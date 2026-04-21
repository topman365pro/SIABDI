import { StudentTimeline } from "@/components/parent/student-timeline";

export default async function ParentStudentTodayPage({
  params
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  return <StudentTimeline studentId={studentId} mode="today" />;
}
