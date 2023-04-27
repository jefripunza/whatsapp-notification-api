const express = require("express");
const router = express.Router();
const app = express.Router();

const RabbitMQ = require("../apps/rabbitmq");
const { MESSAGE_REQUESTS_EXCHANGE } = require("../exchange-queue");

const token_validation = require("../middlewares/token_validation");

const Database = require("../apps/knex");
const tables = require("../models/tables");

const { getFocusVariable } = require("../helpers");

app.post("/message/raw", token_validation, async (req, res) => {
  let { phone_number, message } = req.body;
  if (!(phone_number && message)) {
    return res.status(400).json({
      message: "body is'n complete!",
    });
  }

  const { is_ready, is_authenticated, client, formatter } = global.whatsapp;
  if (!is_ready || !is_authenticated) {
    return res.status(400).json({
      message: "whatsapp is'n ready!",
    });
  }
  phone_number = formatter(phone_number);

  try {
    const isRegister = await client.isRegisteredUser(phone_number);
    if (!isRegister) {
      return res.status(400).json({
        message: "whatsapp is'n registered!",
      });
    }

    const Rabbit = new RabbitMQ();
    await Rabbit.send(MESSAGE_REQUESTS_EXCHANGE, {
      phone_number,
      message,
    });

    return res.json({ message: "success send message!" });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: "internal server error!" });
  }
});

app.post("/message/:key/:phone_number", token_validation, async (req, res) => {
  let { key, phone_number } = req.params;
  const body = req.body;
  if (Object.keys(body).length == 0) {
    return res.status(400).json({
      message: "body cannot empty!",
    });
  }

  const { is_ready, is_authenticated, client, formatter } = global.whatsapp;
  if (!is_ready || !is_authenticated) {
    return res.status(400).json({
      message: "whatsapp is'n ready!",
    });
  }
  phone_number = formatter(phone_number);

  try {
    const isRegister = await client.isRegisteredUser(phone_number);
    if (!isRegister) {
      return res.status(400).json({
        message: "whatsapp is'n registered!",
      });
    }

    const isExist = await Database(tables.templates)
      .select("sample")
      .where("key", key)
      .first();
    if (!isExist) {
      return res.status(400).json({
        message: "template key not found!",
      });
    }

    const variables = getFocusVariable(isExist.sample);
    const variableNotFound = variables.filter((variable) => !body[variable]);
    if (variableNotFound.length > 0) {
      return res.status(400).json({
        message: `template variable (${variableNotFound.join(
          ", "
        )}) not found!`,
      });
    }

    const sample_replacer = variables.reduce((simpan, variable) => {
      return String(simpan).replace(
        new RegExp(`#${variable}#`, "g"),
        body[variable]
      );
    }, isExist.sample);

    const Rabbit = new RabbitMQ();
    await Rabbit.send(MESSAGE_REQUESTS_EXCHANGE, {
      phone_number,
      message: sample_replacer,
    });

    return res.json({
      message: "success send message!",
    });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ message: "internal server error!" });
  }
});

router.use("/send", app);
module.exports = router;
