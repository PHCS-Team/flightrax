"use client";

import { AnimatePresence, motion } from "framer-motion";
import { IdCardIcon } from "lucide-react";

import { LicenseSetupForm } from "@/modules/auth/components/license-setup-form";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { ROLE } from "@/shared/lib/rbac/config";
import type { ProfileRole } from "@/shared/lib/rbac/types";

type AccountLicenseDetail = {
  label: string;
  value: string;
};

type AccountLicenseSectionProps = {
  canSetLicenseDetails: boolean;
  details: AccountLicenseDetail[];
  role: ProfileRole;
};

const panelMotion = {
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.98 },
  initial: { opacity: 0, y: 12, scale: 0.98 },
  transition: { duration: 0.18, ease: "easeOut" },
} as const;

export function AccountLicenseSection({
  canSetLicenseDetails,
  details,
  role,
}: AccountLicenseSectionProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {canSetLicenseDetails ? (
        <motion.div key="license-setup" {...panelMotion}>
          <GlassSurface className="w-full p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10 text-primary-foreground">
                <IdCardIcon className="size-5" />
              </span>
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-primary-foreground">
                  Complete License Details
                </h2>
                <p className="mt-0.5 text-sm text-primary-foreground/70">
                  {role === ROLE.STUDENT
                    ? "You can set these details once. Ask an instructor to edit them later if needed."
                    : "You can set these details once."}
                </p>
              </div>
            </div>
            <LicenseSetupForm surface="onPrimary" />
          </GlassSurface>
        </motion.div>
      ) : (
        <motion.div key="license-details" {...panelMotion}>
          <GlassSurface className="overflow-hidden">
            <div className="flex items-center gap-3 border-b border-primary-foreground/10 px-5 py-4 md:px-6 md:py-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10 text-primary-foreground">
                <IdCardIcon className="size-5" />
              </span>
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-primary-foreground">
                  License Details
                </h2>
                <p className="mt-0.5 text-sm text-primary-foreground/70">
                  Your current license information on file.
                </p>
              </div>
            </div>
            <div className="divide-y divide-primary-foreground/10">
              {details.map((detail) => (
                <div
                  key={detail.label}
                  className="px-5 py-4 md:px-6 md:py-5"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary-foreground/60">
                    {detail.label}
                  </p>
                  <p className="mt-1 text-base font-semibold text-primary-foreground">
                    {detail.value}
                  </p>
                </div>
              ))}
            </div>
          </GlassSurface>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
