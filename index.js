const WhatsApp = require("./src/apps/whatsapp-web");
const { client } = new WhatsApp();
const { io } = require("./src/apps/express");

require("./src/listener")(client, io);
require("./src/websocket")(io);
require("./src/apps/rabbitmq");
