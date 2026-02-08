#!/bin/bash

# TIPS-58: Deploy staff deletion fix to production
# This script deploys the fix for staff deletion bug

set -e

echo "🚀 Deploying staff deletion fix (TIPS-58)..."

# Server details
SERVER="root@31.130.155.71"
PROJECT_PATH="/var/www/tipsio"

echo "📦 Copying fixed file to server..."
scp src/app/api/staff/\[id\]/route.ts $SERVER:$PROJECT_PATH/src/app/api/staff/\[id\]/route.ts

echo "🔄 Restarting application..."
ssh $SERVER << 'ENDSSH'
cd /var/www/tipsio
pm2 restart tipsio
pm2 save
echo "✅ Application restarted"
ENDSSH

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Changes deployed:"
echo "  - Fixed staff deletion to check TipAllocation records"
echo "  - Added fallback to soft delete if hard delete fails"
echo "  - Improved error handling for database constraints"
echo ""
echo "🧪 Test the fix:"
echo "  1. Go to https://tipsio.tech/venue/staff"
echo "  2. Try to delete a staff member with tip allocations"
echo "  3. Staff should be deactivated (soft delete) instead of returning"
echo ""
