"use server";

import { prisma } from "@/src/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/src/auth";

export async function getUsers() {
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      groupId: true,
      group: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getGroups() {
  return await prisma.group.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: "asc" },
  });
}

export async function assignUserToGroup(
  userId: string,
  groupId: string | null
) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    throw new Error(
      "Non autorisé - Seul l'administrateur peut assigner les groupes"
    );
  }

  await prisma.user.update({
    where: { id: userId },
    data: { groupId: groupId || null },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/groups");
}

export async function createUser(formData: FormData) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Non autorisé");
  }

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as "ADMIN" | "USER";

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Un utilisateur avec cet email existe déjà");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
    },
  });

  revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Non autorisé");
  }

  // Empêcher la suppression de son propre compte
  if (session.user.id === userId) {
    throw new Error("Vous ne pouvez pas supprimer votre propre compte");
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/admin/users");
}

export async function updateUserPassword(userId: string, newPassword: string) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Non autorisé");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  revalidatePath("/admin/users");
}
