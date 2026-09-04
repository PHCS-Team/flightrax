"use client";

import { FileTextIcon } from "lucide-react";

import {
  COM_NAV_EQUIPMENT_OPTIONS,
  FLIGHT_RULES_OPTIONS,
  SURVEILLANCE_EQUIPMENT_OPTIONS,
  TYPE_OF_FLIGHT_OPTIONS,
  WAKE_TURBULENCE_CATEGORY_OPTIONS,
} from "@/modules/flight-documents/constants/flight-plan-options";
import {
  optionLabel,
  ReviewCardHeading,
  ReviewChecklistField,
  ReviewField,
  ReviewOptionsField,
  ReviewSection,
} from "@/modules/flight-documents/components/flight-request-review-primitives";
import type { FlightPlanFormValues } from "@/modules/flight-documents/schemas/flight-plan-schema";
import type { FlightPlanAircraftOption } from "@/modules/flight-documents/types/aircraft-option";
import { GlassSurface } from "@/shared/components/layout/glass-surface";

// Read-only display of a filed flight plan, mirroring the form's
// sections field for field, plus the aircraft snapshot fields the form
// auto-populates.
export function FlightPlanReviewCard({
  aircraft,
  filedByName,
  showHeading = true,
  values,
}: {
  aircraft: FlightPlanAircraftOption;
  filedByName: string;
  showHeading?: boolean;
  values: FlightPlanFormValues;
}) {
  return (
    <GlassSurface className="grid gap-6 p-4 sm:p-6">
      {showHeading && (
        <ReviewCardHeading
          description="As filed on CAAP Form ATS 2019-1."
          icon={FileTextIcon}
          title="Flight Plan"
        />
      )}

      <ReviewSection title="Pilots">
        <div className="grid gap-4 sm:grid-cols-2">
          <ReviewField label="Filed By" value={filedByName} />
          <ReviewField
            label="Pilot in Command"
            value={values.pilotInCommandName}
          />
        </div>
      </ReviewSection>

      <ReviewSection title="Aircraft">
        <div className="grid gap-4 sm:grid-cols-2">
          <ReviewField
            label="Aircraft Registration"
            value={aircraft.aircraftIdentification}
          />
          <ReviewField
            label="Type of Aircraft"
            value={aircraft.typeIcaoDesignator}
          />
          <ReviewField
            className="sm:col-span-2"
            label="Aircraft Colour & Marking"
            value={aircraft.colorMarkings}
          />
        </div>
      </ReviewSection>

      <ReviewSection title="Section 1 — Header">
        <div className="grid gap-4 sm:grid-cols-3">
          <ReviewField label="Addressee(s)" value={values.addressee} />
          <ReviewField label="Date of Filing" value={values.dofRaw} />
          <ReviewField label="Originator" value={values.originator} />
        </div>
      </ReviewSection>

      <ReviewSection title="Section 2 — Flight Information">
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <ReviewField
              label="Flight Rules"
              value={optionLabel(FLIGHT_RULES_OPTIONS, values.flightRules)}
            />
            <ReviewField
              label="Type of Flight"
              value={optionLabel(TYPE_OF_FLIGHT_OPTIONS, values.typeOfFlight)}
            />
            <ReviewField
              label="Number of Aircraft"
              value={values.numberOfAircraft}
            />
            <ReviewField
              label="Wake Turbulence Category"
              value={optionLabel(
                WAKE_TURBULENCE_CATEGORY_OPTIONS,
                values.wakeTurbulenceCategory,
              )}
            />
          </div>
          <div className="grid content-start gap-2">
            <p className="text-sm font-semibold text-primary-foreground">
              Equipment
            </p>
            <div className="grid gap-3 rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 p-3 sm:grid-cols-2">
              <ReviewOptionsField
                label="COM/NAV"
                options={COM_NAV_EQUIPMENT_OPTIONS}
                value={values.comNavEquipment}
              />
              <ReviewOptionsField
                label="Surveillance"
                options={SURVEILLANCE_EQUIPMENT_OPTIONS}
                value={values.surveillanceEquipment}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ReviewField
              label="Departure Aerodrome"
              value={values.departureAerodrome}
            />
            <ReviewField
              label="Departure Time"
              value={values.departureTimeRaw}
            />
            <ReviewField label="Cruising Speed" value={values.cruisingSpeed} />
            <ReviewField label="Cruising Level" value={values.cruisingLevel} />
            <ReviewField
              className="sm:col-span-2"
              label="Route"
              multiline
              value={values.route}
            />
            <ReviewField
              label="Destination Aerodrome"
              value={values.destinationAerodrome}
            />
            <ReviewField label="Total EET" value={values.totalEet} />
            <ReviewField
              label="First Alternate Aerodrome"
              value={values.firstAlternateAerodrome}
            />
            <ReviewField
              label="Second Alternate Aerodrome"
              value={values.secondAlternateAerodrome}
            />
            <ReviewField
              className="sm:col-span-2"
              label="Other Information"
              multiline
              value={values.otherRemarks}
            />
          </div>
        </div>
      </ReviewSection>

      <ReviewSection title="Section 3 — Supplementary Information">
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <ReviewField label="Endurance" value={values.endurance} />
            <ReviewField
              label="Persons on Board"
              value={values.personsOnBoard}
            />
          </div>
          <div className="grid gap-2">
            <p className="text-sm font-semibold text-primary-foreground">
              Emergency &amp; Survival Equipment
            </p>
            <div className="grid gap-4 rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 p-3 sm:grid-cols-3">
              <ReviewChecklistField
                items={[
                  { checked: values.emergencyRadioUhf, label: "U — UHF" },
                  { checked: values.emergencyRadioVhf, label: "V — VHF" },
                  { checked: values.emergencyRadioElt, label: "E — ELT" },
                ]}
                label="Emergency Radio"
              />
              <ReviewChecklistField
                items={[
                  { checked: values.survivalPolar, label: "P — Polar" },
                  { checked: values.survivalDesert, label: "D — Desert" },
                  { checked: values.survivalMaritime, label: "M — Maritime" },
                  { checked: values.survivalJungle, label: "J — Jungle" },
                ]}
                label="Survival Equipment"
              />
              <ReviewChecklistField
                items={[
                  { checked: values.jacketLight, label: "L — Light" },
                  {
                    checked: values.jacketFluorescent,
                    label: "F — Fluorescent",
                  },
                  { checked: values.jacketUhf, label: "U — UHF" },
                  { checked: values.jacketVhf, label: "V — VHF" },
                ]}
                label="Jackets"
              />
            </div>
          </div>
          {values.dinghiesHasDinghy ? (
            <div className="grid gap-2">
              <p className="text-sm font-semibold text-primary-foreground">
                Dinghies
              </p>
              <div className="grid gap-4 sm:grid-cols-4">
                <ReviewField label="Number" value={values.dinghiesNumber} />
                <ReviewField label="Capacity" value={values.dinghiesCapacity} />
                <ReviewField label="Color" value={values.dinghiesColor} />
                <ReviewField
                  label="Cover"
                  value={values.dinghiesCovered ? "Covered" : "Not covered"}
                />
              </div>
            </div>
          ) : (
            <ReviewField label="Dinghies" value="None" />
          )}
          <ReviewField label="Remarks" multiline value={values.remarks} />
        </div>
      </ReviewSection>
    </GlassSurface>
  );
}
