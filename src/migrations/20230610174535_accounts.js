/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('accounts', (table) => {
    table.string('account_id').primary();
    table.string('account_no').notNullable();
    table
      .enum('account_type', ['savings', 'current', 'domicile', 'fixed deposit'])
      .defaultTo('savings')
      .notNullable();
    table.decimal('balance', 10, 2).notNullable().defaultTo(0);
    table
      .string('user_id')
      .notNullable()
      .references('user_id')
      .inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('accounts');
};
