import { TeacherPeriodWorkspace } from "@/components/teacher/period-workspace";

export default async function GuruPeriodPage({
  params
}: {
  params: Promise<{ classId: string; periodNo: string }>;
}) {
  const { classId, periodNo } = await params;

  return <TeacherPeriodWorkspace classId={classId} periodNo={Number(periodNo)} />;
}
