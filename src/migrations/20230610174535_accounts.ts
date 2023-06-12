import { Knex } from 'knex';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('accounts', (table) => {
    table.uuid('account_id').primary();
    table.integer('account_no').unique().notNullable();
    table
      .enum('account_type', ['savings', 'current', 'domicile', 'fixed deposit'])
      .defaultTo('savings')
      .notNullable();
    table.decimal('balance', 10, 2).notNullable().defaultTo(0);
    table
      .uuid('user_id')
      .notNullable()
      .references('user_id')
      .inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('accounts');
}
