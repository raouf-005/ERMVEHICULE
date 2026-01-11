import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function createAdmin() {
  const email = "admin@garage.com";
  const password = "admin123";
  const name = "Administrateur";

  // Vérifier si l'admin existe déjà
  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log("L'administrateur existe déjà:", email);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: "ADMIN",
    },
  });

  console.log("Administrateur créé avec succès!");
  console.log("Email:", admin.email);
  console.log("Mot de passe: admin123");
  console.log("⚠️  Changez ce mot de passe après la première connexion!");
}

createAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
