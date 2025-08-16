# RCNG Maintenance Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Daily Tasks](#daily-tasks)
3. [Weekly Tasks](#weekly-tasks)
4. [Monthly Tasks](#monthly-tasks)
5. [Backup Procedures](#backup-procedures)
6. [Monitoring](#monitoring)
7. [Common Issues](#common-issues)
8. [Troubleshooting](#troubleshooting)
9. [Upgrade Procedures](#upgrade-procedures)
10. [Contact Information](#contact-information)

## Introduction

This guide provides comprehensive instructions for maintaining the RCNG application. It covers routine maintenance tasks, monitoring, backup procedures, and troubleshooting common issues.

## Daily Tasks

### 1. Check Application Status

```bash
# Check if the application is running
curl -I https://your-domain.com

# Check queue workers
sudo supervisorctl status

# Check disk space
df -h
```

### 2. Review Logs

Check for errors in the following logs:

```bash
# Application logs
tail -n 100 /var/www/rcng/storage/logs/laravel.log

# Web server error logs
tail -n 100 /var/log/nginx/error.log

# Queue worker logs
tail -n 100 /var/www/rcng/storage/logs/worker.log
```

### 3. Monitor System Resources

```bash
# Check CPU and memory usage
top

# Check disk I/O
iostat -x 1 5

# Check network connections
netstat -tuln
```

## Weekly Tasks

### 1. Database Maintenance

```bash
# Optimize database tables
mysqlcheck -u rcng_user -p --auto-repair --optimize rcng

# Backup database
/usr/local/bin/backup-rcng-db.sh
```

### 2. Clean Up Temporary Files

```bash
# Clear Laravel caches
php /var/www/rcng/artisan cache:clear
php /var/www/rcng/artisan view:clear
php /var/www/rcng/artisan config:clear
php /var/www/rcng/artisan route:clear

# Clear old log files
find /var/www/rcng/storage/logs -name "laravel-*.log" -type f -mtime +7 -delete
```

### 3. Check for Updates

```bash
# Check for system updates
apt update
apt list --upgradable

# Check for Composer updates
cd /var/www/rcng
composer outdated

# Check for NPM updates
npm outdated
```

## Monthly Tasks

### 1. Security Audit

```bash
# Check for unauthorized SSH access
grep "Failed password" /var/log/auth.log

# Check for root login attempts
grep "root" /var/log/auth.log | grep "session opened"

# Check for failed sudo attempts
grep "sudo" /var/log/auth.log | grep "authentication failure"
```

### 2. Review User Accounts

```sql
-- Check for inactive users
SELECT id, name, email, last_login_at 
FROM users 
WHERE last_login_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Check for users with admin privileges
SELECT u.id, u.name, u.email, r.name as role
FROM users u
JOIN model_has_roles m ON u.id = m.model_id
JOIN roles r ON m.role_id = r.id
WHERE r.name = 'admin';
```

### 3. Performance Review

```bash
# Check slow database queries
mysqldumpslow -s t /var/log/mysql/mysql-slow.log

# Check web server response times
grep 'request_time' /var/log/nginx/access.log | sort -k 10 -n | tail -n 20
```

## Backup Procedures

### 1. Database Backups

#### Automated Backup Script

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/var/backups/rcng/db"
DATE=$(date +%Y%m%d%H%M%S)
FILENAME="rcng-db-$DATE.sql.gz"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create database backup
mysqldump --single-transaction --quick --lock-tables=false -u rcng_user -p'your_password_here' rcng | gzip > "$BACKUP_DIR/$FILENAME"

# Delete backups older than 30 days
find $BACKUP_DIR -type f -name "rcng-db-*.sql.gz" -mtime +30 -delete
```

#### Manual Backup

```bash
# Create a manual backup
mysqldump -u rcng_user -p rcng > rcng_backup_$(date +%Y%m%d).sql

# Compress the backup
gzip rcng_backup_$(date +%Y%m%d).sql
```

### 2. File Backups

#### Application Files

```bash
# Create a backup of the application files
tar -czf /var/backups/rcng/rcng-files-$(date +%Y%m%d).tar.gz /var/www/rcng
```

#### Uploaded Files

```bash
# Create a backup of uploaded files
tar -czf /var/backups/rcng/rcng-uploads-$(date +%Y%m%d).tar.gz /var/www/rcng/storage/app/public
```

### 3. Backup Rotation

Keep backups for:
- Daily backups: 7 days
- Weekly backups: 4 weeks
- Monthly backups: 12 months

## Monitoring

### 1. Application Monitoring

#### Laravel Telescope (Development Only)

Access at: `https://your-domain.com/telescope`

#### Log Monitoring

```bash
# Monitor application logs in real-time
tail -f /var/www/rcng/storage/logs/laravel.log

# Monitor web server logs in real-time
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 2. System Monitoring

#### CPU and Memory

```bash
# Install htop for interactive process viewer
sudo apt install htop
htop
```

#### Disk Usage

```bash
# Check disk usage
df -h

# Find large files
find /var/www/rcng -type f -size +100M -exec ls -lh {} \;
```

### 3. Uptime Monitoring

Set up external monitoring services:
- [UptimeRobot](https://uptimerobot.com/)
- [Pingdom](https://www.pingdom.com/)
- [New Relic](https://newrelic.com/)

## Common Issues

### 1. Application Not Responding

**Symptoms:**
- 502 Bad Gateway or 504 Gateway Timeout errors
- Slow response times

**Troubleshooting:**

```bash
# Check if PHP-FPM is running
sudo systemctl status php8.1-fpm

# Check Nginx error logs
sudo tail -n 50 /var/log/nginx/error.log

# Check PHP-FPM logs
sudo tail -n 50 /var/log/php8.1-fpm.log
```

### 2. Database Connection Issues

**Symptoms:**
- "SQLSTATE[HY000] [2002] Connection refused"
- Slow database queries

**Troubleshooting:**

```bash
# Check if MySQL is running
sudo systemctl status mysql

# Check database connection
mysql -u rcng_user -p -e "SHOW STATUS;"

# Check for slow queries
mysqldumpslow -s t /var/log/mysql/mysql-slow.log
```

### 3. File Upload Failures

**Symptoms:**
- "Failed to write file to disk"
- Incomplete file uploads

**Troubleshooting:**

```bash
# Check disk space
df -h

# Check file permissions
ls -la /var/www/rcng/storage/app/public

# Check PHP upload limits
php -i | grep upload_
```

## Troubleshooting

### 1. Application in Maintenance Mode

**To enable maintenance mode:**
```bash
php /var/www/rcng/artisan down --secret="maintenance-secret-key"
```

**To disable maintenance mode:**
```bash
php /var/www/rcng/artisan up
```

### 2. Queue Workers Not Processing

**Check queue worker status:**
```bash
sudo supervisorctl status
```

**Restart queue workers:**
```bash
sudo supervisorctl restart rcng-worker:*
```

**Check queue worker logs:**
```bash
tail -f /var/www/rcng/storage/logs/worker.log
```

### 3. Clearing Caches

```bash
# Clear application cache
php /var/www/rcng/artisan cache:clear

# Clear configuration cache
php /var/www/rcng/artisan config:clear

# Clear route cache
php /var/www/rcng/artisan route:clear

# Clear view cache
php /var/www/rcng/artisan view:clear

# Clear compiled views
php /var/www/rcng/artisan view:cache
```

## Upgrade Procedures

### 1. Pre-Upgrade Checklist

- [ ] Notify users of scheduled maintenance
- [ ] Backup database and files
- [ ] Review release notes for breaking changes
- [ ] Schedule upgrade during low-traffic period

### 2. Upgrade Process

```bash
# Switch to maintenance mode
php /var/www/rcng/artisan down

# Get the latest code
cd /var/www/rcng
git pull origin main

# Install dependencies
composer install --no-dev --optimize-autoloader
npm install
npm run prod

# Run database migrations
php /var/www/rcng/artisan migrate --force

# Clear caches
php /var/www/rcng/artisan cache:clear
php /var/www/rcng/artisan config:clear
php /var/www/rcng/artisan route:clear
php /var/www/rcng/artisan view:clear

# Cache configuration
php /var/www/rcng/artisan config:cache
php /var/www/rcng/artisan route:cache
php /var/www/rcng/artisan view:cache

# Restart queue workers
php /var/www/rcng/artisan queue:restart

# Bring application back up
php /var/www/rcng/artisan up
```

### 3. Post-Upgrade Verification

- [ ] Verify application is running
- [ ] Test critical workflows
- [ ] Check error logs
- [ ] Monitor system resources

## Contact Information

### Support Team
- **Email**: support@rcng.example.com
- **Phone**: +1 (555) 123-4567
- **Slack**: #support-team

### On-Call Engineer
- **Name**: [Primary On-Call Engineer]
- **Phone**: +1 (555) 987-6543
- **Email**: oncall@rcng.example.com

### Escalation Path
1. **Level 1**: Support Team (support@rcng.example.com)
2. **Level 2**: Development Team (dev@rcng.example.com)
3. **Level 3**: System Administrators (sysadmin@rcng.example.com)
4. **Level 4**: CTO (cto@rcng.example.com)

## Emergency Procedures

### Database Outage
1. Check database server status
2. Verify network connectivity
3. Check disk space
4. Restart database service if necessary
5. Restore from backup if needed

### Application Outage
1. Check web server status
2. Verify PHP-FPM is running
3. Check application logs
4. Restart services in this order:
   ```bash
   sudo systemctl restart nginx
   sudo systemctl restart php8.1-fpm
   sudo supervisorctl restart rcng-worker:*
   ```

### Security Incident
1. Isolate affected systems
2. Preserve logs and evidence
3. Notify security team
4. Follow incident response plan
5. Document the incident and remediation steps
