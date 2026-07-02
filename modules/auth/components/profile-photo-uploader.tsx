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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
          className="group relative size-28 shrink-0 cursor-pointer overflow-hidden rounded-full border border-border bg-muted shadow-sm ring-4 ring-background transition hover:scale-[1.02] hover:border-tertiary/60 sm:size-32 md:size-44"
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

      <DialogContent className="overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle>Profile picture</DialogTitle>
          <DialogDescription>
            Preview your selected image first. It only updates after you save.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 px-5">
          <div className="flex justify-center">
            <div className="relative size-72 overflow-hidden rounded-full border bg-muted shadow-sm ring-8 ring-muted/60 sm:size-80">
              {displayUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={`${fullName} profile preview`}
                  className="size-full object-cover"
                  src={displayUrl}
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-primary text-8xl font-medium leading-none tracking-tight text-primary-foreground sm:text-9xl">
                  {fallback}
                </div>
              )}
            </div>
          </div>

          <input
            ref={inputRef}
            accept={PROFILE_PHOTO_TYPES.join(",")}
            className="sr-only"
            onChange={(event) =>
              updateSelectedFile(event.target.files?.[0] ?? null)
            }
            type="file"
          />

          <Button
            className="rounded-2xl border-dashed"
            onClick={() => inputRef.current?.click()}
            type="button"
            variant="outline"
          >
            <ImageIcon className="size-4" />
            {file ? "Choose different image" : "Choose image"}
          </Button>

          {file && (
            <div className="rounded-2xl bg-muted/60 p-3 text-sm">
              <p className="truncate font-medium">{file.name}</p>
              <p className="text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB selected
              </p>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            JPG, PNG, or WebP only. Maximum file size is 5 MB.
          </p>

        </div>

        <DialogFooter className="mt-1 sm:justify-between">
          <Button
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={
              !currentPhotoUrl || upload.isExecuting || remove.isExecuting
            }
            onClick={() => remove.execute()}
            type="button"
            variant="ghost"
          >
            <Trash2Icon className="size-4" />
            Remove photo
          </Button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              disabled={upload.isExecuting || remove.isExecuting}
              onClick={() => setOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={!file || upload.isExecuting || remove.isExecuting}
              onClick={() => {
                if (file) {
                  upload.execute({ profilePhoto: file });
                }
              }}
              type="button"
            >
              {upload.isExecuting ? (
                <UploadIcon className="size-4 animate-pulse" />
              ) : (
                <CameraIcon className="size-4" />
              )}
              {upload.isExecuting ? "Saving..." : "Save photo"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
