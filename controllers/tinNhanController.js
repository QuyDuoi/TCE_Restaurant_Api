const { TinNhan } = require("../models/tinNhanModel"); // Model tin nhắn

// Gửi tin nhắn
exports.guiTinNhan = async (messageData) => {
  const { id_ban, noiDung, nguoiGui, id_nhanVien } = messageData;

  try {
    // Tạo tin nhắn mới
    const newMessage = new TinNhan({
      id_ban,
      noiDung,
      nguoiGui,
      trangThai: false, // Mặc định là chưa đọc
      id_nhanVien: id_nhanVien || null,
    });

    // Lưu vào cơ sở dữ liệu
    const savedMessage = await newMessage.save();

    return savedMessage; // Trả về tin nhắn đã lưu
  } catch (error) {
    console.error("Lỗi khi lưu tin nhắn:", error);
    throw new Error("Đã xảy ra lỗi trong quá trình lưu tin nhắn.");
  }
};

// Cập nhật trạng thái đã đọc
exports.capNhatTrangThaiDaDoc = async (req, res) => {
  try {
    const { id_ban, id_nhanVien } = req.body;

    if (!id_ban || !id_nhanVien) {
      return res
        .status(400)
        .json({ msg: "ID bàn hoặc ID nhân viên không hợp lệ!" });
    }

    // Cập nhật tất cả tin nhắn của bàn thành đã đọc và gán id_nhanVien
    const result = await TinNhan.updateMany(
      { id_ban, trangThai: false },
      { $set: { trangThai: true, id_nhanVien } }
    );

    res.status(200).json({
      msg: "Trạng thái tin nhắn đã được cập nhật thành đã đọc!",
      data: result,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái đã đọc:", error);
    res.status(500).json({ msg: "Đã xảy ra lỗi khi cập nhật trạng thái." });
  }
};

// Lấy danh sách tin nhắn
exports.lay_Danh_Sach_Tin_Nhan = async (req, res) => {
  try {
    const { id_ban } = req.query;

    if (!id_ban) {
      return res.status(400).json({ msg: "ID bàn không hợp lệ!" });
    }

    // Lấy danh sách tin nhắn theo ID bàn, sắp xếp theo thời gian
    const messages = await TinNhan.find({ id_ban })
      .populate("id_nhanVien", "hoTen hinhAnh") // Populate thông tin nhân viên nếu có
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tin nhắn:", error);
    res.status(500).json({ msg: "Đã xảy ra lỗi khi lấy danh sách tin nhắn." });
  }
};
