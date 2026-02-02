# ✅ Production Deployment Checklist

Use this checklist to ensure a smooth production deployment.

---

## Pre-Deployment

### Server Preparation
- [ ] Server accessible via SSH
- [ ] Domain DNS configured and propagated
- [ ] Server has at least 2GB RAM
- [ ] Server has at least 20GB disk space

### Credentials Ready
- [ ] Midtrans production SERVER_KEY
- [ ] Midtrans production CLIENT_KEY
- [ ] Email service API key (optional)
- [ ] SMS service credentials (optional)

### Local Setup
- [ ] Latest code pulled from GitHub
- [ ] All tests passing (`npm test`)
- [ ] No TypeScript errors
- [ ] Dependencies updated

---

## Step 1: Server Setup

- [ ] Connected to server via SSH
- [ ] Created `deploy` user
- [ ] Added `deploy` to sudo group
- [ ] Set up SSH key for `deploy` user
- [ ] Tested SSH connection as `deploy`

### Docker Installation
- [ ] Docker installed
- [ ] Docker Compose installed
- [ ] `deploy` user added to docker group
- [ ] Docker version verified

### Firewall Configuration
- [ ] Port 22 (SSH) allowed
- [ ] Port 80 (HTTP) allowed
- [ ] Port 443 (HTTPS) allowed
- [ ] Firewall enabled
- [ ] Firewall status verified

---

## Step 2: Generate Secrets

Run these commands and save the output:

```bash
openssl rand -base64 32  # NEXTAUTH_SECRET
openssl rand -hex 32     # ENCRYPTION_KEY
openssl rand -base64 24  # DB_PASSWORD
```

- [ ] NEXTAUTH_SECRET generated and saved
- [ ] ENCRYPTION_KEY generated and saved
- [ ] DB_PASSWORD generated and saved
- [ ] Secrets stored securely (password manager)

---

## Step 3: Upload Code

Choose one method:

### Option A: rsync
```bash
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
  ./ deploy@YOUR_SERVER_IP:/opt/tipsio/
```

### Option B: Git
```bash
ssh deploy@YOUR_SERVER_IP
cd /opt/tipsio
git clone https://github.com/super-sh1z01d/tipsio.git .
```

- [ ] Code uploaded to server
- [ ] Files verified in `/opt/tipsio`

---

## Step 4: Configure Environment

- [ ] Created `.env` file on server
- [ ] Added DB_USER=tipsio
- [ ] Added DB_PASSWORD (generated)
- [ ] Added DB_NAME=tipsio
- [ ] Added NEXTAUTH_SECRET (generated)
- [ ] Added NEXTAUTH_URL=https://app.example.com
- [ ] Added ENCRYPTION_KEY (generated)
- [ ] Added MIDTRANS_SERVER_KEY (production)
- [ ] Added MIDTRANS_CLIENT_KEY (production)
- [ ] Set MIDTRANS_IS_PRODUCTION=true
- [ ] Saved and closed `.env` file
- [ ] Verified `.env` file permissions (600)

---

## Step 5: SSL Certificate

- [ ] Created certbot directories
- [ ] Created temporary nginx config
- [ ] Started temporary nginx container
- [ ] Ran certbot to get certificate
- [ ] Certificate obtained successfully
- [ ] Stopped temporary nginx
- [ ] Cleaned up temporary files

---

## Step 6: Deploy Application

- [ ] Ran `docker-compose build --no-cache`
- [ ] Build completed without errors
- [ ] Ran `docker-compose up -d`
- [ ] All containers started
- [ ] Checked container status (`docker-compose ps`)
- [ ] All containers showing "Up"

---

## Step 7: Database Setup

- [ ] Waited 10 seconds for database to initialize
- [ ] Ran `docker-compose exec app npx prisma migrate deploy`
- [ ] Migrations completed successfully
- [ ] (Optional) Ran database seed

---

## Step 8: Verification

### Container Health
- [ ] App container running
- [ ] Database container running
- [ ] No error logs in `docker-compose logs`

### Application Access
- [ ] HTTP redirect working (http → https)
- [ ] HTTPS site accessible
- [ ] No SSL warnings in browser
- [ ] Homepage loads correctly
- [ ] Can navigate to login pages

### API Endpoints
- [ ] `/api/auth/session` responds
- [ ] Rate limiting working (test OTP endpoints)
- [ ] Database queries working

---

## Step 9: Production Configuration

### Nginx (if using separate nginx)
- [ ] Created production nginx.conf
- [ ] Added nginx service to docker-compose.yml
- [ ] Configured SSL in nginx
- [ ] Added security headers
- [ ] Restarted services
- [ ] Verified nginx is proxying correctly

### Monitoring
- [ ] Set up log monitoring
- [ ] Configure uptime monitoring
- [ ] Set up error alerts
- [ ] Configure backup schedule

---

## Post-Deployment

### Testing
- [ ] Test user registration
- [ ] Test OTP login
- [ ] Test venue creation
- [ ] Test QR code generation
- [ ] Test tip payment flow
- [ ] Test rate limiting (try multiple OTP requests)

### Security
- [ ] Verify HTTPS is enforced
- [ ] Check security headers
- [ ] Test rate limiting
- [ ] Verify secrets are not exposed
- [ ] Check firewall rules

### Documentation
- [ ] Update deployment date in docs
- [ ] Document any custom configurations
- [ ] Save backup of `.env` file (securely)
- [ ] Document server access details

---

## Maintenance Setup

### Backups
- [ ] Set up automated database backups
- [ ] Test backup restoration
- [ ] Configure backup retention policy

### Updates
- [ ] Document update procedure
- [ ] Schedule regular security updates
- [ ] Set up dependency update alerts

### Monitoring
- [ ] Configure log rotation
- [ ] Set up disk space monitoring
- [ ] Configure memory/CPU alerts
- [ ] Set up SSL expiry alerts

---

## Rollback Plan

In case of issues:

```bash
# Stop services
docker-compose down

# Restore previous version
git checkout <previous-commit>

# Rebuild and restart
docker-compose build --no-cache
docker-compose up -d

# Restore database backup if needed
cat backup.sql | docker exec -i tipsio-db-1 psql -U tipsio -d tipsio
```

- [ ] Rollback procedure documented
- [ ] Previous version tagged in git
- [ ] Database backup available

---

## Sign-off

### Deployment Team
- [ ] Deployment completed by: _______________
- [ ] Date: _______________
- [ ] Time: _______________

### Verification
- [ ] Application accessible
- [ ] All features working
- [ ] No critical errors
- [ ] Performance acceptable

### Approval
- [ ] Technical lead approval: _______________
- [ ] Product owner approval: _______________

---

## Emergency Contacts

- **Server Provider**: _______________
- **Domain Registrar**: _______________
- **SSL Certificate**: Let's Encrypt (auto-renew)
- **Payment Gateway**: Midtrans Support
- **On-call Engineer**: _______________

---

## Notes

Use this section for deployment-specific notes:

```
Date: December 4, 2025
Server: YOUR_SERVER_IP
Domain: app.example.com
Deployment Method: Manual
Issues Encountered: None
Special Configurations: None
```

---

**Last Updated**: December 4, 2025
