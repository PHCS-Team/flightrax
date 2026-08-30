"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { cn } from "@/shared/lib/utils";
import { createNotamSchema, type CreateNotamInput } from "@/modules/notams/schemas/notam-schema";
import { useCreateNotam } from "@/modules/notams/hooks/use-create-notam.action";

interface NotamFormDialogProps {
  onSuccess?: () => void;
}

export function NotamFormDialog({ onSuccess }: NotamFormDialogProps) {
  const [open, setOpen] = useState(false);
  const createNotam = useCreateNotam({ onSaved: onSuccess });

  const form = useForm<CreateNotamInput>({
    resolver: zodResolver(createNotamSchema),
    defaultValues: {
      title: "",
      description: "",
      severity: "advisory",
      expiresAt: null,
    },
  });

  const onSubmit = (values: CreateNotamInput) => {
    createNotam.execute(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create NOTAM</Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create NOTAM</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="title"
              className={cn(
                "flex items-center gap-1.5 text-sm font-semibold text-primary-foreground/90",
              )}
            >
              Title
            </label>
            <Input
              id="title"
              placeholder="Enter NOTAM title"
              {...form.register("title")}
              disabled={createNotam.isPending}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="severity"
              className={cn(
                "flex items-center gap-1.5 text-sm font-semibold text-primary-foreground/90",
              )}
            >
              Severity
            </label>
            <Select
              onValueChange={(value) => form.setValue("severity", value as "advisory" | "warning" | "alert")}
              defaultValue={form.getValues("severity")}
              disabled={createNotam.isPending}
            >
              <SelectTrigger id="severity">
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="advisory">Advisory</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.severity && (
              <p className="text-sm text-destructive">{form.formState.errors.severity.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="expiresAt"
              className={cn(
                "flex items-center gap-1.5 text-sm font-semibold text-primary-foreground/90",
              )}
            >
              Expires At (optional)
            </label>
            <Input
              id="expiresAt"
              type="date"
              placeholder="YYYY-MM-DD"
              {...form.register("expiresAt", {
                valueAsDate: false,
                setValueAs: (value: string) => value || null,
              })}
              disabled={createNotam.isPending}
            />
            <p className="text-xs text-muted-foreground">Leave empty for no expiration</p>
            {form.formState.errors.expiresAt && (
              <p className="text-sm text-destructive">{form.formState.errors.expiresAt.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className={cn(
                "flex items-center gap-1.5 text-sm font-semibold text-primary-foreground/90",
              )}
            >
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Enter NOTAM description"
              rows={4}
              {...form.register("description")}
              disabled={createNotam.isPending}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setOpen(false);
              }}
              disabled={createNotam.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createNotam.isPending}>
              {createNotam.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}