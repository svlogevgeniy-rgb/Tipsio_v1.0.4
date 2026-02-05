# 🚀 Manual Production Deployment Guide

## Prerequisites

- Server with Ubuntu/Debian
- Root or sudo access
- Domain configured (app.example.com)
- Midtrans production keys

---

## Step 1: Prepare Server

### 1.1 Connect to Server

```bash
ssh root@YOUR_SERVER_IP
```

### 1.2 Create Deployment User

```bash
# Create user
adduser deploy
# Set password when prompted

# Add to docker group (we'll install docker later)
usermod -aG sudo deploy

# Set up SSH key
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# Test new user
exit
ssh deploy@YOUR_SERVER_IP
```

### 1.3 Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Logout and login again for group changes
exit
ssh deploy@YOUR_SERVER_IP
```

### 1.4 Configure Firewall

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
sudo ufw status
```

---

## Step 2: Generate Production Secrets

**On your local machine**, generate secrets:

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY
openssl rand -hex 32

# Generate DB_PASSWORD
openssl rand -base64 24
```

**Save these values!** You'll need them in the next step.

---

## Step 3: Upload Project to Server

### Option A: Using rsync (Recommended)

```bash
# From your local machine
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  ./ deploy@YOUR_SERVER_IP:/opt/tipsio/
```

### Option B: Using Git

```bash
# On server
ssh deploy@YOUR_SERVER_IP
sudo mkdir -p /opt/tipsio
sudo chown deploy:deploy /opt/tipsio
cd /opt/tipsio

# Clone repository
git clone https://github.com/super-sh1z01d/tipsio.git .
```

---

## Step 4: Configure Environment

```bash
# On server
cd /opt/tipsio

# Create .env file
nano .env
```

Paste this content and **fill in the generated values**:

```env
# Database
DB_USER=tipsio
DB_PASSWORD=<paste-generated-db-password>
DB_NAME=tipsio

# NextAuth
NEXTAUTH_SECRET=<paste-generated-secret>
NEXTAUTH_URL=https://app.example.com

# Encryption
ENCRYPTION_KEY=<paste-generated-key>

# Midtrans Production
MIDTRANS_SERVER_KEY=<your-production-server-key>
MIDTRANS_CLIENT_KEY=<your-production-client-key>
MIDTRANS_IS_PRODUCTION=true

# Optional
RESEND_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

Save and exit (Ctrl+X, Y, Enter)

---

## Step 5: Get SSL Certificate

```bash
# Create directories
mkdir -p certbot/conf certbot/www

# Create temporary nginx config
cat > nginx-init.conf << 'EOF'
events {
    worker_connections 1024;
}
http {
    server {
        listen 80;
        server_name app.example.com;
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        location / {
            return 200 'Tipsio is being configured...';
            add_header Content-Type text/plain;
        }
    }
}
EOF

# Start temporary nginx
docker run -d --name nginx-init -p 80:80 \
    -v $(pwd)/nginx-init.conf:/etc/nginx/nginx.conf:ro \
    -v $(pwd)/certbot/www:/var/www/certbot:ro \
    nginx:alpine

# Wait a moment
sleep 3

# Get certificate
docker run --rm \
    -v $(pwd)/certbot/conf:/etc/letsencrypt \
    -v $(pwd)/certbot/www:/var/www/certbot \
    certbot/certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@example.com \
    --agree-tos \
    --no-eff-email \
    -d app.example.com

# Stop temporary nginx
docker stop nginx-init
docker rm nginx-init
rm nginx-init.conf
```

---

## Step 6: Deploy Application

```bash
# Build and start services
docker-compose build --no-cache
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

---

## Step 7: Run Database Migrations

```bash
# Wait for database to be ready (about 10 seconds)
sleep 10

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Optional: Seed database
docker-compose exec app npm run db:seed
```

---

## Step 8: Verify Deployment

### Check Services

```bash
# Check running containers
docker-compose ps

# Check logs
docker-compose logs app
docker-compose logs db

# Check application health
curl http://localhost:3000
```

### Test in Browser

Visit: https://app.example.com

---

## Step 9: Configure Nginx (Production)

Create production nginx config:

```bash
sudo nano /opt/tipsio/nginx.conf
```

Paste:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name app.example.com;
        
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        location / {
            return 301 https://$host$request_uri;
        }
    }

    server {
        listen 443 ssl http2;
        server_name app.example.com;

        ssl_certificate /etc/letsencrypt/live/app.example.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/app.example.com/privkey.pem;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

Update docker-compose.yml to add nginx:

```bash
nano docker-compose.yml
```

Add nginx service:

```yaml
  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      - app
    networks:
      - tipsio-network
```

Restart services:

```bash
docker-compose down
docker-compose up -d
```

---

## Troubleshooting

### Issue: Database Connection Failed

```bash
# Check database logs
docker-compose logs db

# Check credentials
cat .env | grep DB_

# Restart database
docker-compose restart db
```

### Issue: SSL Certificate Failed

```bash
# Check domain DNS
dig app.example.com

# Check certbot logs
docker-compose logs certbot

# Try manual certificate
sudo certbot certonly --standalone -d app.example.com
```

### Issue: Application Not Starting

```bash
# Check logs
docker-compose logs app

# Check environment variables
docker-compose exec app env | grep -E "NEXTAUTH|DATABASE"

# Rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## Maintenance

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f db
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart app
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy
```

### Backup Database

```bash
# Create backup
docker exec tipsio-db-1 pg_dump -U tipsio tipsio > backup-$(date +%Y%m%d).sql

# Restore backup
cat backup-20241204.sql | docker exec -i tipsio-db-1 psql -U tipsio -d tipsio
```

---

## Security Checklist

- [x] Non-root deployment user created
- [x] Firewall configured
- [x] Strong secrets generated
- [x] SSL certificate obtained
- [x] HTTPS enabled
- [x] Security headers configured
- [x] Rate limiting active
- [x] Database password strong
- [x] Midtrans production keys configured

---

## Next Steps

1. Set up monitoring (logs, uptime)
2. Configure automated backups
3. Set up log rotation
4. Configure email alerts
5. Schedule security updates

---

## Support

- **Documentation**: See SECURITY.md
- **Issues**: GitHub Issues
- **Security**: security@tipsio.app

---

**Deployment Date**: December 4, 2025  
**Server**: YOUR_SERVER_IP  
**Domain**: app.example.com
