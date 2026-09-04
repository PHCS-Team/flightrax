import { rgb, type PDFPage } from "pdf-lib";

const INK = rgb(0.07, 0.07, 0.07);

type ParsedSignature = {
  width: number;
  height: number;
  paths: { d: string; strokeWidth: number }[];
  dots: { cx: number; cy: number; r: number }[];
};

function readAttribute(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`\\s${name}="([^"]*)"`));

  return match ? match[1] : null;
}

export function parseSignatureSvg(svg: string): ParsedSignature | null {
  const svgTag = svg.match(/<svg[^>]*>/)?.[0];

  if (!svgTag) {
    return null;
  }

  const viewBox = readAttribute(svgTag, "viewBox")
    ?.split(/[\s,]+/)
    .map(Number);
  const width =
    viewBox && viewBox.length === 4
      ? viewBox[2]
      : Number(readAttribute(svgTag, "width"));
  const height =
    viewBox && viewBox.length === 4
      ? viewBox[3]
      : Number(readAttribute(svgTag, "height"));

  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    !width ||
    !height
  ) {
    return null;
  }

  const paths = Array.from(svg.matchAll(/<path[^>]*>/g)).flatMap((match) => {
    const d = readAttribute(match[0], "d");

    if (!d) {
      return [];
    }

    const strokeWidth = Number(readAttribute(match[0], "stroke-width") ?? "2");

    return [{ d, strokeWidth: Number.isFinite(strokeWidth) ? strokeWidth : 2 }];
  });

  const dots = Array.from(svg.matchAll(/<circle[^>]*>/g)).flatMap((match) => {
    const cx = Number(readAttribute(match[0], "cx"));
    const cy = Number(readAttribute(match[0], "cy"));
    const r = Number(readAttribute(match[0], "r"));

    return [cx, cy, r].every(Number.isFinite) ? [{ cx, cy, r }] : [];
  });

  if (paths.length === 0 && dots.length === 0) {
    return null;
  }

  return { width, height, paths, dots };
}

export function drawSignature(
  page: PDFPage,
  svg: string | null,
  box: { x: number; top: number; width: number; height: number },
): boolean {
  if (!svg) {
    return false;
  }

  const parsed = parseSignatureSvg(svg);

  if (!parsed) {
    return false;
  }

  const scale = Math.min(box.width / parsed.width, box.height / parsed.height);
  const drawnWidth = parsed.width * scale;
  const drawnHeight = parsed.height * scale;
  const x = box.x + (box.width - drawnWidth) / 2;
  const top = box.top - (box.height - drawnHeight);

  for (const path of parsed.paths) {
    page.drawSvgPath(path.d, {
      x,
      y: top,
      scale,
      borderColor: INK,
      borderWidth: Math.max(0.4, path.strokeWidth * scale),
      color: undefined,
    });
  }

  for (const dot of parsed.dots) {
    page.drawCircle({
      x: x + dot.cx * scale,
      y: top - dot.cy * scale,
      size: Math.max(0.4, dot.r * scale),
      color: INK,
    });
  }

  return true;
}
