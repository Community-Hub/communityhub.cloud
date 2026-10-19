import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminApp } from "@/components/admin/admin-app";

/** The site editor. Served only on the editor host (see src/lib/cms/gate.server.ts). */
export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Site editor" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminPage,
});

function AdminPage() {
  // The editor draws in the browser only; the server sends the empty shell.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return <div className="min-h-dvh bg-paper text-ink">{ready ? <AdminApp /> : <p className="p-8 text-ink/70">Loading...</p>}</div>;
}
