module.exports = {
  apps: [
    {
      name: 'api',
      script: 'npm',
      args: 'run start:dev',
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'dev',
        PORT: 3000,
        HTTPS: 'true',
        SSL_KEY_PATH: './121.167.129.36-key.pem',
        SSL_CERT_PATH: './121.167.129.36.pem',
      },
    },
    {
      name: 'api-batch',
      script: 'npm',
      args: 'run start:dev-batch',
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'dev',
        PORT: 3001,
        HTTPS: 'true',
        SSL_KEY_PATH: './121.167.129.36-key.pem',
        SSL_CERT_PATH: './121.167.129.36.pem',
      },
    },
  ],
};
