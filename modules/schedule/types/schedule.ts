import type { ScheduleSessionType } from "@/modules/schedule/constants/session-types";
import type { Database } from "@/shared/types/supabase";

export type ScheduleEntryRow =
  Database["public"]["Tables"]["schedule_entries"]["Row"];

export type ScheduleAircraft = {
  id: string;
  registrationMark: string;
  typeDesignator: string;
};

export type SchedulePerson = {
  id: string;
  fullName: string;
};

export type ScheduleEntry = {
  id: string;
  aircraftId: string;
  startsAt: string;
  endsAt: string;
  sessionType: ScheduleSessionType;
  pilot: SchedulePerson | null;
  instructor: SchedulePerson | null;
  label: string | null;
};

export type SchedulePing = {
  sentAt: string;
  sentByName: string | null;
};

export type ScheduleDay = {
  date: string;
  aircraft: ScheduleAircraft[];
  entries: ScheduleEntry[];
  lastPing: SchedulePing | null;
};

export type SchedulePersonOption = SchedulePerson & {
  roleLabel: string;
};
