import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRightIcon } from "lucide-react";

import { cn } from "@/shared/lib/utils";

type PageHeaderBreadcrumb = {
  href: string;
  label: string;
};

export function PageHeader({
  action,
  breadcrumbs,
  className,
  title,
}: {
  action?: ReactNode;
  breadcrumbs: PageHeaderBreadcrumb[];
  className?: string;
  title: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 border-b border-primary-foreground/15 p-4 sm:border-none",
        className,
      )}
    >
      <div className="min-w-0">
        <nav
          aria-label="Breadcrumb"
          className="hidden items-center gap-1 text-sm text-primary-foreground/65 sm:flex"
        >
          {breadcrumbs.map((breadcrumb, index) => (
            <span
              className="inline-flex items-center gap-1"
              key={breadcrumb.href}
            >
              {index > 0 && <ChevronRightIcon className="size-3.5" />}
              {index === breadcrumbs.length - 1 ? (
                <span
                  aria-current="page"
                  className="font-semibold text-primary-foreground"
                >
                  {breadcrumb.label}
                </span>
              ) : (
                <Link
                  className="rounded-lg transition hover:text-primary-foreground focus-visible:outline-1 focus-visible:outline-ring"
                  href={breadcrumb.href}
                >
                  {breadcrumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
        <h1 className="truncate text-2xl font-bold sm:font-semibold tracking-tight md:text-4xl py-1">
          {title}
        </h1>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
