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
  CardDescription,
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
import {
  Plus,
  Trash2,
  Users,
  FileText,
  UserPlus,
  UserMinus,
} from "lucide-react";
import {
  createGroupAction,
  deleteGroupAction,
  addUserToGroupAction,
  removeUserFromGroupAction,
} from "./actions";

interface Group {
  id: string;
  name: string;
  description: string | null;
  members: { id: string; name: string; email: string }[];
  _count: {
    invoices: number;
    customers: number;
    vehicles: number;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  groupId: string | null;
}

interface GroupsListProps {
  groups: Group[];
  users: User[];
}

export function GroupsList({ groups, users }: GroupsListProps) {
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    setIsCreating(true);
    try {
      await createGroupAction({
        name: newGroupName,
        description: newGroupDescription || undefined,
      });
      setNewGroupName("");
      setNewGroupDescription("");
    } catch (error) {
      console.error("Failed to create group:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce groupe?")) return;

    try {
      await deleteGroupAction(groupId);
    } catch (error) {
      console.error("Failed to delete group:", error);
    }
  };

  const handleAddUserToGroup = async (groupId: string) => {
    if (!selectedUserId) return;

    try {
      await addUserToGroupAction(selectedUserId, groupId);
      setSelectedUserId("");
    } catch (error) {
      console.error("Failed to add user to group:", error);
    }
  };

  const handleRemoveUserFromGroup = async (userId: string) => {
    try {
      await removeUserFromGroupAction(userId);
    } catch (error) {
      console.error("Failed to remove user from group:", error);
    }
  };

  // Users not in any group
  const availableUsers = users.filter((u) => !u.groupId);

  return (
    <div className="space-y-6">
      {/* Create new group */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nouveau Groupe
          </CardTitle>
          <CardDescription>
            Créez un groupe pour permettre la collaboration sur les factures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="groupName">Nom du groupe</Label>
              <Input
                id="groupName"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Ex: Équipe Paris"
              />
            </div>
            <div>
              <Label htmlFor="groupDescription">Description (optionnel)</Label>
              <Input
                id="groupDescription"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="Description du groupe"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleCreateGroup}
                disabled={isCreating || !newGroupName.trim()}
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer le groupe
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Groups list */}
      {groups.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun groupe créé. Créez votre premier groupe ci-dessus.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((group) => (
            <Card key={group.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {group.name}
                    </CardTitle>
                    {group.description && (
                      <CardDescription>{group.description}</CardDescription>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteGroup(group.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Stats */}
                <div className="flex gap-4 mb-4 text-sm">
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    {group.members.length} membre(s)
                  </Badge>
                  <Badge variant="outline">
                    <FileText className="h-3 w-3 mr-1" />
                    {group._count.invoices} facture(s)
                  </Badge>
                </div>

                {/* Members list */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Membres</Label>
                  {group.members.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Aucun membre dans ce groupe
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {group.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between bg-muted/50 px-2 py-1 rounded text-sm"
                        >
                          <span>
                            {member.name} ({member.email})
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveUserFromGroup(member.id)}
                            className="h-6 w-6 p-0"
                          >
                            <UserMinus className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add user to group */}
                {availableUsers.length > 0 && (
                  <div className="mt-4 flex gap-2">
                    <Select
                      value={selectedUserId}
                      onValueChange={setSelectedUserId}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Ajouter un utilisateur..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      onClick={() => handleAddUserToGroup(group.id)}
                      disabled={!selectedUserId}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
