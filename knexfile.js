const path = require("path");
const { session_dir, migrations_dir, seeds_dir } = require("./src/config");

module.exports = {
  // # for sqlite
  // client: "sqlite3",
  // connection: {
  //   filename: path.join(session_dir, "store.db3"),
  // },

  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
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
