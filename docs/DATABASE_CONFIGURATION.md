# RCNG Database Configuration Guide

This guide provides detailed instructions for configuring the production database for the RCNG application.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Server Setup](#database-server-setup)
3. [Database Creation](#database-creation)
4. [User and Permissions](#user-and-permissions)
5. [Configuration](#configuration)
6. [Backup and Recovery](#backup-and-recovery)
7. [Performance Tuning](#performance-tuning)
8. [Security](#security)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

- MySQL 8.0+ or MariaDB 10.4+ installed
- Root access to the database server
- Basic knowledge of SQL and database administration

## Database Server Setup

### 1. Install MySQL Server

```bash
# For Ubuntu/Debian
sudo apt update
sudo apt install -y mysql-server

# For CentOS/RHEL
sudo yum install -y mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld
```

### 2. Secure MySQL Installation

Run the security script:

```bash
sudo mysql_secure_installation
```

Follow the prompts to:
- Set root password
- Remove anonymous users
- Disable root login remotely
- Remove test database
- Reload privilege tables

## Database Creation

### 1. Connect to MySQL

```bash
sudo mysql -u root -p
```

### 2. Create Database

```sql
CREATE DATABASE rcng CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Verify Database Creation

```sql
SHOW DATABASES;
```

## User and Permissions

### 1. Create Application User

```sql
CREATE USER 'rcng_app'@'localhost' IDENTIFIED BY 'strong_password_here';
```

### 2. Grant Privileges

```sql
GRANT ALL PRIVILEGES ON rcng.* TO 'rcng_app'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Verify User Permissions

```sql
SHOW GRANTS FOR 'rcng_app'@'localhost';
```

## Configuration

### 1. Update .env File

Update the database configuration in your `.env` file:

```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rcng
DB_USERNAME=rcng_app
DB_PASSWORD=strong_password_here
```

### 2. Run Migrations

```bash
php artisan migrate --force
```

### 3. Seed the Database (Optional)

```bash
php artisan db:seed --force
```

## Backup and Recovery

### 1. Create Backup

```bash
mysqldump -u rcng_app -p rcng > rcng_backup_$(date +%Y%m%d).sql
```

### 2. Restore from Backup

```bash
mysql -u rcng_app -p rcng < rcng_backup_20230816.sql
```

### 3. Automate Backups

Create a backup script at `/usr/local/bin/backup-rcng-db.sh`:

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/var/backups/rcng/db"
DATE=$(date +%Y%m%d%H%M%S)
FILENAME="rcng-db-$DATE.sql.gz"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create database backup
mysqldump --single-transaction --quick --lock-tables=false -u rcng_app -p'your_password_here' rcng | gzip > "$BACKUP_DIR/$FILENAME"

# Delete backups older than 30 days
find $BACKUP_DIR -type f -name "rcng-db-*.sql.gz" -mtime +30 -delete
```

Make the script executable:

```bash
chmod +x /usr/local/bin/backup-rcng-db.sh
```

## Performance Tuning

### 1. MySQL Configuration

Edit MySQL configuration file:

```bash
sudo nano /etc/mysql/my.cnf
```

Add/update the following settings:

```ini
[mysqld]
# General
max_connections = 100
max_user_connections = 50

# InnoDB
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 1
innodb_flush_method = O_DIRECT
innodb_file_per_table = 1

# Query Cache
query_cache_type = 1
query_cache_size = 64M
query_cache_limit = 8M

# Logs
slow_query_log = 1
slow_query_log_file = /var/log/mysql/mysql-slow.log
long_query_time = 2
log_queries_not_using_indexes = 1
```

Restart MySQL to apply changes:

```bash
sudo systemctl restart mysql
```

### 2. Index Optimization

Regularly optimize tables and update statistics:

```sql
ANALYZE TABLE table_name;
OPTIMIZE TABLE table_name;
```

## Security

### 1. Network Security

- Configure MySQL to listen only on localhost
- Use SSH tunneling for remote access
- Enable SSL for remote connections

### 2. User Privileges

- Follow the principle of least privilege
- Create separate users for different applications
- Regularly audit user privileges

### 3. Data Encryption

- Enable SSL for database connections
- Encrypt sensitive data at rest
- Use application-level encryption for sensitive fields

## Monitoring

### 1. Enable Slow Query Log

```sql
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
SET GLOBAL log_queries_not_using_indexes = 'ON';
```

### 2. Monitor Database Performance

```sql
-- Show process list
SHOW PROCESSLIST;

-- Show status
SHOW STATUS;

-- Show variables
SHOW VARIABLES;

-- Show engine status
SHOW ENGINE INNODB STATUS;
```

## Troubleshooting

### 1. Connection Issues

```bash
# Check if MySQL is running
sudo systemctl status mysql

# Check error log
sudo tail -f /var/log/mysql/error.log
```

### 2. Performance Issues

```sql
-- Show running queries
SHOW FULL PROCESSLIST;

-- Check table status
SHOW TABLE STATUS LIKE 'table_name';

-- Check index usage
EXPLAIN SELECT * FROM table_name WHERE condition;
```

### 3. Common Errors

#### Access Denied
```bash
ERROR 1045 (28000): Access denied for user 'user'@'localhost' (using password: YES)
```

**Solution:**
- Verify username and password
- Check user privileges
- Check if user is allowed to connect from the specified host

#### Too Many Connections
```bash
ERROR 1040 (08004): Too many connections
```

**Solution:**
- Increase `max_connections` in MySQL configuration
- Check for connection leaks in application code
- Implement connection pooling

#### Table is Full
```bash
ERROR 1114 (HY000): The table 'table_name' is full
```

**Solution:**
- Increase `innodb_data_file_path` size
- Check disk space
- Optimize table storage

## Maintenance Scripts

### 1. Database Optimization Script

Create a script at `/usr/local/bin/optimize-rcng-db.sh`:

```bash
#!/bin/bash

# Connect to MySQL and optimize all tables
mysql -u rcng_app -p'your_password_here' -e "USE rcng; SHOW TABLES;" | \
grep -v "^Tables_in" | \
while read table; do
    echo "Optimizing $table..."
    mysql -u rcng_app -p'your_password_here' -e "USE rcng; ANALYZE TABLE $table; OPTIMIZE TABLE $table;"
done

echo "Database optimization complete."
```

Make it executable:

```bash
chmod +x /usr/local/bin/optimize-rcng-db.sh
```

### 2. Database Size Check

```sql
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'rcng'
GROUP BY table_schema;
```

## Replication Setup (Optional)

### 1. Master Configuration

```ini
[mysqld]
server-id = 1
log_bin = /var/log/mysql/mysql-bin.log
binlog_do_db = rcng
```

### 2. Create Replication User

```sql
CREATE USER 'repl'@'%' IDENTIFIED BY 'repl_password';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';
FLUSH PRIVILEGES;
```

### 3. Get Master Status

```sql
SHOW MASTER STATUS;
```

### 4. Configure Slave

```ini
[mysqld]
server-id = 2
relay-log = /var/log/mysql/mysql-relay-bin.log
log_bin = /var/log/mysql/mysql-bin.log
binlog_do_db = rcng
```

### 5. Start Replication

```sql
CHANGE MASTER TO
    MASTER_HOST='master_host',
    MASTER_USER='repl',
    MASTER_PASSWORD='repl_password',
    MASTER_LOG_FILE='mysql-bin.000001',
    MASTER_LOG_POS= 107;

START SLAVE;
```

## High Availability (Optional)

### 1. Set up Master-Master Replication
- Configure circular replication between two or more masters
- Implement conflict resolution strategies
- Monitor replication lag

### 2. Implement Load Balancing
- Use ProxySQL or HAProxy for read scaling
- Configure read/write splitting
- Implement connection pooling

## Backup and Restore Procedures

### 1. Full Backup

```bash
# Create compressed backup
mysqldump -u rcng_app -p --single-transaction --quick --lock-tables=false --routines --triggers --events rcng | gzip > rcng_backup_$(date +%Y%m%d).sql.gz
```

### 2. Partial Backup

```bash
# Backup specific tables
mysqldump -u rcng_app -p rcng table1 table2 > rcng_tables_backup.sql
```

### 3. Point-in-Time Recovery

```bash
# Enable binary logging
[mysqld]
log_bin = /var/log/mysql/mysql-bin.log

# Restore from backup and apply binary logs
mysqlbinlog --start-datetime="2023-08-16 10:00:00" /var/log/mysql/mysql-bin.000001 | mysql -u root -p
```

## Monitoring and Alerts

### 1. Set up Monitoring
- Install and configure Prometheus with MySQL exporter
- Set up Grafana dashboards
- Configure alerts for critical metrics

### 2. Key Metrics to Monitor
- Query response time
- Connection count
- Buffer pool hit ratio
- Lock wait time
- Replication lag (if using replication)

## Security Hardening

### 1. MySQL Secure Installation

```bash
sudo mysql_secure_installation
```

### 2. Disable Remote Root Login

```sql
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
FLUSH PRIVILEGES;
```

### 3. Enable SSL

```sql
-- Check if SSL is enabled
SHOW VARIABLES LIKE '%ssl%';

-- Require SSL for specific user
ALTER USER 'rcng_app'@'%' REQUIRE SSL;
```

## Performance Optimization

### 1. Query Optimization
- Use EXPLAIN to analyze queries
- Add appropriate indexes
- Avoid SELECT * queries
- Use LIMIT for large result sets

### 2. Schema Optimization
- Use appropriate data types
- Normalize where appropriate
- Consider denormalization for read-heavy workloads

### 3. Configuration Tuning
- Adjust buffer pool size
- Configure query cache
- Optimize temporary tables and joins

## Maintenance Schedule

### Daily
- Check error logs
- Monitor replication status (if applicable)
- Verify backups

### Weekly
- Optimize tables
- Analyze slow query log
- Review user privileges

### Monthly
- Review and update database configuration
- Check disk space usage
- Review and update backup strategy

## Support

For database-related issues, contact:
- **Database Administrator**: [Name] - [Email] - [Phone]
- **Emergency Support**: [Contact Information]
- **Documentation**: [Link to Documentation]
