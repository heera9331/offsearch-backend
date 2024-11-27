import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

prisma
  .$connect()
  .then(() => console.log("Database connected successfully!"))
  .catch((error) =>
    console.error("Database connection failed:", error.message)
  );

export { prisma };
