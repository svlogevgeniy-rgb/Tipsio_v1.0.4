# 🔒 Secure Deployment Guide

## Quick Start

### 1. Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY
openssl rand -hex 32

# Generate DB_PASSWORD
openssl rand -base64 24
```

### 2. Create Production .env

Copy `.env.production.example` to `.env` and fill in the generated values:

```bash
cp .env.production.example .env
nano .env  # or use your preferred editor
```

### 3. Set Deployment Variables

```bash
export DEPLOY_SERVER="your-server-ip"
export DEPLOY_USER="deploy"
export DEPLOY_DOMAIN="your-domain.com"
```

### 4. Deploy

```bash
./deploy.sh
```

---

## Detailed Setup

### Server Preparation

#### 1. Create Deployment User

**DO NOT use root for deployment!**

```bash
# SSH to your server as root
ssh root@your-server-ip

# Create deployment user
adduser deploy
usermod -aG sudo deploy
usermod -aG docker deploy

# Set up SSH key authentication
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# Test the new user
exit
ssh deploy@your-server-ip
```

#### 2. Install Docker (if not installed)

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

#### 3. Configure Firewall

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

---

### Environment Configuration

#### Development (.env)

```env
# Already configured with secure defaults
# Just add your API keys:
MIDTRANS_SERVER_KEY="your-sandbox-key"
MIDTRANS_CLIENT_KEY="your-sandbox-client-key"
```

#### Production (.env on server)

```env
# Database
DB_USER="tipsio"
DB_PASSWORD="<generated-strong-password>"
DB_NAME="tipsio"

# Auth
NEXTAUTH_SECRET="<generated-secret>"
NEXTAUTH_URL="https://your-domain.com"

# Encryption
ENCRYPTION_KEY="<generated-key>"

# Midtrans Production
MIDTRANS_SERVER_KEY="<production-server-key>"
MIDTRANS_CLIENT_KEY="<production-client-key>"
MIDTRANS_IS_PRODUCTION="true"

# Optional: Email & SMS
RESEND_API_KEY="<your-key>"
TWILIO_ACCOUNT_SID="<your-sid>"
TWILIO_AUTH_TOKEN="<your-token>"
TWILIO_PHONE_NUMBER="<your-number>"
```

---

### Deployment Process

#### Option 1: Automated Deployment

```bash
# Set environment variables
export DEPLOY_SERVER="YOUR_SERVER_IP"
export DEPLOY_USER="deploy"
export DEPLOY_DOMAIN="app.example.com"

# Run deployment script
./deploy.sh
```

#### Option 2: Manual Deployment

```bash
# 1. Copy files to server
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  ./ deploy@your-server:/opt/tipsio/

# 2. SSH to server
ssh deploy@your-server

# 3. Navigate to app directory
cd /opt/tipsio

# 4. Create .env file (see above)
nano .env

# 5. Build and start
docker-compose build
docker-compose up -d

# 6. Run migrations
docker-compose exec app npx prisma migrate deploy

# 7. Check logs
docker-compose logs -f
```

---

## Security Features

### ✅ Implemented

1. **Rate Limiting**
   - OTP send: 5 requests / 15 minutes
   - OTP verify: 10 attempts / 15 minutes
   - Automatic cleanup of old entries

2. **Strong Secrets**
   - Cryptographically secure random generation
   - No default/weak secrets in production

3. **Database Security**
   - Parameterized credentials
   - Internal Docker network only
   - Strong password requirements

4. **Deployment Security**
   - Non-root user deployment
   - Environment variable configuration
   - No hardcoded credentials

5. **HTTPS/SSL**
   - Automatic Let's Encrypt certificate
   - Configured in deploy.sh

### 🔄 Recommended Additions

1. **Redis for Rate Limiting** (multi-server deployments)
   ```yaml
   # Add to docker-compose.yml
   redis:
     image: redis:7-alpine
     restart: always
     networks:
       - tipsio-network
   ```

2. **Database Backups**
   ```bash
   # Add to crontab
   0 2 * * * docker exec tipsio-db-1 pg_dump -U tipsio tipsio > /backups/tipsio-$(date +\%Y\%m\%d).sql
   ```

3. **Log Monitoring**
   - Set up log aggregation (e.g., ELK stack)
   - Monitor rate limit violations
   - Alert on authentication failures

4. **Security Headers**
   - Add to nginx.conf:
   ```nginx
   add_header X-Frame-Options "SAMEORIGIN";
   add_header X-Content-Type-Options "nosniff";
   add_header X-XSS-Protection "1; mode=block";
   ```

---

## Monitoring

### Check Application Status

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f app

# Check database
docker-compose exec db psql -U tipsio -d tipsio
```

### Health Checks

```bash
# Application health
curl https://your-domain.com/api/health

# Database connection
docker-compose exec app npx prisma db pull
```

---

## Troubleshooting

### Issue: Rate Limiting Too Strict

Edit `src/lib/rate-limit.ts` and adjust limits:

```typescript
// In OTP send endpoint
const rateLimitResult = checkRateLimit(identifier, {
  maxRequests: 10,  // Increase from 5
  windowMs: 15 * 60 * 1000,
});
```

### Issue: Database Connection Failed

```bash
# Check database is running
docker-compose ps db

# Check credentials in .env
cat .env | grep DB_

# View database logs
docker-compose logs db
```

### Issue: SSL Certificate Failed

```bash
# Check domain DNS
dig your-domain.com

# Manually get certificate
docker run --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  certbot/certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email your-email@example.com \
  --agree-tos \
  -d your-domain.com
```

---

## Maintenance

### Regular Tasks

**Weekly**:
- Check `docker-compose logs` for errors
- Review rate limit violations
- Monitor disk space

**Monthly**:
- Run `npm audit` and update dependencies
- Review and rotate API keys if needed
- Check SSL certificate expiry

**Quarterly**:
- Rotate database passwords
- Rotate NEXTAUTH_SECRET and ENCRYPTION_KEY
- Review and update rate limits
- Perform security audit

### Updates

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

---

## Support

- **Documentation**: See `SECURITY.md` for detailed security guidelines
- **Security Issues**: Email security@tipsio.app
- **General Support**: Create an issue on GitHub

---

## Checklist

Before going live:

- [ ] Server prepared with non-root user
- [ ] Firewall configured
- [ ] All secrets generated and set in .env
- [ ] Database password is strong (24+ characters)
- [ ] Midtrans production keys configured
- [ ] MIDTRANS_IS_PRODUCTION=true
- [ ] Domain DNS configured
- [ ] SSL certificate obtained
- [ ] Application deployed and running
- [ ] Database migrations applied
- [ ] Health checks passing
- [ ] Logs reviewed for errors
- [ ] Backup strategy in place
- [ ] Monitoring configured

---

**Last Updated**: December 4, 2025
