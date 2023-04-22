const fs = require("fs");
const path = require("path");
require("dotenv").config();

exports.PORT = process.env.PORT ?? 5000;

exports.temp_dir = path.join(process.cwd(), "temp");
// create temp directory
if (!fs.existsSync(this.temp_dir)) {
  fs.mkdirSync(this.temp_dir);
}

exports.frontend_dir = path.join(process.cwd(), "frontend", "dist");
