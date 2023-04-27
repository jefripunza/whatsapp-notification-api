const express = require("express");
const router = express.Router();
const app = express.Router();

const token_validation = require("../middlewares/token_validation");

const RabbitMQ = require("../apps/rabbitmq");
const { MESSAGE_REQUESTS_EXCHANGE } = require("../exchange-queue");

const Database = require("../apps/knex");
const tables = require("../models/tables");

const cron = require("node-cron");
const tasks = {};

// ==========================================================================
// ==========================================================================

tasks["test"] = {
  task: cron.schedule("* * * * *", async () => {
    const now = new Date();
    console.log("test task", { now: now.toString() });
  }),
  status: false,
};

tasks["daily_scrum"] = {
  task: cron.schedule("0 10 * * 1-5", async () => {
    const now = new Date();
    const Rabbit = new RabbitMQ();
    await Rabbit.send(MESSAGE_REQUESTS_EXCHANGE, {
      phone_number: "120363021874096561@g.us", // mendaki
      // phone_number: "120363130562078659@g.us", // testing bot
      message: `║ Kuy2 @DS 🚨🚨🚨🚨🚨🚨\n╠➥ ${now.getDate()}/${
        now.getMonth() + 1
      }/${now.getFullYear()} \n╚═〘 JeJep BOT 〙`,
    });
  }),
  status: true,
};

// ==========================================================================
// ==========================================================================

Object.keys(tasks).forEach((key) => {
  if (tasks[key].status) {
    tasks[key].task.start();
    console.log(`✅ Task : ${key}`);
    return;
  }
  tasks[key].task.stop();
});

// ==========================================================================
// ==========================================================================
// ==========================================================================

app.get("/", token_validation, async (req, res) => {
  const list_task = Object.keys(tasks).map((key) => {
    return {
      key,
      status: tasks[key].status,
    };
  });
  return res.json({ task: list_task });
});

app.patch("/:key/start", token_validation, async (req, res) => {
  const { key } = req.params;
  if (!tasks[key]) {
    return res.json({ message: "task not found!" });
  }
  if (tasks[key].status) {
    return res.json({ message: "task already active!" });
  }

  tasks[key].task.start();
  tasks[key].status = true;

  return res.json({ message: "success start task!" });
});
app.patch("/:key/stop", token_validation, async (req, res) => {
  const { key } = req.params;
  if (!tasks[key]) {
    return res.json({ message: "task not found!" });
  }
  if (!tasks[key].status) {
    return res.json({ message: "task already inactive!" });
  }

  tasks[key].task.stop();
  tasks[key].status = false;

  return res.json({ message: "success stop task!" });
});

router.use("/task", app);
module.exports = router;
