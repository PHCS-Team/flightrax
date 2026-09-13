import type { ScheduleAircraft } from "@/modules/schedule/types/schedule";

export type ScheduleAircraftGroup = {
  label: string;
  aircraft: ScheduleAircraft[];
};

// The fleet arrives sorted by type, so consecutive aircraft of one type
// collapse into a group and the board draws the type once, like the merged
// cell on the Excel sheet.
export function groupAircraftByType(
  aircraft: ScheduleAircraft[],
): ScheduleAircraftGroup[] {
  const groups: ScheduleAircraftGroup[] = [];

  for (const item of aircraft) {
    const last = groups[groups.length - 1];

    if (last && last.label === item.typeDesignator) {
      last.aircraft.push(item);
    } else {
      groups.push({ label: item.typeDesignator, aircraft: [item] });
    }
  }

  return groups;
}
