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
# Start PostgreSQL (if using Docker)
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

## Production (10 minutes)

### Prerequisites
- Server with Docker installed
- Domain name configured
- Midtrans production keys

### 1. Prepare Server
```bash
# SSH to your server
ssh root@your-server-ip

# Create deployment user
adduser deploy
usermod -aG sudo,docker deploy

# Set up SSH key
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
```

### 2. Generate Production Secrets
```bash
# On your local machine
openssl rand -base64 32  # NEXTAUTH_SECRET
openssl rand -hex 32     # ENCRYPTION_KEY
openssl rand -base64 24  # DB_PASSWORD
```

### 3. Configure Deployment
```bash
# Set environment variables
export DEPLOY_SERVER="your-server-ip"
export DEPLOY_USER="deploy"
export DEPLOY_DOMAIN="your-domain.com"
```

### 4. Deploy
```bash
./deploy.sh
```

### 5. Configure Production .env
```bash
# SSH to server
ssh deploy@your-server-ip
cd /opt/tipsio

# Edit .env file
nano .env
```

Add:
```env
DB_PASSWORD="<generated-db-password>"
NEXTAUTH_SECRET="<generated-secret>"
ENCRYPTION_KEY="<generated-key>"
MIDTRANS_SERVER_KEY="<production-key>"
MIDTRANS_CLIENT_KEY="<production-client-key>"
MIDTRANS_IS_PRODUCTION="true"
```

### 6. Restart Services
```bash
docker-compose down
docker-compose up -d
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
docker ps | grep postgres

# Check connection string in .env
cat .env | grep DATABASE_URL
```

### Port 3000 Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
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
4. 🚀 See [DEPLOYMENT_SECURITY_GUIDE.md](DEPLOYMENT_SECURITY_GUIDE.md) for advanced deployment

---

## Need Help?

- **Security Issues**: security@tipsio.app
- **Documentation**: See README.md
- **Deployment**: See DEPLOYMENT_SECURITY_GUIDE.md
- **General Support**: GitHub Issues

---

**Last Updated**: December 4, 2025
