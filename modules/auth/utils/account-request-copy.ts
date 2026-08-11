import { ROLE, type AccountRequestRole } from "@/shared/lib/rbac/config";

type AccountRequestCopy = {
  idImageLabel: string;
  idNumberLabel: string;
  idNumberPlaceholder: string;
  sectionTitle: string;
};

export const ACCOUNT_REQUEST_COPY = {
  [ROLE.STUDENT]: {
    idImageLabel: "Student ID Image",
    idNumberLabel: "Student ID Number",
    idNumberPlaceholder: "Student ID number",
    sectionTitle: "Student Verification",
  },
  [ROLE.INSTRUCTOR]: {
    idImageLabel: "Instructor ID Image",
    idNumberLabel: "Instructor ID Number",
    idNumberPlaceholder: "Instructor ID number",
    sectionTitle: "Instructor Verification",
  },
} satisfies Record<AccountRequestRole, AccountRequestCopy>;
