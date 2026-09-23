"use client";

import Image from "next/image";
import { ImagePlusIcon, RotateCcwIcon, XIcon } from "lucide-react";
import { useEffect, useId, useMemo, useRef, type ChangeEvent } from "react";

import { compressImage } from "@/shared/lib/images/compress-image";
import { cn } from "@/shared/lib/utils";

export type GalleryImage = {
  id: string;
  url: string | null;
};

type ImageGalleryUploadFieldProps = {
  accept?: readonly string[] | string;
  className?: string;
  disabled?: boolean;
  errorText?: string;
  files: readonly File[];
  helperText?: string;
  id?: string;
  label: string;
  maxFiles: number;
  onFilesChange: (files: File[]) => void;
  onToggleRemove?: (imageId: string) => void;
  removedIds?: readonly string[];
  savedImages?: readonly GalleryImage[];
};

function fileSignature(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

export function ImageGalleryUploadField({
  accept,
  className,
  disabled = false,
  errorText,
  files,
  helperText,
  id,
  label,
  maxFiles,
  onFilesChange,
  onToggleRemove,
  removedIds = [],
  savedImages = [],
}: ImageGalleryUploadFieldProps) {
  const generatedId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = id ?? generatedId;
  const acceptValue =
    typeof accept === "string" ? accept : (accept?.join(",") ?? "image/*");
  const keptSaved = savedImages.filter(
    (image) => !removedIds.includes(image.id),
  );
  const used = keptSaved.length + files.length;
  const slotsLeft = Math.max(maxFiles - used, 0);

  const previews = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files],
  );

  useEffect(() => {
    return () => {
      for (const url of previews) {
        URL.revokeObjectURL(url);
      }
    };
  }, [previews]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const picked = await Promise.all(
      Array.from(event.target.files ?? [])
        .filter((file) => file.type.startsWith("image/"))
        .map(compressImage),
    );
    const signatures = new Set(files.map(fileSignature));
    const added = picked.filter((file) => !signatures.has(fileSignature(file)));

    onFilesChange([...files, ...added].slice(0, maxFiles - keptSaved.length));

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">
          {used} of {maxFiles} added
        </p>
      </div>

      <input
        ref={inputRef}
        accept={acceptValue}
        className="sr-only"
        disabled={disabled}
        id={inputId}
        multiple
        onChange={handleFileChange}
        type="file"
      />

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {savedImages.map((image) => {
          const isRemoved = removedIds.includes(image.id);

          return (
            <div className="relative aspect-square" key={image.id}>
              <div
                className={cn(
                  "relative size-full overflow-hidden rounded-xl bg-muted ring-1 ring-border",
                  isRemoved && "opacity-40",
                )}
              >
                {image.url && (
                  <Image
                    alt=""
                    className="object-cover"
                    fill
                    sizes="120px"
                    src={image.url}
                    unoptimized
                  />
                )}
              </div>
              {onToggleRemove && (
                <button
                  aria-label={
                    isRemoved ? "Keep this image" : "Remove this image"
                  }
                  className={cn(
                    "absolute -right-1.5 -top-1.5 flex size-7 cursor-pointer items-center justify-center rounded-full shadow-sm transition disabled:cursor-default",
                    isRemoved
                      ? "bg-background text-foreground ring-1 ring-border hover:bg-muted"
                      : "bg-destructive text-white hover:bg-destructive/90",
                  )}
                  disabled={disabled}
                  onClick={() => onToggleRemove(image.id)}
                  type="button"
                >
                  {isRemoved ? (
                    <RotateCcwIcon className="size-3.5" />
                  ) : (
                    <XIcon className="size-3.5" />
                  )}
                </button>
              )}
            </div>
          );
        })}

        {files.map((file, index) => (
          <div className="relative aspect-square" key={fileSignature(file)}>
            <div className="relative size-full overflow-hidden rounded-xl bg-muted ring-1 ring-primary/40">
              {previews[index] && (
                <Image
                  alt=""
                  className="object-cover"
                  fill
                  sizes="120px"
                  src={previews[index]}
                  unoptimized
                />
              )}
            </div>
            <button
              aria-label={`Remove ${file.name}`}
              className="absolute -right-1.5 -top-1.5 flex size-7 cursor-pointer items-center justify-center rounded-full bg-destructive text-white shadow-sm transition hover:bg-destructive/90 disabled:cursor-default"
              disabled={disabled}
              onClick={() =>
                onFilesChange(files.filter((_, at) => at !== index))
              }
              type="button"
            >
              <XIcon className="size-3.5" />
            </button>
          </div>
        ))}

        {slotsLeft > 0 && (
          <button
            className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-input bg-muted/30 text-muted-foreground transition hover:bg-muted/60 disabled:cursor-default disabled:opacity-50"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            <ImagePlusIcon className="size-5" />
            <span className="text-xs font-medium">Add</span>
          </button>
        )}
      </div>

      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
      {errorText && <p className="text-sm text-destructive">{errorText}</p>}
    </div>
  );
}
