import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminLayout } from "@/components/admin/admin-layout";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Return 404 for non-sys_admin users (security requirement)
  if (!user || !user.isSysAdmin) {
    redirect("/404");
  }

  return <AdminLayout>{children}</AdminLayout>;
}
