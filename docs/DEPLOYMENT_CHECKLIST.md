# RCNG Deployment Checklist

This checklist outlines the steps required to deploy the RCNG application to production.

## Pre-Deployment Tasks

### Server Setup
- [ ] Provision production server (Ubuntu 22.04 LTS recommended)
- [ ] Configure SSH access
- [ ] Set up firewall (UFW)
- [ ] Configure timezone and NTP
- [ ] Create deployment user with sudo privileges

### Domain and DNS
- [ ] Register domain name
- [ ] Set up DNS records (A, AAAA, MX, TXT)
- [ ] Configure SSL certificates (Let's Encrypt)

### Database Setup
- [ ] Install MySQL 8.0+
- [ ] Create production database
- [ ] Create database user with appropriate permissions
- [ ] Configure database backup strategy

### Application Setup
- [ ] Set up deployment directory structure
- [ ] Configure environment variables
- [ ] Set up file permissions
- [ ] Configure storage for file uploads

## Deployment Process

### 1. Initial Deployment
```bash
# Clone the repository
git clone https://github.com/your-org/rcng.git /var/www/rcng
cd /var/www/rcng

# Install PHP dependencies
composer install --optimize-autoloader --no-dev

# Install NPM dependencies
npm install
npm run production

# Set up environment
cp .env.example .env
nano .env  # Update with production values
php artisan key:generate

# Run migrations
php artisan migrate --force

# Seed database (if needed)
php artisan db:seed --force

# Set up storage link
php artisan storage:link

# Set permissions
sudo chown -R www-data:www-data /var/www/rcng
sudo chmod -R 775 /var/www/rcng/storage
sudo chmod -R 775 /var/www/rcng/bootstrap/cache
```

### 2. Web Server Configuration
- [ ] Configure Nginx/Apache
- [ ] Set up SSL certificates
- [ ] Configure HTTP/2
- [ ] Set up proper caching headers

### 3. Queue Workers
- [ ] Install and configure Supervisor
- [ ] Set up queue workers
- [ ] Configure failed job handling

### 4. Scheduled Tasks
- [ ] Set up cron job for Laravel scheduler
- [ ] Configure log rotation
- [ ] Set up backup schedules

## Post-Deployment Tasks

### Testing
- [ ] Verify all API endpoints
- [ ] Test file uploads
- [ ] Test email sending
- [ ] Verify queue processing
- [ ] Test scheduled tasks

### Monitoring
- [ ] Set up application monitoring
- [ ] Configure error tracking
- [ ] Set up performance monitoring
- [ ] Configure log aggregation

### Security
- [ ] Run security audit
- [ ] Configure WAF rules
- [ ] Set up rate limiting
- [ ] Verify all security headers

## Rollback Plan

### If deployment fails:
1. Switch to maintenance mode
2. Restore database from backup
3. Revert code to previous version
4. Clear caches
5. Disable maintenance mode

## Maintenance Mode Commands

```bash
# Enable maintenance mode
php artisan down --secret="your-secret-key"

# Disable maintenance mode
php artisan up
```

## Common Deployment Issues

### 1. Permission Issues
```bash
# Fix permissions
sudo chown -R www-data:www-data /var/www/rcng
sudo chmod -R 775 /var/www/rcng/storage
sudo chmod -R 775 /var/www/rcng/bootstrap/cache
```

### 2. Storage Link Issues
```bash
# Recreate storage link
php artisan storage:link
```

### 3. Queue Worker Issues
```bash
# Restart queue workers
php artisan queue:restart

# Process failed jobs
php artisan queue:retry all
```

## Post-Deployment Verification

1. **Application**
   - [ ] Homepage loads
   - [ ] API endpoints respond correctly
   - [ ] Authentication works
   - [ ] File uploads work
   - [ ] Emails are sent

2. **Performance**
   - [ ] Page load times < 2s
   - [ ] API response times < 500ms
   - [ ] Database query optimization

3. **Security**
   - [ ] SSL certificate valid
   - [ ] No mixed content warnings
   - [ ] Security headers present
   - [ ] Rate limiting in place

## Monitoring Setup

### 1. Application Logs
```bash
# View Laravel logs
tail -f /var/www/rcng/storage/logs/laravel.log
```

### 2. Server Monitoring
```bash
# Install and configure monitoring tools
sudo apt install -y htop iotop iftop
```

### 3. External Monitoring
- [ ] Set up uptime monitoring
- [ ] Configure alerting
- [ ] Set up status page

## Backup Strategy

### 1. Database Backups
```bash
# Daily backup script
mysqldump -u username -p database_name > backup_$(date +%Y%m%d).sql
```

### 2. File Backups
```bash
# Backup storage directory
tar -czf rcng_storage_$(date +%Y%m%d).tar.gz /var/www/rcng/storage/app/public
```

### 3. Offsite Backups
- [ ] Configure S3 backup
- [ ] Set up backup rotation
- [ ] Test restore process

## Support Information

### Emergency Contacts
- **Primary Contact**: [Name] - [Phone] - [Email]
- **Secondary Contact**: [Name] - [Phone] - [Email]
- **Hosting Provider**: [Provider] - [Support URL] - [Phone]

### Troubleshooting Guide
1. **Application Down**
   - Check web server status
   - Check PHP-FPM status
   - Check database connection
   - Check storage permissions

2. **Performance Issues**
   - Check server load
   - Check database queries
   - Check queue backlog
   - Check disk I/O

3. **Email Issues**
   - Check mail logs
   - Verify SMTP settings
   - Check spam folder
   - Test with different email providers
