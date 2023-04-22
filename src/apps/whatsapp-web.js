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

const qrcode = require("qrcode-terminal");

class WhatsApp {
  is_ready = false;
  is_authenticated = false;
  auth_failure_reason = null;

  constructor(clientId = "my-self") {
    const client = new Client({
      authStrategy: new LocalAuth({ clientId }),
    });
    client.initialize();

    client.on("loading_screen", (percent, message) => {
      console.log("WhatsApp: LOADING SCREEN", percent, message);
    });
    client.on("authenticated", () => {
      console.log("WhatsApp: AUTHENTICATED");
      this.is_authenticated = true;
    });
    client.on("ready", async () => {
      console.log("WhatsApp is ready!");
      this.is_ready = true;
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

    global.whatsapp = client;
    this._client = client;
    return client;
  }

  QRCodeTerminal(cb = false) {
    this._client.on("qr", (qr) => {
      if (cb) cb(qr);
      qrcode.generate(qr, { small: true });
      this.is_ready = false;
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
    await this._client.sendMessage(
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
    await this._client.sendMessage(
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
    await this._client.sendMessage(chatId);
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
    await this._client.sendMessage(
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
    await this._client.sendMessage(
      chatId,
      new Buttons(body, buttons, title, footer)
    );
    return [false, null];
  }
}

module.exports = WhatsApp;
