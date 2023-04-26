const WAWebJS = require("whatsapp-web.js");
const {
  Client,
  LocalAuth,

  // MessageContent
  MessageMedia,
  Location,
  List,
  Buttons,
} = require("whatsapp-web.js");
const locateChrome = require("locate-chrome");

const qrcode = require("qrcode-terminal");
const qr_image = require("qr-image");

class WhatsApp {
  is_ready = false;
  is_authenticated = false;
  auth_failure_reason = null;
  qr_image = null;
  user = null;

  constructor(clientId = "my-self") {
    const client = new Client({
      puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
      authStrategy: new LocalAuth({ clientId }),
    });
    client.initialize();

    client.on("loading_screen", (percent, message) => {
      console.log("WhatsApp: LOADING SCREEN", percent, message);
    });
    client.on("qr", (qr) => {
      this.is_ready = false;
      qr = qr_image.imageSync(qr, { type: "png" });
      qr = btoa(
        new Uint8Array(qr).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
      this.qr_image = qr;
    });
    client.on("authenticated", () => {
      console.log("WhatsApp: AUTHENTICATED");
      this.is_authenticated = true;
    });
    client.on("ready", async () => {
      console.log("✅ WhatsApp is ready!");
      this.is_ready = true;
      this.qr_image = null;
      this.user = {
        name: client.info.pushname,
        number: client.info.me.user,
        number_format: client.info.me._serialized,
      };
    });
    client.on("auth_failure", (msg) => {
      console.error("WhatsApp: AUTHENTICATION FAILURE", msg);
      this.is_authenticated = false;
      this.auth_failure_reason = msg;
    });
    client.on("disconnected", (reason) => {
      console.log("WhatsApp was logged out, reason:", reason);
      process.exit(1);
    });

    this.client = client;
    global.whatsapp = this;
  }

  formatter = (number, standard = "@c.us") => {
    let formatted = number;
    // const standard = '@c.us'; // @s.whatsapp.net / @c.us
    if (!String(formatted).endsWith("@g.us")) {
      // isGroup ? next
      // 1. Menghilangkan karakter selain angka
      formatted = number.replace(/\D/g, "");
      // 2. Menghilangkan angka 62 di depan (prefix)
      //    Kemudian diganti dengan 0
      if (formatted.startsWith("0")) {
        formatted = "62" + formatted.slice(1);
      }
      // 3. Tambahkan standar pengiriman whatsapp
      if (!String(formatted).endsWith(standard)) {
        formatted += standard;
      }
    }
    return formatted;
  };

  QRCodeTerminal() {
    this.client.on("qr", (qr) => {
      qrcode.generate(qr, { small: true });
    });
  }

  /**
   * Get Media from Message
   * @param {WAWebJS.Message} msg
   */
  async getMedia(msg) {
    if (msg.hasMedia) {
      const media = await msg.downloadMedia();
      console.log({ media });
    }
  }

  /**
   * Send Media
   * @param {string} chatId
   * @param {string} mimetype ex: "image/png"
   * @param {string} base64Image
   */
  async sendMedia(chatId, mimetype, base64Image) {
    if (!this.is_ready) return [true, "whatsapp not ready"];
    await this.client.sendMessage(
      chatId,
      new MessageMedia(mimetype, base64Image)
    );
    return [false, null];
  }

  /**
   * Send Media with Reply
   * @param {WAWebJS.Message} msg
   * @param {string} mimetype ex: "image/png"
   * @param {string} base64Image
   */
  async sendMediaReply(msg, mimetype, base64Image) {
    if (!this.is_ready) return [true, "whatsapp not ready"];
    await msg.reply(new MessageMedia(mimetype, base64Image));
    return [false, null];
  }

  /**
   * Send Location
   * @param {string} chatId
   * @param {number} latitude
   * @param {number} longitude
   * @param {string|undefined} description
   */
  async sendLocation(chatId, latitude, longitude, description = undefined) {
    if (!this.is_ready) return [true, "whatsapp not ready"];
    await this.client.sendMessage(
      chatId,
      new Location(latitude, longitude, description)
    );
    return [false, null];
  }

  /**
   * Send Location with Reply
   * @param {WAWebJS.Message} msg
   * @param {number} latitude
   * @param {number} longitude
   * @param {string|undefined} description
   */
  async sendLocationReply(msg, latitude, longitude, description = undefined) {
    if (!this.is_ready) return [true, "whatsapp not ready"];
    await msg.reply(new Location(latitude, longitude, description));
    return [false, null];
  }

  /**
   * Send Contact
   * @param {string} chatId
   */
  async sendContact(chatId) {
    if (!this.is_ready) return [true, "whatsapp not ready"];
    await this.client.sendMessage(chatId);
    return [false, null];
  }

  /**
   * Send List Message
   *
   * @typedef Rows
   * @prop {string} title judul list
   * @prop {string} description isi list
   *
   * @typedef Section
   * @prop {string} title judul per sesi
   * @prop {Rows[]} rows list per sesi
   *
   * @param {string} chatId
   * @param {string} body
   * @param {string} buttonText
   * @param {Section[]} sections
   * @param {string | null | undefined} title
   * @param {string | null | undefined} footer
   */
  async sendList(
    chatId,
    body,
    buttonText,
    sections,
    title = undefined,
    footer = undefined
  ) {
    // const sections = [
    //   {
    //     title: "sectionTitle",
    //     rows: [
    //       { title: "ListItem1", description: "desc" },
    //       { title: "ListItem2" },
    //     ],
    //   },
    // ];
    if (!this.is_ready) return [true, "whatsapp not ready"];
    await this.client.sendMessage(
      chatId,
      new List(body, buttonText, sections, title, footer)
    );
    return [false, null];
  }

  /**
   * Send Button
   *
   * @typedef Buttons
   * @prop {string} body nama button
   *
   * @param {string} chatId
   * @param {string} body
   * @param {Buttons[]} buttons
   * @param {string | null | undefined} title
   * @param {string | null | undefined} footer
   */
  async sendButton(
    chatId,
    body,
    buttons,
    title = undefined,
    footer = undefined
  ) {
    if (!this.is_ready) return [true, "whatsapp not ready"];
    await this.client.sendMessage(
      chatId,
      new Buttons(body, buttons, title, footer)
    );
    return [false, null];
  }
}

module.exports = WhatsApp;
