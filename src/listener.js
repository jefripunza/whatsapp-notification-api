const WAWebJS = require("whatsapp-web.js");
const SocketIO = require("socket.io");
const qr_image = require("qr-image");

/**
 * WhatsApp Listener
 * @param {WAWebJS.Client} client
 * @param {SocketIO.Server} io
 */
module.exports = (client, io) => {
  client.on("qr", (qr) => {
    qr = qr_image.imageSync(qr, { type: "png" });
    qr = btoa(
      new Uint8Array(qr).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );
    io.emit("qr", qr);
  });
  client.on("loading_screen", (percent, message) => {
    io.emit("loading_screen", `${message} ${percent}%`);
  });
  client.on("authenticated", () => {
    io.emit("authenticated", true);
  });
  client.on("ready", async () => {
    const { is_ready, is_authenticated, my } = global.whatsapp;
    io.emit("init", { whatsapp_ready: is_ready, is_authenticated, my });
  });
  client.on("disconnected", (reason) => {
    io.emit("authenticated", false);
  });

  client.on("message", (message) => {
    if (message.body === "!ping") {
      message.reply("pong");
      // client.sendMessage(message.from, "pong");
    }
  });

  // ==========================================================
  // ==========================================================
  // ==========================================================

  // client.on("message_create", (msg) => {
  //   // Fired on all message creations, including your own
  //   if (msg.fromMe) {
  //     // do stuff here
  //   }
  // });

  // client.on("message_revoke_everyone", async (after, before) => {
  //   // Fired whenever a message is deleted by anyone (including you)
  //   console.log({ after }); // message after it was deleted.
  //   if (before) {
  //     console.log({ before }); // message before it was deleted.
  //     if (before.hasMedia) {
  //       const msg = before._data;
  //       // do something with the media data here
  //       // 0

  //       // 1
  //       // const base64 = msg.body;
  //       // const buffer = Buffer.from(base64, "base64");
  //       // fs.writeFileSync("new-path.jpg", buffer);

  //       // 2
  //       // const mediaUrl = msg.clientUrl || msg.deprecatedMms3Url;
  //       // if (!mediaUrl) return undefined;
  //       // const buffer = await axios(mediaUrl, {
  //       //   responseType: "arraybuffer",
  //       // }).then((res) => res.data);
  //       // const decrypted = await window.Store.CryptoLib.decryptE2EMedia(
  //       //   msg.type,
  //       //   buffer,
  //       //   msg.mediaKey,
  //       //   msg.mimetype
  //       // );
  //       // const data = await window.WWebJS.readBlobAsync(decrypted._blob);
  //       // console.log({ buffer });
  //     }
  //   }
  // });

  // client.on("group_join", (notification) => {
  //   // User has joined or been added to the group.
  //   console.log("join", notification);
  //   notification.reply("User joined.");
  // });

  // client.on("change_state", (state) => {
  //   console.log("CHANGE STATE", state);
  // });

  // client.on("group_admin_changed", (notification) => {
  //   if (notification.type === "promote") {
  //     /**
  //      * Emitted when a current user is promoted to an admin.
  //      * {@link notification.author} is a user who performs the action of promoting/demoting the current user.
  //      */
  //     console.log(`You were promoted by ${notification.author}`);
  //   } else if (notification.type === "demote")
  //     /** Emitted when a current user is demoted to a regular user. */
  //     console.log(`You were demoted by ${notification.author}`);
  // });
};
