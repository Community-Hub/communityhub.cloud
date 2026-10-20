import { createServerFn } from "@tanstack/react-start";
import { EMPTY_STATE } from "./core";

/**
 * The saved edits (as JSON text), applied to the site content before the page is drawn. Never fails the page and
 * never waits long: if the database is down or slow the last good state is used (the same one the server's shared
 * content holds), or the built-in text when there never was one. Loads only the content service, not the editor sign-in.
 */
export const getCmsState = createServerFn({ method: "GET" }).handler(async (): Promise<string> => {
  try {
    const { dbSource } = await import("../db");
    const { getCms } = await import("./service.server");
    // The embedded local database needs a moment to start the first time; Neon should answer at once.
    const wait = dbSource === "neon" ? 1000 : 20000;
    const cms = await Promise.race([getCms(), new Promise<never>((_, rej) => setTimeout(() => rej(new Error("service start timed out")), wait).unref?.())]);
    return JSON.stringify(await cms.publicState(wait));
  } catch (err) {
    console.error("[cms] could not load edits, showing built-in text:", err instanceof Error ? err.message : err);
    return JSON.stringify(EMPTY_STATE);
  }
});
