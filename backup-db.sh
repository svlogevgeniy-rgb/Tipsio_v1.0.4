#!/bin/bash

# Database backup script for TIPSIO
# Add to crontab: 0 2 * * * /var/www/tipsio/backup-db.sh

BACKUP_DIR="/var/backups/tipsio"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/tipsio_backup_$DATE.sql"
DB_NAME="tipsio_prod"
DB_USER="tipsio_user"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo "🗄️  Starting database backup..."

# Create backup
pg_dump -U $DB_USER -h localhost $DB_NAME > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Backup created: $BACKUP_FILE"
    
    # Compress backup
    gzip $BACKUP_FILE
    echo "📦 Backup compressed: $BACKUP_FILE.gz"
    
    # Remove old backups (older than 7 days)
    find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
    echo "🧹 Old backups removed (older than 7 days)"
    
    # Show backup size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE.gz" | cut -f1)
    echo "📊 Backup size: $BACKUP_SIZE"
    
    # Count total backups
    BACKUP_COUNT=$(ls -1 $BACKUP_DIR/*.sql.gz 2>/dev/null | wc -l)
    echo "📁 Total backups: $BACKUP_COUNT"
else
    echo "❌ Backup failed!"
    exit 1
fi
