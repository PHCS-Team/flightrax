"use client";

import { useEffect } from "react";

import { appMetadata } from "@/shared/lib/app-metadata";

let hasLoggedConsoleBranding = false;

export function BrowserConsoleBranding() {
  useEffect(() => {
    if (hasLoggedConsoleBranding) {
      return;
    }

    hasLoggedConsoleBranding = true;

    const contactLine = appMetadata.contact
      ? `Contact : ${appMetadata.contact}`
      : "Contact : set NEXT_PUBLIC_APP_CONTACT to publish a browser-safe channel";

    console.log(`
    ________    _       __    __             _  __
   / ____/ /   (_)___ _/ /_  / /__________ _| |/ /
  / /_  / /   / / __ \`/ __ \\/ __/ ___/ __ \\   /
 / __/ / /___/ / /_/ / / / / / /_/ /  / /_/ /   |
/_/   /_____/_/\\__, /_/_/ /_/\\__/_/   \\__,_/_/|_|
              /____/

FlightraX - Flight operations command center
Version : ${appMetadata.version}
Credits : ${appMetadata.credits}
${contactLine}
`);
  }, []);

  return null;
}
