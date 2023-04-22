const express = require("express");
const http = require("http");
const { temp_dir } = require("../config");

const app = express();
const server = http.createServer(app);

app.use(require("cors")());
app.use(require("helmet")());
app.use(require("morgan")("dev"));

require("../module")(app);

app.use(express.static(temp_dir));
app.get("*", (_, res) => res.status(404).json({ message: "page not found!" }));
app.all("*", (_, res) => res.status(404).json({ message: "endpoint not found!" }));

module.exports = { app, server };
