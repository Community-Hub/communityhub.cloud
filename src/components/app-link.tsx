import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { parseHref } from "@/lib/links";

// Internal hrefs go through the router (no reload, Back works); everything else is a plain anchor.
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
      hash={parsed.hash}
      className={className}
      onClick={onClick}
      {...rest}
    >
      {children}
    </Link>
  );
}
