export const APP_SETTING_KEYS = {
  superadminFullNavigation: "superadmin_full_navigation",
} as const;

export type AppSettings = {
  // False hides every superadmin nav and route except Home and Users.
  superadminFullNavigation: boolean;
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  superadminFullNavigation: false,
};

export function toAppSettings(
  rows: readonly { key: string; value: unknown }[] | null | undefined,
): AppSettings {
  const settings = { ...DEFAULT_APP_SETTINGS };

  for (const row of rows ?? []) {
    if (
      row.key === APP_SETTING_KEYS.superadminFullNavigation &&
      typeof row.value === "boolean"
    ) {
      settings.superadminFullNavigation = row.value;
    }
  }

  return settings;
}
