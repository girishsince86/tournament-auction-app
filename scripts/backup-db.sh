#!/bin/bash

# Get the current date for the backup file name
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
BACKUP_FILE="$BACKUP_DIR/tournament_auction_backup_$BACKUP_DATE.sql"

# Create backups directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Load environment variables from .env.local if it exists
if [ -f .env.local ]; then
    source .env.local
fi

# Construct database URL with exact format
DB_URL="postgresql://postgres:admin@db.yfwormqkewwahqhtmrwh.supabase.co:5432/postgres"

echo "Starting database backup..."

# Create the backup using pg_dump
pg_dump "$DB_URL" \
    --clean \
    --if-exists \
    --no-owner \
    --no-privileges \
    --no-comments \
    --format=plain \
    --file="$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup completed successfully!"
    echo "Backup file: $BACKUP_FILE"
    
    # Get the file size
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        BACKUP_SIZE=$(stat -f %z "$BACKUP_FILE" | numfmt --to=iec-i --suffix=B)
    else
        # Linux
        BACKUP_SIZE=$(stat -c%s "$BACKUP_FILE" | numfmt --to=iec-i --suffix=B)
    fi
    echo "Backup size: $BACKUP_SIZE"
else
    echo "Error: Backup failed!"
    exit 1
fi

# Create a compressed version of the backup
echo "Compressing backup file..."
gzip -f "$BACKUP_FILE"
echo "Compressed backup file: $BACKUP_FILE.gz"

# List recent backups
echo -e "\nRecent backups:"
ls -lh "$BACKUP_DIR" | grep "tournament_auction_backup_" | tail -n 5 