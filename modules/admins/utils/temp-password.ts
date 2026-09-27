import { randomInt } from "node:crypto";

// Unambiguous characters only — these get read aloud and retyped.
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

export function generateTempPassword(): string {
  const pick = (length: number) =>
    Array.from({ length }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");

  return `tmp-${pick(4)}-${pick(4)}`;
}
