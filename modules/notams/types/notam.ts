import type { Database } from "@/shared/types/supabase";

type NotamRow = Database["public"]["Tables"]["notams"]["Row"];

export type Notam = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  severity: "advisory" | "warning" | "alert";
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NotamSeverity = Notam["severity"];

export function toNotam(row: NotamRow): Notam {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    severity: row.severity as NotamSeverity,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
