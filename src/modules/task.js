const express = require("express");
const router = express.Router();
const app = express.Router();

const token_validation = require("../middlewares/token_validation");

const RabbitMQ = require("../apps/rabbitmq");
const { MESSAGE_REQUESTS_EXCHANGE } = require("../exchange-queue");

const cron = require("node-cron");
/**
 * @type{cron.ScheduleOptions}
 */
const options = {
  scheduled: false,
  timezone: "Asia/Jakarta",
};
/**
 * @param {string} cronExpression
 * @param {function} func
 * @returns
 */
const schedule = (cronExpression, func) =>
  cron.schedule(cronExpression, func, options);
const tasks = {};

const Database = require("../apps/knex");
const tables = require("../models/tables");

// ==========================================================================
// ==========================================================================

tasks["test"] = {
  task: schedule("* * * * *", async () => {
    const now = new Date();
    console.log("test task", { now: now.toString() });
  }),
  status: false,
};

tasks["daily_scrum"] = {
  task: schedule("0 10 * * 1-5", async () => {
    const now = new Date();
    try {
      const date = now.getDate(),
        month = now.getMonth() + 1,
        year = now.getFullYear();
      const result = await axios({
        url: `https://api-harilibur.vercel.app/api?month=${month}&year=${year}`,
      }).then((res) => res.data);
      const isHoliday = result
        .filter((v) => v.is_national_holiday)
        .find(
          ({ holiday_date }) =>
            date == parseInt(String(holiday_date).split("-")[2])
        );

      const Rabbit = new RabbitMQ();

      if (isHoliday) {
        await Rabbit.send(MESSAGE_REQUESTS_EXCHANGE, {
          phone_number: "120363021874096561@g.us", // mendaki
          message: `║ "LIBUR WOY NGGA KERJA" 🚨🚨🚨🚨🚨🚨\n╠➥ *${
            isHoliday.holiday_name
          }* \n╠➥ ${now.getDate()}/${
            now.getMonth() + 1
          }/${now.getFullYear()} \n╚═〘 JeJep BOT 〙`,
        });
        return; // skip DS !!
      }

      await Rabbit.send(MESSAGE_REQUESTS_EXCHANGE, {
        phone_number: "120363021874096561@g.us", // mendaki
        // phone_number: "120363130562078659@g.us", // testing bot
        message: `║ Kuy2 @DS 🚨🚨🚨🚨🚨🚨\n╠➥ ${now.getDate()}/${
          now.getMonth() + 1
        }/${now.getFullYear()} \n╚═〘 JeJep BOT 〙`,
      });
    } catch (error) {
      console.log({ error });
      return;
    }
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
