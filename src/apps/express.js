const fs = require("fs");
const path = require("path");

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const { PORT, frontend_dir, cors_frontend } = require("../config");

const app = express();
const server = http.createServer(app);

server.listen(PORT, () => console.log(`✅ Server listen at ${PORT}`));
const io = new Server(server, {
  cors: {
    origin: cors_frontend,
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(require("cors")());
app.use(require("helmet")());

// frontend view
app.use(express.static(frontend_dir));
app.get("/", (_, res) => res.sendFile(path.join(frontend_dir, "index.html")));

// api
app.use(require("morgan")("dev"));
app.use("/api/whatsapp", require("../modules/auth"));
app.use("/api/whatsapp", require("../modules/templates"));
app.use("/api/whatsapp", require("../modules/send"));

// error handlers
app.get("*", (req, res) => {
  if (req.headers["content-type"] == "application/json") {
    return res.status(404).json({ message: "page not found!" });
  }
  return res.sendFile(path.join(frontend_dir, "index.html"));
});
app.all("*", (_, res) =>
  res.status(404).json({ message: "endpoint not found!" })
);

module.exports = { app, server, io };
