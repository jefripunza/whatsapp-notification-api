const express = require("express");
const router = express.Router();

const token_validation = require("../middlewares/token_validation");

const Database = require("../apps/knex");
const tables = require("../models/tables");

const app = express.Router();
// Create
app.post("/", token_validation, async (req, res) => {
  const { name, number_serialized } = req.body;
  if (!(name && number_serialized)) {
    return res.status(400).json({
      message: "body is'n complete!",
    });
  }

  const isNumberExist = await Database(tables.contacts)
    .select("id")
    .where("number_serialized", number_serialized)
    .first();
  if (isNumberExist) {
    return res.status(400).json({
      message: "number_serialized is exist!",
    });
  }

  await Database(tables.contacts).insert({
    name,
    number_serialized,
  });

  return res.json({
    message: "success create contact!",
  });
});

// Read
app.get("/", token_validation, async (req, res) => {
  const contacts = await Database(tables.contacts).select("*");
  return res.json({ data: contacts });
});
app.get("/on-club", token_validation, async (req, res) => {
  const contacts = await Database(tables.contacts)
    .select("contacts.*", `${tables.club_of_contact}.id_club`)
    .innerJoin(
      tables.club_of_contact,
      `${tables.club_of_contact}.id_contact`,
      `${tables.contacts}.id`
    );
  const club_ids = contacts.map((v) => v.id_club);
  const clubs = await Database(tables.clubs)
    .select("*")
    .whereIn("id", club_ids);
  const data = clubs.map((club) => {
    club.contacts = contacts
      .filter((v) => v.id_club == club.id)
      .map((c) => {
        delete c.id_club;
        return c;
      });
    return club;
  });
  return res.json({ data });
});

// Update
app.put("/:id", token_validation, async (req, res) => {
  const { id } = req.params;
  const { name, number_serialized } = req.body;
  if (!(name || number_serialized)) {
    return res.status(400).json({
      message: "body cannot empty!",
    });
  }

  const isIdExist = await Database(tables.contacts)
    .select("id")
    .where("id", id)
    .first();
  if (!isIdExist) {
    return res.status(400).json({
      message: "contact id is'n exist!",
    });
  }
  if (number_serialized) {
    const isNumberExist = await Database(tables.contacts)
      .select("id")
      .where("number_serialized", number_serialized)
      .first();
    if (isNumberExist) {
      return res.status(400).json({
        message: "contact number_serialized is exist!",
      });
    }
  }

  await Database(tables.contacts).where("id", id).update({
    name,
    number_serialized,
  });
  return res.json({ message: "success update contact!" });
});

// Delete
app.delete("/:id", token_validation, async (req, res) => {
  const { id } = req.params;

  const isIdExist = await Database(tables.contacts)
    .select("id")
    .where("id", id)
    .first();
  if (!isIdExist) {
    return res.status(400).json({
      message: "contact id is'n exist!",
    });
  }

  await Database(tables.contacts).where("id", id).delete();
  return res.json({ message: "success delete contact!" });
});

router.use("/contact", app);
module.exports = router;
