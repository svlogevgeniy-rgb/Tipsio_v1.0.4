# Security Guidelines

## Environment Variables

### Development
1. Copy `.env.example` to `.env`
2. Generate secure secrets:
   ```bash
   # For NEXTAUTH_SECRET
   openssl rand -base64 32
   
   # For ENCRYPTION_KEY
   openssl rand -hex 32
   ```

### Production
1. Copy `.env.production.example` to `.env` on your server
2. Generate all secrets using the commands above
3. Use strong database passwords (minimum 24 characters)
4. Never commit `.env` files to version control

## Deployment Security

### SSH Access
- **DO NOT use root user** for deployment
- Create a dedicated deployment user:
  ```bash
  # On your server
  sudo adduser deploy
  sudo usermod -aG docker deploy
  ```

### Environment Variables for Deployment
Set these before running `deploy.sh`:
```bash
export DEPLOY_SERVER="your-server-ip"
export DEPLOY_USER="deploy"
export DEPLOY_DOMAIN="your-domain.com"
```

## Rate Limiting

The application includes rate limiting for sensitive endpoints:

- **OTP Send**: 5 requests per 15 minutes per IP
- **OTP Verify**: 10 attempts per 15 minutes per IP

For production with multiple servers, consider using Redis for distributed rate limiting.

## Database Security

### Docker Compose
- Database passwords are now environment variables
- Set `DB_PASSWORD` in your `.env` file
- Use strong passwords (24+ characters)

### Connection Security
- Database is not exposed to the internet (internal Docker network only)
- Use SSL/TLS for database connections in production

## Known Vulnerabilities

### NPM Audit Results
Run `npm audit` to see current vulnerabilities. Some are in dev dependencies and don't affect production:

- **glob** (high): Only affects eslint tooling, not runtime
- **hono/valibot** (high): Transitive dependencies in Prisma dev tools

To update:
```bash
npm audit fix
```

## Security Checklist

Before deploying to production:

- [ ] Generate new `NEXTAUTH_SECRET`
- [ ] Generate new `ENCRYPTION_KEY`
- [ ] Set strong `DB_PASSWORD`
- [ ] Configure Midtrans production keys
- [ ] Set `MIDTRANS_IS_PRODUCTION=true`
- [ ] Use HTTPS (SSL certificate)
- [ ] Create non-root deployment user
- [ ] Set deployment environment variables
- [ ] Review and update rate limits if needed
- [ ] Enable firewall on server
- [ ] Set up regular database backups

## Reporting Security Issues

If you discover a security vulnerability, please email security@tipsio.app instead of using the issue tracker.
