import { auth } from "@/src/auth";
import { redirect } from "next/navigation";
import { getUsers, getGroups } from "./actions";
import UsersList from "./UsersList";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  const [users, groups] = await Promise.all([getUsers(), getGroups()]);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Gestion des Utilisateurs</h1>
      <p className="text-muted-foreground mb-8">
        Gérez les utilisateurs et assignez-les à des groupes pour la
        collaboration sur les factures
      </p>
      <UsersList
        users={users}
        groups={groups}
        currentUserId={session.user.id}
      />
    </div>
  );
}
