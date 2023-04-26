const RabbitMQ = require("../apps/rabbitmq");
const { RABBIT_MESSAGE_REQUESTS_QUEUE } = require("../exchange-queue");
const { delay } = require("../helpers");

module.exports = () => {
  const Rabbit = new RabbitMQ();
  Rabbit.listen(
    RABBIT_MESSAGE_REQUESTS_QUEUE,
    async ({ phone_number, message }, done, dead) => {
      const { is_ready, is_authenticated, client } = global.whatsapp;
      if (!is_ready || !is_authenticated) {
        dead();
        return;
      }
      await client.sendMessage(phone_number, message);
      await delay(5000);
      done();
    }
  );
};
