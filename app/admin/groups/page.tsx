import { prisma } from "@/src/lib/prisma";
import { auth } from "@/src/auth";
import { redirect } from "next/navigation";
import { GroupsList } from "./GroupsList";

export default async function GroupsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  const [groups, users] = await Promise.all([
    prisma.group.findMany({
      include: {
        members: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { invoices: true, customers: true, vehicles: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, groupId: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des Groupes</h1>
        <p className="text-muted-foreground mt-1">
          Créez des groupes pour permettre à plusieurs utilisateurs de
          collaborer sur les mêmes factures
        </p>
      </div>

      <GroupsList groups={groups} users={users} />
    </div>
  );
}
