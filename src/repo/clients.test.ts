import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { describe, afterAll, beforeEach, it, expect } from 'vitest';

import * as schema from '@/db/schema';
import type { DbOrTx } from '@/repo/index';
import { Regime } from '@/types/clients';

import { insertClient } from './clients';
const databaseUrl = process.env.DATABASE_URL_TEST;
if (!databaseUrl) {
  throw new Error('DATABASE_URL_TEST is not set');
}

const sqlConnection = postgres(databaseUrl);
const db = drizzle({ client: sqlConnection, schema, casing: 'snake_case' });

async function clearDB(database: DbOrTx) {
  await database.delete(schema.document);
  await database.delete(schema.checklistItem);
  await database.delete(schema.r2PendingDelete);
  await database.delete(schema.mtdSubmission);
  await database.delete(schema.taxReturn);
  await database.delete(schema.client);
  await database.delete(schema.practice);
}

beforeEach(async () => {
  await clearDB(db);
});

afterAll(async () => {
  await sqlConnection.end();
});

describe('insertClient', () => {
  it('returns an id', async () => {
    const [row] = await db
      .insert(schema.practice)
      .values({ name: 'Test Practice' })
      .returning({ id: schema.practice.id });
    const practiceId = row.id;

    const res = await insertClient(
      practiceId,
      {
        firstName: 'Alice',
        lastName: 'Thornton',
        niNumber: 'AB 12 34 56 C',
        email: 'alice.thornton@example.com',
        phoneNumber: '07700 900001',
        regime: Regime.sa100,
      },
      db,
    );

    expect(res.id.length).toBeGreaterThan(0);
  });

  it('with 2 clients with same niNumber and practiceId throws', async () => {
    const [row] = await db
      .insert(schema.practice)
      .values({ name: 'Test Practice' })
      .returning({ id: schema.practice.id });
    const practiceId = row.id;

    await insertClient(
      practiceId,
      {
        firstName: 'Alice',
        lastName: 'Thornton',
        niNumber: 'AB 12 34 56 C',
        email: 'alice.thornton@example.com',
        phoneNumber: '07700 900001',
        regime: Regime.sa100,
      },
      db,
    );

    await expect(async () => {
      await insertClient(
        practiceId,
        {
          firstName: 'Alice',
          lastName: 'Thornton',
          niNumber: 'AB 12 34 56 C',
          email: 'alice.thornton@example.com',
          phoneNumber: '07700 900001',
          regime: Regime.sa100,
        },
        db,
      );
    }).rejects.toThrow();
  });
});
