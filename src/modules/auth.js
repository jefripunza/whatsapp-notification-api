const express = require("express");
const router = express.Router();
const app = express.Router();

const token_validation = require("../middlewares/token_validation");

app.delete("/logout", token_validation, (req, res) => {
  return res.json({ message: "success logout!" });
});

router.use("/auth", app);
module.exports = router;
