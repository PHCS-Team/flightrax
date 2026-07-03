import { StudentReviewClientSurface } from "@/modules/auth/components/student-review-client-surface";
import { PageHeader } from "@/shared/components/layout/page-header";

export function StudentReviewPage() {
  return (
    <section>
      <PageHeader
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/student-review", label: "Student Review" },
        ]}
        title="Student Requests"
      />

      <StudentReviewClientSurface />
    </section>
  );
}
