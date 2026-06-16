import 'dotenv/config'; // Ensures your env vars are loaded early
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

/**
 * Instância única do PrismaClient compartilhada por toda a aplicação.
 * Criar várias instâncias abre conexões demais com o banco.
 */
// 1. Pass the URL directly to the MariaDB adapter
const adapter = new PrismaMariaDb(process.env.DATABASE_URL);

// 2. Initialize Prisma with the adapter and export it
export const prisma = new PrismaClient({ adapter });