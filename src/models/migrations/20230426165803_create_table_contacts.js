const tables = require("../tables");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(tables.contacts, function (table) {
    table.increments();

    table.string("name").nullable();
    table.string("number_serialized").unique().notNullable();

    table
      .integer("sync_from_group")
      .unsigned()
      .nullable()
      .references("id")
      .inTable(tables.groups)
      .onUpdate("CASCADE")
      .onDelete("CASCADE");

    table.boolean("is_process").defaultTo(true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable(tables.contacts);
};
