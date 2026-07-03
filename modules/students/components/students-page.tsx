import { PageHeader } from "@/shared/components/layout/page-header";
import { StudentsClientSurface } from "@/modules/students/components/students-client-surface";

export function StudentsPage() {
  return (
    <section>
      <PageHeader
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/students", label: "Students" },
        ]}
        title="Students"
      />

      <StudentsClientSurface />
    </section>
  );
}
