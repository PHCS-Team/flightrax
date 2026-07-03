const DEFAULT_APP_VERSION = "0.1.0";
const DEFAULT_APP_CREDITS = "WCC Flight Operations";
const DEFAULT_APP_CONTACT = "";

type AppMetadata = {
  contact: string;
  contactHref: string | null;
  credits: string;
  version: string;
};

function readPublicMetadataValue(value: string | undefined, fallback: string) {
  const trimmedValue = value?.trim();

  return trimmedValue && trimmedValue.length > 0 ? trimmedValue : fallback;
}

function resolveContactHref(contact: string) {
  if (!contact) {
    return null;
  }

  if (/^(mailto:|https?:\/\/)/i.test(contact)) {
    return contact;
  }

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
    return `mailto:${contact}`;
  }

  return null;
}

const contact = readPublicMetadataValue(
  process.env.NEXT_PUBLIC_APP_CONTACT,
  DEFAULT_APP_CONTACT,
);

export const appMetadata = {
  contact,
  contactHref: resolveContactHref(contact),
  credits: readPublicMetadataValue(
    process.env.NEXT_PUBLIC_APP_CREDITS,
    DEFAULT_APP_CREDITS,
  ),
  version: readPublicMetadataValue(
    process.env.NEXT_PUBLIC_APP_VERSION,
    DEFAULT_APP_VERSION,
  ),
} satisfies AppMetadata;
