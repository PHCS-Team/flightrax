"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";

import { ROLE } from "@/shared/lib/rbac/config";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { registerStudentAction } from "@/modules/auth/actions/register-student";
import { studentRegisterSchema } from "@/modules/auth/schemas/auth-schema";
import type { StudentRegisterInput } from "@/modules/auth/types/auth";

export function StudentRegisterForm() {
  const router = useRouter();
  const form = useForm<StudentRegisterInput>({
    resolver: zodResolver(studentRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      studentIdNumber: "",
    },
  });
  const { execute, result, isExecuting } = useAction(registerStudentAction, {
    onSuccess: ({ data }) => {
      if (data?.redirectTo) {
        router.push(data.redirectTo);
      }
    },
  });

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit((values) => execute(values))}>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Request student access</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Use your full name in Lastname, First M. format and upload a clear image of your student ID.
        </p>
      </div>
      <div className="space-y-2">
        <Input placeholder="Doe, John S." {...form.register("fullName")} />
        {form.formState.errors.fullName && (
          <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Input placeholder="name@campus.edu" type="email" {...form.register("email")} />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Input placeholder="Password" type="password" {...form.register("password")} />
        {form.formState.errors.password && (
          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Input placeholder="Student ID number" {...form.register("studentIdNumber")} />
        {form.formState.errors.studentIdNumber && (
          <p className="text-sm text-destructive">{form.formState.errors.studentIdNumber.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Input
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              form.setValue("studentIdDocument", file, { shouldValidate: true });
            }
          }}
          type="file"
        />
        <p className="text-xs text-muted-foreground">
          Upload a JPG, PNG, or WebP image of your student ID. Max 5 MB.
        </p>
        {form.formState.errors.studentIdDocument && (
          <p className="text-sm text-destructive">{form.formState.errors.studentIdDocument.message}</p>
        )}
      </div>
      {result.data?.message && (
        <p className={result.data.ok ? "text-sm text-muted-foreground" : "text-sm text-destructive"}>
          {result.data.message}
        </p>
      )}
      <Button className="w-full" disabled={isExecuting} type="submit">
        {isExecuting ? "Submitting request..." : "Submit student registration"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have access? <Link className="font-medium text-foreground" href={`/login/${ROLE.STUDENT}`}>Sign in</Link>
      </p>
    </form>
  );
}
