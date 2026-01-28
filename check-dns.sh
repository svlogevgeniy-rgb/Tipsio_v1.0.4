#!/bin/bash

DOMAIN="tipsio.id"
WWW_DOMAIN="www.tipsio.id"
EXPECTED_IP="31.130.155.71"

echo "🔍 Checking DNS configuration for TIPSIO..."
echo ""

# Check main domain
echo "Checking $DOMAIN..."
CURRENT_IP=$(dig +short $DOMAIN | head -n1)
echo "  Current IP: $CURRENT_IP"
echo "  Expected IP: $EXPECTED_IP"

if [ "$CURRENT_IP" = "$EXPECTED_IP" ]; then
    echo "  ✅ DNS is correct!"
else
    echo "  ❌ DNS needs to be updated"
fi

echo ""

# Check www subdomain
echo "Checking $WWW_DOMAIN..."
WWW_IP=$(dig +short $WWW_DOMAIN | head -n1)
echo "  Current IP: $WWW_IP"
echo "  Expected IP: $EXPECTED_IP"

if [ "$WWW_IP" = "$EXPECTED_IP" ]; then
    echo "  ✅ DNS is correct!"
else
    echo "  ❌ DNS needs to be updated"
fi

echo ""

# Summary
if [ "$CURRENT_IP" = "$EXPECTED_IP" ] && [ "$WWW_IP" = "$EXPECTED_IP" ]; then
    echo "✅ All DNS records are correct! You can proceed with SSL setup."
    echo ""
    echo "Next step: Run ./setup-domain-ssl.sh"
else
    echo "⚠️  DNS records need to be updated!"
    echo ""
    echo "Please update the following A records at your domain registrar:"
    echo "  - $DOMAIN → $EXPECTED_IP"
    echo "  - $WWW_DOMAIN → $EXPECTED_IP"
    echo ""
    echo "After updating, wait 5-30 minutes and run this script again to verify."
fi

echo ""
