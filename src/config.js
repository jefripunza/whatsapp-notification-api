const fs = require("fs");
const path = require("path");
require("dotenv").config();

exports.PORT = process.env.PORT ?? 5000;
exports.JWT_SECRET_TOKEN = process.env.JWT_SECRET_TOKEN ?? "my-s3cr3t";
exports.RABBIT_HOST = process.env.RABBIT_HOST ?? "amqp://localhost";

exports.session_dir = path.join(process.cwd(), ".wwebjs_auth");
if (!fs.existsSync(this.session_dir)) {
  fs.mkdirSync(this.session_dir);
}
exports.temp_dir = path.join(this.session_dir, "temp");
if (!fs.existsSync(this.temp_dir)) {
  fs.mkdirSync(this.temp_dir);
}
exports.migrations_dir = path.join(
  process.cwd(),
  "src",
  "models",
  "migrations"
);
if (!fs.existsSync(this.migrations_dir)) {
  fs.mkdirSync(this.migrations_dir, { recursive: true });
}
exports.seeds_dir = path.join(process.cwd(), "src", "models", "seeds");
if (!fs.existsSync(this.seeds_dir)) {
  fs.mkdirSync(this.seeds_dir, { recursive: true });
}
exports.consumers_dir = path.join(process.cwd(), "src", "consumers");
if (!fs.existsSync(this.consumers_dir)) {
  fs.mkdirSync(this.consumers_dir, { recursive: true });
}

exports.frontend_dir = path.join(process.cwd(), "frontend", "dist");

exports.cors_frontend =
  process.env.NODE_ENV === "production" ? undefined : "http://localhost:5173";
