const express = require("express");
const router = express.Router();

const token_validation = require("../middlewares/token_validation");

const Database = require("../apps/knex");
const tables = require("../models/tables");

const app = express.Router();

// Read
app.get("/", token_validation, async (req, res) => {
  const groups = await Database(tables.groups).select("*");
  return res.json({ data: groups });
});

// Update
app.put("/:id", token_validation, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({
      message: "body is'n exist!",
    });
  }

  const isIdExist = await Database(tables.groups)
    .select("id")
    .where("id", id)
    .first();
  if (!isIdExist) {
    return res.status(400).json({
      message: "group id is'n exist!",
    });
  }

  await Database(tables.groups).where("id", id).update({
    name,
  });
  return res.json({ message: "success update group!" });
});

// Change
app.patch("/process/:id", token_validation, async (req, res) => {
  const { id } = req.params;

  const isIdExist = await Database(tables.groups)
    .select("id")
    .where("id", id)
    .first();
  if (!isIdExist) {
    return res.status(400).json({
      message: "group id is'n exist!",
    });
  }

  await Database(tables.groups).where("id", id).update({ is_process: true });
  return res.json({ message: "success change group processing active!" });
});
app.patch("/un-process/:id", token_validation, async (req, res) => {
  const { id } = req.params;

  const isIdExist = await Database(tables.groups)
    .select("id")
    .where("id", id)
    .first();
  if (!isIdExist) {
    return res.status(400).json({
      message: "group id is'n exist!",
    });
  }

  await Database(tables.groups).where("id", id).update({ is_process: false });
  return res.json({ message: "success change group processing active!" });
});
app.patch("/sync/:id", token_validation, async (req, res) => {
  const { id } = req.params;

  const isIdExist = await Database(tables.groups)
    .select("id")
    .where("id", id)
    .first();
  if (!isIdExist) {
    return res.status(400).json({
      message: "group id is'n exist!",
    });
  }

  await Database(tables.groups).where("id", id).update({ is_sync: true });
  return res.json({ message: "success activation sync group!" });
});

router.use("/group", app);
module.exports = router;
