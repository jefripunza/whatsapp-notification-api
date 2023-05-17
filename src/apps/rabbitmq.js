const fs = require("fs");
const path = require("path");
const amqp = require("amqplib");
const { RABBIT_HOST, consumers_dir } = require("../config");

let first = true;
class RabbitMQ {
  connection;
  channel;

  async init() {
    try {
      const connection = await amqp.connect(RABBIT_HOST, "heartbeat=60");
      this.connection = connection;
      const channel = await connection.createChannel();
      // channel.reject()
      this.channel = channel;
      if (first) {
        const [credential, host] = String(RABBIT_HOST)
          .split("://")[1]
          .split("@");
        const [username, password] = String(credential).split(":");
        const view_host = ["localhost", "host.docker.internal"].some(
          (localhost_docker) => String(RABBIT_HOST).includes(localhost_docker)
        )
          ? RABBIT_HOST
          : `amqp://${this.#createHideDot(username)}:${this.#createHideDot(
              password
            )}@${host}`;
        console.log(`✅ Rabbit Connected on ${view_host}`);
        this.#run_consumers();
        first = false;
      }
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  }
  #createHideDot = (value) => {
    return [...Array(value.length).keys()].map((v) => "*").join("");
  };

  async #run_consumers() {
    const run = async () => {
      if (!fs.existsSync(consumers_dir)) return;
      await fs
        .readdirSync(consumers_dir)
        .filter(
          (consumer_filename) => !String(consumer_filename).startsWith("#")
        )
        .forEach(async (consumer_filename) => {
          const consumer_name = String(consumer_filename)
            .split(".")[0]
            .split("-")
            .map((v) => String(v)[0].toUpperCase() + String(v).slice(1))
            .join(" ");
          require(path.join(consumers_dir, consumer_filename))(); // execute
          console.log(`✅ Consumer : ${consumer_name} is Ready!`);
        });
    };
    const interval = setInterval(() => {
      const whatsapp = global.whatsapp;
      if (whatsapp) {
        run();
        clearInterval(interval);
      }
    }, 1000);
  }

  /**
   * Publish message to exchange
   */
  async send(exchange, msg) {
    const routingKey = "";
    try {
      await this.init();
      await this.channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(msg)),
        {
          persistent: true,
        }
      );
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setTimeout(() => {
        this.channel.close();
        this.connection.close();
      }, 500);
    }
  }

  /**
   * Listen message from queue
   */
  async listen(queue, receive) {
    try {
      await this.init();
      // await this.channel.assertQueue(queue, { durable: true });
      await this.channel.prefetch(1);
      this.channel.consume(queue, (data) => {
        if (data) {
          const ack = () => {
            this.channel.ack(data);
          };
          const reject = () => {
            this.channel.reject(data, false);
          };
          receive(
            JSON.parse(Buffer.from(data.content).toString()),
            ack,
            reject
          );
        }
      });
    } catch (error) {
      console.log(queue, error);
    }
  }
}

// Init
const Rabbit = new RabbitMQ();
Rabbit.init();

module.exports = RabbitMQ;
