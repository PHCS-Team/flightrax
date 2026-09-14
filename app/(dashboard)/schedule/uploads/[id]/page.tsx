import { ScheduleUploadPage } from "@/modules/schedule/components/schedule-upload-page";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ScheduleUploadPage uploadId={id} />;
}
