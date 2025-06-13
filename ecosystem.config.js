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
      },
    },
  ],
};
