import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.API_PORT || 4000),
  databaseUrl:
    process.env.DATABASE_URL || "postgresql://mac@localhost:5432/acrs",
};
