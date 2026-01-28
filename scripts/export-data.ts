import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as fs from "fs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function exportData() {
  console.log("📊 Экспорт данных из локальной БД...");
  
  try {
    const users = await prisma.user.findMany();
    const venues = await prisma.venue.findMany();
    const staff = await prisma.staff.findMany();
    const qrCodes = await prisma.qrCode.findMany();
    
    const data = {
      users,
      venues,
      staff,
      qrCodes
    };
    
    fs.writeFileSync("local-data-export.json", JSON.stringify(data, null, 2));
    
    console.log(`✅ Экспортировано в local-data-export.json:`);
    console.log(`  - Пользователей: ${users.length}`);
    console.log(`  - Заведений: ${venues.length}`);
    console.log(`  - Сотрудников: ${staff.length}`);
    console.log(`  - QR кодов: ${qrCodes.length}`);
  } catch (error) {
    console.error("❌ Ошибка экспорта:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

exportData();
