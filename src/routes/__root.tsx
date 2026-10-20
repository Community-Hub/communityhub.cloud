import { pc } from "@/lib/page-content";
import { site } from "@/lib/site";
import { createRootRoute, HeadContent, Outlet, Scripts, useRouterState } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { getCmsState } from "@/lib/cms/state";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SiteHeader } from "@/components/site-header";
import appCss from "../styles.css?url";

/** JSON that is safe inside a script tag. */
const inlineJson = (json: string) =>
  json.replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");

export const Route = createRootRoute({
  // The saved edits are loaded once per page load, applied to the content before anything is drawn,
  // and handed to the browser so its first render matches the server's.
  loader: () => getCmsState(),
  staleTime: Number.POSITIVE_INFINITY,
  head: ({ loaderData }) => ({
    scripts: loaderData ? [{ children: `window.__CMS_STATE__=${inlineJson(loaderData)};` }] : [],
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: pc.meta.home.title },
      { name: "description", content: site.mission },
      { name: "theme-color", content: "#14241c" },
      { property: "og:title", content: pc.meta.home.title },
      { property: "og:description", content: pc.meta.ogDescription.text },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/og.jpg" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/assets/icon-ch.png" },
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;500;700&family=Lato:ital,wght@0,400;0,700;1,400&display=swap",
      },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  // The editor has its own screen: no site header on it.
  const editing = useRouterState({ select: (s) => s.location.pathname === "/admin" });
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          {editing ? null : <SiteHeader />}
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
