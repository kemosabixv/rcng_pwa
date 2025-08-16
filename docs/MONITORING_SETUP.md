# RCNG Monitoring Setup Guide

This guide provides instructions for setting up monitoring for the RCNG application to ensure optimal performance and quick issue detection.

## Table of Contents
1. [Monitoring Architecture](#monitoring-architecture)
2. [Prerequisites](#prerequisites)
3. [Setting Up Prometheus](#setting-up-prometheus)
4. [Configuring Node Exporter](#configuring-node-exporter)
5. [Setting Up Grafana](#setting-up-grafana)
6. [Application Metrics](#application-metrics)
7. [Log Management](#log-management)
8. [Alerting](#alerting)
9. [Performance Tuning](#performance-tuning)
10. [Troubleshooting](#troubleshooting)

## Monitoring Architecture

```
+----------------+    +----------------+    +----------------+
|  Application  |--->|  Prometheus   |<---|  Node Exporter |
|    (RCNG)      |    |  (Metrics DB)  |    |  (System)      |
+----------------+    +-------+--------+    +----------------+
                             |
                             v
                      +------+--------+
                      |    Grafana    |
                      | (Visualization)|
                      +---------------+
                             |
                             v
                      +------+--------+
                      |    Alert     |
                      |  Management  |
                      +--------------+
```

## Prerequisites

- Ubuntu 20.04/22.04 server
- Docker and Docker Compose installed
- Minimum 2 CPU cores, 4GB RAM, 20GB disk space
- Root or sudo access

## Setting Up Prometheus

### 1. Create Docker Compose File

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus:/etc/prometheus
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
    networks:
      - monitoring

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    restart: unless-stopped
    command:
      - '--path.rootfs=/host'
    network_mode: host
    pid: host
    volumes:
      - '/:/host:ro,rslave'
    deploy:
      mode: global

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
      - GF_USERS_ALLOW_SIGN_UP=false
    networks:
      - monitoring

volumes:
  prometheus_data:
  grafana_data:

networks:
  monitoring:
    driver: bridge
```

### 2. Configure Prometheus

Create a `prometheus` directory and add `prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          # - alertmanager:9093

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]

  - job_name: "node"
    static_configs:
      - targets: ["node-exporter:9100"]

  - job_name: "rcng"
    metrics_path: "/metrics"
    static_configs:
      - targets: ["host.docker.internal:8000"]
    metrics_path: "/metrics"
    scheme: "http"
```

### 3. Start Monitoring Stack

```bash
# Create required directories
mkdir -p prometheus

# Start the stack
docker-compose up -d
```

Access Prometheus at: http://your-server-ip:9090

## Configuring Node Exporter

Node Exporter is already configured in the Docker Compose file. It will collect system metrics.

To verify it's working:

```bash
# Check Node Exporter metrics
curl http://localhost:9100/metrics
```

## Setting Up Grafana

1. Access Grafana at: http://your-server-ip:3000
2. Login with admin/admin123 (change this password after first login)
3. Add Prometheus as a data source:
   - Go to Configuration > Data Sources
   - Click "Add data source"
   - Select Prometheus
   - Set URL to `http://prometheus:9090`
   - Click "Save & Test"

### Import Dashboards

1. Go to Create > Import
2. Import the following dashboards by entering their IDs:
   - Node Exporter Full: 1860
   - MySQL Overview: 7362
   - Nginx Metrics: 12006

## Application Metrics

### 1. Install Prometheus Client for Laravel

```bash
comrequire promphp/prometheus_client_php
```

### 2. Create Metrics Controller

Create `app/Http/Controllers/MetricsController.php`:

```php
<?php

namespace App\Http\Controllers;

use Prometheus\CollectorRegistry;
use Prometheus\RenderTextFormat;
use Prometheus\Storage\APC;

class MetricsController extends Controller
{
    public function index()
    {
        $registry = new CollectorRegistry(new APC());
        
        // Example counter
        $counter = $registry->getOrRegisterCounter(
            'rcng',
            'http_requests_total',
            'Total HTTP requests',
            ['method', 'endpoint', 'status']
        );
        
        $renderer = new RenderTextFormat();
        $result = $renderer->render($registry->getMetricFamilySamples());
        
        return response($result, 200, ['Content-Type' => 'text/plain']);
    }
}
```

### 3. Add Route

Add to `routes/web.php`:

```php
Route::get('/metrics', 'App\Http\Controllers\MetricsController@index');
```

### 4. Create Middleware for Request Metrics

Create `app/Http/Middleware/RequestMetrics.php`:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Prometheus\CollectorRegistry;
use Prometheus\Storage\APC;

class RequestMetrics
{
    public function handle($request, Closure $next)
    {
        return $next($request);
    }

    public function terminate($request, $response)
    {
        $route = $request->route();
        $path = $route ? $route->uri() : $request->path();
        
        $registry = new CollectorRegistry(new APC());
        
        // Increment request counter
        $counter = $registry->getOrRegisterCounter(
            'rcng',
            'http_requests_total',
            'Total HTTP requests',
            ['method', 'endpoint', 'status']
        );
        
        $counter->inc([
            $request->method(),
            $path,
            $response->status()
        ]);
        
        // Track request duration
        $histogram = $registry->getOrRegisterHistogram(
            'rcng',
            'http_request_duration_seconds',
            'HTTP request duration in seconds',
            ['method', 'endpoint'],
            [0.1, 0.25, 0.5, 0.75, 1.0, 2.5, 5.0, 10.0]
        );
        
        $histogram->observe(
            microtime(true) - LARAVEL_START,
            [$request->method(), $path]
        );
    }
}
```

### 5. Register Middleware

Add to `app/Http/Kernel.php`:

```php
protected $middleware = [
    // ...
    \App\Http\Middleware\RequestMetrics::class,
];
```

## Log Management

### 1. Configure Laravel Logging

Update `.env`:

```ini
LOG_CHANNEL=stack
LOG_LEVEL=debug

PAPERTRAIL_URL=logsX.papertrailapp.com
PAPERTRAIL_PORT=12345
```

### 2. Install Papertrail Log Drain

```bash
composer require graham-campbell/markdown
```

### 3. Configure Logging in `config/logging.php`

```php
'papertrail' => [
    'driver' => 'monolog',
    'level' => 'debug',
    'handler' => SyslogUdpHandler::class,
    'handler_with' => [
        'host' => env('PAPERTRAIL_URL'),
        'port' => env('PAPERTRAIL_PORT'),
    ],
],
```

## Alerting

### 1. Configure Alert Manager

Create `alertmanager.yml`:

```yaml
route:
  group_by: ['alertname', 'job']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 3h
  receiver: 'web.hook'

receivers:
  - name: 'web.hook'
    webhook_configs:
      - url: 'http://localhost:5001/'

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'dev', 'instance']
```

### 2. Add Alert Rules

Create `prometheus/rules.yml`:

```yaml
groups:
- name: example
  rules:
  - alert: HighRequestLatency
    expr: job:request_latency_seconds:mean5m{job="rcng"} > 1
    for: 10m
    labels:
      severity: page
    annotations:
      summary: High request latency on {{ $labels.instance }}
      description: "{{ $labels.instance }} has high request latency ({{ $value }}s)"

  - alert: ErrorRateHigh
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: High error rate on {{ $labels.instance }}
      description: "Error rate is {{ $value }} on {{ $labels.instance }}"
```

### 3. Update Prometheus Configuration

Add to `prometheus/prometheus.yml`:

```yaml
rule_files:
  - 'rules.yml'

alerting:
  alertmanagers:
  - static_configs:
    - targets: ['alertmanager:9093']
```

## Performance Tuning

### 1. Nginx Configuration

```nginx
http {
    # Basic Settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    # Gzip Settings
    gzip on;
    gzip_disable "msie6";
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_buffers 16 8k;
    gzip_http_version 1.1;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache Settings
    open_file_cache max=200000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
}
```

### 2. PHP-FPM Configuration

```ini
pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
pm.max_requests = 500
```

## Troubleshooting

### 1. Prometheus Not Scraping

```bash
# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Check logs
docker-compose logs prometheus
```

### 2. Grafana Not Showing Data

1. Check data source configuration
2. Verify time range in Grafana
3. Check Prometheus metrics directly

### 3. High Resource Usage

```bash
# Check top processes
top

# Check disk I/O
iostat -x 1

# Check network traffic
iftop
```

### 4. Check Application Logs

```bash
# Laravel logs
tail -f storage/logs/laravel.log

# Nginx error logs
tail -f /var/log/nginx/error.log

# PHP-FPM logs
tail -f /var/log/php8.1-fpm.log
```

## Monitoring Best Practices

1. **Set Up Alerts**: Configure alerts for critical metrics
2. **Regular Backups**: Backup Grafana dashboards and Prometheus rules
3. **Capacity Planning**: Monitor resource usage trends
4. **Documentation**: Document your monitoring setup and procedures
5. **Regular Reviews**: Review and update monitoring rules and dashboards

## Next Steps

1. Set up additional exporters for:
   - MySQL/MariaDB
   - Redis
   - Nginx
2. Configure additional alert channels (Slack, PagerDuty, etc.)
3. Set up long-term storage for metrics
4. Implement log aggregation with ELK or Loki
5. Set up synthetic monitoring with Blackbox Exporter
