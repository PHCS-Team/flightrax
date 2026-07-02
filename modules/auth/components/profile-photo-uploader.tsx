"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { CameraIcon, ImageIcon, Trash2Icon, UploadIcon } from "lucide-react";

import {
  removeProfilePhotoAction,
  uploadProfilePhotoAction,
} from "@/modules/auth/actions/upload-profile-photo";
import { PROFILE_PHOTO_TYPES } from "@/modules/auth/utils/profile-photo";
import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { toastActionResult } from "@/shared/lib/action-toast";

type ProfilePhotoUploaderProps = {
  currentPhotoUrl: string | null;
  fallback: string;
  fullName: string;
};

export function ProfilePhotoUploader({
  currentPhotoUrl,
  fallback,
  fullName,
}: ProfilePhotoUploaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewObjectUrlRef = useRef<string | null>(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const upload = useAction(uploadProfilePhotoAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        updateSelectedFile(null);
        setOpen(false);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
        router.refresh();
      }
    },
  });
  const remove = useAction(removeProfilePhotoAction, {
    onSuccess: ({ data }) => {
      toastActionResult(data);

      if (data?.ok) {
        updateSelectedFile(null);
        setOpen(false);
        router.refresh();
      }
    },
  });

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
      }
    };
  }, []);

  function updateSelectedFile(selectedFile: File | null) {
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }

    setFile(selectedFile);

    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    previewObjectUrlRef.current = objectUrl;
    setPreviewUrl(objectUrl);
  }

  const displayUrl = previewUrl ?? currentPhotoUrl;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          aria-label="View or change profile photo"
          className="group relative size-28 shrink-0 cursor-pointer overflow-hidden rounded-full border border-border bg-muted shadow-sm ring-4 ring-background transition hover:scale-[1.02] hover:border-tertiary/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:size-32 md:size-44"
          type="button"
        >
          <Avatar className="size-full">
            {currentPhotoUrl && (
              <AvatarImage
                alt={`${fullName} profile photo`}
                className="size-full rounded-full object-cover"
                src={currentPhotoUrl}
              />
            )}
            <AvatarFallback className="size-full rounded-full bg-linear-to-b from-primary to-tertiary text-primary-foreground text-4xl font-medium leading-none tracking-tight sm:text-5xl md:text-7xl">
              {fallback}
            </AvatarFallback>
          </Avatar>
          <span className="absolute inset-0 flex items-center justify-center bg-primary/55 text-primary-foreground opacity-0 backdrop-blur-[2px] transition group-hover:opacity-100 group-focus-visible:opacity-100">
            <span className="flex size-12 items-center justify-center rounded-full bg-tertiary text-tertiary-foreground shadow-lg md:size-14">
              <CameraIcon className="size-5 md:size-6" />
            </span>
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] overflow-y-auto p-4 sm:max-w-lg sm:p-6">
        <DialogSectionHeader
          description="Choose a clear profile photo so your account is easy to identify."
          icon={CameraIcon}
          title="Profile picture"
        />

        <form
          className="grid min-w-0 gap-5"
          onSubmit={(event) => {
            event.preventDefault();

            if (file) {
              upload.execute({ profilePhoto: file });
            }
          }}
        >
          <div className="flex justify-center">
            <div className="relative size-28 max-w-full overflow-hidden rounded-full border border-border bg-muted shadow-sm ring-4 ring-muted/50 sm:size-44">
              {displayUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={`${fullName} profile preview`}
                  className="size-full object-cover"
                  src={displayUrl}
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-primary text-4xl font-medium leading-none tracking-tight text-primary-foreground sm:text-6xl">
                  {fallback}
                </div>
              )}
            </div>
          </div>

          <div className="grid min-w-0 gap-2">
            <label
              className="text-sm font-semibold text-foreground"
              htmlFor="profile-photo-input"
            >
              Photo file
            </label>
            <input
              ref={inputRef}
              accept={PROFILE_PHOTO_TYPES.join(",")}
              className="sr-only"
              id="profile-photo-input"
              onChange={(event) =>
                updateSelectedFile(event.target.files?.[0] ?? null)
              }
              type="file"
            />
            <button
              className="group grid min-h-16 w-full min-w-0 max-w-full cursor-pointer grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-lg border border-border bg-background p-3 text-left shadow-sm transition hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default sm:flex sm:rounded-2xl"
              onClick={() => inputRef.current?.click()}
              type="button"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground sm:rounded-xl">
                <ImageIcon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {file ? file.name : "Choose an image"}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {file
                    ? `${(file.size / 1024 / 1024).toFixed(2)} MB selected`
                    : "Select a profile photo from your device"}
                </span>
              </span>
              <span className="col-span-2 w-full shrink-0 rounded-lg border border-border px-3 py-2 text-center text-xs font-semibold text-foreground transition group-hover:border-primary/40 sm:col-span-1 sm:w-auto sm:rounded-xl">
                Browse
              </span>
            </button>
            <div className="grid gap-2">
              <p className="text-xs text-muted-foreground">
                JPG, PNG, or WebP only. Maximum file size is 5 MB.
              </p>
              {currentPhotoUrl && (
                <Button
                  className="h-auto w-fit justify-self-start p-0 text-xs font-semibold text-destructive hover:bg-transparent hover:text-destructive/80 disabled:cursor-default"
                  disabled={upload.isExecuting || remove.isExecuting}
                  onClick={() => remove.execute()}
                  type="button"
                  variant="ghost"
                >
                  <Trash2Icon className="size-3.5" />
                  Remove current photo
                </Button>
              )}
            </div>
          </div>

          <Button
            className="h-12 w-full min-w-0 cursor-pointer rounded-lg px-4 font-bold uppercase disabled:cursor-default sm:rounded-2xl sm:px-7"
            disabled={!file || upload.isExecuting || remove.isExecuting}
            type="submit"
          >
            {upload.isExecuting ? (
              <UploadIcon className="size-4 animate-pulse" />
            ) : (
              <CameraIcon className="size-4" />
            )}
            {upload.isExecuting ? "Saving..." : "Save photo"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
