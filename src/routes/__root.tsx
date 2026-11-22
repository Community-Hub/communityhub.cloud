import { lazy, Suspense, useEffect, useState } from "react";
import { pc } from "@/lib/page-content";
import { site } from "@/lib/site";
import { createRootRoute, HeadContent, Outlet, Scripts, useRouterState } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { getCmsState, getEditorHost } from "@/lib/cms/state";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SiteHeader } from "@/components/site-header";
import appCss from "../styles.css?url";

/** JSON that is safe inside a script tag. */
const inlineJson = (json: string) =>
  json.replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");

// Editing on the page: loaded only on the editor's own address, never by a visitor to the public site.
const PageEditor = lazy(() => import("@/components/admin/page-editor").then((m) => ({ default: m.PageEditor })));

export const Route = createRootRoute({
  // The saved edits are loaded once per page load, applied to the content before anything is drawn,
  // and handed to the browser so its first render matches the server's.
  loader: async () => {
    const [cms, editorHost] = await Promise.all([getCmsState(), getEditorHost()]);
    return { cms, editorHost };
  },
  staleTime: Number.POSITIVE_INFINITY,
  head: ({ loaderData }) => ({
    scripts: loaderData?.cms ? [{ children: `window.__CMS_STATE__=${inlineJson(loaderData.cms)};` }] : [],
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: pc.meta.home.title },
      { name: "description", content: site.mission },
      { name: "theme-color", content: "#ffffff" },
      { property: "og:title", content: pc.meta.home.title },
      { property: "og:description", content: pc.meta.ogDescription.text },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/og.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Downtown Oberlin from the Community Hub film, with the line: It has never been more important to act locally while thinking globally" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/assets/icon-ch.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;600;700&family=Figtree:ital,wght@0,400..800;1,400..600&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  // The editor has its own screen: no site header on it.
  const editing = useRouterState({ select: (s) => s.location.pathname === "/admin" });
  const editorHost = Route.useLoaderData({ select: (d) => Boolean(d?.editorHost) });
  // Marks the page as interactive (tests wait for it before clicking).
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
    setHydrated(true);
  }, []);
  // On the editor's address only: the on-page editor asks for the page to be drawn afresh from its content (once
  // when it starts, and after a save it could not show in place).
  const [draw, setDraw] = useState(0);
  useEffect(() => {
    if (!editorHost) return;
    const redraw = () => setDraw((n) => n + 1);
    window.addEventListener("cms:redraw", redraw);
    return () => window.removeEventListener("cms:redraw", redraw);
  }, [editorHost]);
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          {editing ? null : (
            <a
              href="#main"
              className="skip-link"
              onClick={(event) => {
                const main = document.getElementById("main");
                if (!main) return;
                event.preventDefault();
                main.setAttribute("tabindex", "-1");
                main.focus({ preventScroll: true });
                main.scrollIntoView({ block: "start" });
              }}
            >
              Skip to content
            </a>
          )}
          {editing ? null : <SiteHeader key={`header-${draw}`} />}
          <Outlet key={`page-${draw}`} />
          {editorHost && hydrated && !editing ? (
            <Suspense fallback={null}>
              <PageEditor />
            </Suspense>
          ) : null}
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
