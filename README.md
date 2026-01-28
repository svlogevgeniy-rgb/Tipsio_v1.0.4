# Tipsio - Digital Tipping Platform

A modern digital tipping platform built with Next.js, enabling seamless tip distribution for service industry venues.

## 🔒 Security First

This project has undergone a comprehensive security audit. All critical vulnerabilities have been addressed.

**📋 See [SECURITY_AUDIT_COMPLETE.md](SECURITY_AUDIT_COMPLETE.md) for full audit report**

### Quick Security Setup

1. **Generate Secrets**
   ```bash
   openssl rand -base64 32  # For NEXTAUTH_SECRET
   openssl rand -hex 32     # For ENCRYPTION_KEY
   ```

2. **Update .env**
   - Copy `.env.example` to `.env`
   - Replace placeholder values with generated secrets

3. **Review Security Docs**
   - [SECURITY.md](SECURITY.md) - Security guidelines
   - [DEPLOYMENT_SECURITY_GUIDE.md](DEPLOYMENT_SECURITY_GUIDE.md) - Deployment instructions

## Getting Started

### Prerequisites

- Node.js 20.18.x (run `nvm use` to respect `.nvmrc`)
- npm 10.8+
- PostgreSQL 15+
- Docker (for production)

### Development Setup

First, install dependencies and set up environment:

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env and add your secrets

# Initialize local database (Docker + Prisma)
npm run init-db

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

Need more control over the database (custom ports, manual Postgres install, troubleshooting)? Read the dedicated [README_DB.md](README_DB.md).

### Test User

Need quick credentials for local testing? Run:

```bash
npm run create:test-user
```

By default this upserts `manager@test.com` / `password123` with the `MANAGER` role. Override via `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`, and `TEST_USER_ROLE` env vars if you need different values.

### Database Automation

- `npm run init-db` — start Docker Postgres, push schema, seed demo data
- `npm run reset-db` — drop schema, recreate, seed again
- `npm run db:stop` — stop the database container without destroying the volume

All commands and manual alternatives are documented in [README_DB.md](README_DB.md).

### Health & Monitoring

- `GET /api/health` exposes application + database status (used by container health checks).
- `docker-compose.yml` now has health checks for both `app` and `db` services so orchestration layers only route traffic once everything is ready.
- `npm run db:wait` can be reused anywhere (including CI/CD) to block until Postgres accepts connections.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 🚀 Production Deployment

### Docker Deployment (Recommended)

```bash
# Set deployment variables
export DEPLOY_SERVER="your-server-ip"
export DEPLOY_USER="deploy"
export DEPLOY_DOMAIN="your-domain.com"

# Deploy
./deploy.sh
```

**📖 Full deployment guide**: [DEPLOYMENT_SECURITY_GUIDE.md](DEPLOYMENT_SECURITY_GUIDE.md)

### Manual Deployment

See [DEPLOYMENT_SECURITY_GUIDE.md](DEPLOYMENT_SECURITY_GUIDE.md) for step-by-step manual deployment instructions.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test src/lib/rate-limit.test.ts
```

### Continuous Integration

Every push and pull request runs `.github/workflows/ci.yml`, which:

- pins Node.js 20.18.0 to match local/Docker runtimes,
- executes `npm ci`, `npm run lint`, and `npm run build`,
- sets deterministic env vars so Prisma generates without a live database.

## 🔐 Security Features

- ✅ Rate limiting on authentication endpoints
- ✅ Cryptographically secure secrets
- ✅ Parameterized database credentials
- ✅ Non-root deployment user
- ✅ HTTPS/SSL support
- ✅ Environment-based configuration

## 📚 Documentation

- [README_DB.md](README_DB.md) - Local database bootstrap guide
- [SECURITY.md](SECURITY.md) - Security guidelines and best practices
- [SECURITY_AUDIT_COMPLETE.md](SECURITY_AUDIT_COMPLETE.md) - Complete security audit report
- [SECURITY_FIXES.md](SECURITY_FIXES.md) - Detailed list of security fixes
- [DEPLOYMENT_SECURITY_GUIDE.md](DEPLOYMENT_SECURITY_GUIDE.md) - Secure deployment guide

## 🔄 Updating Your Local Instance Safely

When pulling upstream changes, keep your local secrets and data intact with this workflow:

1. **Back up config and data**
   ```bash
   cp .env .env.backup.$(date +%Y%m%d-%H%M)
   pg_dump -U tipsio -h localhost tipsio > backups/tipsio-$(date +%Y%m%d-%H%M).sql   # adjust user/db if different
   ```
2. **Sync code**
   ```bash
   git stash push -u -m "pre-update"
   git pull origin main --ff-only
   git stash pop
   npm install
   ```
3. **Apply schema changes without wiping data**
   ```bash
   npx prisma migrate deploy
   npm run seed --if-present   # only if new seed data is required
   ```
4. **Verify**
   ```bash
   npm run lint
   npm run test
   npm run dev
   ```

All steps are safe for existing databases; `migrate deploy` never drops tables and seeds run only when explicitly needed.

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **Payment**: Midtrans
- **UI**: Tailwind CSS + Radix UI
- **Testing**: Vitest
- **Deployment**: Docker + Docker Compose

## 📝 License

Private project - All rights reserved

## 🤝 Support

For security issues, email: security@tipsio.app
