import { GraduationCapIcon } from "lucide-react";

import { EmptyState } from "@/shared/components/layout/empty-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { getApprovedStudents } from "@/modules/students/queries/students";
import { StudentsTable } from "@/modules/students/components/students-table";

export async function StudentsPage() {
  const students = await getApprovedStudents();

  return (
    <section>
      <PageHeader
        breadcrumbs={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/students", label: "Students" },
        ]}
        title="Students"
      />

      {students.length === 0 ? (
        <EmptyState
          description="Approved student accounts will appear here once they are ready for scheduling and flight operations."
          icon={<GraduationCapIcon className="size-7" />}
          title="No approved students yet"
        />
      ) : (
        <StudentsTable students={students} />
      )}
    </section>
  );
}
