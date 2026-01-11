"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Badge } from "@/src/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { createUser, deleteUser, assignUserToGroup } from "./actions";
import { Trash2, Plus, UserCircle, Users, Loader2 } from "lucide-react";

interface Group {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  groupId: string | null;
  group: Group | null;
}

interface UsersListProps {
  users: User[];
  groups: Group[];
  currentUserId: string;
}

export default function UsersList({
  users,
  groups,
  currentUserId,
}: UsersListProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assigningUserId, setAssigningUserId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleCreateUser = async (formData: FormData) => {
    setError("");
    setLoading(true);

    try {
      await createUser(formData);
      setShowForm(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la création"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      return;
    }

    try {
      await deleteUser(userId);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Erreur lors de la suppression"
      );
    }
  };

  const handleAssignGroup = async (userId: string, groupId: string) => {
    setAssigningUserId(userId);
    try {
      await assignUserToGroup(userId, groupId === "none" ? null : groupId);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Erreur lors de l'assignation du groupe"
      );
    } finally {
      setAssigningUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Info box about groups */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Gestion des groupes</p>
              <p className="text-sm text-blue-700">
                Assignez les utilisateurs à des groupes pour leur permettre de
                collaborer sur les mêmes factures. Les membres d'un même groupe
                peuvent voir et modifier les factures du groupe.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <p className="text-gray-600">{users.length} utilisateur(s)</p>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Créer un utilisateur</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleCreateUser} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input id="name" name="name" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Rôle</Label>
                  <select
                    id="role"
                    name="role"
                    className="w-full h-10 px-3 border rounded-md"
                    defaultValue="USER"
                  >
                    <option value="USER">Utilisateur</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Création..." : "Créer"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Groupe</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <UserCircle className="w-5 h-5 text-gray-400" />
                      {user.name}
                      {user.id === currentUserId && (
                        <Badge variant="outline" className="text-xs">
                          Vous
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "ADMIN" ? "default" : "secondary"}
                    >
                      {user.role === "ADMIN" ? "Admin" : "Utilisateur"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.role === "ADMIN" ? (
                      <span className="text-muted-foreground text-sm">
                        Accès global
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        {assigningUserId === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Select
                            value={user.groupId || "none"}
                            onValueChange={(value) =>
                              handleAssignGroup(user.id, value)
                            }
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Aucun groupe" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                <span className="text-muted-foreground">
                                  Aucun groupe
                                </span>
                              </SelectItem>
                              {groups.map((group) => (
                                <SelectItem key={group.id} value={group.id}>
                                  <div className="flex items-center gap-2">
                                    <Users className="w-3 h-3" />
                                    {group.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="text-right">
                    {user.id !== currentUserId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
