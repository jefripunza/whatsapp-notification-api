const WAWebJS = require("whatsapp-web.js");
const SocketIO = require("socket.io");
const qr_image = require("qr-image");
const jwt = require("./utils/jwt");

const { createPromise, getAtSignVariable } = require("../src/helpers");

const Database = require("./apps/knex");
const tables = require("./models/tables");

const RabbitMQ = require("./apps/rabbitmq");
const {
  MENTION_EVERYONE_EXCHANGE,
  MENTION_PARTIAL_EXCHANGE,
} = require("./exchange-queue");

const onLeave = require("./utils/onleave");

const list_tag_all_cmd = ["@everyone", "@here"];

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
    // check kapan di kirim, jangan ambil history, terblokir ntar
    const now = new Date();
    const time_save = new Date();
    time_save.setMinutes(time_save.getMinutes() - 1);
    const date_message = new Date(msg._data.t * 1000);
    if (time_save.getTime() >= date_message.getTime()) {
      console.log("history goblox...", date_message.toString());
      return;
    }
    console.log(time_save.toString(), ">=", date_message.toString());

    const participant_serialized = msg._data.id.participant;
    const text = msg.body;
    const chat = await msg.getChat();

    if (chat.isGroup) {
      const group_data = {
        name: chat.name,
        id_serialized: chat.id._serialized,
      };
      /**
       * @type{string[]}
       */
      let participants_serialized = chat.participants.map(
        (participant) => participant.id._serialized
      );

      // penjagaan processing dan kebutuhan sync contact
      const isGroupExist = await Database(tables.groups)
        .select("id", "is_process", "is_sync")
        .where("id_serialized", group_data.id_serialized)
        .first();
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

      /**
       * Get Club if Available
       * @type{string[]}
       */
      let club_available = [];
      if (String(text).includes("@")) {
        const clubs = await Database(tables.clubs).pluck("name");
        const at_sign = getAtSignVariable(text, ["everyone", "here"]);
        club_available = clubs.filter((club) => at_sign.includes(club));
      }

      // limiter
      let list_on_leave = [];
      if (
        list_tag_all_cmd.some((tag_all_cmd) =>
          String(text).includes(tag_all_cmd)
        ) ||
        club_available.length > 0
      ) {
        if (!msg.fromMe) {
          const requests = await Database(tables.request_limiter)
            .where("number_serialized", participant_serialized)
            .where("expired_at", ">=", now);
          console.log({
            participant_serialized,
            requests_length: requests.length,
          });
          if (requests.length < 3) {
            console.log("Insert to limiter...", { participant_serialized });
            const expired_at = new Date(now);
            expired_at.setMinutes(expired_at.getMinutes() + 1);
            await Database(tables.request_limiter).insert({
              number_serialized: participant_serialized,
              expired_at,
            });
          } else {
            // limit
            return;
          }

          // if on leave (OCR)
          // let profile_pictures = await createPromise(
          //   participants_serialized,
          //   async (id_serialized, i) => {
          //     return {
          //       id_serialized,
          //       image: await client.getProfilePicUrl(id_serialized),
          //     };
          //   }
          // );
          // profile_pictures = profile_pictures.reduce(
          //   (simpan, { id_serialized, image }) => {
          //     return {
          //       ...simpan,
          //       [id_serialized]: image,
          //     };
          //   },
          //   {}
          // );
          // list_on_leave = await onLeave(profile_pictures);
          // participants_serialized = participants_serialized.filter(
          //   (participant) => {
          //     const participant_match = list_on_leave.find(
          //       (v) => v.id == participant
          //     );
          //     return !participant_match.isOnLeave;
          //   }
          // );
        }
      }

      // Fired on all message creations, including your own
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
        contacts = contacts.filter(
          (contact) =>
            participants_serialized.includes(contact.number_serialized) // pake yg nggak on leave
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
            mentions.push({
              id: {
                _serialized: contact.id._serialized,
              },
            });
            text += `@${String(contact_serialized).split("@")[0]} `;
          }
          text += "\n\n";
        }
        text += "\n╚═〘 JeJep BOT 〙";
        if (mentions.length == 0) return; // skip, nggak ada yg di mention...
        const Rabbit = new RabbitMQ();
        await Rabbit.send(MENTION_PARTIAL_EXCHANGE, {
          id_serialized: group_data.id_serialized,
          text,
          mentions,
        });
      } else {
        if (
          list_tag_all_cmd.some((tag_all_cmd) =>
            String(text).includes(tag_all_cmd)
          )
        ) {
          let mentions = [];
          let text = "╠➥ 🚨🚨🚨 Hadirlah wahai kalian makhluk bumi 🚨🚨🚨\n";
          // pake yg nggak on leave
          for (let participant of participants_serialized) {
            const contact = await client.getContactById(participant);
            mentions.push({
              id: {
                _serialized: contact.id._serialized,
              },
            });
            text += `@${String(participant).split("@")[0]} `;
          }
          text += "\n╚═〘 JeJep BOT 〙";
          const Rabbit = new RabbitMQ();
          await Rabbit.send(MENTION_EVERYONE_EXCHANGE, {
            id_serialized: group_data.id_serialized,
            text,
            mentions,
          });
        }
      }
    }
  });

  // ==========================================================
  // ==========================================================
  // ==========================================================

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
