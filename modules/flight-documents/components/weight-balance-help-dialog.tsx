"use client";

import { CircleHelpIcon, RotateCwIcon } from "lucide-react";
import { useState } from "react";

import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { FloatingActionButton } from "@/shared/components/layout/floating-action-button";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";

const FORMULAS = [
  { term: "Moment", detail: "Weight × ARM = Moment" },
  {
    term: "Total Weight",
    detail:
      "Weight (Basic Empty Weight) + Weight (Usable Fuel) + Weight (FI + Student) + Weight (Baggage Area N) = Total Weight",
  },
  {
    term: "Total Moment",
    detail:
      "Moment (Basic Empty Weight) + Moment (Usable Fuel) + Moment (FI + Student) + Moment (Baggage Area N) = Total Moment",
  },
  {
    term: "Center of Gravity (CG)",
    detail: "Total Moment / Total Weight = CG",
  },
];

export function WeightBalanceHelp() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <FloatingActionButton
        icon={CircleHelpIcon}
        label="How to Fill Up the Weight & Balance"
        onClick={() => setOpen(true)}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-6 sm:max-w-lg">
          <DialogSectionHeader
            description="How the load sheet fills itself in and the formulas behind it."
            icon={CircleHelpIcon}
            title="How to Fill Up the Weight & Balance"
          />
          <div className="grid gap-4">
            <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Filling the Sheet
              </p>
              <div>
                <p className="text-xs font-medium text-foreground/80">
                  Given Values
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Shaded values come from the aircraft&apos;s configuration —
                  Basic Empty Weight and all ARMs are preset and cannot be
                  edited.
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground/80">
                  Weights
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Fill in the weight for each load; each Moment auto-calculates
                  as Weight × ARM.
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground/80">
                  Manual Moments
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Typing a Moment manually stops its auto-calculation — click
                  the <RotateCwIcon className="inline size-2.5 align-middle" />{" "}
                  icon to re-enable it.
                </p>
              </div>
            </div>

            <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Formulas
              </p>
              {FORMULAS.map((item) => (
                <div key={item.term}>
                  <p className="text-xs font-medium text-foreground/80">
                    {item.term}
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
