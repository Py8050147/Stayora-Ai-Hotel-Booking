import "dotenv/config";
import { defineConfig as ormConfig } from "@prisma/orm-postgres/config";

export default ormConfig({
  contract: "./prisma/contract.prisma",
  db: {
    connection: process.env["DATABASE_URL"]!,
  },
});
