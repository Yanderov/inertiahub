import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || (user.role !== "ADMIN" && user.role !== "EDITOR")) {
    redirect("/auth/login?redirect=/admin");
  }

  return (
    <div className="flex min-h-screen bg-[#09090b] text-white">
      <AdminSidebar user={{ email: user.email, name: user.name || undefined, role: user.role }} />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
