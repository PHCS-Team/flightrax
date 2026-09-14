import type { Database } from "@/shared/types/supabase";

export type ScheduleUploadRow =
  Database["public"]["Tables"]["schedule_uploads"]["Row"];

export type ScheduleUploadSheetRow =
  Database["public"]["Tables"]["schedule_upload_sheets"]["Row"];

export type ScheduleSheetAlign = "left" | "center" | "right";

export type ScheduleSheetCell = {
  r: number;
  c: number;
  v: string;
  fill?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  align?: ScheduleSheetAlign;
  wrap?: boolean;
};

export type ScheduleSheetMerge = {
  r: number;
  c: number;
  rowSpan: number;
  colSpan: number;
};

export type ScheduleSheetGrid = {
  rowCount: number;
  colCount: number;
  colWidths: number[];
  rowHeights: number[];
  merges: ScheduleSheetMerge[];
  cells: ScheduleSheetCell[];
};

export type ParsedScheduleSheet = {
  position: number;
  name: string;
  boardDate: string | null;
  grid: ScheduleSheetGrid;
};

export type ScheduleUpload = {
  id: string;
  label: string | null;
  fileName: string;
  sizeBytes: number;
  startsOn: string;
  endsOn: string;
  sheetCount: number;
  uploadedByName: string | null;
  createdAt: string;
};

export type ScheduleUploadSheet = {
  id: string;
  position: number;
  name: string;
  boardDate: string | null;
  grid: ScheduleSheetGrid;
};

export type ScheduleUploadDetail = ScheduleUpload & {
  downloadUrl: string | null;
  sheets: ScheduleUploadSheet[];
};
