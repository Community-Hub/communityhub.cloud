/**
 * Server side of the editor: the content service, the editor sign-in (better-auth) and the guards
 * every editor request passes. Server only.
 */
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { Pool } from "pg";
import { getPglite, getSql } from "../db.ts";
import { pgliteDialect } from "../auth/pglite-dialect.ts";
import { adminOrigin, authSecret, isAdminEmail, isAdminHost, signupCode, useSecureCookies } from "./env.ts";
import { getCms } from "./service.server.ts";
import { CmsError } from "./validate.ts";

const g = globalThis as typeof globalThis & {
  __cmsAuth__?: Map<string, ReturnType<typeof buildAuth>>;
};

export { getCms };

const GENERIC_DENIED = "Sign-in is not available with those details.";
const FORM_PATHS = new Set(["/sign-in/email", "/sign-up/email"]);
const timingSafeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

function buildAuth(origin: string, secure: boolean) {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  const database = databaseUrl
    ? new Pool({ connectionString: databaseUrl, connectionTimeoutMillis: 5000, max: 5 })
    : { dialect: pgliteDialect(() => getPglite()), type: "postgres" as const };

  return betterAuth({
    baseURL: origin,
    basePath: "/api/cms-auth",
    secret: authSecret(),
    database,
    // better-auth refuses state-changing requests whose Origin is not listed here (CSRF protection).
    trustedOrigins: [origin],
    user: { modelName: "cms_user" },
    session: {
      modelName: "cms_session",
      expiresIn: 60 * 60 * 12, // editors sign in again after 12 hours
      updateAge: 60 * 30,
    },
    account: { modelName: "cms_account" },
    verification: { modelName: "cms_verification" },
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      requireEmailVerification: false, // no email is sent; the allowlist and sign-up code are the gate
    },
    rateLimit: {
      enabled: true, // on in every environment, not only production
      storage: "database",
      modelName: "cms_rate_limit",
      window: 60,
      max: 60,
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/sign-up/email": { window: 300, max: 5 },
      },
    },
    advanced: {
      useSecureCookies: secure,
      ipAddress: { ipAddressHeaders: ["x-forwarded-for", "x-real-ip"] },
      defaultCookieAttributes: { httpOnly: true, sameSite: "strict", secure, path: "/" },
      // Cookies are host-only (no Domain attribute), so they belong to the editor host and nothing else.
      crossSubDomainCookies: { enabled: false },
      cookiePrefix: "cms",
    },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (!FORM_PATHS.has(ctx.path)) return;
        const body = (ctx.body ?? {}) as { email?: unknown };
        // Only people on the allowlist may sign in or sign up, and sign-up also needs the shared code.
        if (!isAdminEmail(body.email)) throw new APIError("FORBIDDEN", { message: GENERIC_DENIED });
        if (ctx.path === "/sign-up/email") {
          const expected = signupCode();
          const given = ctx.headers?.get("x-cms-signup-code") ?? "";
          if (!expected || !timingSafeEqual(expected, given)) throw new APIError("FORBIDDEN", { message: GENERIC_DENIED });
        }
      }),
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            if (!isAdminEmail(user.email)) throw new APIError("FORBIDDEN", { message: GENERIC_DENIED });
            return { data: { ...user, email: user.email.trim().toLowerCase() } };
          },
        },
      },
      session: {
        create: {
          before: async (session) => {
            // Taking an email off the list also stops new sessions for it.
            const sql = await getSql();
            const rows = await sql`select email from cms_user where id = ${session.userId}`;
            if (!isAdminEmail((rows[0] as { email?: string } | undefined)?.email)) {
              throw new APIError("FORBIDDEN", { message: GENERIC_DENIED });
            }
          },
        },
      },
    },
  });
}

/** The better-auth instance for the address this request came to. */
export function getCmsAuth(request: Request) {
  const origin = adminOrigin(request);
  const map = (g.__cmsAuth__ ??= new Map());
  let auth = map.get(origin);
  if (!auth) {
    auth = buildAuth(origin, useSecureCookies(request));
    map.set(origin, auth);
  }
  return auth;
}

export interface Admin {
  email: string;
  name: string;
}

const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store", ...headers } });
export { json };

/** Throws a Response when the request is not from a signed-in editor on the editor host. */
export async function requireAdmin(request: Request): Promise<Admin> {
  if (!isAdminHost(request)) throw json({ error: "Not found" }, 404);
  const session = await getCmsAuth(request).api.getSession({ headers: request.headers });
  const email = session?.user?.email;
  if (!session || !isAdminEmail(email)) throw json({ error: "Please sign in." }, 401);
  if (!["GET", "HEAD"].includes(request.method)) assertSameOrigin(request);
  return { email: email!.toLowerCase(), name: session.user.name };
}

/** Writes must come from the editor page itself: same Origin, JSON or multipart, never a plain cross-site form. */
export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin || origin !== adminOrigin(request)) throw json({ error: "Request blocked (origin)." }, 403);
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") throw json({ error: "Request blocked (origin)." }, 403);
}

/** Turn anything thrown inside an editor handler into a response. */
export function fail(err: unknown): Response {
  if (err instanceof Response) return err;
  if (err instanceof CmsError) return json({ error: err.message }, err.status);
  console.error("[cms]", err);
  return json({ error: "Something went wrong. Nothing was saved." }, 500);
}
