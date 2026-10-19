/** Calls to the editor API. Plain fetch, same origin, cookies sent automatically. */

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, { credentials: "same-origin", ...init });
  } catch {
    throw new ApiError("Could not reach the server. Check your connection and try again.", 0);
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
  if (!res.ok) throw new ApiError(data.error ?? data.message ?? "Something went wrong.", res.status);
  return data as T;
}

export const get = <T>(path: string) => call<T>(path);
export const post = <T = { ok: true }>(path: string, body: unknown, headers: Record<string, string> = {}) =>
  call<T>(path, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body) });
export const upload = (form: FormData) => call<{ ok: true; url: string }>("/api/cms/upload", { method: "POST", body: form });

export const errorText = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong.");
