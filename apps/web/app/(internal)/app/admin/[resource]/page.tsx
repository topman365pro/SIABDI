import { notFound } from "next/navigation";
import { AdminResourceWorkspace } from "@/components/admin/resource-workspace";
import { ADMIN_RESOURCES } from "@/lib/config/admin-resources";

export default async function AdminResourcePage({
  params
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;

  if (!ADMIN_RESOURCES[resource]) {
    notFound();
  }

  return <AdminResourceWorkspace resourceKey={resource} />;
}
