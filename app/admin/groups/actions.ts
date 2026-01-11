"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/src/auth";

/**
 * Create a new group
 */
export async function createGroupAction(data: {
  name: string;
  description?: string;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Non autorisé");
  }

  const group = await prisma.group.create({
    data: {
      name: data.name,
      description: data.description,
    },
  });

  revalidatePath("/admin/groups");
  return group;
}

/**
 * Add a user to a group
 */
export async function addUserToGroupAction(userId: string, groupId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Non autorisé");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { groupId },
  });

  revalidatePath("/admin/groups");
  revalidatePath("/admin/users");
}

/**
 * Remove a user from their group
 */
export async function removeUserFromGroupAction(userId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Non autorisé");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { groupId: null },
  });

  revalidatePath("/admin/groups");
  revalidatePath("/admin/users");
}

/**
 * Delete a group (users in the group will be removed from it)
 */
export async function deleteGroupAction(groupId: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Non autorisé");
  }

  // First, remove all users from the group
  await prisma.user.updateMany({
    where: { groupId },
    data: { groupId: null },
  });

  // Then delete the group
  await prisma.group.delete({
    where: { id: groupId },
  });

  revalidatePath("/admin/groups");
}

/**
 * Update group details
 */
export async function updateGroupAction(
  groupId: string,
  data: { name?: string; description?: string }
) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Non autorisé");
  }

  await prisma.group.update({
    where: { id: groupId },
    data,
  });

  revalidatePath("/admin/groups");
}
