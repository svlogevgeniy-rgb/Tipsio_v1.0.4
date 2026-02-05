/**
 * Script to fix staff balances based on existing TipAllocation records
 * 
 * This script recalculates staff balances from TipAllocation records
 * that don't have a payoutId (unpaid allocations).
 * 
 * Usage:
 *   npx ts-node scripts/fix-staff-balances.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Starting staff balance fix...\n');

  try {
    // Get all staff members
    const allStaff = await prisma.staff.findMany({
      select: {
        id: true,
        displayName: true,
        balance: true,
        venueId: true,
      },
    });

    console.log(`Found ${allStaff.length} staff members\n`);

    let fixedCount = 0;
    let totalAdded = 0;

    for (const staff of allStaff) {
      // Calculate correct balance from unpaid allocations
      const unpaidAllocations = await prisma.tipAllocation.findMany({
        where: {
          staffId: staff.id,
          payoutId: null, // Only unpaid allocations
        },
        select: {
          amount: true,
        },
      });

      const correctBalance = unpaidAllocations.reduce((sum, alloc) => sum + alloc.amount, 0);

      if (correctBalance !== staff.balance) {
        console.log(`❌ ${staff.displayName}:`);
        console.log(`   Current balance: ${staff.balance}`);
        console.log(`   Correct balance: ${correctBalance}`);
        console.log(`   Difference: ${correctBalance - staff.balance}`);

        // Update balance
        await prisma.staff.update({
          where: { id: staff.id },
          data: { balance: correctBalance },
        });

        console.log(`   ✅ Fixed!\n`);
        fixedCount++;
        totalAdded += (correctBalance - staff.balance);
      } else {
        console.log(`✅ ${staff.displayName}: Balance correct (${staff.balance})`);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   Total staff: ${allStaff.length}`);
    console.log(`   Fixed: ${fixedCount}`);
    console.log(`   Total amount added: ${totalAdded}`);
    console.log('\n✅ Done!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('Failed to fix balances:', error);
    process.exit(1);
  });
