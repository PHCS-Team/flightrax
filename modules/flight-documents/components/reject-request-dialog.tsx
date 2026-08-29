"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MessageSquareWarningIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Textarea } from "@/shared/components/ui/textarea";

const rejectReasonFormSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "Explain why the request is rejected.")
    .max(1000, "Keep the reason under 1000 characters."),
});

type RejectReasonFormValues = z.infer<typeof rejectReasonFormSchema>;

export function RejectRequestDialog({
  isSubmitting,
  onOpenChange,
  onSubmit,
  open,
}: {
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string) => void;
  open: boolean;
}) {
  const form = useForm<RejectReasonFormValues>({
    resolver: zodResolver(rejectReasonFormSchema),
    defaultValues: { reason: "" },
  });
  const error = form.formState.errors.reason?.message;

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      form.reset();
    }

    onOpenChange(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] overflow-y-auto p-6 sm:w-full sm:max-w-md">
        <DialogSectionHeader
          description="The pilot sees this reason — explain what needs to be fixed before resubmitting."
          icon={MessageSquareWarningIcon}
          title="Rejection Reason"
        />
        <form
          className="grid gap-3"
          onSubmit={form.handleSubmit((values) => onSubmit(values.reason))}
        >
          <Textarea
            autoFocus
            className="h-36 field-sizing-fixed resize-none overflow-y-auto border-border bg-muted/30 text-[#121212] placeholder:text-muted-foreground/55"
            placeholder="Enter the rejection reason"
            {...form.register("reason")}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter className="-mx-6 -mb-6 mt-2 sm:justify-end">
            <Button
              disabled={isSubmitting}
              onClick={() => handleOpenChange(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={isSubmitting}
              type="submit"
              variant="destructive"
            >
              {isSubmitting ? "Rejecting..." : "Reject request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
