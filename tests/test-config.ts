import knex, { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import dbConfig from '../src/utils/knexfile';
import { encryptPassword } from '../src/utils/hashpassword.utils';
import generateAccountNumbers from '../src/utils/generatenum.utils';

export const testDb = knex(dbConfig['test']);

export async function clearDatabase(db: Knex): Promise<void> {
  await db.schema.dropTableIfExists('knex_migrations');
  await db.schema.dropTableIfExists('knex_migrations_lock');
  await db.schema.dropTableIfExists('transactions');
  await db.schema.dropTableIfExists('accounts');
  await db.schema.dropTableIfExists('users');
}

const user_id1: string = uuidv4();
const user_id2: string = uuidv4();
const user_id3: string = uuidv4();

export async function seedDatabase(db: Knex): Promise<void> {
  await db.table('users').insert([
    {
      user_id: user_id1,
      first_name: 'john',
      last_name: 'doe',
      email: 'john@doe.com',
      password: await encryptPassword('12345678'),
    },
    {
      user_id: user_id2,
      first_name: 'thor',
      last_name: 'odinson',
      email: 'thor@odinson.com',
      password: await encryptPassword('12345678'),
    },
    {
      user_id: user_id3,
      first_name: 'tim',
      last_name: 'crook',
      email: 'tim@crook.com',
      password: await encryptPassword('12345678'),
    },
  ]);

  await db.table('accounts').insert([
    {
      account_id: uuidv4(),
      user_id: user_id1,
      account_no: generateAccountNumbers(),
      account_type: 'savings',
    },
    {
      account_id: uuidv4(),
      user_id: user_id2,
      account_no: generateAccountNumbers(),
      account_type: 'savings',
    },
    {
      account_id: uuidv4(),
      user_id: user_id3,
      account_no: generateAccountNumbers(),
      account_type: 'savings',
    },
  ]);

  // ... repeat for other tables
}

export async function migrateLatest(db: Knex): Promise<void> {
  await db.migrate.latest();
}
