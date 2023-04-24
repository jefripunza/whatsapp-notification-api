const express = require("express");
const router = express.Router();
const app = express.Router();

const token_validation = require("../middlewares/token_validation");

const Database = require("../apps/knex");
const tables = require("../models/tables");

// pagination
app.get("/", async (req, res) => {
  let { page, show, search } = req.query;
  page = page ?? 1;
  show = show ?? 10;

  const ids = await Database(tables.templates)
    .where(function () {
      if (search) {
        this.whereRaw(
          `LOWER(${tables.templates}.key) like '%` +
            String(search).toLowerCase() +
            "%'"
        );
      }
    })
    .pluck("id");
  const total_data = ids.length;
  const data = await Database(tables.templates)
    .select("*")
    .whereIn("id", ids)
    .limit(show)
    .offset((page - 1) * show);

  return res.json({
    data,
    total_data,
    total_page: Math.ceil(Number(total_data) / show),
  });
});

app.post("/", async (req, res) => {
  const { key, sample, example } = req.body;
  if (!(key && sample && example)) {
    return res.status(400).json({
      message: "body is'n complete!",
    });
  }
  try {
    JSON.parse(example);
  } catch (error) {
    return res.status(400).json({
      message: "example is'n json format!",
    });
  }

  const isExist = await Database(tables.templates)
    .select("id")
    .where("key", key)
    .first();
  if (isExist) {
    return res.status(400).json({
      message: "key exist!",
    });
  }

  await Database(tables.templates).insert({
    key,
    sample,
    example,
  });

  return res.json({
    message: "success create template!",
  });
});

router.use("/template", app);
module.exports = router;
