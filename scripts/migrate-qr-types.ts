/**
 * Migration Script: QR Type Conversion
 * 
 * This script migrates existing QR codes from legacy types to new types:
 * - PERSONAL -> INDIVIDUAL (preserves staffId)
 * - TABLE -> TEAM (creates QrCodeRecipient for all active venue staff)
 * - VENUE -> TEAM (creates QrCodeRecipient for all active venue staff)
 * 
 * Run with: npx ts-node scripts/migrate-qr-types.ts
 * 
 * IMPORTANT: Run this script AFTER the Prisma migration that adds INDIVIDUAL/TEAM enum values
 */

import { config } from 'dotenv';
import { PrismaClient, QrType, StaffStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Load environment variables
config();

// Create Prisma client with adapter
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

interface MigrationStats {
  personalToIndividual: number;
  tableToTeam: number;
  venueToTeam: number;
  recipientsCreated: number;
  errors: string[];
}

async function migrateQrTypes(): Promise<MigrationStats> {
  const stats: MigrationStats = {
    personalToIndividual: 0,
    tableToTeam: 0,
    venueToTeam: 0,
    recipientsCreated: 0,
    errors: [],
  };

  console.log('Starting QR type migration...\n');

  // Step 1: Migrate PERSONAL -> INDIVIDUAL
  console.log('Step 1: Migrating PERSONAL -> INDIVIDUAL...');
  try {
    const personalQrs = await prisma.qrCode.findMany({
      where: { type: 'PERSONAL' as QrType },
    });

    for (const qr of personalQrs) {
      await prisma.qrCode.update({
        where: { id: qr.id },
        data: { type: 'INDIVIDUAL' as QrType },
      });
      stats.personalToIndividual++;
    }
    console.log(`  Migrated ${stats.personalToIndividual} PERSONAL QR codes to INDIVIDUAL`);
  } catch (error) {
    const errorMsg = `Error migrating PERSONAL QRs: ${error}`;
    stats.errors.push(errorMsg);
    console.error(`  ${errorMsg}`);
  }

  // Step 2: Migrate TABLE -> TEAM with recipients
  console.log('\nStep 2: Migrating TABLE -> TEAM...');
  try {
    const tableQrs = await prisma.qrCode.findMany({
      where: { type: 'TABLE' as QrType },
      include: {
        venue: {
          include: {
            staff: {
              where: { status: StaffStatus.ACTIVE },
            },
          },
        },
      },
    });

    for (const qr of tableQrs) {
      const activeStaff = qr.venue.staff;
      
      // Create QrCodeRecipient entries for all active staff
      if (activeStaff.length > 0) {
        await prisma.qrCodeRecipient.createMany({
          data: activeStaff.map(staff => ({
            qrCodeId: qr.id,
            staffId: staff.id,
          })),
          skipDuplicates: true,
        });
        stats.recipientsCreated += activeStaff.length;
      }

      // Update QR type
      await prisma.qrCode.update({
        where: { id: qr.id },
        data: { type: 'TEAM' as QrType },
      });
      stats.tableToTeam++;
    }
    console.log(`  Migrated ${stats.tableToTeam} TABLE QR codes to TEAM`);
  } catch (error) {
    const errorMsg = `Error migrating TABLE QRs: ${error}`;
    stats.errors.push(errorMsg);
    console.error(`  ${errorMsg}`);
  }

  // Step 3: Migrate VENUE -> TEAM with recipients
  console.log('\nStep 3: Migrating VENUE -> TEAM...');
  try {
    const venueQrs = await prisma.qrCode.findMany({
      where: { type: 'VENUE' as QrType },
      include: {
        venue: {
          include: {
            staff: {
              where: { status: StaffStatus.ACTIVE },
            },
          },
        },
      },
    });

    for (const qr of venueQrs) {
      const activeStaff = qr.venue.staff;
      
      // Create QrCodeRecipient entries for all active staff
      if (activeStaff.length > 0) {
        await prisma.qrCodeRecipient.createMany({
          data: activeStaff.map(staff => ({
            qrCodeId: qr.id,
            staffId: staff.id,
          })),
          skipDuplicates: true,
        });
        stats.recipientsCreated += activeStaff.length;
      }

      // Update QR type
      await prisma.qrCode.update({
        where: { id: qr.id },
        data: { type: 'TEAM' as QrType },
      });
      stats.venueToTeam++;
    }
    console.log(`  Migrated ${stats.venueToTeam} VENUE QR codes to TEAM`);
  } catch (error) {
    const errorMsg = `Error migrating VENUE QRs: ${error}`;
    stats.errors.push(errorMsg);
    console.error(`  ${errorMsg}`);
  }

  return stats;
}

async function verifyMigration(): Promise<void> {
  console.log('\nVerifying migration...');
  
  // Check for any remaining legacy types
  const legacyCount = await prisma.qrCode.count({
    where: {
      type: { in: ['PERSONAL', 'TABLE', 'VENUE'] as QrType[] },
    },
  });

  if (legacyCount > 0) {
    console.log(`  WARNING: ${legacyCount} QR codes still have legacy types`);
  } else {
    console.log('  ✓ No legacy QR types remaining');
  }

  // Count new types
  const individualCount = await prisma.qrCode.count({
    where: { type: 'INDIVIDUAL' as QrType },
  });
  const teamCount = await prisma.qrCode.count({
    where: { type: 'TEAM' as QrType },
  });
  const recipientCount = await prisma.qrCodeRecipient.count();

  console.log(`  INDIVIDUAL QR codes: ${individualCount}`);
  console.log(`  TEAM QR codes: ${teamCount}`);
  console.log(`  QrCodeRecipient records: ${recipientCount}`);
}

async function main() {
  console.log('='.repeat(60));
  console.log('QR Type Migration Script');
  console.log('='.repeat(60));
  console.log();

  try {
    const stats = await migrateQrTypes();
    await verifyMigration();

    console.log('\n' + '='.repeat(60));
    console.log('Migration Summary');
    console.log('='.repeat(60));
    console.log(`PERSONAL -> INDIVIDUAL: ${stats.personalToIndividual}`);
    console.log(`TABLE -> TEAM: ${stats.tableToTeam}`);
    console.log(`VENUE -> TEAM: ${stats.venueToTeam}`);
    console.log(`Recipients created: ${stats.recipientsCreated}`);
    
    if (stats.errors.length > 0) {
      console.log(`\nErrors (${stats.errors.length}):`);
      stats.errors.forEach(err => console.log(`  - ${err}`));
    } else {
      console.log('\n✓ Migration completed successfully!');
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
