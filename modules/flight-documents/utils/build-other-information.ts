import {
  DEFAULT_AERODROME_CODE,
  DEFAULT_DEPARTURE_POINT_REMARK,
} from "@/modules/flight-documents/constants/flight-plan-options";
import { getAerodromeName } from "@/modules/flight-documents/constants/philippine-aerodromes";
import type { FlightPlanFilerContext } from "@/modules/flight-documents/types/filer-context";
import {
  formatLicenseLine,
  toLicenseShortForm,
} from "@/modules/flight-documents/utils/format-license-line";
import type { RatingOption } from "@/shared/types/rating-option";

export type OtherInformationInput = {
  dofRaw: string;
  departureAerodrome: string;
  destinationAerodrome: string;
  firstAlternateAerodrome: string;
  secondAlternateAerodrome: string;
};

function roleLabel(role: FlightPlanFilerContext["profile"]["role"]) {
  if (role === "student") {
    return "STUDENT";
  }

  if (role === "instructor") {
    return "FI";
  }

  return role.toUpperCase();
}

// The location text a DEP//DEST//ALTN//2ND-ALTN/ line carries: the
// school's home field for ZZZZ (editable afterwards), otherwise the
// selected aerodrome's code and name.
function aerodromeLineValue(code: string): string {
  const trimmed = code.trim().toUpperCase();

  if (!trimmed) {
    return "";
  }

  if (trimmed === DEFAULT_AERODROME_CODE) {
    return DEFAULT_DEPARTURE_POINT_REMARK;
  }

  const name = getAerodromeName(trimmed);

  return name ? `${trimmed} - ${name.toUpperCase()}` : trimmed;
}

export type AerodromeLineInput = {
  departureAerodrome: string;
  destinationAerodrome: string;
  firstAlternateAerodrome: string;
  secondAlternateAerodrome: string;
};

type AerodromeLinePrefix = "DEP" | "DEST" | "ALTN" | "2ND-ALTN";

const AERODROME_LINE_ORDER: Record<AerodromeLinePrefix, string[]> = {
  DEP: ["DOF"],
  DEST: ["DOF", "DEP"],
  ALTN: ["DOF", "DEP", "DEST"],
  "2ND-ALTN": ["DOF", "DEP", "DEST", "ALTN"],
};

function linePattern(prefix: string) {
  return new RegExp(`^\\s*${prefix}\\/`, "i");
}

// Reconciles the DEP/, DEST/, ALTN/, and 2ND-ALTN/ lines of Other
// Information with the selected aerodromes. DEP/ and DEST/ always carry
// the selection's value; alternate lines exist only while an alternate
// is chosen. Changing an aerodrome rewrites its line; every other line
// stays untouched, so this is safe after the user edits the text.
export function syncAerodromeLines(
  text: string,
  input: AerodromeLineInput,
): string {
  const lines = text ? text.split("\n") : [];

  const upsertLine = (prefix: AerodromeLinePrefix, code: string) => {
    const value = aerodromeLineValue(code);
    const index = lines.findIndex((line) => linePattern(prefix).test(line));

    if (!value) {
      if (index !== -1) {
        lines.splice(index, 1);
      }

      return;
    }

    if (index !== -1) {
      lines[index] = `${prefix}/ ${value}`;

      return;
    }

    let insertAt = 0;

    for (let i = 0; i < lines.length; i++) {
      if (
        AERODROME_LINE_ORDER[prefix].some((candidate) =>
          linePattern(candidate).test(lines[i]),
        )
      ) {
        insertAt = i + 1;
      }
    }

    lines.splice(insertAt, 0, `${prefix}/ ${value}`);
  };

  upsertLine("DEP", input.departureAerodrome);
  upsertLine("DEST", input.destinationAerodrome);
  upsertLine("ALTN", input.firstAlternateAerodrome);
  upsertLine("2ND-ALTN", input.secondAlternateAerodrome);

  return lines.join("\n");
}

// Rewrites the DOF/ line of Other Information with the current raw DOF,
// inserting it at the top when missing. Every other line stays.
export function syncDofLine(text: string, dofRaw: string): string {
  const lines = text ? text.split("\n") : [];
  const index = lines.findIndex((line) => /^\s*DOF\//i.test(line));
  const dofLine = `DOF/ ${dofRaw}`;

  if (index !== -1) {
    lines[index] = dofLine;
  } else {
    lines.unshift(dofLine);
  }

  return lines.join("\n");
}

// Default Item 18 (Other Information) text, one item per line, per the
// client's format: DOF/, then DEP/ and DEST/ (always present with the
// selected location — the school's home field when ZZZZ), ALTN/ and
// 2ND-ALTN/ while alternates are chosen, and the filer's RMK/ line.
// Auto-filled but user-editable.
export function buildOtherInformation(
  input: OtherInformationInput,
  context: FlightPlanFilerContext,
  ratingOptions: readonly RatingOption[],
): string {
  // Same short form as the signature block: "123456-SPL | C152 | 25 APR '24".
  const licenseLine = formatLicenseLine(
    context.licenses.map((license) => toLicenseShortForm(license, ratingOptions)),
  );
  const remark = [context.profile.fullName.toUpperCase(), licenseLine]
    .filter(Boolean)
    .join(" | ");

  const lines = [`DOF/ ${input.dofRaw}`];

  const pushAerodromeLine = (prefix: AerodromeLinePrefix, code: string) => {
    const value = aerodromeLineValue(code);

    if (value) {
      lines.push(`${prefix}/ ${value}`);
    }
  };

  pushAerodromeLine("DEP", input.departureAerodrome);
  pushAerodromeLine("DEST", input.destinationAerodrome);
  pushAerodromeLine("ALTN", input.firstAlternateAerodrome);
  pushAerodromeLine("2ND-ALTN", input.secondAlternateAerodrome);

  lines.push(`RMK/ ${roleLabel(context.profile.role)}: ${remark}`);

  return lines.join("\n");
}
