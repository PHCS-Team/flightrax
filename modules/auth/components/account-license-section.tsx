"use client";

import { AnimatePresence, motion } from "motion/react";
import { GraduationCapIcon, IdCardIcon, PlaneIcon } from "lucide-react";

import { LicenseSetupForm } from "@/modules/auth/components/license-setup-form";
import { GlassSurface } from "@/shared/components/layout/glass-surface";

type AccountLicenseDetail = {
  icon: "licenseNumber" | "licenseType" | "rating";
  label: string;
  value: string;
};

type AccountLicenseSectionProps = {
  canSetLicenseDetails: boolean;
  details: AccountLicenseDetail[];
};

const panelMotion = {
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.98 },
  initial: { opacity: 0, y: 12, scale: 0.98 },
  transition: { duration: 0.18, ease: "easeOut" },
} as const;

const detailIcons = {
  licenseNumber: IdCardIcon,
  licenseType: GraduationCapIcon,
  rating: PlaneIcon,
} as const;

export function AccountLicenseSection({
  canSetLicenseDetails,
  details,
}: AccountLicenseSectionProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {canSetLicenseDetails ? (
        <motion.div key="license-setup" {...panelMotion}>
          <GlassSurface className="w-full p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold tracking-tight text-primary-foreground">
                Complete license details
              </h2>
              <p className="mt-1 text-sm text-primary-foreground/70">
                You can set these details once. Ask an instructor to edit them
                later if needed.
              </p>
            </div>
            <LicenseSetupForm surface="onPrimary" />
          </GlassSurface>
        </motion.div>
      ) : (
        <motion.div key="license-details" {...panelMotion}>
          <GlassSurface className="divide-y divide-primary-foreground/10 md:grid md:grid-cols-3 md:divide-x md:divide-y-0 md:p-2">
            {details.map((detail) => {
              const Icon = detailIcons[detail.icon];

              return (
                <div
                  key={detail.label}
                  className="flex items-center gap-3 p-4 md:p-5"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10 text-primary-foreground md:rounded-2xl">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary-foreground/60">
                      {detail.label}
                    </p>
                    <p className="mt-1 truncate text-base font-semibold text-primary-foreground">
                      {detail.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </GlassSurface>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
