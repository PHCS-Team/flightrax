"use client";

import { CircleHelpIcon } from "lucide-react";
import { useState } from "react";

import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { FloatingActionButton } from "@/shared/components/layout/floating-action-button";
import { Dialog, DialogContent } from "@/shared/components/ui/dialog";

const HELP_SECTIONS = [
  {
    title: "General",
    items: [
      {
        term: "All times are zulu (UTC)",
        detail:
          "Every time on the form is written in UTC, never local time. Philippine local time is UTC+8, so 0100Z = 9:00 AM PH time.",
      },
      {
        term: "Aerodrome codes",
        detail:
          "Use the 4-letter ICAO code (e.g. RPLL). Write ZZZZ when the aerodrome has no ICAO code, then specify the location in Other Information preceded by DEP/ (departure), DEST/ (destination), or ALTN/ (alternate) — e.g. DEP/ RPT-20 BINALONAN.",
      },
    ],
  },
  {
    title: "Section 1 — Header",
    items: [
      {
        term: "DOF (Date of Filing)",
        detail:
          "6 digits, DDHHMM: day of month followed by the time in zulu. Example: 280100 = the 28th at 0100Z (9:00 AM PH time).",
      },
      {
        term: "Addressee(s) / Originator",
        detail:
          "The ATS units this plan is addressed to and the originating station. Leave blank unless instructed otherwise.",
      },
    ],
  },
  {
    title: "Section 2 — Flight Information",
    items: [
      {
        term: "Flight Rules",
        detail:
          "I = IFR, V = VFR. Y = IFR first then VFR, Z = VFR first then IFR.",
      },
      {
        term: "Type of Flight",
        detail:
          "S = scheduled, N = non-scheduled, G = general aviation (typical for training flights), M = military, X = other.",
      },
      {
        term: "Wake Turbulence Category",
        detail:
          "Based on maximum takeoff weight: L = light (most trainers), M = medium, H = heavy.",
      },
      {
        term: "Equipment",
        detail:
          "COM/NAV: S = standard equipment, N = none. Surveillance: N = none, A = transponder Mode A, C = transponder Mode A with altitude reporting.",
      },
      {
        term: "Departure Time",
        detail: "4 digits, HHMM in zulu. Example: 0130 = 0130Z.",
      },
      {
        term: "Cruising Speed",
        detail:
          "K or N followed by 4 digits (km/h or knots), or M plus 3 digits. Example: N0110 = 110 knots.",
      },
      {
        term: "Cruising Level",
        detail:
          "VFR for uncontrolled VFR flight, or F + 3 digits (flight level), A + 3 digits (altitude in hundreds of feet, e.g. A045 = 4,500 ft), S/M + 4 digits (metric).",
      },
      {
        term: "Total EET",
        detail:
          "Total estimated elapsed time from departure to destination, written as HHMM. Example: 0130 = 1 hour 30 minutes.",
      },
    ],
  },
  {
    title: "Section 3 — Supplementary Information",
    items: [
      {
        term: "Endurance",
        detail:
          "Fuel endurance as HHMM — how long the aircraft can stay airborne.",
      },
      {
        term: "Persons on Board",
        detail:
          "Always 3 digits — pad with zeros (002 = two persons). Write TBN if the number is to be notified.",
      },
      {
        term: "Emergency & Survival Equipment",
        detail:
          "Tick only the equipment actually carried on this flight: emergency radios (UHF/VHF/ELT), survival kits, and jackets.",
      },
      {
        term: "Dinghies",
        detail:
          "Only when dinghies are carried: number, total capacity in persons, color, and whether they are covered.",
      },
    ],
  },
];

export function FlightPlanHelp() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <FloatingActionButton
        icon={CircleHelpIcon}
        label="How to Fill Up the Flight Plan"
        onClick={() => setOpen(true)}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-6 sm:max-w-lg">
          <DialogSectionHeader
            description="Field-by-field guide based on CAAP Form ATS 2019-1."
            icon={CircleHelpIcon}
            title="How to Fill Up the Flight Plan"
          />
          <div className="grid gap-4">
            {HELP_SECTIONS.map((section) => (
              <div
                className="space-y-2 rounded-lg border bg-muted/30 p-3"
                key={section.title}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {section.title}
                </p>
                {section.items.map((item) => (
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
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
