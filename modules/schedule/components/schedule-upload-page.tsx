import { ScheduleUploadClientSurface } from "@/modules/schedule/components/schedule-upload-client-surface";
import { ScheduleUploadDownloadAction } from "@/modules/schedule/components/schedule-upload-download-action";
import { PageHeader } from "@/shared/components/layout/page-header";

export function ScheduleUploadPage({ uploadId }: { uploadId: string }) {
  return (
    <section>
      <PageHeader
        action={<ScheduleUploadDownloadAction uploadId={uploadId} />}
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/schedule?view=files", label: "Schedule" },
          { href: `/schedule/uploads/${uploadId}`, label: "Schedule File" },
        ]}
        title="Schedule File"
      />

      <ScheduleUploadClientSurface uploadId={uploadId} />
    </section>
  );
}
