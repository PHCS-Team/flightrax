"use client";

import { useMemo } from "react";

import type { SchedulePersonOption } from "@/modules/schedule/types/schedule";
import { PersonSelectField } from "@/shared/components/person-select-field";
import { describeExpiredCredentials } from "@/shared/lib/aviation/expired-credentials";

export function SchedulePersonField({
  disabled = false,
  error,
  id,
  isLoading,
  label,
  onChange,
  people,
  value,
}: {
  disabled?: boolean;
  error?: string;
  id: string;
  isLoading: boolean;
  label: string;
  onChange: (value: string) => void;
  people: SchedulePersonOption[];
  value: string;
}) {
  const options = useMemo(
    () =>
      people.map((person) => ({
        id: person.id,
        fullName: person.fullName,
        meta: person.roleLabel,
        note:
          person.expiredCredentials.length > 0
            ? describeExpiredCredentials(person.expiredCredentials)
            : undefined,
        disabled: person.expiredCredentials.length > 0,
      })),
    [people],
  );

  return (
    <PersonSelectField
      disabled={disabled}
      error={error}
      id={id}
      isLoading={isLoading}
      label={label}
      noneLabel="None"
      onChange={onChange}
      options={options}
      value={value}
    />
  );
}
