const WAWebJS = require("whatsapp-web.js");
const SocketIO = require("socket.io");
const qr_image = require("qr-image");
const jwt = require("./utils/jwt");

const { delay, getAtSignVariable } = require("../src/helpers");

const Database = require("./apps/knex");
const tables = require("./models/tables");

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
    const { is_ready, is_authenticated, client, user } = global.whatsapp;
    if (user) {
      user.token = jwt.createToken(user);
      user.picture = await client.getProfilePicUrl(client.info.me._serialized);
    }
    io.emit("init", {
      from: "listener.js",
      whatsapp_ready: is_ready,
      is_authenticated,
      user,
    });

    // test
    const participants = await client.getContactById("120363130562078659@g.us");
  });
  client.on("disconnected", (reason) => {
    io.emit("authenticated", false);
  });

  client.on("message", async (msg) => {
    if (msg.body === "!ping") {
      msg.reply("pong");
      // client.sendMessage(msg.from, "pong");
    }
  });

  client.on("message_create", async (msg) => {
    const text = msg.body;
    const chat = await msg.getChat();

    if (chat.isGroup) {
      const isGroupExist = await Database(tables.groups)
        .select("id", "is_process", "is_sync")
        .where("id_serialized", chat.id._serialized)
        .first();
      const group_data = {
        name: chat.name,
        id_serialized: chat.id._serialized,
      };
      if (!isGroupExist) {
        await Database(tables.groups).insert(group_data);
        console.log("New Group", group_data);
      } else {
        if (!isGroupExist.is_process) {
          return; // skip nggak di perbolehkan
        }
        if (isGroupExist.is_sync) {
          const id_group = isGroupExist.id;
          let participants = chat.participants.map(
            (participant) => participant.id._serialized
          );
          const participants_sync = await Database(tables.contacts)
            .whereIn("number_serialized", participants)
            .pluck("number_serialized");
          participants = participants.filter(
            (participant) => !participants_sync.includes(participant)
          );
          if (participants.length > 0) {
            console.log(`New Participant from ${group_data.name}`, {
              participants,
            });
            participants = participants.map((number_serialized) => {
              return {
                number_serialized,
                sync_from_group: id_group,
              };
            });
            await Database(tables.contacts).insert(participants);
          } else {
            console.log(`No New Participant from ${group_data.name}`);
          }
          await Database(tables.groups)
            .where("id", id_group)
            .update({ is_sync: false });
        }
      }
    }

    if (chat.isGroup && String(text).includes("@")) {
      // Fired on all message creations, including your own
      const clubs = await Database(tables.clubs).pluck("name");
      const at_sign = getAtSignVariable(text, ["everyone"]);
      const club_available = clubs.filter((club) => at_sign.includes(club));

      if (club_available.length > 0) {
        let contacts = await Database(tables.contacts)
          .select(
            `${tables.contacts}.number_serialized`,
            `${tables.clubs}.name AS club_name`
          )
          .innerJoin(
            tables.club_of_contact,
            `${tables.club_of_contact}.id_contact`,
            `${tables.contacts}.id`
          )
          .innerJoin(
            tables.clubs,
            `${tables.clubs}.id`,
            `${tables.club_of_contact}.id_club`
          )
          .whereIn(`${tables.clubs}.name`, club_available);
        const get_serialized = chat.participants.map(
          (participant) => participant.id._serialized
        );
        contacts = contacts.filter((contact) =>
          get_serialized.includes(contact.number_serialized)
        );
        const club_of_contact = contacts.reduce((simpan, contact) => {
          const { club_name, number_serialized } = contact;
          if (simpan[club_name]) {
            simpan[club_name].push(number_serialized);
            return {
              ...simpan,
            };
          }
          return {
            ...simpan,
            [club_name]: [number_serialized],
          };
        }, {});
        const keys = Object.keys(club_of_contact);
        let mentions = []; // di kumpulin semua contact nya, kirim nya bareng2
        let text = "╠➥ 🚨🚨🚨 Bimsalabim... 🚨🚨🚨\n\n";
        for (let key of keys) {
          text += `#${String(key).toUpperCase()} : \n`;
          const contacts_of_club = club_of_contact[key];
          for (const contact_serialized of contacts_of_club) {
            const contact = await client.getContactById(contact_serialized);
            mentions.push(contact);
            text += `@${String(contact_serialized).split("@")[0]} `;
          }
          text += "\n\n";
        }
        text += "\n╚═〘 JeJep BOT 〙";
        await delay();
        await chat.sendMessage(text, { mentions });
      } else {
        if (String(text).includes("@everyone")) {
          let mentions = [];
          let text = "╠➥ 🚨🚨🚨 Hadirlah wahai kalian makhluk bumi 🚨🚨🚨\n";
          for (let participant of chat.participants) {
            const contact = await client.getContactById(
              participant.id._serialized
            );
            mentions.push(contact);
            text += `@${participant.id.user} `;
          }
          text += "\n╚═〘 JeJep BOT 〙";
          await delay();
          await chat.sendMessage(text, { mentions });
        }
      }
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
