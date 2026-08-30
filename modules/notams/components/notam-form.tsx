"use client";

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
import { cn } from "@/shared/lib/utils";
import { createNotamSchema, type CreateNotamInput } from "@/modules/notams/schemas/notam-schema";
import { useCreateNotam } from "@/modules/notams/hooks/use-create-notam.action";

interface NotamFormProps {
  onSuccess?: () => void;
}

export function NotamForm({ onSuccess }: NotamFormProps) {
  const createNotam = useCreateNotam({ onSaved: onSuccess });
  const today = new Date().toISOString().split("T")[0];

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
    <div className="border-y border-blue-200/60 bg-white/70 backdrop-blur-sm shadow-sm rounded-2xl p-6 sm:rounded-3xl sm:border sm:bg-white/80 [&_input:disabled]:opacity-100 [&_input:disabled]:border-blue-200/60 [&_input:disabled]:bg-white/70 [&_input:disabled]:text-blue-900 [&_input:disabled]:placeholder:text-blue-400 [&_[data-slot=select-trigger]:disabled]:opacity-100 [&_[data-slot=select-trigger]:disabled]:border-blue-200/60 [&_[data-slot=select-trigger]:disabled]:bg-white/70 [&_[data-slot=select-trigger]:disabled]:text-blue-900 [&_[data-slot=select-trigger]:disabled_svg]:hidden [&_textarea:disabled]:opacity-100 [&_textarea:disabled]:border-blue-200/60 [&_textarea:disabled]:bg-white/70 [&_textarea:disabled]:text-blue-900 [&_textarea:disabled]:placeholder:text-blue-400 [&_.text-red-600]:text-red-600 [&_.text-blue-900]:text-blue-900 [&_.text-blue-500]:text-blue-500 [&_input]:border-blue-300 [&_input]:bg-white/80 [&_input]:placeholder:text-blue-400 [&_input[aria-invalid=true]]:border-red-300/60 [&_input[aria-invalid=true]]:ring-red-300/25 **:data-[slot=select-trigger]:border-blue-300 **:data-[slot=select-trigger]:bg-white/80 [&_[data-slot=select-trigger][aria-invalid=true]]:border-red-300/60 [&_[data-slot=select-trigger][aria-invalid=true]]:ring-red-300/25 [&_[data-slot=select-trigger][data-placeholder]]:text-blue-400 [&_textarea[aria-invalid=true]]:border-red-300/60 [&_textarea[aria-invalid=true]]:ring-red-300/25">
      <div className="space-y-4 pb-4 border-b border-blue-200/60">
        <h3 className="text-lg font-semibold text-blue-900">Create NOTAM</h3>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="title"
            className={cn(
              "flex items-center gap-1.5 text-sm font-semibold text-blue-700",
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
            <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="severity"
              className={cn(
                "flex items-center gap-1.5 text-sm font-semibold text-blue-700",
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
              <SelectContent className="bg-white/95 backdrop-blur-sm border-blue-200/60">
                <SelectItem value="advisory">Advisory</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.severity && (
              <p className="text-sm text-red-600">{form.formState.errors.severity.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="expiresAt"
              className={cn(
                "flex items-center gap-1.5 text-sm font-semibold text-blue-700",
              )}
            >
              Expires At (optional)
            </label>
            <Input
              id="expiresAt"
              type="date"
              min={today}
              placeholder="YYYY-MM-DD"
              {...form.register("expiresAt", {
                valueAsDate: false,
                setValueAs: (value: string) => value || null,
              })}
              disabled={createNotam.isPending}
            />
            <p className="text-xs text-blue-500">Leave empty for no expiration</p>
            {form.formState.errors.expiresAt && (
              <p className="text-sm text-red-600">{form.formState.errors.expiresAt.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="description"
            className={cn(
              "flex items-center gap-1.5 text-sm font-semibold text-blue-700",
            )}
          >
            Description
          </label>
          <Textarea
            id="description"
            placeholder="Enter NOTAM description"
            rows={3}
            {...form.register("description")}
            disabled={createNotam.isPending}
          />
          {form.formState.errors.description && (
            <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-blue-200/60">
          <Button type="submit" disabled={createNotam.isPending} className="bg-blue-600 hover:bg-blue-700">
            {createNotam.isPending ? "Creating..." : "Create NOTAM"}
          </Button>
        </div>
      </form>
    </div>
  );
}