"use client";

import { useEffect, useId, useMemo, useRef, type ChangeEvent } from "react";
import { ImageIcon, Trash2Icon, UploadCloudIcon } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { compressImage } from "@/shared/lib/images/compress-image";
import { cn } from "@/shared/lib/utils";

type ImagePreview = {
  name: string;
  sizeText: string;
  url: string;
};

type Theme = "light" | "dark";

export type ImageUploadFieldProps = {
  accept?: readonly string[] | string;
  className?: string;
  currentImageUrl?: string | null;
  disabled?: boolean;
  errorText?: string;
  helperText?: string;
  id?: string;
  label: string;
  onChange: (file: File | null) => void;
  required?: boolean;
  theme?: Theme;
  value?: File | null;
  variant?: "default" | "compact";
};

export function ImageUploadField({
  accept,
  className,
  currentImageUrl,
  disabled,
  errorText,
  helperText,
  id,
  label,
  onChange,
  required,
  theme = "light",
  value,
  variant = "default",
}: ImageUploadFieldProps) {
  const generatedId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = id ?? generatedId;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const errorId = errorText ? `${inputId}-error` : undefined;
  const describedBy =
    [helperId, errorId].filter(Boolean).join(" ") || undefined;
  const acceptValue =
    typeof accept === "string" ? accept : (accept?.join(",") ?? "image/*");
  const preview = useMemo(
    () =>
      value
        ? {
            name: value.name,
            sizeText: formatFileSize(value.size),
            url: URL.createObjectURL(value),
          }
        : null,
    [value],
  );

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview]);

  const showsCurrent = !preview && Boolean(currentImageUrl);

  function clearNativeInput() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []).find((file) =>
      file.type.startsWith("image/"),
    );

    onChange(picked ? await compressImage(picked) : null);
  }

  function handleRemove() {
    onChange(null);
    clearNativeInput();
  }

  const control = {
    currentImageUrl: showsCurrent ? currentImageUrl : null,
    disabled,
    errorText,
    onChoose: () => inputRef.current?.click(),
    onRemove: handleRemove,
    preview,
    theme,
  };

  return (
    <div className={cn("w-full min-w-0 max-w-full space-y-2", className)}>
      <label
        className={cn(
          "flex items-center gap-1.5 text-sm font-semibold",
          theme === "dark" ? "text-primary-foreground/90" : "text-foreground",
        )}
        htmlFor={inputId}
      >
        <span>{label}</span>
        {required && (
          <span
            className={cn(
              theme === "dark" ? "text-blue-300" : "text-secondary",
            )}
            aria-hidden="true"
          >
            *
          </span>
        )}
        {required && <span className="sr-only">required</span>}
      </label>

      <input
        ref={inputRef}
        accept={acceptValue}
        aria-describedby={describedBy}
        aria-invalid={Boolean(errorText)}
        aria-required={required}
        className="sr-only"
        disabled={disabled}
        id={inputId}
        onChange={handleFileChange}
        type="file"
      />

      {variant === "compact" ? (
        <CompactUploadControl {...control} />
      ) : (
        <DefaultUploadControl {...control} />
      )}

      {helperText && (
        <p
          className={cn(
            "text-xs",
            theme === "dark"
              ? "text-primary-foreground/70"
              : "text-muted-foreground",
          )}
          id={helperId}
        >
          {helperText}
        </p>
      )}
      {errorText && (
        <p className="text-sm text-destructive" id={errorId}>
          {errorText}
        </p>
      )}
    </div>
  );
}

type UploadControlProps = {
  currentImageUrl?: string | null;
  disabled?: boolean;
  errorText?: string;
  onChoose: () => void;
  onRemove: () => void;
  preview: ImagePreview | null;
  theme: Theme;
};

