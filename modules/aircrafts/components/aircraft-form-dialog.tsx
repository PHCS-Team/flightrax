"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlaneIcon } from "lucide-react";
import { type ReactNode } from "react";
import { useForm, useWatch, type UseFormRegisterReturn } from "react-hook-form";

import { useCreateAircraft } from "@/modules/aircrafts/hooks/use-create-aircraft.action";
import { useAircraftTypes } from "@/modules/aircrafts/hooks/use-aircraft-types.query";
import { useUpdateAircraft } from "@/modules/aircrafts/hooks/use-update-aircraft.action";
import { aircraftFormSchema } from "@/modules/aircrafts/schemas/aircraft-schema";
import type {
  Aircraft,
  AircraftFormInput,
} from "@/modules/aircrafts/types/aircraft";
import type { AircraftType } from "@/modules/aircrafts/types/aircraft-type";
import {
  AIRCRAFT_PHOTO_MAX_BYTES,
  AIRCRAFT_PHOTO_TYPES,
} from "@/modules/aircrafts/utils/aircraft-photo";
import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { ImageUploadField } from "@/shared/components/image-upload-field";
import { AircraftStatusPill } from "@/modules/aircrafts/components/aircraft-status-pill";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";

const AIRCRAFT_PHOTO_HELPER_TEXT = `JPG, PNG, or WebP only. Maximum file size is ${AIRCRAFT_PHOTO_MAX_BYTES / 1024 / 1024} MB. New uploads replace the current image.`;

function getDefaultValues(aircraft?: Aircraft): AircraftFormInput {
  return {
    aircraftIdentification: aircraft?.aircraftIdentification ?? "",
    aircraftType: aircraft?.aircraftType ?? "",
    colorMarkings: aircraft?.colorMarkings ?? "",
    model: aircraft?.model ?? "",
    photo: null,
    remarks: aircraft?.remarks ?? "",
    serialNumber: aircraft?.serialNumber ?? "",
    status: aircraft?.status ?? "active",
  };
}

