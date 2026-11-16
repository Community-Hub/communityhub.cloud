import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { AppLink } from "@/components/app-link";
import { site } from "@/lib/site";

export const Route = createFileRoute("/lorawan_/console")({
  component: LoRaWANConsole,
  head: () => ({
    meta: [
      { title: "LoRaWAN console — Community Hub" },
      { name: "description", content: "Sign in to your organization's LoRaWAN network: gateways, sensors, readings and alerts." },
    ],
  }),
});

/** The live LoRaWAN console. It runs inside communityhub.cloud, so signing in and working in it never leaves the site. */
const CONSOLE_SRC = "https://lorawan-sensors.communityhb.tech/login";

function LoRaWANConsole() {
  const [ready, setReady] = useState(false);
  return (
    <main id="main" className="lora-console">
      <div className="lora-console-bar wrap">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-[0.9375rem] text-ink/65">
          <AppLink href="/lorawan" className="inline-flex min-h-11 items-center gap-1.5 font-medium text-leaf underline decoration-leaf/40 underline-offset-4 hover:text-pine">
            <ArrowLeft className="size-4" aria-hidden />
            LoRaWAN
          </AppLink>
          <span aria-hidden className="text-ink/35">
            /
          </span>
          <span aria-current="page" className="truncate">
            Console
          </span>
        </nav>
        <p className="hidden text-[0.9375rem] text-ink/70 sm:block">
          Don’t have an account?{" "}
          <AppLink href={site.contactHref} className="font-semibold text-leaf underline decoration-leaf/40 underline-offset-4 hover:text-pine">
            Contact us
          </AppLink>
        </p>
      </div>
      <div className="lora-console-frame panel" aria-busy={!ready}>
        {!ready && (
          <p className="lora-console-loading" role="status">
            Opening the console…
          </p>
        )}
        <iframe
          src={CONSOLE_SRC}
          title="LoRaWAN console: sign in to your organization's network"
          onLoad={() => setReady(true)}
          allow="clipboard-write"
          className="absolute inset-0 size-full border-0"
        />
      </div>
    </main>
  );
}
