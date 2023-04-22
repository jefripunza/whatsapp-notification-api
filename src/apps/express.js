const path = require("path");

const express = require("express");
const http = require("http");
const { frontend_dir } = require("../config");

const app = express();
const server = http.createServer(app);

app.use(require("cors")());
app.use(require("helmet")());

// frontend view
app.use(express.static(frontend_dir));
app.get("/", (_, res) => res.sendFile(path.join(frontend_dir, "index.html")));

// api
app.use(require("morgan")("dev"));
require("../module")(app);
app.get("*", (_, res) => res.status(404).json({ message: "page not found!" }));
app.all("*", (_, res) =>
  res.status(404).json({ message: "endpoint not found!" })
);

module.exports = { app, server };
