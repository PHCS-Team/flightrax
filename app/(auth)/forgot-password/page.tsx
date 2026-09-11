import { ForgotPasswordPage } from "@/modules/auth/components/forgot-password-page";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return <ForgotPasswordPage error={error} />;
}
