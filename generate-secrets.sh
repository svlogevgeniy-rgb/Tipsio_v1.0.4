#!/bin/bash

# Tipsio - Production Secrets Generator
# This script generates all required secrets for production deployment

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         Tipsio Production Secrets Generator                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check if openssl is available
if ! command -v openssl &> /dev/null; then
    echo "❌ Error: openssl is not installed"
    echo "Please install openssl first"
    exit 1
fi

echo "🔐 Generating cryptographically secure secrets..."
echo ""

# Generate secrets
NEXTAUTH_SECRET=$(openssl rand -base64 32)
ENCRYPTION_KEY=$(openssl rand -hex 32)
DB_PASSWORD=$(openssl rand -base64 24)

# Display secrets
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Secrets Generated Successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Copy these values to your .env file:"
echo ""
echo "NEXTAUTH_SECRET=\"${NEXTAUTH_SECRET}\""
echo "ENCRYPTION_KEY=\"${ENCRYPTION_KEY}\""
echo "DB_PASSWORD=\"${DB_PASSWORD}\""
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Ask if user wants to create .env file
read -p "📝 Create .env.production file with these secrets? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    cat > .env.production << EOF
# Production Environment Variables
# Generated: $(date)

# Database
DB_USER=tipsio
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=tipsio

# NextAuth
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
NEXTAUTH_URL=https://app.example.com

# Encryption
ENCRYPTION_KEY=${ENCRYPTION_KEY}

# Midtrans Payment Gateway - ADD YOUR KEYS
MIDTRANS_SERVER_KEY=YOUR_PRODUCTION_SERVER_KEY
MIDTRANS_CLIENT_KEY=YOUR_PRODUCTION_CLIENT_KEY
MIDTRANS_IS_PRODUCTION=true

# Optional: Email & SMS
RESEND_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
EOF

    echo "✅ Created .env.production file"
    echo ""
    echo "⚠️  IMPORTANT:"
    echo "1. Edit .env.production and add your Midtrans keys"
    echo "2. Keep this file secure - DO NOT commit to git"
    echo "3. Copy to server: scp .env.production deploy@server:/opt/tipsio/.env"
    echo ""
else
    echo "ℹ️  No file created. Copy the secrets manually."
    echo ""
fi

# Save to secure file for backup
BACKUP_FILE="secrets-backup-$(date +%Y%m%d-%H%M%S).txt"
cat > "$BACKUP_FILE" << EOF
Tipsio Production Secrets
Generated: $(date)

NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENCRYPTION_KEY=${ENCRYPTION_KEY}
DB_PASSWORD=${DB_PASSWORD}

⚠️  KEEP THIS FILE SECURE!
⚠️  Store in password manager
⚠️  Delete after copying to server
EOF

echo "💾 Backup saved to: $BACKUP_FILE"
echo "⚠️  Store this file securely and delete after deployment"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Add Midtrans production keys to .env.production"
echo "2. Copy .env.production to the server:"
echo "   scp .env.production deploy@YOUR_SERVER_IP:/opt/tipsio/.env"
echo ""
echo "3. Follow MANUAL_DEPLOY.md for complete deployment"
echo ""
echo "✨ Done!"
