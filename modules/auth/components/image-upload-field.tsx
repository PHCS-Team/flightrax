"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { ImageIcon, Trash2Icon, UploadCloudIcon } from "lucide-react";

import { AuthFieldLabel } from "@/modules/auth/components/auth-field-label";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

type ImagePreview = {
  key: string;
  name: string;
  sizeText: string;
  url: string;
};

type ImageUploadFieldBaseProps = {
  accept?: readonly string[] | string;
  className?: string;
  disabled?: boolean;
  errorText?: string;
  helperText?: string;
  id?: string;
  label: string;
  required?: boolean;
  variant?: "default" | "compact";
};

type SingleImageUploadFieldProps = ImageUploadFieldBaseProps & {
  multiple?: false;
  onChange: (file: File | null) => void;
  value?: File | null;
};

type MultipleImageUploadFieldProps = ImageUploadFieldBaseProps & {
  multiple: true;
  onChange: (files: File[]) => void;
  value?: readonly File[];
};

export type ImageUploadFieldProps = SingleImageUploadFieldProps | MultipleImageUploadFieldProps;

export function ImageUploadField(props: ImageUploadFieldProps) {
  const generatedId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<string[]>([]);
  const [previews, setPreviews] = useState<ImagePreview[]>([]);
  const inputId = props.id ?? generatedId;
  const helperId = props.helperText ? `${inputId}-helper` : undefined;
  const errorId = props.errorText ? `${inputId}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(" ") || undefined;
  const accept = typeof props.accept === "string" ? props.accept : (props.accept?.join(",") ?? "image/*");
  const hasFiles = previews.length > 0;
  const variant = props.variant ?? "default";

  useEffect(() => {
    return () => {
      revokeObjectUrls(previewUrlsRef.current);
    };
  }, []);

  function clearNativeInput() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const imageFiles = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (props.multiple) {
      updatePreviews(imageFiles);
      props.onChange(imageFiles);
      return;
    }

    const file = imageFiles[0] ?? null;
    updatePreviews(file ? [file] : []);
    props.onChange(file);
  }

  function handleRemove(index: number) {
    if (props.multiple) {
      const files = props.value ?? [];
      const nextFiles = files.filter((_, fileIndex) => fileIndex !== index);
      updatePreviews(nextFiles);
      props.onChange(nextFiles);
    } else {
      updatePreviews([]);
      props.onChange(null);
    }

    clearNativeInput();
  }

  function updatePreviews(files: readonly File[]) {
    revokeObjectUrls(previewUrlsRef.current);
    const nextPreviews = createImagePreviews(files);
    previewUrlsRef.current = nextPreviews.map((preview) => preview.url);
    setPreviews(nextPreviews);
  }

  useEffect(() => {
    if (props.multiple) {
      updatePreviews(props.value ?? []);
      return;
    }

    updatePreviews(props.value ? [props.value] : []);
  }, [props.multiple, props.value]);

  return (
    <div className={cn("space-y-2", props.className)}>
      <AuthFieldLabel htmlFor={inputId} required={props.required}>
        {props.label}
      </AuthFieldLabel>

      <input
        ref={inputRef}
        accept={accept}
        aria-describedby={describedBy}
        aria-invalid={Boolean(props.errorText)}
        aria-required={props.required}
        className="sr-only"
        disabled={props.disabled}
        id={inputId}
        multiple={props.multiple}
        onChange={handleFileChange}
        type="file"
      />

      {variant === "compact" ? (
        <CompactUploadControl
          disabled={props.disabled}
          errorText={props.errorText}
          hasFiles={hasFiles}
          multiple={Boolean(props.multiple)}
          onChoose={() => inputRef.current?.click()}
          onRemove={handleRemove}
          previews={previews}
        />
      ) : (
        <DefaultUploadControl
          disabled={props.disabled}
          errorText={props.errorText}
          hasFiles={hasFiles}
          multiple={Boolean(props.multiple)}
          onChoose={() => inputRef.current?.click()}
          onRemove={handleRemove}
          previews={previews}
        />
      )}

      {props.helperText && (
        <p className="text-xs text-muted-foreground" id={helperId}>
          {props.helperText}
        </p>
      )}
      {props.errorText && (
        <p className="text-sm text-destructive" id={errorId}>
          {props.errorText}
        </p>
      )}
    </div>
  );
}

type UploadControlProps = {
  disabled?: boolean;
  errorText?: string;
  hasFiles: boolean;
  multiple: boolean;
  onChoose: () => void;
  onRemove: (index: number) => void;
  previews: ImagePreview[];
};

function CompactUploadControl({
  disabled,
  errorText,
  hasFiles,
  multiple,
  onChoose,
  onRemove,
  previews,
}: UploadControlProps) {
  const selectedSummary = getSelectedSummary(previews, multiple);

  return (
    <div
      className={cn(
        "min-h-12 rounded-lg border border-dashed border-primary-foreground/25 bg-primary-foreground/10 p-1 shadow-sm transition md:min-h-10 sm:rounded-2xl",
        "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        errorText && "border-destructive bg-destructive/10 focus-within:ring-destructive/20",
        disabled && "opacity-60",
      )}
    >
      <div className="flex min-h-10 items-center gap-2 md:min-h-8">
        <button
          className="flex min-w-0 flex-1 items-center gap-3 rounded-md px-2 py-1 text-left text-primary-foreground transition hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:rounded-xl"
          disabled={disabled}
          onClick={onChoose}
          type="button"
        >
          <PreviewThumbnail preview={previews[0]} size="compact" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">
              {hasFiles ? selectedSummary.title : "Choose image"}
            </span>
            <span className="block truncate text-xs text-primary-foreground/70">
              {hasFiles ? selectedSummary.detail : multiple ? "Select image files" : "Select one image file"}
            </span>
          </span>
        </button>
        {hasFiles ? (
          <button
            aria-label={`Remove ${previews[0].name}`}
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-primary-foreground/80 transition hover:bg-destructive/15 hover:text-destructive focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:size-8"
            disabled={disabled}
            onClick={() => onRemove(0)}
            type="button"
          >
            <Trash2Icon className="size-4" />
          </button>
        ) : (
          <UploadCloudIcon className="mr-2 size-4 shrink-0 text-primary-foreground/70" />
        )}
      </div>
    </div>
  );
}

function DefaultUploadControl({
  disabled,
  errorText,
  hasFiles,
  multiple,
  onChoose,
  onRemove,
  previews,
}: UploadControlProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-primary-foreground/25 bg-primary-foreground/10 p-3 shadow-sm transition sm:rounded-2xl",
        "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        errorText && "border-destructive bg-destructive/10 focus-within:ring-destructive/20",
        disabled && "opacity-60",
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-[6rem_1fr] sm:items-center">
          <PreviewThumbnail preview={previews[0]} size="default" />

          <div className="space-y-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-primary-foreground">
                {hasFiles ? "Image ready for review" : "Upload a clear image"}
              </p>
              <p className="text-xs text-primary-foreground/70">
                {multiple ? "Select one or more image files." : "Select one image file."}
              </p>
            </div>

            <Button
              className="h-12 w-full rounded-lg border-primary-foreground/25 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 sm:rounded-2xl"
              disabled={disabled}
              onClick={onChoose}
              type="button"
              variant="outline"
            >
              <UploadCloudIcon className="size-4" />
              {hasFiles ? "Choose different image" : "Choose image"}
            </Button>
          </div>
        </div>

        {hasFiles && (
          <div className="space-y-2">
            {previews.map((preview, index) => (
              <SelectedImageRow
                disabled={disabled}
                key={preview.key}
                onRemove={() => onRemove(index)}
                preview={preview}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewThumbnail({
  preview,
  size,
}: {
  preview?: ImagePreview;
  size: "default" | "compact";
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden border border-primary-foreground/15 bg-primary/20",
        size === "compact"
          ? "size-10 shrink-0 rounded-md md:size-8 sm:rounded-xl"
          : "h-32 rounded-lg sm:h-24 sm:rounded-2xl",
      )}
    >
      {preview ? (
        <div
          aria-label={`${preview.name} preview`}
          className="absolute inset-0 bg-cover bg-center"
          role="img"
          style={{ backgroundImage: `url(${preview.url})` }}
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground",
            size === "compact" ? "size-8 md:size-6" : "size-12",
          )}
        >
          <ImageIcon className={size === "compact" ? "size-4 md:size-3.5" : "size-6"} />
        </div>
      )}
    </div>
  );
}

function SelectedImageRow({
  disabled,
  onRemove,
  preview,
}: {
  disabled?: boolean;
  onRemove: () => void;
  preview: ImagePreview;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-primary-foreground/10 p-3 text-sm sm:rounded-2xl">
      <div className="min-w-0">
        <p className="truncate font-medium text-primary-foreground">{preview.name}</p>
        <p className="text-xs text-primary-foreground/70">{preview.sizeText} selected</p>
      </div>
      <button
        aria-label={`Remove ${preview.name}`}
        className="flex size-10 shrink-0 items-center justify-center rounded-full text-primary-foreground/80 transition hover:bg-destructive/15 hover:text-destructive focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        disabled={disabled}
        onClick={onRemove}
        type="button"
      >
        <Trash2Icon className="size-4" />
      </button>
    </div>
  );
}

function getSelectedSummary(previews: readonly ImagePreview[], multiple: boolean) {
  if (previews.length === 0) {
    return { title: "Choose image", detail: multiple ? "Select image files" : "Select one image file" };
  }

  const [firstPreview] = previews;

  if (previews.length === 1) {
    return { title: firstPreview.name, detail: `${firstPreview.sizeText} selected` };
  }

  return {
    title: `${previews.length} images selected`,
    detail: firstPreview ? `${firstPreview.name} and ${previews.length - 1} more` : "Images selected",
  };
}

function createImagePreviews(files: readonly File[]) {
  return files.map((file, index) => ({
    key: `${file.name}-${file.lastModified}-${index}`,
    name: file.name,
    sizeText: formatFileSize(file.size),
    url: URL.createObjectURL(file),
  }));
}

function revokeObjectUrls(urls: readonly string[]) {
  urls.forEach((url) => URL.revokeObjectURL(url));
}

function formatFileSize(sizeBytes: number) {
  return `${(sizeBytes / 1024 / 1024).toFixed(2)} MB`;
}