export function AircraftFormDialog({
  aircraft,
  onOpenChange,
  open,
  trigger,
}: {
  aircraft?: Aircraft;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  trigger?: ReactNode;
}) {
  const isEditing = Boolean(aircraft);
  const dialogId = aircraft?.id ?? "new-aircraft";
  const form = useForm<AircraftFormInput>({
    resolver: zodResolver(aircraftFormSchema),
    defaultValues: getDefaultValues(aircraft),
  });
  const createAircraft = useCreateAircraft({
    onSaved: () => handleSaved(),
  });
  const updateAircraft = useUpdateAircraft({
    onSaved: () => handleSaved(),
  });
  const { aircraftTypes } = useAircraftTypes();
  const errors = form.formState.errors;
  const selectedStatus = useWatch({ control: form.control, name: "status" });
  const selectedTypeKey = useWatch({
    control: form.control,
    name: "aircraftType",
  });
  const selectedPhoto = useWatch({ control: form.control, name: "photo" });
  const selectedType = aircraftTypes.find(
    (type) => type.typeKey === selectedTypeKey,
  );
  const isExecuting = createAircraft.isExecuting || updateAircraft.isExecuting;

  function handleSaved() {
    onOpenChange(false);
  }

  function handleDialogOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      form.reset(getDefaultValues(aircraft));
    }

    onOpenChange(nextOpen);
  }

  function handleSubmit(values: AircraftFormInput) {
    if (aircraft) {
      updateAircraft.execute({ ...values, aircraftId: aircraft.id });
      return;
    }

    createAircraft.execute(values);
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-6 sm:max-w-2xl">
        <DialogSectionHeader
          description={
            isEditing
              ? `Update ${aircraft?.aircraftIdentification} and replace its image when needed.`
              : "Create an aircraft profile for fleet planning and flight plan defaults."
          }
          icon={PlaneIcon}
          title={isEditing ? "Edit Aircraft" : "Create Aircraft"}
        />

        <form className="grid gap-5" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="-mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Important Aircraft Details
            </h3>

            <AircraftStatusPill
              disabled={isExecuting}
              onChange={(value) =>
                form.setValue("status", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              size="sm"
              value={selectedStatus}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <label
                  className="text-sm font-semibold text-foreground"
                  htmlFor={`${dialogId}-type`}
                >
                  Aircraft Type
                  <span className="ml-1 text-secondary">*</span>
                </label>
                <span className="inline text-xs text-muted-foreground sm:hidden">
                  Manage types from the fleet page
                </span>
              </div>
              <Select
                onValueChange={(value) =>
                  form.setValue("aircraftType", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                value={selectedTypeKey}
              >
                <SelectTrigger
                  aria-invalid={Boolean(errors.aircraftType)}
                  aria-required="true"
                  id={`${dialogId}-type`}
                >
                  <SelectValue placeholder="Choose type" />
                </SelectTrigger>
                <SelectContent>
                  {aircraftTypes.map((type) => (
                    <SelectItem key={type.typeKey} value={type.typeKey}>
                      {type.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.aircraftType && (
                <p className="text-sm text-destructive">
                  {errors.aircraftType.message}
                </p>
              )}
            </div>
            <AircraftTextField
              error={errors.model?.message}
              id={`${dialogId}-model`}
              label="Model"
              placeholder="Cessna 172S Skyhawk"
              register={form.register("model")}
              required
            />
          </div>

          {selectedType && <TypeWbSpecsPreview aircraftType={selectedType} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <AircraftTextField
              error={errors.aircraftIdentification?.message}
              id={`${dialogId}-identification`}
              label="Aircraft Identification"
              placeholder="WCC trainer 218"
              register={form.register("aircraftIdentification")}
              required
            />
            <AircraftTextField
              error={errors.serialNumber?.message}
              id={`${dialogId}-serial`}
              label="Serial Number"
              placeholder="172-12345"
              register={form.register("serialNumber")}
              required
            />
          </div>

          <AircraftTextField
            error={errors.colorMarkings?.message}
            id={`${dialogId}-color-markings`}
            label="Color and Markings"
            placeholder="White fuselage with blue training stripe"
            register={form.register("colorMarkings")}
            required
          />

          <h3 className="-mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Additional Information
          </h3>

          <div className="grid gap-2">
            <label
              className="text-sm font-semibold text-foreground"
              htmlFor={`${dialogId}-remarks`}
            >
              Remarks
            </label>
            <Textarea
              id={`${dialogId}-remarks`}
              placeholder="Add dispatch notes, inspection context, or training restrictions"
              {...form.register("remarks")}
            />
          </div>

          <ImageUploadField
            accept={AIRCRAFT_PHOTO_TYPES}
            currentImageUrl={aircraft?.photoUrl ?? null}
            helperText={AIRCRAFT_PHOTO_HELPER_TEXT}
            id={`${dialogId}-photo`}
            label="Aircraft Image"
            onChange={(file) =>
              form.setValue("photo", file, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            required={false}
            value={selectedPhoto}
            variant="default"
          />

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
              {isExecuting
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                  ? "Save aircraft"
                  : "Create aircraft"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AircraftTextField({
  error,
  id,
  label,
  placeholder,
  register,
  required = false,
}: {
  error?: string;
  id: string;
  label: string;
  placeholder: string;
  register: UseFormRegisterReturn;
  required?: boolean;
}) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="grid gap-2">
      <label className="text-sm font-semibold text-foreground" htmlFor={id}>
        {label}
        {required && <span className="ml-1 text-secondary">*</span>}
      </label>
      <Input
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        aria-required={required || undefined}
        id={id}
        placeholder={placeholder}
        {...register}
      />
      {error && (
        <p className="text-sm text-destructive" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}

function TypeWbSpecsPreview({ aircraftType }: { aircraftType: AircraftType }) {
  const hasSpecs =
    aircraftType.usableFuelArm !== null ||
    aircraftType.fiAndStudentArm !== null ||
    aircraftType.maximumTakeoffWeight !== null ||
    aircraftType.baggageAreas.length > 0;

  return (
    <div className="rounded-lg border bg-muted/30 px-3 py-2.5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Inherited Configurations from Selected Aircraft Type
      </p>
      {hasSpecs ? (
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
          <TypeSpecPreviewStat
            label="Usable Fuel ARM"
            unit="in"
            value={aircraftType.usableFuelArm}
          />
          <TypeSpecPreviewStat
            label="FI + Student ARM"
            unit="in"
            value={aircraftType.fiAndStudentArm}
          />
          <TypeSpecPreviewStat
            label="MTOW"
            unit="lbs"
            value={aircraftType.maximumTakeoffWeight?.toLocaleString() ?? null}
          />
          <TypeSpecPreviewStat
            label="MBW"
            unit="lbs"
            value={
              aircraftType.baggageAreaMaxWeight > 0
                ? aircraftType.baggageAreaMaxWeight.toLocaleString()
                : null
            }
          />
          <TypeSpecPreviewStat
            label="Baggage Area ARM"
            unit="in"
            value={
              aircraftType.baggageAreas.length > 0
                ? aircraftType.baggageAreas.map((area) => area.arm).join(" / ")
                : null
            }
          />
        </div>
      ) : (
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          This type has no W&B configurations yet. Aircraft of this type inherit
          them once set under Types on the fleet page.
        </p>
      )}
    </div>
  );
}

function TypeSpecPreviewStat({
  label,
  unit,
  value,
}: {
  label: string;
  unit: string;
  value: number | string | null;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">
        {value === null ? (
          <span className="font-normal text-muted-foreground">Not set</span>
        ) : (
          <>
            {value}{" "}
            <span className="font-normal text-muted-foreground">{unit}</span>
          </>
        )}
      </p>
    </div>
  );
}
