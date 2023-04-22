const WhatsApp = require("./src/apps/whatsapp-web");
const client = new WhatsApp();

const { server } = require("./src/apps/express");

const { PORT } = require("./src/config");

require("./src/listener")(client);
server.listen(PORT, () => console.log(`Server listen at ${PORT}`));
