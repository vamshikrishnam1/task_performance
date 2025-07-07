# Team Performance Dashboard

A simple web application for tracking team performance metrics and generating weekly reports.

## Technology Stack

- **Backend**: Go with Gorilla Mux router
- **Database**: PostgreSQL 
- **Frontend**: React (vanilla JS via CDN)
- **Reverse Proxy**: Nginx
- **Styling**: Tailwind CSS

## Self-Hosting on Debian Cloud VM

This guide covers complete deployment on a Debian-based cloud VM with all dependencies installed locally.

## Prerequisites

- Fresh Debian 11/12 cloud VM instance
- Root or sudo access
- Basic terminal/SSH knowledge

## Complete Installation Guide

### 1. Initial Server Setup

Connect to your Debian VM via SSH:
```bash
ssh root@your-server-ip
```

Update system packages:
```bash
apt update && apt upgrade -y
```

### 2. Install Required Dependencies

#### Install curl and essential tools:
```bash
apt install -y curl wget git build-essential
```

#### Install Go (version 1.21 or higher):
```bash
wget https://golang.org/dl/go1.21.5.linux-amd64.tar.gz
tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> /etc/profile
source /etc/profile
```

Verify installation:
```bash
go version
```

#### Install PostgreSQL:
```bash
apt install -y postgresql postgresql-contrib
```

Start and enable PostgreSQL:
```bash
systemctl start postgresql
systemctl enable postgresql
```

#### Install Nginx (for reverse proxy):
```bash
apt install -y nginx
```

#### Install systemd service utilities:
```bash
apt install -y systemd
```

### 3. Database Setup

Switch to postgres user and create database:
```bash
sudo -u postgres psql
```

In PostgreSQL shell:
```sql
CREATE DATABASE team_performance;
CREATE USER app_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE team_performance TO app_user;
\q
```

### 4. Application Deployment

#### Create application directory:
```bash
mkdir -p /var/www/team-performance
cd /var/www/team-performance
```

#### Clone your repository:
```bash
git clone https://github.com/your-username/team-performance-dashboard.git .
```

#### Install Go dependencies:
```bash
go mod download
go mod tidy
```

#### Create environment file:
```bash
nano .env
```

Add configuration:
```env
DATABASE_URL=postgresql://app_user:your_secure_password@localhost:5432/team_performance
PORT=8080
```

#### Build application:
```bash
go build -o team-performance-dashboard main.go
```

### 5. Create Systemd Service

Create systemd service file:
```bash
nano /etc/systemd/system/team-performance.service
```

Add configuration:
```ini
[Unit]
Description=Team Performance Dashboard
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/team-performance
ExecStart=/var/www/team-performance/team-performance-dashboard
Restart=always
RestartSec=3
Environment=DATABASE_URL=postgresql://app_user:your_secure_password@localhost:5432/team_performance
Environment=PORT=8080

[Install]
WantedBy=multi-user.target
```

Enable and start service:
```bash
systemctl daemon-reload
systemctl enable team-performance
systemctl start team-performance
```

### 6. Nginx Configuration

Create Nginx configuration:
```bash
nano /etc/nginx/sites-available/team-performance
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or IP

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/team-performance /etc/nginx/sites-enabled/
```

Test and reload Nginx:
```bash
nginx -t
systemctl reload nginx
```

### 7. Firewall Configuration

Install and configure UFW:
```bash
apt install -y ufw
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

### 8. SSL Certificate (Optional but Recommended)

Install Certbot:
```bash
apt install -y certbot python3-certbot-nginx
```

Obtain SSL certificate:
```bash
certbot --nginx -d your-domain.com
```

### 9. File Permissions

Set proper ownership:
```bash
chown -R www-data:www-data /var/www/team-performance
chmod -R 755 /var/www/team-performance
```

### 10. File Permissions

Set proper ownership and permissions:
```bash
chown -R www-data:www-data /var/www/team-performance
chmod +x /var/www/team-performance/team-performance-dashboard
```

## Post-Installation

### Verify Installation

Check all services are running:
```bash
systemctl status postgresql
systemctl status nginx
pm2 status
```

Test database connection:
```bash
sudo -u postgres psql -d team_performance -c "SELECT version();"
```

Check application logs:
```bash
pm2 logs team-performance-dashboard
```

### Access Application

Your application should now be accessible at:
- HTTP: `http://your-server-ip` or `http://your-domain.com`
- HTTPS: `https://your-domain.com` (if SSL configured)

## Maintenance

### Update Application

```bash
cd /var/www/team-performance
git pull origin main
go build -o team-performance-dashboard main.go
systemctl restart team-performance
```

### Backup Database

```bash
sudo -u postgres pg_dump team_performance > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Monitor Resources

```bash
systemctl status team-performance
htop
df -h
```

### View Logs

```bash
journalctl -u team-performance -f
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Troubleshooting

### Application won't start
- Check logs: `journalctl -u team-performance`
- Verify database connection: Test with `sudo -u postgres psql -d team_performance`
- Check environment variables in systemd service file
- Verify binary has execute permissions: `ls -la /var/www/team-performance/team-performance-dashboard`

### Database connection issues
- Verify PostgreSQL is running: `systemctl status postgresql`
- Check database exists: `sudo -u postgres psql -l`
- Test connection: `sudo -u postgres psql -d team_performance`

### Build errors
- Ensure Go is properly installed: `go version`
- Check Go module dependencies: `go mod verify`
- Clean and rebuild: `go clean && go build -o team-performance-dashboard main.go`

### Nginx errors
- Check configuration: `nginx -t`
- View error logs: `tail -f /var/log/nginx/error.log`
- Verify proxy settings

## Security Considerations

1. **Use strong passwords** for database and system users
2. **Keep system updated**: `apt update && apt upgrade`
3. **Configure firewall** properly with UFW
4. **Use SSL certificates** for HTTPS
5. **Regular backups** of database and application
6. **Monitor logs** for suspicious activity

## Performance Optimization

1. **Enable Nginx gzip compression**
2. **Configure PostgreSQL** for your server specs
3. **Use PM2 clustering** for multiple CPU cores
4. **Implement log rotation** to prevent disk space issues
5. **Monitor resource usage** with `pm2 monit`