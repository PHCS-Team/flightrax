import { ClipboardCheckIcon } from "lucide-react";

import { StudentReviewList } from "@/modules/auth/components/student-review-list";
import { getStudentReviewItems } from "@/modules/auth/queries/student-review";
import { EmptyState } from "@/shared/components/layout/empty-state";
import { PageHeader } from "@/shared/components/layout/page-header";

export async function StudentReviewPage() {
  const students = await getStudentReviewItems();

  return (
    <section>
      <PageHeader
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/student-review", label: "Student Review" },
        ]}
        title="Student Requests"
      />

      {students.length === 0 ? (
        <EmptyState
          description="Submitted student accounts that are pending or need a second look will appear here."
          icon={<ClipboardCheckIcon className="size-7" />}
          title="No student requests are waiting for review"
        />
      ) : (
        <StudentReviewList students={students} />
      )}
    </section>
  );
}
