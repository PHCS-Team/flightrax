"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch((error: unknown) => {
        if (process.env.NODE_ENV !== "production") {
          console.info("[sw] registration failed", error);
        }
      });
    };

    if (document.readyState === "complete") {
      register();

      return;
    }

    window.addEventListener("load", register);

    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
