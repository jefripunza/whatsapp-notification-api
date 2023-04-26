const knex = require("knex");
const knexfile = require("../../knexfile");
/**
 * @type{knex.Knex}
 */
const Database = knex(knexfile);

// Test Connection
(async () => {
  Database.raw("SELECT 1")
    .then(() => {
      console.log("✅ Database connected");
    })
    .catch((e) => {
      console.log("Database not connected");
      console.error(e);
      process.exit(1);
    });
})();

module.exports = Database;
