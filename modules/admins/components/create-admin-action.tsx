"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlusIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { AdminCredentialsDialog } from "@/modules/admins/components/admin-credentials-dialog";
import { useCreateAdmin } from "@/modules/admins/hooks/use-create-admin.action";
import { createAdminSchema } from "@/modules/admins/schemas/admin-account-schema";
import type { AdminCredentials, CreateAdminInput } from "@/modules/admins/types/admin";
import { DialogSectionHeader } from "@/shared/components/layout/dialog-section-header";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { ADMIN_DEPARTMENT_LABELS } from "@/shared/lib/rbac/config";

export function CreateAdminAction() {
  const [formOpen, setFormOpen] = useState(false);
  const [credentials, setCredentials] = useState<AdminCredentials | null>(null);
  const form = useForm<CreateAdminInput>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      fullName: "",
      email: "",
      department: "" as CreateAdminInput["department"],
    },
  });
  const createAdmin = useCreateAdmin({
    onCreated: (created) => {
      form.reset();
      setFormOpen(false);
      setCredentials(created);
    },
  });
  const errors = form.formState.errors;

  return (
    <>
      <Button onClick={() => setFormOpen(true)} type="button">
        <UserPlusIcon className="size-4" />
        <span className="hidden sm:inline">Create admin</span>
        <span className="sm:hidden">Create</span>
      </Button>

      <Dialog onOpenChange={setFormOpen} open={formOpen}>
        <DialogContent className="p-6 sm:max-w-lg">
          <DialogSectionHeader
            description="A temporary password is generated automatically — you will get a message to send them."
            icon={UserPlusIcon}
            title="Create Admin Account"
          />

          <form
            className="grid gap-5"
            onSubmit={form.handleSubmit((values) => createAdmin.execute(values))}
          >
            <div className="grid gap-2">
              <label
                className="text-sm font-semibold text-foreground"
                htmlFor="create-admin-name"
              >
                Full Name
                <span className="ml-1 text-secondary">*</span>
              </label>
              <Input
                aria-invalid={Boolean(errors.fullName)}
                aria-required="true"
                id="create-admin-name"
                placeholder="Last, First M."
                {...form.register("fullName")}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <label
                className="text-sm font-semibold text-foreground"
                htmlFor="create-admin-email"
              >
                Email
                <span className="ml-1 text-secondary">*</span>
              </label>
              <Input
                aria-invalid={Boolean(errors.email)}
                aria-required="true"
                id="create-admin-email"
                placeholder="Enter email address"
                type="email"
                {...form.register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <label
                className="text-sm font-semibold text-foreground"
                htmlFor="create-admin-department"
              >
                Department
                <span className="ml-1 text-secondary">*</span>
              </label>
              <Controller
                control={form.control}
                name="department"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      aria-invalid={Boolean(errors.department)}
                      className="w-full"
                      id="create-admin-department"
                    >
                      <SelectValue placeholder="Choose department" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ADMIN_DEPARTMENT_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.department && (
                <p className="text-sm text-destructive">
                  {errors.department.message}
                </p>
              )}
            </div>

            <DialogFooter className="mt-1">
              <Button
                disabled={createAdmin.isExecuting}
                onClick={() => setFormOpen(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button disabled={createAdmin.isExecuting} type="submit">
                {createAdmin.isExecuting ? "Creating..." : "Create admin"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {credentials && (
        <AdminCredentialsDialog
          credentials={credentials}
          onOpenChange={(open) => {
            if (!open) {
              setCredentials(null);
            }
          }}
          open
        />
      )}
    </>
  );
}
