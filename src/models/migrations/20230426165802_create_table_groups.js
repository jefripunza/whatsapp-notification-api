const tables = require("../tables");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(tables.groups, function (table) {
    table.increments();

    table.string("name").notNullable();
    table.string("id_serialized").unique().notNullable();

    table.boolean("is_process").defaultTo(true);
    table.boolean("is_sync").defaultTo(false);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable(tables.groups);
};
