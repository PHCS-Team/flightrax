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
    eyebrow: "Choose access",
    title: "Select your organizational entry point.",
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
    eyebrow: "Choose registration",
    title: "Select your registration entry point.",
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
    eyebrow: "Campus access",
    icon: GraduationCapIcon,
    title: {
      [AUTH_MODE.LOGIN]: "Student sign in",
      [AUTH_MODE.REGISTER]: "Request student access",
    },
  },
  [ROLE.INSTRUCTOR]: {
    label: "Instructor",
    eyebrow: "Instructor desk",
    icon: PlaneIcon,
    title: {
      [AUTH_MODE.LOGIN]: "Instructor sign in",
      [AUTH_MODE.REGISTER]: "Create instructor access",
    },
  },
  [ROLE.ADMIN]: {
    label: "Admin",
    eyebrow: "Department control",
    icon: ShieldCheckIcon,
    title: {
      [AUTH_MODE.LOGIN]: "Admin sign in",
      [AUTH_MODE.REGISTER]: "Create department admin access",
    },
  },
  [ROLE.SUPERADMIN]: {
    label: "Superadmin",
    eyebrow: "IT command",
    icon: CrownIcon,
    title: {
      [AUTH_MODE.LOGIN]: "Superadmin sign in",
      [AUTH_MODE.REGISTER]: "Create superadmin access",
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
