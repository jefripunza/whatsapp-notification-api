const { PORT } = require("./src/config");

const WhatsApp = require("./src/apps/whatsapp-web");
const { client } = new WhatsApp();

const { server, io } = require("./src/apps/express");

require("./src/listener")(client, io);
require("./src/websocket")(io);

server.listen(PORT, () => console.log(`Server listen at ${PORT}`));
