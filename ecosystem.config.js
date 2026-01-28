module.exports = {
  apps: [{
    name: 'tipsio',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/tipsio',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/www/tipsio/logs/pm2-error.log',
    out_file: '/var/www/tipsio/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false,
    // Restart delay
    restart_delay: 4000,
    // Max restarts within 1 minute
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
