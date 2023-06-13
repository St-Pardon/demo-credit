import knex, { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import dbConfig from '../src/utils/knexfile';
import { encryptPassword } from '../src/utils/hashpassword.utils';

// Import any utility functions or test helpers you may need
// import { clearDatabase, seedDatabase } from './path/to/test-utils';

// Create a test database connection using the provided configuration
export const testDb = knex(dbConfig['test']); // Assuming your configuration object has a `test` property for the test database settings

export async function clearDatabase(db: Knex): Promise<void> {
  await db.schema.dropTableIfExists('knex_migrations');
  await db.schema.dropTableIfExists('knex_migrations_lock');
  await db.schema.dropTableIfExists('transactions');
  await db.schema.dropTableIfExists('accounts');
  await db.schema.dropTableIfExists('users');
}

export async function seedDatabase(db: Knex): Promise<void> {
  // Seed the tables with sample data
  await db.table('users').insert([
    {
      user_id: uuidv4(),
      first_name: 'john',
      last_name: 'doe',
      email: 'john@doe.com',
      password: await encryptPassword('12345678'),
    },
    //   { id: 2, last_name: 'Item 2' },
    // ... add more sample data
  ]);

  // await db.table('table2').insert([
  //   { id: 1, name: 'User 1' },
  //   { id: 2, name: 'User 2' },
  //   // ... add more sample data
  // ]);

  // ... repeat for other tables
}

export async function migrateLatest(db: Knex): Promise<void> {
  // Run the latest migrations
  await db.migrate.latest();
}
