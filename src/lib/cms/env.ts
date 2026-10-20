/**
 * Settings for the editor, read from the environment at request time. Server only.
 *
 *   ADMIN_EMAILS       comma separated. Only these emails may sign up or sign in.
 *   ADMIN_HOST         host (and port, locally) the editor lives on, e.g. admin.communityhub.cloud.
 *   ADMIN_SIGNUP_CODE  shared secret the first sign-up needs (required in production).
 *   BETTER_AUTH_SECRET signs the editor sessions.
 */
import { isIP } from "node:net";

const read = (key: string) => process.env[key]?.trim() || undefined;

/** Only an explicit development or test run gets the relaxed local behaviour. Anything else (including unset) is treated as live. */
export const isDevOrTest = () => process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
export const isProduction = () => !isDevOrTest();

export const MIN_SIGNUP_CODE = 16;

export function adminEmails(): string[] {
  return (read("ADMIN_EMAILS") ?? "")
    .split(/[,\s;]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: unknown): boolean {
  return typeof email === "string" && adminEmails().includes(email.trim().toLowerCase());
}

/** `admin.example.org` or `admin.localhost:8080`, lower case, or null when not set. */
export function adminHost(): string | null {
  return read("ADMIN_HOST")?.toLowerCase() ?? null;
}

/** The shared sign-up code, or null (sign-up refused) when it is missing or shorter than 16 characters. */
export function signupCode(): string | null {
  const code = read("ADMIN_SIGNUP_CODE");
  return code && code.length >= MIN_SIGNUP_CODE ? code : null;
}

export function authSecret(): string {
  const s = read("BETTER_AUTH_SECRET");
  if (s && s.length >= 32) return s;
  if (isProduction()) throw new Error("BETTER_AUTH_SECRET must be set (32+ characters) to run the editor.");
  return "dev-only-secret-dev-only-secret-0123456789"; // local runs only; never used in production
}

export const requestHost = (request: Request): string => (request.headers.get("host") ?? new URL(request.url).host).toLowerCase();

/**
 * Where the editor may be served from.
 * - ADMIN_HOST set: only that host.
 * - Not set, development or test run (NODE_ENV): any host, so `npm run dev` works with no setup.
 * - Not set, anything else: nowhere (the editor stays off until the founder chooses a host).
 */
export function isAdminHost(request: Request): boolean {
  const configured = adminHost();
  if (configured) return requestHost(request) === configured;
  return isDevOrTest();
}

/** True on the dedicated editor host (ADMIN_HOST). That host serves only the editor. */
export function onDedicatedAdminHost(request: Request): boolean {
  const configured = adminHost();
  return !!configured && requestHost(request) === configured;
}

const isLocalHost = (host: string) => {
  const name = host.replace(/:\d+$/, "");
  return name === "localhost" || name.endsWith(".localhost") || isIP(name) !== 0;
};

/** The address people type to reach the editor, used for cookies and the same-origin check. */
export function adminOrigin(request: Request): string {
  const host = adminHost() ?? requestHost(request);
  return `${isLocalHost(host) ? "http" : "https"}://${host}`;
}

/** Secure cookies everywhere except a local http address. */
export const useSecureCookies = (request: Request) => adminOrigin(request).startsWith("https://");
