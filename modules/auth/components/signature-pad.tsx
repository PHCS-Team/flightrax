"use client";

import { useEffect, useRef, useState } from "react";
import type { PointGroup } from "signature_pad";
import SignaturePadLib from "signature_pad";

import { Button } from "@/shared/components/ui/button";

type SignaturePadProps = {
  currentSignature?: string | null;
  onSave: (svg: string) => void;
  isSaving: boolean;
  label?: string;
};

export function SignaturePad({
  currentSignature,
  onSave,
  isSaving,
  label = "Signature",
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePadLib | null>(null);
  const historyRef = useRef<PointGroup[][]>([]);
  const [canUndo, setCanUndo] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pad = new SignaturePadLib(canvas, {
      penColor: "#121212",
      backgroundColor: "transparent",
    });
    padRef.current = pad;
    historyRef.current = [];
    setCanUndo(false);

    pad.addEventListener("endStroke", () => {
      const data = pad.toData();
      if (data.length > 0) {
        const snapshot = data.map((g) => ({ ...g, points: [...g.points] }));
        historyRef.current = [...historyRef.current, snapshot];
        setCanUndo(true);
      }
    });

    function resize() {
      if (!canvas) return;
      const data = pad.toData();
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(ratio, ratio);
      }
      if (data.length > 0) {
        pad.fromData(data);
      }
    }

    resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      pad.off();
      padRef.current = null;
    };
  }, []);

  useEffect(() => {
    const pad = padRef.current;
    if (!pad || !currentSignature) return;

    const svgDataUrl = `data:image/svg+xml,${encodeURIComponent(currentSignature)}`;
    pad.fromDataURL(svgDataUrl);
  }, [currentSignature]);

  function handleUndo() {
    const pad = padRef.current;
    if (!pad) return;

    const history = historyRef.current;
    if (history.length === 0) return;

    history.pop();
    historyRef.current = history;
    setCanUndo(history.length > 0);

    if (history.length === 0) {
      pad.clear();
    } else {
      pad.fromData(history[history.length - 1]);
    }
  }

  function handleClear() {
    padRef.current?.clear();
    historyRef.current = [];
    setCanUndo(false);
  }

  function handleSave() {
    const pad = padRef.current;
    if (!pad || pad.isEmpty()) return;

    onSave(pad.toSVG());
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-primary-foreground/90">
        {label}
      </p>
      <canvas
        ref={canvasRef}
        className="h-48 w-full rounded-lg border border-border bg-white"
      />
      <div className="-mt-1.5 flex items-center justify-between">
        <p className="text-xs text-primary-foreground/60">
          Draw your signature
        </p>
        <div className="flex gap-1">
          <Button
            className="h-6 px-3 text-xs"
            disabled={!canUndo}
            onClick={handleUndo}
            type="button"
            variant="ghost"
          >
            Undo
          </Button>
          <Button
            className="h-6 px-3 text-xs"
            onClick={handleClear}
            type="button"
            variant="ghost"
          >
            Clear
          </Button>
        </div>
      </div>
      <Button
        className="w-full"
        disabled={isSaving}
        onClick={handleSave}
        type="button"
      >
        {isSaving ? "Saving..." : "Save signature"}
      </Button>
    </div>
  );
}
