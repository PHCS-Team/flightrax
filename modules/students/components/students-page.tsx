import { GlassSurface } from "@/shared/components/layout/glass-surface";
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
        <GlassSurface className="p-6 text-sm text-primary-foreground/75">
          No approved students are available yet.
        </GlassSurface>
      ) : (
        <StudentsTable students={students} />
      )}
    </section>
  );
}
