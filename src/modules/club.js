const express = require("express");
const router = express.Router();

const token_validation = require("../middlewares/token_validation");

const Database = require("../apps/knex");
const tables = require("../models/tables");

const app = express.Router();
// Create
app.post("/", token_validation, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({
      message: "body is'n complete!",
    });
  }

  const isExist = await Database(tables.clubs)
    .select("id")
    .where("name", name)
    .first();
  if (isExist) {
    return res.status(400).json({
      message: "name club is exist!",
    });
  }

  await Database(tables.clubs).insert({
    name,
  });
  return res.json({
    message: "success create club!",
  });
});
app.post("/join", token_validation, async (req, res) => {
  const { id_club, id_contact } = req.body;
  if (!(id_club && id_contact)) {
    return res.status(400).json({
      message: "body is'n complete!",
    });
  }

  const isClubExist = await Database(tables.clubs)
    .select("id")
    .where("id", id_club)
    .first();
  if (!isClubExist) {
    return res.status(400).json({
      message: "club id is'n exist!",
    });
  }
  const isContactExist = await Database(tables.contacts)
    .select("id")
    .where("id", id_contact)
    .first();
  if (!isContactExist) {
    return res.status(400).json({
      message: "contact id is'n exist!",
    });
  }
  const isJoin = await Database(tables.club_of_contact)
    .select("id")
    .where("id_club", id_club)
    .andWhere("id_contact", id_contact)
    .first();
  if (isJoin) {
    return res.status(400).json({
      message: "id_club & id_contact is joined!",
    });
  }

  await Database(tables.club_of_contact).insert({
    id_club,
    id_contact,
  });
  return res.json({
    message: "success join contact on club!",
  });
});
// Read
app.get("/", token_validation, async (req, res) => {
  const clubs = await Database(tables.clubs).select("*").orderBy("id", "asc");
  return res.json({ data: clubs });
});
// Update
app.put("/:id", token_validation, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const isIdExist = await Database(tables.clubs)
    .select("id")
    .where("id", id)
    .first();
  if (!isIdExist) {
    return res.status(400).json({
      message: "club id is'n exist!",
    });
  }
  const isNameExist = await Database(tables.clubs)
    .select("id")
    .where("name", name)
    .first();
  if (isNameExist) {
    return res.status(400).json({
      message: "club name is exist!",
    });
  }

  await Database(tables.clubs).where("id", id).update({
    name,
  });
  return res.json({ message: "success update club!" });
});
// Delete
app.delete("/:id", token_validation, async (req, res) => {
  const { id } = req.params;

  const isIdExist = await Database(tables.clubs)
    .select("id")
    .where("id", id)
    .first();
  if (!isIdExist) {
    return res.status(400).json({
      message: "club id is'n exist!",
    });
  }

  await Database(tables.clubs).where("id", id).delete();
  return res.json({ message: "success delete club!" });
});

router.use("/club", app);
module.exports = router;
