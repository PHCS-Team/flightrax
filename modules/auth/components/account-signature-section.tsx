"use client";

import { PenLineIcon } from "lucide-react";

import { SignaturePad } from "@/modules/auth/components/signature-pad";
import { useSaveSignature } from "@/modules/auth/hooks/use-save-signature.action";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { ROLE } from "@/shared/lib/rbac/config";
import type { Profile } from "@/shared/lib/rbac/types";

type AccountSignatureSectionProps = {
  profile: Profile;
};

export function AccountSignatureSection({
  profile,
}: AccountSignatureSectionProps) {
  const isInstructor = profile.role === ROLE.INSTRUCTOR;

  return (
    <GlassSurface className="p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/10 text-primary-foreground">
          <PenLineIcon className="size-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-primary-foreground">
            Signature
          </h2>
          <p className="mt-0.5 text-sm text-primary-foreground/70">
            {isInstructor
              ? "Your signature will be attached to flight plans you approve."
              : "Your signature will be attached to your flight plans."}
          </p>
        </div>
      </div>
      <SignaturePadSlot currentSignature={profile.signature_svg} />
    </GlassSurface>
  );
}

function SignaturePadSlot({
  currentSignature,
}: {
  currentSignature: string | null | undefined;
}) {
  const { execute, isExecuting } = useSaveSignature();

  return (
    <SignaturePad
      currentSignature={currentSignature ?? null}
      isSaving={isExecuting}
      onSave={(svg) => execute({ signature: svg })}
    />
  );
}
