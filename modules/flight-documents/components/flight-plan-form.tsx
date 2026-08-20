"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { InfoIcon, PenLineIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  useController,
  useForm,
  useWatch,
  type Control,
  type FieldPath,
  type UseFormRegisterReturn,
} from "react-hook-form";

import {
  COM_NAV_EQUIPMENT_OPTIONS,
  FLIGHT_RULES_OPTIONS,
  SURVEILLANCE_EQUIPMENT_OPTIONS,
  TYPE_OF_FLIGHT_OPTIONS,
  WAKE_TURBULENCE_CATEGORY_OPTIONS,
} from "@/modules/flight-documents/constants/flight-plan-options";
import { FLIGHT_PLAN_FORM_DEFAULTS } from "@/modules/flight-documents/constants/flight-plan-form-defaults";
import { useFlightPlanFilerContext } from "@/modules/flight-documents/hooks/use-filer-context.query";
import { useFlightPlanPicOptions } from "@/modules/flight-documents/hooks/use-pic-options.query";
import {
  flightPlanFormSchema,
  type FlightPlanFormValues,
} from "@/modules/flight-documents/schemas/flight-plan-schema";
import { buildOtherInformation } from "@/modules/flight-documents/utils/build-other-information";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import { Textarea } from "@/shared/components/ui/textarea";

// Everything typed on the flight plan is uppercase — displayed via CSS
// here and enforced server-side on save.
const INPUT_TEXT_CLASS = "text-[#121212] uppercase placeholder:normal-case";
const TEXTAREA_CLASS =
  "border-primary-foreground/20 bg-primary-foreground/95 text-[#121212] uppercase placeholder:normal-case placeholder:text-muted-foreground";


export function getFlightPlanFormDefaults(): FlightPlanFormValues {
  return {
    addressee: "",
    dofRaw: "",
    originator: "",
    departureTimeRaw: "",
    cruisingSpeed: "",
    cruisingLevel: "",
    route: "",
    totalEet: "",
    firstAlternateAerodrome: "",
    secondAlternateAerodrome: "",
    otherRemarks: "",
    endurance: "",
    dinghiesHasDinghy: false,
    dinghiesNumber: "",
    dinghiesCapacity: "",
    dinghiesCovered: false,
    dinghiesColor: "",
    pilotInCommandId: "",
    pilotInCommandName: "",
    ...FLIGHT_PLAN_FORM_DEFAULTS,
  };
}

