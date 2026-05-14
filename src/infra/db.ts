import { drizzle } from 'drizzle-orm/postgres-js';
import { headers } from 'next/headers';
import postgres from 'postgres';

import { DEMO_HEADER } from '@/config/demo';
import * as schema from '@/db/schema';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

const sqlConnection = postgres(databaseUrl);
export const db = drizzle({ client: sqlConnection, schema, casing: 'snake_case' });

let dbDemo: typeof db | undefined;

export async function getCurrentDb() {
  const headerList = await headers();
  const isDemo = headerList.get(DEMO_HEADER) === 'true';

  if (isDemo) {
    if (!dbDemo) {
      const demoDatabaseUrl = process.env.DATABASE_URL_DEMO;
      if (!demoDatabaseUrl) throw new Error('DATABASE_URL_DEMO is not set');
      dbDemo = drizzle({ client: postgres(demoDatabaseUrl), schema, casing: 'snake_case' });
    }
    return dbDemo;
  }

  return db;
}

export type Db = typeof db;
