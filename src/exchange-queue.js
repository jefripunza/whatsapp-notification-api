const path = require("path");
require("dotenv").config({
  path: path.join(process.cwd(), ".rabbitmq"),
});

exports.MESSAGE_REQUESTS_EXCHANGE =
  process.env.MESSAGE_REQUESTS_EXCHANGE;
exports.MESSAGE_REQUESTS_QUEUE = process.env.MESSAGE_REQUESTS_QUEUE;

exports.MENTION_EVERYONE_EXCHANGE =
  process.env.MENTION_EVERYONE_EXCHANGE;
exports.MENTION_EVERYONE_QUEUE = process.env.MENTION_EVERYONE_QUEUE;

exports.MENTION_PARTIAL_EXCHANGE = process.env.MENTION_PARTIAL_EXCHANGE;
exports.MENTION_PARTIAL_QUEUE = process.env.MENTION_PARTIAL_QUEUE;
