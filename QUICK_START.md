# 🚀 Quick Start Guide

## Development (5 minutes)

### 1. Clone & Install
```bash
git clone https://github.com/super-sh1z01d/tipsio.git
cd tipsio
npm install
```

### 2. Generate Secrets
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate ENCRYPTION_KEY
openssl rand -hex 32
```

### 3. Configure Environment
```bash
cp .env.example .env
nano .env  # Paste generated secrets
```

Your `.env` should look like:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tipsio?schema=public"
NEXTAUTH_SECRET="<paste-generated-secret>"
NEXTAUTH_URL="http://localhost:3000"
ENCRYPTION_KEY="<paste-generated-key>"
```

### 4. Setup Database
```bash
# Option 1: Use local PostgreSQL
# Make sure PostgreSQL is installed and running
createdb tipsio

# Option 2: Use Docker (optional)
docker run -d \
  --name tipsio-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=tipsio \
  -p 5432:5432 \
  postgres:15-alpine

# Run migrations
npx prisma migrate dev
```

### 5. Start Development Server
```bash
npm run dev
```

Visit http://localhost:3000 🎉

---

## Production (15 minutes)

### Prerequisites
- Server with Node.js 20+ and PostgreSQL 15+
- Domain name configured
- Midtrans production keys

### Quick Production Setup

For detailed production deployment, see [DEPLOYMENT_GUIDE_NO_DOCKER.md](DEPLOYMENT_GUIDE_NO_DOCKER.md)

### 1. Prepare Server
```bash
# SSH to your server
ssh root@your-server-ip

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt-get install -y nginx
```

### 2. Deploy Application
```bash
# Clone repository
cd /var/www
git clone https://github.com/your-org/tipsio.git
cd tipsio

# Install dependencies
npm ci --production=false

# Setup environment
cp .env.production.example .env.production
nano .env.production  # Add your secrets

# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 3. Configure Nginx
```bash
# Copy nginx configuration
sudo cp nginx.conf.example /etc/nginx/sites-available/tipsio
sudo ln -s /etc/nginx/sites-available/tipsio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Setup SSL
```bash
# Install certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

Visit https://your-domain.com 🎉

---

## Testing

```bash
# Run all tests
npm test

# Run specific test
npm test src/lib/rate-limit.test.ts

# Watch mode
npm run test:watch
```

---

## Common Issues

### Database Connection Failed
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Or if using Docker
docker ps | grep postgres

# Check connection string in .env
cat .env | grep DATABASE_URL
```

### Port 3000 Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Or using PM2
pm2 list

# Kill the process
kill -9 <PID>
# Or restart PM2
pm2 restart tipsio
```

### Rate Limiting Too Strict
Edit `src/lib/rate-limit.ts` and adjust limits:
```typescript
const rateLimitResult = checkRateLimit(identifier, {
  maxRequests: 10,  // Increase from 5
  windowMs: 15 * 60 * 1000,
});
```

---

## Next Steps

1. ✅ Application running
2. 📖 Read [SECURITY.md](SECURITY.md) for security best practices
3. 🔒 Review [SECURITY_AUDIT_COMPLETE.md](SECURITY_AUDIT_COMPLETE.md)
4. 🚀 See [DEPLOYMENT_GUIDE_NO_DOCKER.md](DEPLOYMENT_GUIDE_NO_DOCKER.md) for production deployment

---

**Last Updated**: January 31, 2026
