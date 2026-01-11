import { auth } from "@/src/auth";
import { redirect } from "next/navigation";
import { getUsers } from "./actions";
import UsersList from "./UsersList";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const users = await getUsers();

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Gestion des Utilisateurs</h1>
      <UsersList users={users} currentUserId={session.user.id} />
    </div>
  );
}
