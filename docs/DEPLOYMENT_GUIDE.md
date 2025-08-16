# RCNG Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Server Requirements](#server-requirements)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Database Setup](#database-setup)
6. [Application Deployment](#application-deployment)
7. [Web Server Configuration](#web-server-configuration)
8. [SSL Configuration](#ssl-configuration)
9. [Scheduled Tasks](#scheduled-tasks)
10. [Queue Workers](#queue-workers)
11. [Monitoring](#monitoring)
12. [Backup Strategy](#backup-strategy)
13. [Maintenance](#maintenance)
14. [Troubleshooting](#troubleshooting)
15. [Upgrading](#upgrading)

## Prerequisites

- A server running Ubuntu 20.04/22.04 LTS or similar Linux distribution
- Root or sudo access to the server
- Domain name pointed to your server's IP address
- Basic knowledge of Linux command line and server administration

## Server Requirements

- **PHP**: 8.1 or higher
- **Database**: MySQL 8.0+ or MariaDB 10.4+
- **Web Server**: Nginx or Apache
- **Cache**: Redis or Memcached
- **Queue**: Redis, Beanstalkd, or database
- **Node.js**: 16.x or higher (for frontend assets)
- **Composer**: Latest version
- **Git**: Latest version
- **Supervisor**: For queue workers
- **Certbot**: For SSL certificates

## Installation

### 1. Server Setup

Update the package list and upgrade installed packages:

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Required Packages

```bash
# Install PHP and extensions
sudo apt install -y php8.1-fpm php8.1-common php8.1-mysql \
    php8.1-xml php8.1-curl php8.1-mbstring \
    php8.1-gd php8.1-zip php8.1-bcmath \
    php8.1-intl php8.1-redis

# Install database server
sudo apt install -y mysql-server

# Install web server (Nginx)
sudo apt install -y nginx

# Install Redis
sudo apt install -y redis-server

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Install Composer
curl -sS https://getcomposer.org/installer | sudo php -- --install-dir=/usr/local/bin --filename=composer

# Install Supervisor
sudo apt install -y supervisor

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

## Configuration

### 1. PHP Configuration

Edit the PHP-FPM configuration:

```bash
sudo nano /etc/php/8.1/fpm/php.ini
```

Update the following settings:

```ini
memory_limit = 256M
upload_max_filesize = 20M
post_max_size = 22M
max_execution_time = 300
max_input_vars = 1000
```

### 2. MySQL Configuration

Secure your MySQL installation:

```bash
sudo mysql_secure_installation
```

Create a database and user:

```sql
CREATE DATABASE rcng CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'rcng_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON rcng.* TO 'rcng_user'@'localhost';
FLUSH PRIVILEGES;
```

## Application Deployment

### 1. Clone the Repository

```bash
sudo mkdir -p /var/www/rcng
sudo chown -R $USER:$USER /var/www/rcng
cd /var/www/rcng

git clone https://github.com/your-org/rcng.git .
```

### 2. Install Dependencies

```bash
# Install PHP dependencies
composer install --optimize-autoloader --no-dev

# Install NPM dependencies
npm install
npm run prod
```

### 3. Environment Configuration

```bash
cp .env.example .env
nano .env
```

Update the following environment variables:

```ini
APP_NAME="RCNG"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com
APP_KEY=base64:generate_with_php_artisan_key_generate

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rcng
DB_USERNAME=rcng_user
DB_PASSWORD=your_password_here

CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email@example.com
MAIL_PASSWORD=your-email-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@example.com
MAIL_FROM_NAME="RCNG"
```

Generate application key:

```bash
php artisan key:generate
```

### 4. Run Migrations and Seeders

```bash
php artisan migrate --force
php artisan db:seed --force
```

### 5. Storage and Permissions

```bash
# Create storage link
php artisan storage:link

# Set permissions
sudo chown -R www-data:www-data /var/www/rcng/storage
sudo chown -R www-data:www-data /var/www/rcng/bootstrap/cache
sudo chmod -R 775 /var/www/rcng/storage
sudo chmod -R 775 /var/www/rcng/bootstrap/cache
```

## Web Server Configuration

### Nginx Configuration

Create a new Nginx server block:

```bash
sudo nano /etc/nginx/sites-available/rcng
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /var/www/rcng/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Enable the site and test the configuration:

```bash
sudo ln -s /etc/nginx/sites-available/rcng /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL Configuration

Obtain an SSL certificate using Certbot:

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Automate certificate renewal:

```bash
sudo certbot renew --dry-run
```

## Scheduled Tasks

Set up the Laravel scheduler to run scheduled tasks:

```bash
crontab -e
```

Add the following line:

```
* * * * * cd /var/www/rcng && php artisan schedule:run >> /dev/null 2>&1
```

## Queue Workers

Configure Supervisor to manage queue workers:

```bash
sudo nano /etc/supervisor/conf.d/rcng-worker.conf
```

Add the following configuration:

```ini
[program:rcng-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/rcng/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/rcng/storage/logs/worker.log
stopwaitsecs=3600
```

Start and enable Supervisor:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start rcng-worker:*
```

## Monitoring

### Laravel Telescope (Optional)

For local development and debugging:

```bash
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate
```

### Log Management

View application logs:

```bash
tail -f /var/www/rcng/storage/logs/laravel.log
```

### Performance Monitoring

Consider setting up:
- Laravel Horizon for queue monitoring
- New Relic or Datadog for APM
- Blackfire or Tideways for profiling

## Backup Strategy

### Database Backups

Create a backup script:

```bash
nano /usr/local/bin/backup-rcng-db.sh
```

Add the following content:

```bash
#!/bin/bash

# Set variables
BACKUP_DIR="/var/backups/rcng"
DATE=$(date +%Y%m%d%H%M%S)
FILENAME="rcng-db-$DATE.sql.gz"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create database backup
mysqldump --single-transaction --quick --lock-tables=false -u rcng_user -p'your_password_here' rcng | gzip > "$BACKUP_DIR/$FILENAME"

# Delete backups older than 30 days
find $BACKUP_DIR -type f -name "rcng-db-*.sql.gz" -mtime +30 -delete
```

Make the script executable:

```bash
chmod +x /usr/local/bin/backup-rcng-db.sh
```

### File Backups

Add to your backup script:

```bash
# Backup storage directory
tar -czf "$BACKUP_DIR/rcng-files-$DATE.tar.gz" /var/www/rcng/storage/app/public
```

### Automated Backups

Set up a cron job for daily backups:

```bash
crontab -e
```

Add:

```
0 2 * * * /usr/local/bin/backup-rcng-db.sh
```

## Maintenance

### Application Maintenance Mode

```bash
# Enable maintenance mode
php artisan down --secret="maintenance-secret-key"

# Disable maintenance mode
php artisan up
```

### Cache Management

```bash
# Clear application cache
php artisan cache:clear

# Clear route cache
php artisan route:cache

# Clear config cache
php artisan config:cache

# Clear view cache
php artisan view:cache
```

## Troubleshooting

### Common Issues

#### 500 Internal Server Error
- Check Laravel logs: `tail -f storage/logs/laravel.log`
- Verify file permissions
- Check `.env` configuration

#### Database Connection Issues
- Verify database credentials in `.env`
- Check if MySQL service is running: `sudo systemctl status mysql`
- Check database permissions

#### File Upload Issues
- Check `storage` directory permissions
- Verify `upload_max_filesize` and `post_max_size` in PHP config
- Check web server configuration

## Upgrading

### Before Upgrading

1. Backup your database and files
2. Check the upgrade guide in the release notes
3. Review any breaking changes

### Upgrade Process

```bash
# Switch to maintenance mode
php artisan down

# Get the latest code
git pull origin main

# Install new dependencies
composer install --no-dev --optimize-autoloader

# Run database migrations
php artisan migrate --force

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart queue workers
php artisan queue:restart

# Bring application back up
php artisan up
```

## Support

For assistance with deployment, please contact:
- Email: devops@rcng.example.com
- Slack: #devops-support
- Documentation: [https://docs.rcng.example.com](https://docs.rcng.example.com)
