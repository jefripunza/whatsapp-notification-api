const SocketIO = require("socket.io");

/**
 * Socket IO Listener
 * @param {SocketIO.Server} io
 */
module.exports = (io) => {
  io.on("connection", (socket) => {
    const id = socket.id;
    // console.log(`user ${id} connected`);
    // socket.on("disconnect", () => {
    //   console.log(`user ${id} disconnected`);
    // });

    const { is_ready, is_authenticated, qr_image, my } = global.whatsapp;
    socket.emit("init", { whatsapp_ready: is_ready, is_authenticated, my });
    if (qr_image) socket.emit("qr", qr_image);
  });
};
