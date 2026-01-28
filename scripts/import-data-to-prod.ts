import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as fs from "fs";

// Production connection string
const connectionString = "postgresql://tipsio_user:tipsio_secure_pass_2026@31.130.155.71:5432/tipsio_prod";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function importData() {
  console.log("📥 Импорт данных в production БД...");
  
  try {
    // Читаем экспортированные данные
    const data = JSON.parse(fs.readFileSync("local-data-export.json", "utf-8"));
    
    console.log(`\n📊 Данные для импорта:`);
    console.log(`  - Пользователей: ${data.users.length}`);
    console.log(`  - Заведений: ${data.venues.length}`);
    console.log(`  - Сотрудников: ${data.staff.length}`);
    console.log(`  - QR кодов: ${data.qrCodes.length}`);
    
    // Импортируем пользователей
    console.log(`\n👤 Импорт пользователей...`);
    for (const user of data.users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user,
      });
      console.log(`  ✅ ${user.email}`);
    }
    
    // Импортируем заведения
    console.log(`\n🏢 Импорт заведений...`);
    for (const venue of data.venues) {
      await prisma.venue.upsert({
        where: { id: venue.id },
        update: venue,
        create: venue,
      });
      console.log(`  ✅ ${venue.name}`);
    }
    
    // Импортируем сотрудников
    console.log(`\n👥 Импорт сотрудников...`);
    for (const staff of data.staff) {
      await prisma.staff.upsert({
        where: { id: staff.id },
        update: staff,
        create: staff,
      });
      console.log(`  ✅ ${staff.displayName} (${staff.fullName})`);
    }
    
    // Импортируем QR коды
    console.log(`\n📱 Импорт QR кодов...`);
    for (const qrCode of data.qrCodes) {
      await prisma.qrCode.upsert({
        where: { id: qrCode.id },
        update: qrCode,
        create: qrCode,
      });
      console.log(`  ✅ ${qrCode.shortCode} (${qrCode.label})`);
    }
    
    console.log(`\n✅ Импорт завершён успешно!`);
    
  } catch (error) {
    console.error("❌ Ошибка импорта:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

importData();
