"use client";

import { useEffect, useState, type CSSProperties } from "react";

// Sibling of useVisualViewportCenter, for bottom-anchored surfaces.
//
// A bottom sheet is pinned with `bottom: 0`, which is measured against the
// *layout* viewport. The soft keyboard shrinks only the *visual* viewport, so
// the sheet stays exactly where it was and the keyboard covers it. Centring
// is the wrong correction here — the sheet has to be lifted by the height of
// the keyboard instead.
export function useVisualViewportBottomInset(): CSSProperties | undefined {
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

      // What the layout viewport has that the visible area does not: the
      // keyboard, plus any browser chrome that slid in with it.
      const hiddenBelow = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop,
      );

      setStyle(
        hiddenBelow > 40
          ? {
              bottom: hiddenBelow,
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
