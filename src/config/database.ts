import { createPool } from 'mysql2/promise';

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name} environment variable`);
  }

  return value;
}

export const db = createPool({
  host: requireEnv('MYSQL_HOST'),
  port: Number(process.env.MYSQL_PORT ?? 3306),
  user: requireEnv('MYSQL_USER'),
  password: requireEnv('MYSQL_PASSWORD'),
  database: requireEnv('MYSQL_DATABASE'),
  waitForConnections: true,
  connectionLimit: 10,
});