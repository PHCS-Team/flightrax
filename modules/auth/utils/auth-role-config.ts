import {
  CrownIcon,
  GraduationCapIcon,
  PlaneIcon,
  ShieldCheckIcon,
  type LucideIcon,
} from "lucide-react";

import { ROLE } from "@/shared/lib/rbac/config";
import type { ProfileRole } from "@/shared/lib/rbac/types";

export type AuthMode = "login" | "register";

export const AUTH_MODE = {
  LOGIN: "login",
  REGISTER: "register",
} as const satisfies Record<string, AuthMode>;

export const AUTH_MODE_CONFIG = {
  [AUTH_MODE.LOGIN]: {
    eyebrow: "Choose Access",
    title: "Select Your Organizational Entry Point",
    description:
      "Select your official organizational access to continue through the correct permission lane.",
    selectedDescription:
      "Enter your credentials to continue through the selected access lane.",
    submitLabel: "Sign in",
    switchPrompt: "Need access?",
    switchLabel: "Create an account",
    switchMode: AUTH_MODE.REGISTER,
  },
  [AUTH_MODE.REGISTER]: {
    eyebrow: "Choose Registration",
    title: "Select Your Registration Entry Point",
    description:
      "Select your official organizational access to register for the correct permission lane.",
    selectedDescription:
      "Complete the account details for the selected access lane.",
    submitLabel: "Register",
    switchPrompt: "Already have access?",
    switchLabel: "Sign in instead",
    switchMode: AUTH_MODE.LOGIN,
  },
} satisfies Record<
  AuthMode,
  {
    eyebrow: string;
    title: string;
    description: string;
    selectedDescription: string;
    submitLabel: string;
    switchPrompt: string;
    switchLabel: string;
    switchMode: AuthMode;
  }
>;

export const AUTH_ROLE_CONFIG = {
  [ROLE.STUDENT]: {
    label: "Student",
    eyebrow: "Campus Access",
    icon: GraduationCapIcon,
    title: {
      [AUTH_MODE.LOGIN]: "Student Sign In",
      [AUTH_MODE.REGISTER]: "Request Student Access",
    },
  },
  [ROLE.INSTRUCTOR]: {
    label: "Instructor",
    eyebrow: "Instructor Desk",
    icon: PlaneIcon,
    title: {
      [AUTH_MODE.LOGIN]: "Instructor Sign In",
      [AUTH_MODE.REGISTER]: "Create Instructor Access",
    },
  },
  [ROLE.ADMIN]: {
    label: "Admin",
    eyebrow: "Department Control",
    icon: ShieldCheckIcon,
    title: {
      [AUTH_MODE.LOGIN]: "Admin Sign In",
      [AUTH_MODE.REGISTER]: "Create Department Admin Access",
    },
  },
  [ROLE.SUPERADMIN]: {
    label: "Superadmin",
    eyebrow: "IT Command",
    icon: CrownIcon,
    title: {
      [AUTH_MODE.LOGIN]: "Superadmin Sign In",
      [AUTH_MODE.REGISTER]: "Create Superadmin Access",
    },
  },
} satisfies Record<
  ProfileRole,
  {
    label: string;
    eyebrow: string;
    icon: LucideIcon;
    title: Record<AuthMode, string>;
  }
>;
