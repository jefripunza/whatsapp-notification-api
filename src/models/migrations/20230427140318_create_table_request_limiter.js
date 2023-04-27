const tables = require("../tables");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(tables.request_limiter, function (table) {
    table.increments();

    table.string("number_serialized").notNullable();

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("expired_at").nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable(tables.request_limiter);
};
