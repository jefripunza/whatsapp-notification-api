const path = require("path");
require("dotenv").config({
  path: path.join(process.cwd(), ".rabbitmq"),
});

exports.RABBIT_MESSAGE_REQUESTS_EXCHANGE =
  process.env.MESSAGE_REQUESTS_EXCHANGE;
exports.RABBIT_MESSAGE_REQUESTS_QUEUE = process.env.MESSAGE_REQUESTS_QUEUE;
