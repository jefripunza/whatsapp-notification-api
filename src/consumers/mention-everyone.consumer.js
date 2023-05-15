const RabbitMQ = require("../apps/rabbitmq");
const { MENTION_EVERYONE_QUEUE } = require("../exchange-queue");
const { delay } = require("../helpers");

module.exports = () => {
  const Rabbit = new RabbitMQ();
  Rabbit.listen(
    MENTION_EVERYONE_QUEUE,
    async ({ id_serialized, text, mentions }, done, dead) => {
      try {
        const { is_ready, is_authenticated, client } = global.whatsapp;
        if (!is_ready || !is_authenticated) {
          done();
          return;
        }
        await client.sendMessage(id_serialized, text, { mentions });
        await delay(3000);
      } catch (error) {
        console.log("message-request", { error });
      } finally {
        done();
      }
    }
  );
};