function CompactUploadControl({
  currentImageUrl,
  disabled,
  errorText,
  onChoose,
  onRemove,
  preview,
  theme,
}: UploadControlProps) {
  const showsCurrent = !preview && Boolean(currentImageUrl);

  return (
    <div
      className={cn(
        "min-h-12 w-full min-w-0 max-w-full overflow-hidden rounded-lg border border-dashed p-1 shadow-sm transition md:min-h-10 sm:rounded-2xl",
        "focus-within:ring-3 focus-within:ring-ring/50",
        theme === "dark"
          ? "border-primary-foreground/25 bg-primary-foreground/10"
          : "bg-muted/30 focus-within:border-ring",
        errorText &&
          (theme === "dark"
            ? "border-red-200/60 bg-red-200/10 focus-within:ring-red-200/25"
            : "border-destructive/50 bg-destructive/10 focus-within:ring-destructive/20"),
        disabled && "opacity-60",
      )}
    >
      <div className="flex min-h-10 w-full min-w-0 max-w-full items-center gap-2 overflow-hidden md:min-h-8">
        <button
          className={cn(
            "flex min-w-0 flex-1 cursor-pointer items-center gap-3 overflow-hidden rounded-md px-2 py-1 text-left transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default sm:rounded-xl",
            theme === "dark"
              ? "text-primary-foreground hover:bg-primary-foreground/10"
              : "text-foreground hover:bg-muted/50",
          )}
          disabled={disabled}
          onClick={onChoose}
          type="button"
        >
          <PreviewThumbnail
            imageUrl={showsCurrent ? currentImageUrl : undefined}
            preview={preview}
            size="compact"
            theme={theme}
          />
          <span className="min-w-0 flex-1 overflow-hidden">
            <span className="block truncate text-sm font-semibold">
              {preview
                ? preview.name
                : showsCurrent
                  ? "Current image"
                  : "Choose image"}
            </span>
            <span
              className={cn(
                "block truncate text-xs",
                theme === "dark"
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground",
              )}
            >
              {preview
                ? `${preview.sizeText} selected`
                : showsCurrent
                  ? "Choose a new image to replace it"
                  : "Select one image file"}
            </span>
          </span>
        </button>
        {preview && (
          <button
            aria-label={`Remove ${preview.name}`}
            className={cn(
              "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition hover:bg-destructive/15 hover:text-destructive focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default md:size-8",
              theme === "dark"
                ? "text-primary-foreground/80"
                : "text-muted-foreground/80",
            )}
            disabled={disabled}
            onClick={onRemove}
            type="button"
          >
            <Trash2Icon className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function DefaultUploadControl({
  currentImageUrl,
  disabled,
  errorText,
  onChoose,
  onRemove,
  preview,
  theme,
}: UploadControlProps) {
  const showsCurrent = !preview && Boolean(currentImageUrl);

  return (
    <div
      className={cn(
        "rounded-lg border border-dashed p-3 shadow-sm transition sm:rounded-2xl",
        "focus-within:ring-3 focus-within:ring-ring/50",
        theme === "dark"
          ? "border-primary-foreground/25 bg-primary-foreground/10"
          : "bg-muted/30 focus-within:border-ring",
        errorText &&
          (theme === "dark"
            ? "border-red-200/60 bg-red-200/10 focus-within:ring-red-200/25"
            : "border-destructive/50 bg-destructive/10 focus-within:ring-destructive/20"),
        disabled && "opacity-60",
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-[6rem_1fr] sm:items-center">
          <PreviewThumbnail
            imageUrl={showsCurrent ? currentImageUrl : undefined}
            preview={preview}
            size="default"
            theme={theme}
          />

          <div className="space-y-3">
            <div className="space-y-1">
              <p
                className={cn(
                  "text-sm font-semibold",
                  theme === "dark"
                    ? "text-primary-foreground"
                    : "text-foreground",
                )}
              >
                {preview
                  ? "Image ready for review"
                  : showsCurrent
                    ? "Current image"
                    : "Upload a clear image"}
              </p>
              <p
                className={cn(
                  "text-xs",
                  theme === "dark"
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground",
                )}
              >
                {showsCurrent
                  ? "Choose a new image to replace it."
                  : "Select one image file."}
              </p>
            </div>

            {theme === "dark" ? (
              <button
                className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-primary-foreground/25 bg-primary-foreground/10 px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary-foreground/20 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default disabled:opacity-50 sm:rounded-2xl"
                disabled={disabled}
                onClick={onChoose}
                type="button"
              >
                <UploadCloudIcon className="size-4" />
                {preview
                  ? "Choose different image"
                  : showsCurrent
                    ? "Replace image"
                    : "Choose image"}
              </button>
            ) : (
              <Button
                className="w-full"
                disabled={disabled}
                onClick={onChoose}
                type="button"
                variant="outline"
              >
                <UploadCloudIcon className="size-4" />
                {preview
                  ? "Choose different image"
                  : showsCurrent
                    ? "Replace image"
                    : "Choose image"}
              </Button>
            )}
          </div>
        </div>

        {preview && (
          <SelectedImageRow
            disabled={disabled}
            onRemove={onRemove}
            preview={preview}
            theme={theme}
          />
        )}
      </div>
    </div>
  );
}

function PreviewThumbnail({
  imageUrl,
  preview,
  size,
  theme,
}: {
  imageUrl?: string | null;
  preview: ImagePreview | null;
  size: "default" | "compact";
  theme: Theme;
}) {
  const backgroundUrl = preview?.url ?? imageUrl ?? null;

  return (
    <div
      className={cn(
        "relative flex max-w-full items-center justify-center overflow-hidden",
        theme === "dark"
          ? "border border-primary-foreground/15 bg-primary/20"
          : "border bg-muted/50",
        size === "compact"
          ? "size-10 shrink-0 rounded-md md:size-8 sm:rounded-xl"
          : "h-32 rounded-lg sm:h-24 sm:rounded-2xl",
      )}
    >
      {backgroundUrl ? (
        <div
          aria-label={
            preview ? `${preview.name} preview` : "Current image preview"
          }
          className="absolute inset-0 bg-cover bg-center"
          role="img"
          style={{ backgroundImage: `url(${backgroundUrl})` }}
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-full",
            theme === "dark"
              ? "bg-primary-foreground/15 text-primary-foreground"
              : "text-muted-foreground",
            size === "compact" ? "size-8 md:size-6" : "size-12",
          )}
        >
          <ImageIcon
            className={size === "compact" ? "size-4 md:size-3.5" : "size-6"}
          />
        </div>
      )}
    </div>
  );
}

function SelectedImageRow({
  disabled,
  onRemove,
  preview,
  theme,
}: {
  disabled?: boolean;
  onRemove: () => void;
  preview: ImagePreview;
  theme: Theme;
}) {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 max-w-full items-center justify-between gap-3 overflow-hidden rounded-lg p-3 text-sm sm:rounded-2xl",
        theme === "dark" ? "bg-primary-foreground/10" : "bg-muted/50",
      )}
    >
      <div className="min-w-0 flex-1 overflow-hidden">
        <p
          className={cn(
            "truncate font-medium",
            theme === "dark" ? "text-primary-foreground" : "text-foreground",
          )}
        >
          {preview.name}
        </p>
        <p
          className={cn(
            "truncate text-xs",
            theme === "dark"
              ? "text-primary-foreground/70"
              : "text-muted-foreground",
          )}
        >
          {preview.sizeText} selected
        </p>
      </div>
      <button
        aria-label={`Remove ${preview.name}`}
        className={cn(
          "flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full transition hover:bg-destructive/15 hover:text-destructive focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default",
          theme === "dark"
            ? "text-primary-foreground/80"
            : "text-muted-foreground/80",
        )}
        disabled={disabled}
        onClick={onRemove}
        type="button"
      >
        <Trash2Icon className="size-4" />
      </button>
    </div>
  );
}

function formatFileSize(sizeBytes: number) {
  return `${(sizeBytes / 1024 / 1024).toFixed(2)} MB`;
}
