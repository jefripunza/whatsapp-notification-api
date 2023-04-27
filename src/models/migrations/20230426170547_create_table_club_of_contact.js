const tables = require("../tables");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(tables.club_of_contact, function (table) {
    table.increments();

    table
      .integer("id_club")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable(tables.clubs)
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
    table
      .integer("id_contact")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable(tables.contacts)
      .onUpdate("CASCADE")
      .onDelete("CASCADE");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable(tables.club_of_contact);
};
