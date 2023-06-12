import { Knex } from 'knex';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  return await knex.schema.createTable('transactions', (table) => {
    table.uuid('id').primary();
    table.uuid('transaction_id').notNullable();
    table.enum('transaction_type', ['debit', 'credit']).notNullable();
    table.enum('status', ['successful', 'failed', 'cancelled']).notNullable();
    table.decimal('amount', 10, 2).notNullable();
    table
      .integer('from')
      .references('account_no')
      .inTable('accounts')
      .nullable();
    table.integer('to').references('account_no').inTable('accounts').nullable();
    table.string('comment', 100);
    table.string('description', 255);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  return await knex.schema.dropTable('transaction_history');
}
