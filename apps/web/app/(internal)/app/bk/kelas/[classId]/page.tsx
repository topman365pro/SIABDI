import { BkClassRoster } from "@/components/bk/bk-class-roster";

export default async function BkClassPage({
  params
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;

  return <BkClassRoster classId={classId} />;
}
