"use client";

import { MinusIcon, PlusIcon, ScanIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

const MAX_PIXEL_RATIO = 2;
// Pages are drawn above their fit-to-width size so zooming in stays sharp
// without re-rendering.
const RENDER_OVERSAMPLE = 1.6;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.5;

function clampZoom(value: number) {
  return Math.min(Math.max(value, MIN_ZOOM), MAX_ZOOM);
}

function ensurePromiseWithResolvers() {
  if (typeof Promise.withResolvers === "function") {
    return;
  }

  Promise.withResolvers = function withResolvers<T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    return { promise, resolve, reject };
  };
}

// Draws the PDF inside the app. An installed PWA cannot rely on the phone's
// PDF viewer: opening a blob URL from standalone mode lands on a blank page
// or throws the user out of the app.
export function PdfDocumentView({
  bytes,
  className,
  label,
}: {
  bytes: Uint8Array;
  className?: string;
  label: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [isRendering, setIsRendering] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const container = pagesRef.current;

      if (!container) {
        return;
      }

      try {
        // Legacy build: the modern one needs globals older iOS lacks.
        ensurePromiseWithResolvers();
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf/pdf.worker.min.mjs";

        const document = await pdfjs.getDocument({ data: bytes.slice() })
          .promise;

        if (cancelled) {
          return;
        }

        const width = scrollRef.current?.clientWidth || 360;
        const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
        const pages: HTMLCanvasElement[] = [];

        for (let number = 1; number <= document.numPages; number += 1) {
          const page = await document.getPage(number);
          const base = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({
            scale: (width / base.width) * ratio * RENDER_OVERSAMPLE,
          });
          const canvas = window.document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (!context) {
            continue;
          }

          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = "block w-full bg-white";
          canvas.setAttribute(
            "aria-label",
            `${label}, page ${number} of ${document.numPages}`,
          );

          await page.render({ canvas, canvasContext: context, viewport })
            .promise;

          if (cancelled) {
            return;
          }

          pages.push(canvas);
        }

        container.replaceChildren(...pages);
        setIsRendering(false);
      } catch (renderError) {
        if (cancelled) {
          return;
        }

        setError(
          renderError instanceof Error
            ? renderError.message
            : "The document could not be displayed.",
        );
        setIsRendering(false);
      }
    }

    void render();

    return () => {
      cancelled = true;
    };
  }, [bytes, label]);

  const zoomBy = useCallback((delta: number) => {
    setZoom((current) => clampZoom(current + delta));
  }, []);

  useEffect(() => {
    const scroll = scrollRef.current;

    if (!scroll) {
      return;
    }

    function distanceBetween(touches: TouchList) {
      const [first, second] = [touches[0], touches[1]];

      return Math.hypot(
        first.clientX - second.clientX,
        first.clientY - second.clientY,
      );
    }

    function onTouchStart(event: TouchEvent) {
      if (event.touches.length === 2) {
        pinchRef.current = {
          distance: distanceBetween(event.touches),
          zoom,
        };
      }
    }

    function onTouchMove(event: TouchEvent) {
      const pinch = pinchRef.current;

      if (!pinch || event.touches.length !== 2) {
        return;
      }

      event.preventDefault();
      setZoom(
        clampZoom(
          (pinch.zoom * distanceBetween(event.touches)) / pinch.distance,
        ),
      );
    }

    function onTouchEnd(event: TouchEvent) {
      if (event.touches.length < 2) {
        pinchRef.current = null;
      }
    }

    scroll.addEventListener("touchstart", onTouchStart, { passive: true });
    scroll.addEventListener("touchmove", onTouchMove, { passive: false });
    scroll.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      scroll.removeEventListener("touchstart", onTouchStart);
      scroll.removeEventListener("touchmove", onTouchMove);
      scroll.removeEventListener("touchend", onTouchEnd);
    };
  }, [zoom]);

  return (
    <div
      className={cn("flex min-h-0 flex-col gap-2 px-3 pb-3 pt-2", className)}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 px-3 py-2">
        <p className="min-w-0 truncate text-xs text-muted-foreground">
          Pinch to zoom, drag to move.
        </p>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            aria-label="Zoom out"
            className="size-9 p-0"
            disabled={zoom <= MIN_ZOOM}
            onClick={() => zoomBy(-ZOOM_STEP)}
            size="sm"
            type="button"
            variant="outline"
          >
            <MinusIcon className="size-4" />
          </Button>
          <span className="w-12 text-center text-xs font-medium tabular-nums text-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            aria-label="Zoom in"
            className="size-9 p-0"
            disabled={zoom >= MAX_ZOOM}
            onClick={() => zoomBy(ZOOM_STEP)}
            size="sm"
            type="button"
            variant="outline"
          >
            <PlusIcon className="size-4" />
          </Button>
          <Button
            aria-label="Fit to width"
            className="size-9 p-0"
            disabled={zoom === MIN_ZOOM}
            onClick={() => setZoom(MIN_ZOOM)}
            size="sm"
            type="button"
            variant="outline"
          >
            <ScanIcon className="size-4" />
          </Button>
        </div>
      </div>

      {isRendering && (
        <p className="shrink-0 animate-pulse py-8 text-center text-sm text-muted-foreground">
          Rendering the document...
        </p>
      )}
      {error && (
        <p className="py-8 text-center text-sm text-destructive">{error}</p>
      )}

      <div
        className="min-h-0 flex-1 touch-pan-x touch-pan-y overflow-auto overscroll-contain bg-muted/60"
        ref={scrollRef}
      >
        <div
          className="grid min-w-full gap-2"
          ref={pagesRef}
          style={{ width: `${zoom * 100}%` }}
        />
      </div>
    </div>
  );
}
