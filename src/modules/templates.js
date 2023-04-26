const express = require("express");
const router = express.Router();
const app = express.Router();

const token_validation = require("../middlewares/token_validation");

const Database = require("../apps/knex");
const tables = require("../models/tables");

// pagination
app.get("/", token_validation, async (req, res) => {
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
  let data = await Database(tables.templates)
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

app.post("/", token_validation, async (req, res) => {
  let { key, sample, example } = req.body;

  if (!(key && sample && example)) {
    return res.status(400).json({
      message: "body is'n complete!",
    });
  }
  try {
    example = JSON.parse(example);
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
      message: "key is exist on database!",
    });
  }

  await Database(tables.templates).insert({
    key,
    sample,
    example_data: example,
  });

  return res.json({
    message: "success create template!",
  });
});

app.put("/:key", token_validation, async (req, res) => {
  const { key } = req.params;
  let { sample, example } = req.body;

  if (!(sample && example)) {
    return res.status(400).json({
      message: "body is'n complete!",
    });
  }
  try {
    example = JSON.parse(example);
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
      message: "key is exist on database!",
    });
  }

  await Database(tables.templates).where("key", key).insert({
    sample,
    example_data: example,
  });

  return res.json({
    message: "success update template!",
  });
});

app.delete("/:key", token_validation, async (req, res) => {
  const { key } = req.params;

  const isExist = await Database(tables.templates)
    .select("id")
    .where("key", key)
    .first();
  if (!isExist) {
    return res.status(400).json({
      message: "key is'n exist on database!",
    });
  }

  await Database(tables.templates).where("key", key).delete();

  return res.json({
    message: "success remove template!",
  });
});

router.use("/template", app);
module.exports = router;
