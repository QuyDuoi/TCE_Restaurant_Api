// config/socket.js
const socketIo = require("socket.io");
const { guiTinNhan } = require("../controllers/tinNhanController");
const { TinNhan } = require("../models/tinNhanModel");

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

    // Nhận thông tin người dùng khi kết nối
    socket.on("NhanDien", ({ role, id_ban }) => {
      if (role === "KhachHang") {
        socket.join(`ban_${id_ban}`);
        console.log(`Khách đã vào bàn_${id_ban}`);
      } else if (role === "NhanVien") {
        socket.join("NhanViens");
        console.log("Có một nhân viên đã vào phòng");
      } else if (role === "DauBep") {
        socket.join("DauBeps");
        console.log("Có 1 đầu bếp vào");
        
      } else if (role === "PhucVuBan") {
        socket.join(`PhucVuBan_${id_ban}`);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });

    // Lắng nghe sự kiện sendMessage từ client
    socket.on("khachGuiTin", async (messageData) => {
      try {
        // Lưu tin nhắn vào cơ sở dữ liệu
        const savedMessage = await guiTinNhan(messageData);

        // Gửi tin nhắn mới đến tất cả nhân viên
        io.to("NhanViens").emit("tinNhanMoiCuaKhach", savedMessage);
      } catch (error) {
        console.error("Error processing message:", error);
      }
    });

    // Xử lý tin nhắn từ nhân viên
    socket.on("nhanVienGuiTin", async (messageData) => {
      const { id_ban, noiDung, id_nhanVien } = messageData;
      try {
        // Lưu tin nhắn vào cơ sở dữ liệu
        const savedMessage = await guiTinNhan(messageData);

        // Gửi tin nhắn mới đến khách hàng cụ thể (phòng bàn)
        io.to(`ban_${id_ban}`).emit("tinNhanMoiCuaNv", savedMessage);
      } catch (error) {
        console.error("Error handling employeeMessage:", error);
      }
    });

    socket.on("docTinNhan", async ({ id_ban, id_nhanVien }) => {
      try {
        // Cập nhật trạng thái đã đọc và gán id_nhanVien
        await TinNhan.updateMany(
          { id_ban, trangThai: false },
          { $set: { trangThai: true, id_nhanVien } }
        );

        // Gửi thông báo cập nhật cho phòng
        io.to(`ban_${id_ban}`).emit("nhanVienDaDoc", { id_ban, id_nhanVien });

        console.log(
          `Messages for bàn ${id_ban} marked as read by nhân viên ${id_nhanVien}`
        );
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });
  });

  return io;
};
