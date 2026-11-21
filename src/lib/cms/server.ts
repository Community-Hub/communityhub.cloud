/**
 * Server side of the editor: the content service, the editor sign-in (better-auth) and the guards
 * every editor request passes. Server only.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { emailOTP } from "better-auth/plugins/email-otp";
import { Pool } from "pg";
import { getPglite, getSql } from "../db.ts";
import { pgliteDialect } from "../auth/pglite-dialect.ts";
import { canSendMail, MailError, sendMail } from "../contact/mail.server.ts";
import { takeCodeSlot } from "./code-limit.ts";
import { adminHost, adminOrigin, authSecret, codeOutbox, isAdminEmail, isAdminHost, isDevOrTest, useSecureCookies } from "./env.ts";
import { getCms } from "./service.server.ts";
import { CmsError } from "./validate.ts";

const g = globalThis as typeof globalThis & {
  __cmsAuth__?: Map<string, ReturnType<typeof buildAuth>>;
};

export { getCms };

/**
 * Signing in, with no passwords: an editor types their address, is emailed a 6-digit code, types it, and stays
 * signed in on that browser for a week (the owner's choice, 21 Nov 2026). Being able to read the mailbox of a listed
 * address is the proof; there is nothing else to remember, share or leak.
 */
const GENERIC_DENIED = "Sign-in is not available with those details.";
const NOT_LISTED = "That email address cannot use the editor. Use the address the site owner added for you.";
const SEND_PATH = "/email-otp/send-verification-otp";
const SIGN_IN_PATH = "/sign-in/email-otp";
/** The only sign-in calls the editor makes. Everything else the library offers (passwords, changing an address) stays shut. */
const OPEN_PATHS = new Set([SEND_PATH, SIGN_IN_PATH, "/sign-out", "/get-session"]);
export const CODE_MINUTES = 10;
export const SESSION_SECONDS = 60 * 60 * 24 * 7;

/** Email the code (or, in development and tests, put it in the outbox folder). Never logs the code when live. */
async function deliverCode(email: string, code: string): Promise<void> {
  const outbox = codeOutbox();
  if (outbox) {
    await mkdir(outbox, { recursive: true });
    await writeFile(join(outbox, `${email.replace(/[^a-z0-9@._+-]/g, "_")}.txt`), code, "utf8");
    return;
  }
  if (!canSendMail()) {
    if (isDevOrTest()) {
      console.info(`[cms] sign-in code for ${email}: ${code} (RESEND_API_KEY is not set, so it was not emailed)`);
      return;
    }
    console.error("[cms] RESEND_API_KEY is not set, so no sign-in code can be sent and nobody can sign in.");
    throw new APIError("SERVICE_UNAVAILABLE", { message: "The editor cannot send email right now. Tell the site owner." });
  }
  try {
    await sendMail({
      to: email,
      subject: `${code} is your Community Hub editor code`,
      text: [
        `Your sign-in code for the Community Hub site editor is ${code}.`,
        `It works for ${CODE_MINUTES} minutes. After you sign in, you stay signed in on that browser for a week.`,
        "If you did not ask for this code, you can ignore this email. Nobody can sign in without it.",
      ].join("\n\n"),
      footer: `Sent by the Community Hub site editor${adminHost() ? ` (${adminHost()})` : ""}.`,
    });
  } catch (err) {
    console.error("[cms] the sign-in code was not sent:", err instanceof MailError ? err.message : err);
    throw new APIError("BAD_GATEWAY", { message: "The code could not be sent. Try again in a minute." });
  }
}

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
      expiresIn: SESSION_SECONDS, // a week from signing in, then a new code
      disableSessionRefresh: true, // the week is not extended by use
    },
    account: { modelName: "cms_account" },
    verification: { modelName: "cms_verification" },
    emailAndPassword: { enabled: false }, // no passwords at all
    plugins: [
      emailOTP({
        otpLength: 6,
        expiresIn: CODE_MINUTES * 60,
        allowedAttempts: 5, // a wrong code five times and that code is dead; ask for a new one
        storeOTP: "hashed", // the database never holds a usable code
        disableSignUp: false, // a listed address gets its account the first time it signs in
        rateLimit: { window: 60, max: 5 },
        async sendVerificationOTP({ email, otp, type }) {
          if (type !== "sign-in" || !isAdminEmail(email)) return; // refused in the hook below; never mail a stranger
          await deliverCode(email.trim().toLowerCase(), otp);
        },
      }),
    ],
    rateLimit: {
      enabled: true, // on in every environment, not only production
      storage: "database",
      modelName: "cms_rate_limit",
      window: 60,
      max: 60,
      customRules: {
        [SEND_PATH]: { window: 60, max: 5 },
        [SIGN_IN_PATH]: { window: 60, max: 5 },
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
        if (!OPEN_PATHS.has(ctx.path)) throw new APIError("NOT_FOUND", { message: "Not found" });
        if (ctx.path !== SEND_PATH && ctx.path !== SIGN_IN_PATH) return;
        const body = (ctx.body ?? {}) as { email?: unknown; type?: unknown };
        // Only people on the allowlist are sent a code or may use one, and a code is only ever for signing in.
        if (!isAdminEmail(body.email)) throw new APIError("FORBIDDEN", { message: NOT_LISTED });
        if (ctx.path !== SEND_PATH) return;
        if (body.type !== "sign-in") throw new APIError("FORBIDDEN", { message: GENERIC_DENIED });
        // One address is emailed at most 5 codes in 15 minutes, whoever asks and from wherever.
        if (!(await takeCodeSlot(await getSql(), String(body.email)))) {
          throw new APIError("TOO_MANY_REQUESTS", { message: "Too many codes were asked for this address. Wait 15 minutes, then try again." });
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
