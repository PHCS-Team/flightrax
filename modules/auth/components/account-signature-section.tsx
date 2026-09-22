"use client";

import Image from "next/image";
import { useState } from "react";
import { PenLineIcon, PencilIcon } from "lucide-react";

import { SignaturePad } from "@/modules/auth/components/signature-pad";
import { useSaveSignature } from "@/modules/auth/hooks/use-save-signature.action";
import { GlassSurface } from "@/shared/components/layout/glass-surface";
import { Button } from "@/shared/components/ui/button";
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
  const [isEditing, setIsEditing] = useState(false);
  const { execute, isExecuting } = useSaveSignature({
    onSaved: () => setIsEditing(false),
  });

  if (currentSignature && !isEditing) {
    return (
      <SavedSignature
        onEdit={() => setIsEditing(true)}
        signature={currentSignature}
      />
    );
  }

  return (
    <SignaturePad
      isSaving={isExecuting}
      onCancel={currentSignature ? () => setIsEditing(false) : undefined}
      onSave={(svg) => execute({ signature: svg })}
    />
  );
}

function SavedSignature({
  onEdit,
  signature,
}: {
  onEdit: () => void;
  signature: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-primary-foreground/90">
        Signature
      </p>
      <div className="relative h-48 w-full overflow-hidden rounded-lg border border-border bg-white">
        <Image
          alt="Your saved signature"
          className="object-contain p-3"
          fill
          src={`data:image/svg+xml,${encodeURIComponent(signature)}`}
          unoptimized
        />
      </div>
      <p className="-mt-1.5 text-xs text-primary-foreground/60">
        Locked so it can&apos;t be changed by accident.
      </p>
      <Button className="w-full" onClick={onEdit} type="button">
        <PencilIcon className="size-4" />
        Edit signature
      </Button>
    </div>
  );
}
