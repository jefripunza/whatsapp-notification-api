const path = require("path");
const { session_dir, migrations_dir, seeds_dir } = require("./src/config");

module.exports = {
  client: "sqlite3",
  connection: {
    filename: path.join(session_dir, "store.db3"),
  },
  useNullAsDefault: true,
  migrations: {
    tableName: "knex_migrations",
    directory: migrations_dir,
  },
  seeds: {
    directory: seeds_dir,
  },
};
