import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { parseHref } from "@/lib/links";
import { setNavigationTarget } from "@/lib/use-hash-stops";

// Internal hrefs go through the router (no reload, Back works, no # in URL); everything else is a plain anchor.
export function AppLink({
  href,
  className,
  children,
  onClick,
  ...rest
}: {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  "aria-current"?: "page";
  "data-active"?: boolean;
  "aria-label"?: string;
}) {
  const parsed = parseHref(href);
  if (parsed.kind === "external") {
    const web = parsed.href.startsWith("http");
    return (
      <a href={parsed.href} className={className} onClick={onClick} {...rest} {...(web ? { rel: "noopener" } : {})}>
        {children}
      </a>
    );
  }
  return (
    <Link
      // Paths come from content tables, so they cannot be checked against the route tree at compile time.
      to={parsed.to as never}
      search={parsed.search as never}
      className={className}
      onClick={(event) => {
        if (parsed.hash) {
          const here = window.location.pathname.replace(/\/+$/, "") || "/";
          const samePage = here === parsed.to;
          setNavigationTarget(parsed.hash, samePage);
          // Already on that page: it scrolls to the target itself, and a second page change would cut the scroll short.
          const plain = !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);
          if (plain && !parsed.search && samePage) event.preventDefault();
        }
        onClick?.();
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
