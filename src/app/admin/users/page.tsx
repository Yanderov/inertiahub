import prisma from "@/lib/prisma";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminUsersClient from "./AdminUsersClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.hubUser.findMany({
    orderBy: { lastSeen: "desc" },
    take: 150,
  });

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AdminHeader
        title="Script Users & Bans"
        description="Inspect Roblox accounts, hardware identifiers (HWID), active game sessions, and enforce instant blacklists."
      />

      <div className="p-6 sm:p-8 max-w-7xl">
        <AdminUsersClient initialUsers={users} />
      </div>
    </div>
  );
}
