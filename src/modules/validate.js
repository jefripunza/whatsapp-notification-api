const express = require("express");
const router = express.Router();
const app = express.Router();
const { onlyNumber } = require("../helpers");

const token_validation = require("../middlewares/token_validation");

app.get("/is-register/:phone_number", async (req, res) => {
  const { phone_number } = req.params;

  const { is_ready, is_authenticated, client, formatter } = global.whatsapp;
  if (!is_ready || !is_authenticated) {
    return res.status(400).json({
      message: "whatsapp is'n ready!",
    });
  }

  phone_number = formatter(onlyNumber(phone_number));
  const register = await client.isRegisteredUser(phone_number);
  return res.json({ register });
});

router.use("/validate", app);
module.exports = router;
