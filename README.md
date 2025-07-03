# Team Performance Dashboard

A web application for tracking team performance metrics and generating weekly reports.

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

#### Install Node.js (version 18):
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
```

Verify installation:
```bash
node --version
npm --version
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

#### Install PM2 (process manager):
```bash
npm install -g pm2
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

#### Install dependencies:
```bash
npm install
```

#### Create environment file:
```bash
nano .env
```

Add configuration:
```env
DATABASE_URL="postgresql://app_user:your_secure_password@localhost:5432/team_performance"
PORT=5000
NODE_ENV=production
```

#### Set up database schema:
```bash
npm run db:push
```

#### Build application:
```bash
npm run build
```

### 5. Process Management with PM2

Create PM2 ecosystem file:
```bash
nano ecosystem.config.js
```

Add configuration:
```javascript
module.exports = {
  apps: [{
    name: 'team-performance-dashboard',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/team-performance',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

Create logs directory:
```bash
mkdir -p logs
```

Start application with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
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
        proxy_pass http://localhost:5000;
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

### 10. System Service Configuration

Create systemd service for auto-start:
```bash
nano /etc/systemd/system/team-performance.service
```

Add configuration:
```ini
[Unit]
Description=Team Performance Dashboard
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/team-performance
ExecStart=/usr/bin/pm2 start ecosystem.config.js --no-daemon
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable service:
```bash
systemctl enable team-performance
systemctl start team-performance
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
npm install
npm run build
pm2 restart team-performance-dashboard
```

### Backup Database

```bash
sudo -u postgres pg_dump team_performance > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Monitor Resources

```bash
pm2 monit
htop
df -h
```

### View Logs

```bash
pm2 logs team-performance-dashboard
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Troubleshooting

### Application won't start
- Check logs: `pm2 logs`
- Verify database connection: `npm run db:push`
- Check environment variables: `cat .env`

### Database connection issues
- Verify PostgreSQL is running: `systemctl status postgresql`
- Check database exists: `sudo -u postgres psql -l`
- Test connection: `sudo -u postgres psql -d team_performance`

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