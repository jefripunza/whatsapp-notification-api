const SocketIO = require("socket.io");
const jwt = require("./utils/jwt");

/**
 * Socket IO Listener
 * @param {SocketIO.Server} io
 */
module.exports = (io) => {
  io.on("connection", async (socket) => {
    const id = socket.id;
    // console.log(`user ${id} connected`);
    // socket.on("disconnect", () => {
    //   console.log(`user ${id} disconnected`);
    // });

    const { is_ready, is_authenticated, qr_image, client, user } =
      global.whatsapp;
    if (qr_image) socket.emit("qr", qr_image);
    if (user) {
      user.token = jwt.createToken(user);
      user.picture = await client.getProfilePicUrl(client.info.me._serialized);
    }
    socket.emit("init", {
      from: "websocket.js",
      whatsapp_ready: is_ready,
      is_authenticated,
      user,
    });
  });
};
