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
      className={className}
      onClick={() => {
        if (parsed.hash) setNavigationTarget(parsed.hash);
        onClick?.();
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
