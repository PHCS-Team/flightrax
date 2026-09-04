"use client";

import { useEffect, useState, type CSSProperties } from "react";

// When the soft keyboard opens, iOS shrinks the *visual* viewport but a
// `position: fixed` element centred in the layout viewport does not move,
// so a dialog's input can sit under the keyboard on first open. This
// returns an inline style that re-centres a translate(-50%,-50%) element
// inside the visible area while the keyboard is up, and nothing otherwise
// so the CSS centring stays in charge.
export function useVisualViewportCenter(): CSSProperties | undefined {
  const [style, setStyle] = useState<CSSProperties | undefined>(undefined);

  useEffect(() => {
    const viewport = window.visualViewport;

    if (!viewport) {
      return;
    }

    function update() {
      if (!viewport) {
        return;
      }

      // Keyboard (or any other overlay) is up when the visible height is
      // meaningfully shorter than the layout viewport.
      const keyboardOpen = viewport.height < window.innerHeight - 40;

      setStyle(
        keyboardOpen
          ? {
              top: viewport.offsetTop + viewport.height / 2,
              maxHeight: viewport.height - 16,
              overflowY: "auto",
            }
          : undefined,
      );
    }

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);

    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);

  return style;
}
