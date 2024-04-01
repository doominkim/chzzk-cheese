let envFilePath = 'envs/.env.dev';

if (process.env.NODE_ENV === 'staging') envFilePath = 'envs/.env.staging';
if (process.env.NODE_ENV === 'test') envFilePath = 'envs/.env.test';
if (process.env.NODE_ENV === 'prod') envFilePath = 'envs/.env.prod';

export default envFilePath;
