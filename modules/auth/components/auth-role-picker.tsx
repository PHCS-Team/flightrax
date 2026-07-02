import Link from "next/link";

import { PUBLIC_AUTH_ROLES } from "@/shared/lib/rbac/config";
import { AuthShell } from "@/modules/auth/components/auth-shell";
import {
  AUTH_MODE_CONFIG,
  AUTH_ROLE_CONFIG,
  type AuthMode,
} from "@/modules/auth/utils/auth-role-config";

export function AuthRolePicker({ mode }: { mode: AuthMode }) {
  const modeConfig = AUTH_MODE_CONFIG[mode];

  return (
    <AuthShell
      eyebrow={modeConfig.eyebrow}
      title={modeConfig.title}
      description={modeConfig.description}
      surface="bare"
    >
      <nav
        aria-label={`${modeConfig.submitLabel} role`}
        className="relative mx-auto w-full max-w-lg py-4"
      >
        <div
          aria-hidden="true"
          className="absolute left-12 right-12 top-20 h-1 rounded-full bg-primary-foreground/25 sm:left-16 sm:right-16"
        />
        <div
          aria-hidden="true"
          className="absolute left-12 right-12 top-20 h-px translate-y-1 rounded-full bg-primary-foreground/60 sm:left-16 sm:right-16"
        />
        <div className="grid grid-cols-3 gap-2 sm:gap-5">
          {PUBLIC_AUTH_ROLES.map((role) => {
            const config = AUTH_ROLE_CONFIG[role];
            const Icon = config.icon;

            return (
              <Link
                aria-label={`${modeConfig.submitLabel} as ${config.label}`}
                className="group relative z-10 flex min-h-36 flex-col items-center justify-start gap-3 px-1 py-2 text-center text-primary-foreground outline-none sm:min-h-40"
                href={`/${mode}/${role}`}
                key={role}
              >
                <span className="relative flex size-24 items-center justify-center rounded-full bg-primary-foreground text-primary shadow-lg shadow-primary/20 ring-4 ring-primary-foreground/20 transition duration-200 group-hover:-translate-y-1 group-hover:bg-primary-foreground/95 group-hover:ring-primary-foreground/35 group-focus-visible:ring-primary-foreground/60 group-active:translate-y-0 sm:size-28">
                  <span className="absolute inset-3 rounded-full border border-primary/15" />
                  <Icon className="relative size-9 sm:size-10" />
                </span>
                <span className="text-sm font-semibold tracking-tight text-primary-foreground transition group-hover:text-primary-foreground/85 sm:text-base">
                  {config.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
      <p className="sr-only">{modeConfig.submitLabel}</p>
      <p className="mt-2 text-center text-sm text-primary-foreground/70">
        {modeConfig.switchPrompt}{" "}
        <Link
          className="font-semibold text-primary-foreground underline-offset-4 transition hover:text-primary-foreground/80 hover:underline"
          href={`/${modeConfig.switchMode}`}
        >
          {modeConfig.switchLabel}
        </Link>
      </p>
    </AuthShell>
  );
}
