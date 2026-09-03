// Permissions that span more than one module live here instead of a
// module's constants/permissions.ts.

// Open the license/certificate details dialogs from the user tables.
export const CREDENTIALS_VIEW_DETAILS = "credentials.view_details" as const;

// Held only by superadmins. `hasPermission` short-circuits for that role,
// so this doubles as the gate for surfaces that are superadmin-only.
export const SYSTEM_MANAGE = "system.manage" as const;
