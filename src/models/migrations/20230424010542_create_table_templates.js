const tables = require("../tables");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(tables.templates, function (table) {
    table.increments();

    table.string("key").unique().notNullable();
    table.text("sample").notNullable();
    table.json("example_data").defaultTo({});

    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable(tables.templates);
};
