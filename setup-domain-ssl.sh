#!/bin/bash

set -e

SERVER_IP="31.130.155.71"
SERVER_USER="root"
SERVER_PASS="yM*4r-ysQ+e2ag"
DOMAIN="tipsio.id"
WWW_DOMAIN="www.tipsio.id"

echo "🌐 Starting domain and SSL setup for $DOMAIN..."

# Check DNS first
echo "🔍 Checking DNS configuration..."
CURRENT_IP=$(dig +short $DOMAIN | head -n1)
echo "Current DNS for $DOMAIN: $CURRENT_IP"
echo "Expected IP: $SERVER_IP"

if [ "$CURRENT_IP" != "$SERVER_IP" ]; then
    echo ""
    echo "⚠️  WARNING: DNS is not pointing to the correct server!"
    echo "   Current IP: $CURRENT_IP"
    echo "   Expected IP: $SERVER_IP"
    echo ""
    echo "Please update your DNS records at your domain registrar:"
    echo "  - $DOMAIN → $SERVER_IP"
    echo "  - $WWW_DOMAIN → $SERVER_IP"
    echo ""
    echo "After updating DNS, wait 5-30 minutes for propagation."
    echo ""
    echo "Do you want to continue anyway? (yes/no)"
    read -r CONTINUE
    if [ "$CONTINUE" != "yes" ]; then
        echo "Aborting. Please update DNS and run this script again."
        exit 1
    fi
fi

# Function to run commands on server
run_remote() {
    sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$1"
}

# Function to copy files to server
copy_to_server() {
    sshpass -p "$SERVER_PASS" scp -o StrictHostKeyChecking=no "$1" "$SERVER_USER@$SERVER_IP:$2"
}

# Step 1: Upload temporary HTTP Nginx configuration
echo "📤 Uploading temporary Nginx configuration..."
copy_to_server "nginx-tipsio-domain.conf" "/tmp/nginx-tipsio-domain.conf"

# Step 2: Move configuration to Nginx sites-available
echo "📝 Installing Nginx configuration..."
run_remote "sudo mv /tmp/nginx-tipsio-domain.conf /etc/nginx/sites-available/tipsio"

# Step 3: Remove old symlink if exists and create new one
echo "🔗 Creating symlink..."
run_remote "sudo rm -f /etc/nginx/sites-enabled/tipsio && sudo ln -s /etc/nginx/sites-available/tipsio /etc/nginx/sites-enabled/tipsio"

# Step 4: Create certbot directory
echo "📁 Creating certbot directory..."
run_remote "sudo mkdir -p /var/www/certbot"

# Step 5: Test Nginx configuration
echo "✅ Testing Nginx configuration..."
run_remote "sudo nginx -t"

# Step 6: Reload Nginx
echo "🔄 Reloading Nginx..."
run_remote "sudo systemctl reload nginx"

# Step 7: Install certbot if not installed
echo "📦 Installing certbot..."
run_remote "sudo apt update && sudo apt install -y certbot python3-certbot-nginx"

# Step 8: Obtain SSL certificate
echo "🔐 Obtaining SSL certificate for $DOMAIN and $WWW_DOMAIN..."
echo "⚠️  Make sure DNS records point to $SERVER_IP before continuing!"
echo "Press Enter to continue or Ctrl+C to cancel..."
read

run_remote "sudo certbot --nginx -d $DOMAIN -d $WWW_DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect"

# Step 9: Upload final SSL configuration
echo "📤 Uploading final SSL Nginx configuration..."
copy_to_server "nginx-tipsio-ssl.conf" "/tmp/nginx-tipsio-ssl.conf"
run_remote "sudo mv /tmp/nginx-tipsio-ssl.conf /etc/nginx/sites-available/tipsio"

# Step 10: Test and reload Nginx again
echo "✅ Testing final Nginx configuration..."
run_remote "sudo nginx -t"
run_remote "sudo systemctl reload nginx"

# Step 11: Update NEXTAUTH_URL in .env.production
echo "🔧 Updating NEXTAUTH_URL in .env.production..."
run_remote "cd /var/www/tipsio && sed -i 's|NEXTAUTH_URL=.*|NEXTAUTH_URL=\"https://$DOMAIN\"|' .env.production"

# Step 12: Restart PM2 application
echo "🔄 Restarting application..."
run_remote "cd /var/www/tipsio && pm2 restart tipsio"

# Step 13: Verify SSL certificate auto-renewal
echo "🔄 Setting up SSL certificate auto-renewal..."
run_remote "sudo certbot renew --dry-run"

echo ""
echo "✅ Domain and SSL setup completed successfully!"
echo ""
echo "📊 Summary:"
echo "  - Domain: https://$DOMAIN"
echo "  - WWW Domain: https://$WWW_DOMAIN"
echo "  - SSL Certificate: Active"
echo "  - Auto-renewal: Configured"
echo "  - NEXTAUTH_URL: Updated"
echo "  - Application: Restarted"
echo ""
echo "🌐 Your application is now accessible at:"
echo "  https://$DOMAIN"
echo "  https://$WWW_DOMAIN"
echo ""
echo "📝 Next steps:"
echo "  1. Test the application: curl -I https://$DOMAIN"
echo "  2. Check SSL rating: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo "  3. Add Midtrans keys to .env.production if not done yet"
echo ""
