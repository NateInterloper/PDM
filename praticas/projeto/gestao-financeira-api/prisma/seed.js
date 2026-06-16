import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

// 1. Pass the URL directly to the MariaDB adapter (it accepts mysql:// URLs perfectly)
const adapter = new PrismaMariaDb(process.env.DATABASE_URL);

// 2. Pass the adapter to the PrismaClient constructor
const prisma = new PrismaClient({ adapter });

const defaultCategories = [
  { name: "income",    displayName: "Renda",       icon: "work",                background: "#DE9AC3", isIncome: true,  isDefault: true },
  { name: "food",      displayName: "Alimentação", icon: "fastfood",            background: "#DEA17B", isIncome: false, isDefault: true },
  { name: "house",     displayName: "Casa",        icon: "home",                background: "#E6E088", isIncome: false, isDefault: true },
  { name: "education", displayName: "Educação",    icon: "book",                background: "#AB8FBE", isIncome: false, isDefault: true },
  { name: "travel",    displayName: "Viagens",     icon: "airplanemode-active", background: "#82C9DE", isIncome: false, isDefault: true },
];

async function main() {
  for (const c of defaultCategories) {
    await prisma.category.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
  }
  console.log("Seed concluído.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());