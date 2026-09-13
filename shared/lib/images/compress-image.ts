// Phone cameras produce 4–12 MB photos. Vercel rejects any request body over
// 4.5 MB before our code runs, so an ID photo that passed the 5 MB check
// still died silently in production. Shrinking in the browser first keeps
// uploads well under that and makes the 5 MB limit a formality.
//
// Output is always JPEG: nothing we upload (IDs, licences, aircraft photos,
// avatars) needs transparency, and JPEG is the only format that reliably
// gets small. Anything that is not a raster image, or that fails to decode,
// is returned untouched so the normal validation still runs on it.

const MAX_EDGE_PX = 2000;
const SKIP_BELOW_BYTES = 1 * 1024 * 1024;
const JPEG_QUALITY = 0.85;

const COMPRESSIBLE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

function jpegName(name: string): string {
  const base = name.replace(/\.[^.]+$/, "");

  return `${base || "image"}.jpg`;
}

export async function compressImage(file: File): Promise<File> {
  if (!COMPRESSIBLE_TYPES.has(file.type) || file.size <= SKIP_BELOW_BYTES) {
    return file;
  }

  if (typeof createImageBitmap !== "function") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    const scale = Math.min(
      1,
      MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height),
    );
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    if (!context) {
      bitmap.close();
      return file;
    }

    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );

    if (!blob || blob.size >= file.size) {
      return file;
    }

    return new File([blob], jpegName(file.name), {
      type: "image/jpeg",
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  }
}
