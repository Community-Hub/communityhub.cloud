import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { canSendMail, mailFrom, mailProvider, MailError, sendMail } from "./mail.server.ts";

const KEYS = ["POSTMARK_SERVER_TOKEN", "POSTMARK_FROM", "RESEND_API_KEY", "MAIL_FROM"] as const;
const saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
const realFetch = globalThis.fetch;
const set = (env: Partial<Record<(typeof KEYS)[number], string>>) => {
  for (const k of KEYS) delete process.env[k];
  Object.assign(process.env, env);
};
afterEach(() => {
  for (const k of KEYS) saved[k] === undefined ? delete process.env[k] : (process.env[k] = saved[k]);
  globalThis.fetch = realFetch;
});

/** Stands in for the network: remembers the one request and answers with `status`. */
function capture(status = 200) {
  const seen: { url: string; headers: Record<string, string>; body: any }[] = [];
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    seen.push({ url: String(url), headers: init?.headers as Record<string, string>, body: JSON.parse(String(init?.body)) });
    return new Response(status === 200 ? "{}" : '{"Message":"nope"}', { status });
  }) as typeof fetch;
  return seen;
}
const mail = { to: "john.petersen@oberlin.edu", subject: "123456 is your\ncode", text: "Hello", footer: "Sent by the editor." };

describe("which service carries the site's mail", () => {
  it("nothing is set: nothing can be sent", async () => {
    set({});
    assert.equal(mailProvider(), null);
    assert.equal(canSendMail(), false);
    await assert.rejects(() => sendMail(mail), MailError);
  });

  it("Resend alone: Resend, from MAIL_FROM", async () => {
    set({ RESEND_API_KEY: "re_test", MAIL_FROM: "Community Hub <website@communityhb.tech>" });
    assert.equal(mailProvider(), "resend");
    const seen = capture();
    await sendMail(mail);
    assert.equal(seen[0].url, "https://api.resend.com/emails");
    assert.equal(seen[0].headers.authorization, "Bearer re_test");
    assert.equal(seen[0].body.from, "Community Hub <website@communityhb.tech>");
    assert.deepEqual(seen[0].body.to, ["john.petersen@oberlin.edu"]);
    assert.equal(seen[0].body.subject, "123456 is your code");
  });

  it("a Postmark token wins, and sends from communityhub.cloud whatever MAIL_FROM says", async () => {
    set({ POSTMARK_SERVER_TOKEN: "pm_test", RESEND_API_KEY: "re_test", MAIL_FROM: "Community Hub <website@communityhb.tech>" });
    assert.equal(mailProvider(), "postmark");
    assert.equal(mailFrom(), "Community Hub <mail@communityhub.cloud>");
    const seen = capture();
    await sendMail({ ...mail, replyTo: "visitor@example.org", attachments: [{ filename: "demo-request.ics", content: "QkVHSU4=" }] });
    assert.equal(seen.length, 1);
    assert.equal(seen[0].url, "https://api.postmarkapp.com/email");
    assert.equal(seen[0].headers["x-postmark-server-token"], "pm_test");
    assert.equal(seen[0].headers.authorization, undefined);
    const body = seen[0].body;
    assert.equal(body.From, "Community Hub <mail@communityhub.cloud>");
    assert.equal(body.To, "john.petersen@oberlin.edu");
    assert.equal(body.ReplyTo, "visitor@example.org");
    assert.equal(body.Subject, "123456 is your code");
    assert.equal(body.TextBody, "Hello\n\nSent by the editor.");
    assert.match(body.HtmlBody, /Sent by the editor\./);
    assert.equal(body.MessageStream, "outbound");
    assert.deepEqual(body.Attachments, [{ Name: "demo-request.ics", Content: "QkVHSU4=", ContentType: "text/calendar" }]);
  });

  it("POSTMARK_FROM changes the Postmark sender", () => {
    set({ POSTMARK_SERVER_TOKEN: "pm_test", POSTMARK_FROM: "Community Hub <website@communityhub.cloud>" });
    assert.equal(mailFrom(), "Community Hub <website@communityhub.cloud>");
  });

  it("a refusal is reported with the service's name and never retried on the other one", async () => {
    set({ POSTMARK_SERVER_TOKEN: "pm_test", RESEND_API_KEY: "re_test" });
    const seen = capture(422);
    await assert.rejects(() => sendMail(mail), /Postmark answered 422/);
    assert.equal(seen.length, 1);
  });
});
