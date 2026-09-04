"use client";

import { PlusIcon, ScaleIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import { useSetAircraftTypeWbSpecs } from "@/modules/aircrafts/hooks/use-set-aircraft-type-wb-specs.action";
import { DECIMAL_NUMBER_PATTERN } from "@/shared/validations/number-patterns";
import type { AircraftType } from "@/modules/aircrafts/types/aircraft-type";
import { ConfirmationDialog } from "@/shared/components/layout/confirmation-dialog";
import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";

const MAX_BAGGAGE_AREAS = 6;

export function AircraftTypeWbSpecsDialog({
  aircraftType,
  onOpenChange,
  open,
}: {
  aircraftType: AircraftType;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-6 sm:max-w-md">
        <DialogSectionHeader
          description={`The ICAO designator and weight and balance specifications for ${aircraftType.type}. Every aircraft of this type shares these values.`}
          icon={ScaleIcon}
          title="Type Specifications"
        />
        <WbSpecsForm aircraftType={aircraftType} onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}

function WbSpecsForm({
  aircraftType,
  onOpenChange,
}: {
  aircraftType: AircraftType;
  onOpenChange: (open: boolean) => void;
}) {
  const [icaoDesignator, setIcaoDesignator] = useState(
    aircraftType.icaoDesignator,
  );
  const [usableFuelArm, setUsableFuelArm] = useState(() =>
    aircraftType.usableFuelArm === null
      ? ""
      : String(aircraftType.usableFuelArm),
  );
  const [fiAndStudentArm, setFiAndStudentArm] = useState(() =>
    aircraftType.fiAndStudentArm === null
      ? ""
      : String(aircraftType.fiAndStudentArm),
  );
  const [maximumTakeoffWeight, setMaximumTakeoffWeight] = useState(() =>
    aircraftType.maximumTakeoffWeight === null
      ? ""
      : String(aircraftType.maximumTakeoffWeight),
  );
  const [hasBaggage, setHasBaggage] = useState(
    () =>
      aircraftType.baggageAreas.length > 0 ||
      aircraftType.baggageAreaMaxWeight > 0,
  );
  const [baggageAreaMaxWeight, setBaggageAreaMaxWeight] = useState(() =>
    String(aircraftType.baggageAreaMaxWeight),
  );
  const [baggageArms, setBaggageArms] = useState<string[]>(() =>
    aircraftType.baggageAreas.map((area) => String(area.arm)),
  );
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveSpecs = useSetAircraftTypeWbSpecs({
    onSaved: () => onOpenChange(false),
  });
  const isExecuting = saveSpecs.isExecuting;

  function handleBaggageToggle(enabled: boolean) {
    if (enabled) {
      setHasBaggage(true);

      if (baggageArms.length === 0) {
        setBaggageArms([""]);
      }

      return;
    }

    const hasData =
      baggageArms.some((arm) => arm.trim() !== "") ||
      (baggageAreaMaxWeight.trim() !== "" && Number(baggageAreaMaxWeight) > 0);

    if (hasData) {
      setClearConfirmOpen(true);
      return;
    }

    clearBaggage();
  }

  function clearBaggage() {
    setHasBaggage(false);
    setBaggageArms([]);
    setBaggageAreaMaxWeight("0");
    setClearConfirmOpen(false);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const scalars = [usableFuelArm, fiAndStudentArm, maximumTakeoffWeight];
    const areas = baggageArms.map((arm) => arm.trim());

    if (!/^[A-Z0-9]{2,4}$/.test(icaoDesignator)) {
      setError("Enter the 2–4 character ICAO type designator, e.g. C152.");
      return;
    }

    if (
      scalars.some(
        (value) => !DECIMAL_NUMBER_PATTERN.test(value.trim()) || Number(value) <= 0,
      )
    ) {
      setError(
        "Enter a valid positive number for the ARMs and maximum takeoff weight.",
      );
      return;
    }

    if (hasBaggage) {
      if (areas.length === 0) {
        setError("Add at least one baggage area or turn Has Baggage off.");
        return;
      }

      if (areas.some((arm) => !DECIMAL_NUMBER_PATTERN.test(arm) || Number(arm) <= 0)) {
        setError("Enter a valid positive ARM for every baggage area.");
        return;
      }

      if (!DECIMAL_NUMBER_PATTERN.test(baggageAreaMaxWeight.trim())) {
        setError("Enter a valid baggage area max weight.");
        return;
      }
    }

    setError(null);
    saveSpecs.execute({
      typeKey: aircraftType.typeKey,
      icaoDesignator,
      usableFuelArm: Number(usableFuelArm),
      fiAndStudentArm: Number(fiAndStudentArm),
      maximumTakeoffWeight: Number(maximumTakeoffWeight),
      baggageAreaMaxWeight: hasBaggage ? Number(baggageAreaMaxWeight) : 0,
      baggageAreas: hasBaggage
        ? areas.map((arm) => ({ arm: Number(arm) }))
        : [],
    });
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <h3 className="-mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Identification
      </h3>
      <div className="grid gap-2">
        <label
          className="text-sm font-semibold text-foreground"
          htmlFor="type-icao-designator"
        >
          ICAO Designator
          <span className="ml-1 text-secondary">*</span>
        </label>
        <Input
          autoCapitalize="characters"
          className="border-border bg-muted/30 font-mono uppercase text-[#121212] placeholder:normal-case placeholder:font-sans placeholder:text-muted-foreground/55 disabled:cursor-default"
          disabled={isExecuting}
          id="type-icao-designator"
          maxLength={4}
          onChange={(event) =>
            setIcaoDesignator(
              event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
            )
          }
          placeholder="C152"
          value={icaoDesignator}
        />
      </div>

      <h3 className="-mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        ARM Specifications
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <SpecField
          hint="in"
          id="type-usable-fuel-arm"
          isExecuting={isExecuting}
          label="Usable Fuel ARM"
          onChange={setUsableFuelArm}
          value={usableFuelArm}
        />
        <SpecField
          hint="in"
          id="type-fi-and-student-arm"
          isExecuting={isExecuting}
          label="FI + Student ARM"
          onChange={setFiAndStudentArm}
          value={fiAndStudentArm}
        />
      </div>

      <h3 className="-mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Weight Limits
      </h3>
      <SpecField
        hint="lbs"
        id="type-maximum-takeoff-weight"
        isExecuting={isExecuting}
        label="Max Takeoff Weight"
        onChange={setMaximumTakeoffWeight}
        value={maximumTakeoffWeight}
      />

      <div className="-mb-2 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Baggage Areas
        </h3>
        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground">
          Has Baggage
          <Switch
            aria-label="Has baggage areas"
            checked={hasBaggage}
            className="cursor-pointer data-disabled:cursor-not-allowed"
            disabled={isExecuting}
            onCheckedChange={handleBaggageToggle}
          />
        </label>
      </div>
      {!hasBaggage ? (
        <p className="rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          No baggage areas. Aircraft of this type have no baggage compartment.
        </p>
      ) : (
        <div className="grid gap-3">
          <SpecField
            hint="lbs"
            id="type-baggage-area-max-weight"
            isExecuting={isExecuting}
            label="Max Baggage Weight"
            onChange={setBaggageAreaMaxWeight}
            value={baggageAreaMaxWeight}
          />
          {baggageArms.map((arm, index) => (
            <div className="grid gap-2" key={index}>
              <label
                className="text-sm font-semibold text-foreground"
                htmlFor={`baggage-area-arm-${index}`}
              >
                Baggage Area {index + 1} ARM
                <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                  (in)
                </span>
                <span className="ml-1 text-secondary">*</span>
              </label>
              <div className="flex items-center gap-2">
                <Input
                  className="flex-1 border-border bg-muted/30 text-[#121212] placeholder:text-muted-foreground/55"
                  disabled={isExecuting}
                  id={`baggage-area-arm-${index}`}
                  min={0}
                  onChange={(event) =>
                    setBaggageArms((prev) =>
                      prev.map((value, i) =>
                        i === index ? event.target.value : value,
                      ),
                    )
                  }
                  placeholder="0.00"
                  step="any"
                  type="number"
                  value={arm}
                />
                <Button
                  aria-label={`Remove baggage area ${index + 1}`}
                  className="size-9 shrink-0"
                  disabled={isExecuting}
                  onClick={() =>
                    setBaggageArms((prev) => prev.filter((_, i) => i !== index))
                  }
                  size="icon"
                  type="button"
                  variant="destructive"
                >
                  <Trash2Icon className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
          <Button
            className="justify-self-start"
            disabled={isExecuting || baggageArms.length >= MAX_BAGGAGE_AREAS}
            onClick={() => setBaggageArms((prev) => [...prev, ""])}
            type="button"
            variant="outline"
          >
            <PlusIcon className="size-4" />
            Add baggage area
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <DialogFooter className="-mx-6 -mb-6 mt-1 sm:justify-end">
        <Button
          disabled={isExecuting}
          onClick={() => onOpenChange(false)}
          type="button"
          variant="outline"
        >
          Cancel
        </Button>
        <Button disabled={isExecuting} type="submit">
          {isExecuting ? "Saving..." : "Save specifications"}
        </Button>
      </DialogFooter>

      <ConfirmationDialog
        confirmLabel="Clear baggage data"
        confirmingLabel="Clearing..."
        description="Turning this off clears every baggage area ARM and resets the baggage area max weight to 0. Nothing is deleted until you save the specifications."
        icon={Trash2Icon}
        isConfirming={false}
        onConfirm={clearBaggage}
        onOpenChange={setClearConfirmOpen}
        open={clearConfirmOpen}
        title="Clear Baggage Data?"
      />
    </form>
  );
}

function SpecField({
  disabled = false,
  hint,
  id,
  isExecuting,
  label,
  onChange,
  required = true,
  value,
}: {
  disabled?: boolean;
  hint: string;
  id: string;
  isExecuting: boolean;
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  value: string;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-semibold text-foreground" htmlFor={id}>
        {label}
        <span className="ml-0.5 text-xs font-normal text-muted-foreground">
          ({hint})
        </span>
        {required && <span className="ml-1 text-secondary">*</span>}
      </label>
      <Input
        className="border-border bg-muted/30 text-[#121212] placeholder:text-muted-foreground/55 disabled:cursor-default"
        disabled={disabled || isExecuting}
        id={id}
        min={0}
        onChange={(event) => onChange(event.target.value)}
        placeholder="0.00"
        step="any"
        type="number"
        value={value}
      />
    </div>
  );
}
