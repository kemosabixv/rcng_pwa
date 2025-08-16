# RCNG System Installation Guide

This guide will walk you through the installation and setup process for the RCNG (Ruiru Central Neighbourhood Association) system.

## Prerequisites

- PHP 8.1 or higher
- Composer
- Node.js 16+ and NPM
- MySQL 5.7+ or MariaDB 10.3+
- Web server (Apache/Nginx)
- Git

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/rcng.git
cd rcng
```

### 2. Install PHP Dependencies

```bash
cd backend
composer install
```

### 3. Configure Environment

Copy the example environment file and update the values:

```bash
cp .env.example .env
```

Edit the `.env` file with your database credentials and other settings:

```env
APP_NAME="RCNG"
APP_ENV=production
APP_DEBUG=false
APP_URL=http://your-domain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rcng
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
```

### 4. Generate Application Key

```bash
php artisan key:generate
```

### 5. Run Database Migrations and Seeders

This will create the necessary database tables and seed the default admin user:

```bash
php artisan migrate --seed
```

After running the seeder, you'll see output similar to this:

```
==============================================
DEFAULT ADMIN CREDENTIALS
Email: admin@rcng.local
Password: Admin@2025
==============================================
IMPORTANT: Save these credentials in a secure place.
You should change the password after first login.
==============================================
```

**Important:** Save the admin credentials shown in the output.

### 6. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 7. Build Frontend Assets

For development:
```bash
npm run dev
```

For production:
```bash
npm run build
```

### 8. Set Up Storage Link

```bash
cd ../backend
php artisan storage:link
```

### 9. Configure Web Server

#### Apache
Ensure your `.htaccess` file in the `public` directory is properly configured and `mod_rewrite` is enabled.

#### Nginx
Add this to your server configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/rcng/backend/public;

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

### 10. Set Up Scheduler (Optional but Recommended)

Add this cron job to run scheduled tasks:

```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

## Initial Setup

1. Access the application in your browser: `http://your-domain.com`
2. Log in using the admin credentials provided during installation
3. Change the default admin password immediately
4. Configure system settings through the admin panel
5. Create additional user accounts as needed

## Security Considerations

- Change the default admin password immediately after first login
- Ensure your `.env` file is not accessible from the web
- Keep your server and dependencies up to date
- Configure proper file permissions:
  ```bash
  chown -R www-data:www-data /path/to/rcng
  find /path/to/rcng -type d -exec chmod 755 {} \;
  find /path/to/rcng -type f -exec chmod 644 {} \;
  chmod -R 775 /path/to/rcng/backend/storage
  chmod -R 775 /path/to/rcng/backend/bootstrap/cache
  ```

## Troubleshooting

- If you get a 500 error, check the Laravel log: `tail -f storage/logs/laravel.log`
- If assets aren't loading, run `npm run dev` or `npm run build`
- If you get database errors, verify your `.env` file has the correct database credentials

## Support

For additional help, please contact support@rcng.org or open an issue on our GitHub repository.
