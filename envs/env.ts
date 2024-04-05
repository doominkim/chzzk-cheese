let envFilePath = 'envs/.env.dev';

if (process.env.NODE_ENV === 'prod') envFilePath = 'envs/.env.prod';
if (process.env.NODE_ENV === 'prod') envFilePath = 'envs/.env.prod';

export default envFilePath;
