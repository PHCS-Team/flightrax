"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function LogoutSuccessToast() {
  useEffect(() => {
    const url = new URL(window.location.href);

    if (url.searchParams.get("logout") !== "success") {
      return;
    }

    toast.success("Signed out successfully.");
    url.searchParams.delete("logout");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  return null;
}
