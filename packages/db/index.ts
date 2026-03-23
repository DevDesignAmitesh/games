import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const globalPrisma = global as unknown as { prisma: PrismaClient | null };

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma = globalPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production")
  globalPrisma.prisma = new PrismaClient({ adapter });

export * from "./generated/prisma/client.js";
