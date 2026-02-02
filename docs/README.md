# Tipsio Documentation Index

## 📚 Core Documentation

### Getting Started
- [README.md](../README.md) - Main project documentation and overview
- [QUICK_START.md](../QUICK_START.md) - Quick start guide for development and production

### Development
- [README_DB.md](../README_DB.md) - Database setup and management guide
- Package scripts - See `package.json` for available npm commands

### Deployment
- [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) - Deployment overview and guide
- [DEPLOYMENT_GUIDE_NO_DOCKER.md](../DEPLOYMENT_GUIDE_NO_DOCKER.md) - **Current deployment method** (PM2 + Nginx)
- [DEPLOYMENT_SECURITY_GUIDE.md](../DEPLOYMENT_SECURITY_GUIDE.md) - Security guidelines for deployment
- [deploy-to-production.sh](../deploy-to-production.sh) - Automated deployment script
- [ecosystem.config.js](../ecosystem.config.js) - PM2 configuration

### Security
- [SECURITY.md](../SECURITY.md) - Security guidelines and best practices
- [SECURITY_AUDIT_COMPLETE.md](../SECURITY_AUDIT_COMPLETE.md) - Complete security audit report

### Infrastructure
- [DOMAIN_SSL_SETUP.md](../DOMAIN_SSL_SETUP.md) - Domain and SSL configuration guide
- [backup-db.sh](../backup-db.sh) - Database backup script
- [nginx.conf.example](../nginx.conf.example) - Nginx configuration example

## 🗂️ Operational Documentation

### Specs & Features
Located in `.kiro/specs/`:
- `admin-panel-security/` - Admin panel authentication and authorization
- `full-stack-stabilization/` - Full stack stability improvements
- `landing-and-qr-improvements/` - Landing page and QR code enhancements
- `tip-payment-ui-v2/` - Tip payment UI redesign
- `venue-dashboard-deduplication/` - Venue dashboard optimization
- And more...

### Operations
Located in `docs/ops/`:
- `venue-dashboard-deduplication.md` - Venue dashboard deduplication guide
- `TIPS-31-issues.md` - Known issues and solutions

### Refactoring
Located in `docs/refactoring/`:
- `STRUCTURAL_REFACTORING.md` - Structural refactoring documentation
- `TIPS-27.md` - Refactoring task documentation

## 📦 Archived Documentation

Historical documentation is preserved in `docs/archive/`:
- `refactoring/` - Completed refactoring guides and reports
- `deployment/` - Old deployment guides (Docker-based)
- `reports/` - Status reports and completion summaries
- `explanations/` - Temporary explanation documents

See [docs/archive/README.md](archive/README.md) for details.

## 🔧 Docker Archive

Docker-related files have been archived in `docker-archive/`:
- Old Dockerfile and docker-compose configurations
- Previous Docker-based deployment scripts

**Note**: The project no longer uses Docker for deployment. See [DEPLOYMENT_GUIDE_NO_DOCKER.md](../DEPLOYMENT_GUIDE_NO_DOCKER.md) for current deployment method.

## 📝 Documentation Guidelines

### When to Create Documentation
- New features or significant changes
- Deployment procedures
- Security considerations
- Troubleshooting guides

### Where to Place Documentation
- **Root level**: Core documentation (README, DEPLOYMENT, SECURITY)
- **docs/**: Operational and technical documentation
- **docs/ops/**: Operational procedures and guides
- **docs/refactoring/**: Refactoring documentation
- **.kiro/specs/**: Feature specifications and implementation plans

### Documentation Standards
- Use clear, concise language
- Include code examples where appropriate
- Keep documentation up-to-date with code changes
- Archive outdated documentation instead of deleting

## 🔄 Keeping Documentation Current

### Regular Reviews
- Review documentation quarterly
- Update after major changes
- Archive completed work documentation

### Version Control
- All documentation is version controlled
- Use meaningful commit messages for doc changes
- Link documentation to related code changes

## 📞 Support

- **Security Issues**: security@tipsio.app
- **Documentation Issues**: Create a GitHub issue
- **General Support**: See README.md

---

**Last Updated**: January 31, 2026
**Maintained By**: Development Team
