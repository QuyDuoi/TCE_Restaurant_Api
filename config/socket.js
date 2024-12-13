// config/socket.js
const socketIo = require("socket.io");

module.exports = function (server) {
  const io = socketIo(server, {
    cors: {
      origin: "*", // Cho phép tất cả các nguồn, bạn có thể giới hạn theo yêu cầu
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["my-custom-header"],
      credentials: true, // Nếu bạn cần gửi cookie từ frontend
    },
  });

  console.log("Socket.IO initialized");

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });

    socket.on("chat message", (msg) => {
      console.log("Message received: " + msg);
      io.emit("chat message", msg);
    });

    socket.on("new order", (orderData) => {
      console.log("New order received: ", orderData);
      io.emit("new order", orderData);
    });
  });

  return io;
};
