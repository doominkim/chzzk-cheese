module.exports = {
  apps: [
    {
      name: 'chzzk-cheese',
      script: 'npm',
      args: 'run start:prod',
      exec_mode: 'fork',
      autorestart: true,
      watch: true,
      env: {
        NODE_ENV: 'prod',
      },
    },
  ],
};
