import {
  PrismaClient,
  CustomerKind,
  DocumentStatus,
  InvoiceStatus,
  RepairOrderStatus,
  LineItemKind,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create Suppliers
  const supplier1 = await prisma.supplier.create({
    data: {
      name: "Auto Pièces Pro",
      email: "contact@autopiecespro.fr",
      phone: "01 23 45 67 89",
      addressLine1: "123 Rue de l'Industrie",
      postalCode: "75001",
      city: "Paris",
    },
  });

  const supplier2 = await prisma.supplier.create({
    data: {
      name: "Garage Distribution",
      email: "commandes@garagedistrib.fr",
      phone: "04 56 78 90 12",
      addressLine1: "456 Avenue du Commerce",
      postalCode: "69001",
      city: "Lyon",
    },
  });

  // Create Parts
  const parts = await Promise.all([
    prisma.part.create({
      data: {
        name: "Filtre à huile universel",
        oemRef: "FILT-HUILE-001",
        purchasePriceHt: 8.5,
        marginPercent: 76,
        salePriceHt: 15.0,
        stockQty: 25,
        lowStockThreshold: 5,
        supplierId: supplier1.id,
      },
    }),
    prisma.part.create({
      data: {
        name: "Filtre à air sport",
        oemRef: "FILT-AIR-002",
        purchasePriceHt: 22.0,
        marginPercent: 104,
        salePriceHt: 45.0,
        stockQty: 12,
        lowStockThreshold: 3,
        supplierId: supplier1.id,
      },
    }),
    prisma.part.create({
      data: {
        name: "Plaquettes de frein avant",
        oemRef: "PLAQ-FREIN-001",
        purchasePriceHt: 35.0,
        marginPercent: 86,
        salePriceHt: 65.0,
        stockQty: 8,
        lowStockThreshold: 4,
        supplierId: supplier2.id,
      },
    }),
    prisma.part.create({
      data: {
        name: "Disques de frein ventilés",
        oemRef: "DISQ-FREIN-001",
        purchasePriceHt: 85.0,
        marginPercent: 70,
        salePriceHt: 145.0,
        stockQty: 4,
        lowStockThreshold: 2,
        supplierId: supplier2.id,
      },
    }),
    prisma.part.create({
      data: {
        name: "Bougie d'allumage NGK",
        oemRef: "BOUGIE-001",
        purchasePriceHt: 6.0,
        marginPercent: 100,
        salePriceHt: 12.0,
        stockQty: 50,
        lowStockThreshold: 10,
        supplierId: supplier1.id,
      },
    }),
    prisma.part.create({
      data: {
        name: "Huile moteur 5W40 5L",
        oemRef: "HUILE-5W40-5L",
        purchasePriceHt: 28.0,
        marginPercent: 86,
        salePriceHt: 52.0,
        stockQty: 15,
        lowStockThreshold: 5,
        supplierId: supplier2.id,
      },
    }),
    prisma.part.create({
      data: {
        name: "Kit courroie distribution",
        oemRef: "COURR-DIST-001",
        purchasePriceHt: 120.0,
        marginPercent: 83,
        salePriceHt: 220.0,
        stockQty: 3,
        lowStockThreshold: 2,
        supplierId: supplier1.id,
      },
    }),
    prisma.part.create({
      data: {
        name: "Batterie 12V 60Ah",
        oemRef: "BATT-12V-60AH",
        purchasePriceHt: 65.0,
        marginPercent: 69,
        salePriceHt: 110.0,
        stockQty: 6,
        lowStockThreshold: 2,
        supplierId: supplier2.id,
      },
    }),
  ]);

  // Create Customers
  const customer1 = await prisma.customer.create({
    data: {
      kind: CustomerKind.PERSON,
      firstName: "Jean",
      lastName: "Dupont",
      email: "jean.dupont@email.fr",
      phone: "06 12 34 56 78",
      addressLine1: "12 Rue de la Paix",
      postalCode: "75002",
      city: "Paris",
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      kind: CustomerKind.BUSINESS,
      companyName: "Martin & Associés SARL",
      firstName: "Marie",
      lastName: "Martin",
      email: "m.martin@entreprise.fr",
      phone: "06 98 76 54 32",
      addressLine1: "45 Boulevard Haussmann",
      postalCode: "75008",
      city: "Paris",
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      kind: CustomerKind.PERSON,
      firstName: "Pierre",
      lastName: "Durand",
      email: "pierre.durand@gmail.com",
      phone: "07 11 22 33 44",
      addressLine1: "78 Avenue des Champs-Élysées",
      postalCode: "75008",
      city: "Paris",
    },
  });

  // Create Vehicles
  const vehicle1 = await prisma.vehicle.create({
    data: {
      registrationPlate: "AB-123-CD",
      vin: "VF1RFB00123456789",
      make: "Renault",
      model: "Clio IV",
      year: 2019,
      mileageKm: 45000,
      customerId: customer1.id,
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      registrationPlate: "EF-456-GH",
      vin: "WVWZZZ3CZWE123456",
      make: "Volkswagen",
      model: "Golf VII",
      year: 2020,
      mileageKm: 32000,
      customerId: customer2.id,
    },
  });

  const vehicle3 = await prisma.vehicle.create({
    data: {
      registrationPlate: "IJ-789-KL",
      vin: "WBAPH5C55BA123456",
      make: "BMW",
      model: "Serie 3",
      year: 2018,
      mileageKm: 78000,
      customerId: customer3.id,
    },
  });

  // Create Mechanics
  const mechanic1 = await prisma.mechanic.create({
    data: {
      name: "Luc Bernard",
      email: "luc.bernard@garage.fr",
      active: true,
    },
  });

  const mechanic2 = await prisma.mechanic.create({
    data: {
      name: "Sophie Leroy",
      email: "sophie.leroy@garage.fr",
      active: true,
    },
  });

  // Create a Quote
  const quote = await prisma.quote.create({
    data: {
      quoteNumber: "DEV-2024-001",
      status: DocumentStatus.ACCEPTED,
      vehicleId: vehicle1.id,
      customerId: customer1.id,
      subtotalHt: 280.0,
      vatTotal: 56.0,
      totalTtc: 336.0,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          {
            kind: LineItemKind.PART,
            description: "Huile moteur 5W40 5L",
            quantity: 1,
            unitPriceHt: 52.0,
            vatRate: 20,
            lineTotalHt: 52.0,
            lineTotalTtc: 62.4,
            partId: parts[5].id,
            position: 0,
          },
          {
            kind: LineItemKind.PART,
            description: "Filtre à huile",
            quantity: 1,
            unitPriceHt: 15.0,
            vatRate: 20,
            lineTotalHt: 15.0,
            lineTotalTtc: 18.0,
            partId: parts[0].id,
            position: 1,
          },
          {
            kind: LineItemKind.PART,
            description: "Filtre à air",
            quantity: 1,
            unitPriceHt: 45.0,
            vatRate: 20,
            lineTotalHt: 45.0,
            lineTotalTtc: 54.0,
            partId: parts[1].id,
            position: 2,
          },
          {
            kind: LineItemKind.LABOR,
            description: "Main d'œuvre vidange",
            quantity: 2,
            unitPriceHt: 45.0,
            vatRate: 20,
            lineTotalHt: 90.0,
            lineTotalTtc: 108.0,
            position: 3,
          },
          {
            kind: LineItemKind.LABOR,
            description: "Diagnostic électronique",
            quantity: 1,
            unitPriceHt: 35.0,
            vatRate: 20,
            lineTotalHt: 35.0,
            lineTotalTtc: 42.0,
            position: 4,
          },
        ],
      },
    },
  });

  // Create a Repair Order
  const repairOrder = await prisma.repairOrder.create({
    data: {
      roNumber: "OR-2024-001",
      status: RepairOrderStatus.IN_PROGRESS,
      vehicleId: vehicle1.id,
      customerId: customer1.id,
      mechanicId: mechanic1.id,
      quoteId: quote.id,
      notes: "Vidange complète + remplacement filtres",
      startedAt: new Date(),
    },
  });

  // Create an Invoice
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: "FAC-2024-001",
      status: InvoiceStatus.PAID,
      vehicleId: vehicle2.id,
      customerId: customer2.id,
      subtotalHt: 210.0,
      vatTotal: 42.0,
      totalTtc: 252.0,
      issuedAt: new Date(),
      paidAt: new Date(),
      items: {
        create: [
          {
            kind: LineItemKind.PART,
            description: "Plaquettes frein avant",
            quantity: 1,
            unitPriceHt: 65.0,
            vatRate: 20,
            lineTotalHt: 65.0,
            lineTotalTtc: 78.0,
            partId: parts[2].id,
            position: 0,
          },
          {
            kind: LineItemKind.LABOR,
            description: "Main d'œuvre freins",
            quantity: 2,
            unitPriceHt: 45.0,
            vatRate: 20,
            lineTotalHt: 90.0,
            lineTotalTtc: 108.0,
            position: 1,
          },
          {
            kind: LineItemKind.LABOR,
            description: "Contrôle général",
            quantity: 1,
            unitPriceHt: 55.0,
            vatRate: 20,
            lineTotalHt: 55.0,
            lineTotalTtc: 66.0,
            position: 2,
          },
        ],
      },
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log(`   - ${await prisma.supplier.count()} suppliers`);
  console.log(`   - ${await prisma.part.count()} parts`);
  console.log(`   - ${await prisma.customer.count()} customers`);
  console.log(`   - ${await prisma.vehicle.count()} vehicles`);
  console.log(`   - ${await prisma.mechanic.count()} mechanics`);
  console.log(`   - ${await prisma.quote.count()} quotes`);
  console.log(`   - ${await prisma.repairOrder.count()} repair orders`);
  console.log(`   - ${await prisma.invoice.count()} invoices`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
