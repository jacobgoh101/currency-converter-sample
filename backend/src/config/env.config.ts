import { config as dotEnvConfig } from 'dotenv';
import { resolve as resolvePath } from 'path';

dotEnvConfig({ path: resolvePath(process.cwd(), '..', '.env') });

export const ENV = {
  NODE_ENV: process.env.NODE_ENV,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
};
