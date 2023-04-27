const tables = require("../tables");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable(tables.clubs, function (table) {
    table.increments();

    table.string("name").unique().notNullable();
  });
  await knex(tables.clubs).insert([
    { name: "ds" },
    { name: "pria" },
    { name: "wanita" },
    { name: "bully" },
    { name: "be" },
    { name: "fe" },
    { name: "qa" },
    { name: "po" },
    { name: "core" },
    { name: "integrasi" },
    { name: "tokopedia" },
    { name: "shoope" },
    { name: "lazada" },
    { name: "blibli" },
    { name: "tiktok" },
    { name: "grab" },
  ]);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable(tables.clubs);
};