export function FlightPlanForm({
  defaultValues,
  isSubmitting,
  onCancel,
  onSubmit,
  submitLabel,
}: {
  defaultValues?: FlightPlanFormValues;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (values: FlightPlanFormValues) => void;
  submitLabel: string;
}) {
  const form = useForm<FlightPlanFormValues>({
    resolver: zodResolver(flightPlanFormSchema),
    defaultValues: defaultValues ?? getFlightPlanFormDefaults(),
  });
  const errors = form.formState.errors;
  const { filerContext } = useFlightPlanFilerContext();
  const { picOptions } = useFlightPlanPicOptions();
  const hasDinghy = useWatch({
    control: form.control,
    name: "dinghiesHasDinghy",
  });
  const dofRaw = useWatch({ control: form.control, name: "dofRaw" });
  const [
    departureAerodrome,
    destinationAerodrome,
    firstAlternateAerodrome,
    secondAlternateAerodrome,
  ] = useWatch({
    control: form.control,
    name: [
      "departureAerodrome",
      "destinationAerodrome",
      "firstAlternateAerodrome",
      "secondAlternateAerodrome",
    ],
  });
  const pilotInCommandId = useWatch({
    control: form.control,
    name: "pilotInCommandId",
  });
  const isSelfPic = Boolean(
    filerContext && pilotInCommandId === filerContext.profile.id,
  );
  const [otherInfoEdited, setOtherInfoEdited] = useState(false);

  // Keep Other Information auto-filled from the DOF, any ZZZZ aerodromes
  // (DEP// DEST// ALTN/ lines), and the filer's licenses until the user
  // edits the field themselves.
  useEffect(() => {
    if (!filerContext || otherInfoEdited) {
      return;
    }

    form.setValue(
      "otherRemarks",
      buildOtherInformation(
        {
          dofRaw,
          departureAerodrome,
          destinationAerodrome,
          firstAlternateAerodrome,
          secondAlternateAerodrome,
        },
        filerContext,
      ),
      { shouldDirty: false },
    );
  }, [
    dofRaw,
    departureAerodrome,
    destinationAerodrome,
    firstAlternateAerodrome,
    secondAlternateAerodrome,
    filerContext,
    form,
    otherInfoEdited,
  ]);

  function handleSelfPicToggle(enabled: boolean) {
    if (!filerContext) {
      return;
    }

    if (enabled) {
      form.setValue("pilotInCommandId", filerContext.profile.id, {
        shouldDirty: true,
      });
      form.setValue("pilotInCommandName", filerContext.profile.fullName, {
        shouldDirty: true,
      });

      return;
    }

    form.setValue("pilotInCommandId", "", { shouldDirty: true });
    form.setValue("pilotInCommandName", "", { shouldDirty: true });
  }

  function handlePicSelect(picId: string) {
    const pic = picOptions.find((option) => option.id === picId);

    form.setValue("pilotInCommandId", pic?.id ?? "", { shouldDirty: true });
    form.setValue("pilotInCommandName", pic?.fullName ?? "", {
      shouldDirty: true,
    });
  }

  return (
    <form className="grid gap-6" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex items-start gap-1.5 rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 px-3 py-2 text-xs text-muted-foreground">
        <InfoIcon className="mt-0.5 size-3.5 shrink-0" />
        <p>
          Aircraft identification, type of aircraft, and aircraft colour &
          marking are auto-populated from the selected aircraft, so they do not
          appear on this form.
        </p>
      </div>

      <SectionHeading title="Section 1 — Header" />
      <div className="grid gap-4 sm:grid-cols-3">
        <FpTextField
          error={errors.addressee?.message}
          helper="Leave blank unless instructed"
          id="fp-addressee"
          label="Addressee(s)"
          optional
          placeholder="Enter addressee"
          register={form.register("addressee")}
        />
        <FpTextField
          error={errors.dofRaw?.message}
          helper="DDHHMM in zulu — e.g. 280100 = the 28th at 0100Z"
          id="fp-dof"
          maxLength={6}
          label="Date of Filing"
          placeholder="280100"
          register={form.register("dofRaw")}
          required
        />
        <FpTextField
          error={errors.originator?.message}
          helper="Leave blank unless instructed"
          id="fp-originator"
          label="Originator"
          optional
          placeholder="Enter originator"
          register={form.register("originator")}
        />
      </div>

      <SectionHeading title="Section 2 — Flight Information" />
      <div className="grid gap-4 sm:grid-cols-3">
        <FpSelectField
          control={form.control}
          error={errors.flightRules?.message}
          label="Flight Rules"
          name="flightRules"
          options={FLIGHT_RULES_OPTIONS}
        />
        <FpSelectField
          control={form.control}
          error={errors.typeOfFlight?.message}
          label="Type of Flight"
          name="typeOfFlight"
          options={TYPE_OF_FLIGHT_OPTIONS}
        />
        <FpTextField
          error={errors.numberOfAircraft?.message}
          id="fp-number-of-aircraft"
          label="Number of Aircraft"
          placeholder="1"
          register={form.register("numberOfAircraft")}
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <FpSelectField
          control={form.control}
          error={errors.wakeTurbulenceCategory?.message}
          label="Wake Turbulence Category"
          name="wakeTurbulenceCategory"
          options={WAKE_TURBULENCE_CATEGORY_OPTIONS}
        />
        <div className="grid content-start gap-2 sm:col-span-2">
          <p className="text-sm font-semibold text-foreground">Equipment</p>
          <div className="grid gap-3 rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 p-3 sm:grid-cols-2">
            <FpRadioGroup
              control={form.control}
              error={errors.comNavEquipment?.message}
              label="COM/NAV"
              name="comNavEquipment"
              options={COM_NAV_EQUIPMENT_OPTIONS}
            />
            <FpRadioGroup
              control={form.control}
              error={errors.surveillanceEquipment?.message}
              label="Surveillance"
              name="surveillanceEquipment"
              options={SURVEILLANCE_EQUIPMENT_OPTIONS}
            />
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FpTextField
          error={errors.departureAerodrome?.message}
          helper="ICAO code — if ZZZZ, add DEP/ location in Other Information"
          id="fp-departure-aerodrome"
          maxLength={4}
          label="Departure Aerodrome"
          placeholder="ZZZZ"
          register={form.register("departureAerodrome")}
          required
        />
        <FpTextField
          error={errors.departureTimeRaw?.message}
          helper="HHMM in zulu"
          id="fp-departure-time"
          maxLength={4}
          label="Departure Time"
          placeholder="0130"
          register={form.register("departureTimeRaw")}
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FpTextField
          error={errors.cruisingSpeed?.message}
          helper="e.g. N0110 = 110 knots"
          id="fp-cruising-speed"
          label="Cruising Speed"
          placeholder="N0110"
          register={form.register("cruisingSpeed")}
          required
        />
        <FpTextField
          error={errors.cruisingLevel?.message}
          helper="VFR, or e.g. A045 = 4,500 ft"
          id="fp-cruising-level"
          label="Cruising Level"
          placeholder="VFR"
          register={form.register("cruisingLevel")}
          required
        />
      </div>
      <FpTextareaField
        error={errors.route?.message}
        helper="Separate route points with commas, e.g. RPT-20 BINALONAN, RPUG, RPUS"
        id="fp-route"
        label="Route"
        optional
        placeholder="Enter route points"
        register={form.register("route")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FpTextField
          error={errors.destinationAerodrome?.message}
          helper="ICAO code — if ZZZZ, add DEST/ location in Other Information"
          id="fp-destination-aerodrome"
          maxLength={4}
          label="Destination Aerodrome"
          placeholder="ZZZZ"
          register={form.register("destinationAerodrome")}
          required
        />
        <FpTextField
          error={errors.totalEet?.message}
          helper="HHMM"
          id="fp-total-eet"
          maxLength={4}
          label="Total EET"
          placeholder="0130"
          register={form.register("totalEet")}
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FpTextField
          error={errors.firstAlternateAerodrome?.message}
          helper="ICAO code — if ZZZZ, add ALTN/ location in Other Information"
          id="fp-first-alternate"
          label="First Alternate Aerodrome"
          maxLength={4}
          optional
          placeholder="ICAO code"
          register={form.register("firstAlternateAerodrome")}
        />
        <FpTextField
          error={errors.secondAlternateAerodrome?.message}
          helper="ICAO code — if ZZZZ, add ALTN/ location in Other Information"
          id="fp-second-alternate"
          label="Second Alternate Aerodrome"
          maxLength={4}
          optional
          placeholder="ICAO code"
          register={form.register("secondAlternateAerodrome")}
        />
      </div>
      <FpTextareaField
        error={errors.otherRemarks?.message}
        helper="Auto-filled from your DOF, departure point, and licenses — edit as needed"
        id="fp-other-information"
        label="Other Information"
        register={form.register("otherRemarks", {
          onChange: () => {
            setOtherInfoEdited(true);
          },
        })}
        rows={4}
      />

      <SectionHeading title="Section 3 — Supplementary Information" />
      <div className="grid gap-4 sm:grid-cols-2">
        <FpTextField
          error={errors.endurance?.message}
          helper="HHMM"
          id="fp-endurance"
          maxLength={4}
          label="Endurance"
          placeholder="0430"
          register={form.register("endurance")}
          required
        />
        <FpTextField
          error={errors.personsOnBoard?.message}
          helper="3 digits (e.g. 002) or TBN"
          id="fp-persons-on-board"
          maxLength={3}
          label="Persons on Board"
          placeholder="002"
          register={form.register("personsOnBoard")}
          required
        />
      </div>
      <div className="grid gap-2">
        <p className="text-sm font-semibold text-foreground">
          Emergency &amp; Survival Equipment
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
            Tick all that apply — you can select multiple per category
          </span>
        </p>
      </div>
      <div className="-mt-4 grid gap-4 rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 p-3 sm:grid-cols-3">
        <FpCheckboxColumn
          control={form.control}
          items={[
            { label: "U — UHF", name: "emergencyRadioUhf" },
            { label: "V — VHF", name: "emergencyRadioVhf" },
            { label: "E — ELT", name: "emergencyRadioElt" },
          ]}
          label="Emergency Radio"
        />
        <FpCheckboxColumn
          control={form.control}
          items={[
            { label: "P — Polar", name: "survivalPolar" },
            { label: "D — Desert", name: "survivalDesert" },
            { label: "M — Maritime", name: "survivalMaritime" },
            { label: "J — Jungle", name: "survivalJungle" },
          ]}
          label="Survival Equipment"
        />
        <FpCheckboxColumn
          control={form.control}
          items={[
            { label: "L — Light", name: "jacketLight" },
            { label: "F — Fluorescent", name: "jacketFluorescent" },
            { label: "U — UHF", name: "jacketUhf" },
            { label: "V — VHF", name: "jacketVhf" },
          ]}
          label="Jackets"
        />
      </div>

      <div className="flex items-center gap-3">
        <p className="text-sm font-semibold text-foreground">
          Dinghies
          <span className="ml-0.5 text-xs font-normal text-muted-foreground">
            (optional)
          </span>
        </p>
        <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground">
          Has Dinghies
          <DinghySwitch control={form.control} isSubmitting={isSubmitting} />
        </label>
      </div>
      {hasDinghy && (
        <div className="grid gap-4 sm:grid-cols-4">
          <FpTextField
            error={errors.dinghiesNumber?.message}
            id="fp-dinghies-number"
            label="Number"
            optional
            placeholder="0"
            register={form.register("dinghiesNumber")}
          />
          <FpTextField
            error={errors.dinghiesCapacity?.message}
            id="fp-dinghies-capacity"
            label="Capacity"
            optional
            placeholder="0"
            register={form.register("dinghiesCapacity")}
          />
          <FpTextField
            error={errors.dinghiesColor?.message}
            id="fp-dinghies-color"
            label="Color"
            optional
            placeholder="Enter color"
            register={form.register("dinghiesColor")}
          />
          <FpCheckboxColumn
            control={form.control}
            items={[{ label: "Covered", name: "dinghiesCovered" }]}
            label="Cover"
          />
        </div>
      )}

      <FpTextareaField
        error={errors.remarks?.message}
        id="fp-remarks"
        label="Remarks"
        optional
        placeholder="Supplementary remarks"
        register={form.register("remarks")}
      />

      <div className="grid gap-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-foreground">
            Pilot in Command
            <span className="ml-1 text-secondary">*</span>
          </p>
          <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground">
            Set myself as PIC
            <Switch
              aria-label="Set myself as pilot in command"
              checked={isSelfPic}
              className="cursor-pointer"
              disabled={isSubmitting || !filerContext?.canSetSelfAsPic}
              onCheckedChange={handleSelfPicToggle}
            />
          </label>
        </div>
        {!filerContext?.canSetSelfAsPic && (
          <p className="text-xs text-muted-foreground">
            Setting yourself as PIC requires an active, non-expired PPL license.
          </p>
        )}
        {isSelfPic ? (
          <Input
            className={INPUT_TEXT_CLASS}
            disabled
            value={filerContext?.profile.fullName ?? ""}
          />
        ) : (
          <Select
            onValueChange={handlePicSelect}
            value={pilotInCommandId || undefined}
          >
            <SelectTrigger
              aria-invalid={Boolean(errors.pilotInCommandId)}
              className={INPUT_TEXT_CLASS}
              id="fp-pilot-in-command"
            >
              <SelectValue placeholder="Choose a flight instructor" />
            </SelectTrigger>
            <SelectContent>
              {picOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {errors.pilotInCommandId && (
          <p className="text-sm text-destructive">
            {errors.pilotInCommandId.message}
          </p>
        )}
      </div>

      <div className="flex items-start gap-1.5 rounded-lg border border-primary-foreground/15 bg-primary-foreground/5 px-3 py-2 text-xs text-muted-foreground">
        <PenLineIcon className="mt-0.5 size-3.5 shrink-0" />
        <p>
          Saving this flight plan automatically signs it with your registered
          signature from account settings.
        </p>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          disabled={isSubmitting}
          onClick={onCancel}
          type="button"
          variant="outline"
        >
          Cancel
        </Button>
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="grid gap-2">
      <div className="h-px w-full bg-primary-foreground/20" />
      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {title}
      </h3>
    </div>
  );
}

function DinghySwitch({
  control,
  isSubmitting,
}: {
  control: Control<FlightPlanFormValues>;
  isSubmitting: boolean;
}) {
  const { field } = useController({ control, name: "dinghiesHasDinghy" });

  return (
    <Switch
      aria-label="Has dinghies"
      checked={Boolean(field.value)}
      className="cursor-pointer"
      disabled={isSubmitting}
      onCheckedChange={field.onChange}
    />
  );
}

function FpTextField({
  error,
  helper,
  id,
  label,
  maxLength,
  optional = false,
  placeholder,
  register,
  required = false,
}: {
  error?: string;
  helper?: string;
  id: string;
  label: string;
  maxLength?: number;
  optional?: boolean;
  placeholder: string;
  register: UseFormRegisterReturn;
  required?: boolean;
}) {
  return (
    <div className="grid content-start gap-2">
      <label className="text-sm font-semibold text-foreground" htmlFor={id}>
        {label}
        {required && <span className="ml-1 text-secondary">*</span>}
        {optional && (
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            (optional)
          </span>
        )}
      </label>
      <Input
        aria-invalid={Boolean(error)}
        aria-required={required || undefined}
        className={INPUT_TEXT_CLASS}
        id={id}
        maxLength={maxLength}
        placeholder={placeholder}
        {...register}
      />
      {helper && !error && (
        <p className="text-xs text-muted-foreground">{helper}</p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function FpTextareaField({
  error,
  helper,
  id,
  label,
  optional = false,
  placeholder,
  register,
  rows = 3,
}: {
  error?: string;
  helper?: string;
  id: string;
  label: string;
  optional?: boolean;
  placeholder?: string;
  register: UseFormRegisterReturn;
  rows?: number;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-semibold text-foreground" htmlFor={id}>
        {label}
        {optional && (
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            (optional)
          </span>
        )}
      </label>
      <Textarea
        aria-invalid={Boolean(error)}
        className={TEXTAREA_CLASS}
        id={id}
        placeholder={placeholder}
        rows={rows}
        {...register}
      />
      {helper && !error && (
        <p className="text-xs text-muted-foreground">{helper}</p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function FpSelectField({
  control,
  error,
  label,
  name,
  options,
}: {
  control: Control<FlightPlanFormValues>;
  error?: string;
  label: string;
  name: FieldPath<FlightPlanFormValues>;
  options: ReadonlyArray<{ readonly value: string; readonly label: string }>;
}) {
  const { field } = useController({ control, name });

  return (
    <div className="grid content-start gap-2">
      <label className="text-sm font-semibold text-foreground" htmlFor={name}>
        {label}
        <span className="ml-1 text-secondary">*</span>
      </label>
      <Select
        onValueChange={field.onChange}
        value={typeof field.value === "string" ? field.value : undefined}
      >
        <SelectTrigger
          aria-invalid={Boolean(error)}
          aria-required="true"
          className={INPUT_TEXT_CLASS}
          id={name}
        >
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function FpRadioGroup({
  control,
  error,
  label,
  name,
  options,
}: {
  control: Control<FlightPlanFormValues>;
  error?: string;
  label: string;
  name: "comNavEquipment" | "surveillanceEquipment";
  options: ReadonlyArray<{ readonly value: string; readonly label: string }>;
}) {
  const { field } = useController({ control, name });

  return (
    <div className="grid content-start gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="grid gap-1.5">
        {options.map((option) => (
          <label
            className="flex cursor-pointer items-start gap-2 text-sm text-foreground"
            key={option.value}
          >
            <Checkbox
              checked={field.value === option.value}
              className="mt-0.5 cursor-pointer rounded-full"
              onCheckedChange={() => field.onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function FpCheckboxColumn({
  control,
  items,
  label,
}: {
  control: Control<FlightPlanFormValues>;
  items: { label: string; name: FieldPath<FlightPlanFormValues> }[];
  label: string;
}) {
  return (
    <div className="grid content-start gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="grid gap-1.5">
        {items.map((item) => (
          <FpBooleanCheckbox
            control={control}
            key={item.name}
            label={item.label}
            name={item.name}
          />
        ))}
      </div>
    </div>
  );
}

function FpBooleanCheckbox({
  control,
  label,
  name,
}: {
  control: Control<FlightPlanFormValues>;
  label: string;
  name: FieldPath<FlightPlanFormValues>;
}) {
  const { field } = useController({ control, name });

  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
      <Checkbox
        checked={Boolean(field.value)}
        className="cursor-pointer"
        onCheckedChange={(checked) => field.onChange(checked === true)}
      />
      {label}
    </label>
  );
}
