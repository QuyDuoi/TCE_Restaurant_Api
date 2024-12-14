const { Ban } = require("../models/banModel");
const { KhuVuc } = require("../models/khuVucModel");
const QRCode = require("qrcode");
const { NhaHang } = require("../models/nhaHangModel");
const { LichDatBan } = require("../models/lichDatBan");
const { NhanVien } = require("../models/nhanVienModel");
const { CaLamViec } = require("../models/caLamViecModel");
const io = require("../bin/www");

// Thêm bàn
exports.them_ban_va_qrcode = async (req, res, next) => {
  try {
    const { tenBan, sucChua, trangThai, ghiChu, id_khuVuc } = req.body;

    console.log(req.body);

    // Kiểm tra xem khu vực có tồn tại không
    const khuVuc = await KhuVuc.findById(id_khuVuc);
    if (!khuVuc) {
      return res.status(404).json({ msg: "Khu vực không tồn tại" });
    }

    // Kiểm tra xem tên bàn đã tồn tại trong khu vực chưa
    const existingBan = await Ban.findOne({ tenBan, id_khuVuc });
    if (existingBan) {
      return res
        .status(400)
        .json({ msg: "Tên bàn đã tồn tại trong khu vực này" });
    }

    // Tạo bàn mới
    const ban = new Ban({ tenBan, sucChua, trangThai, ghiChu, id_khuVuc });
    const savedBan = await ban.save(); // Lưu bàn vào database
    const idBan = savedBan._id;

    // URL hoặc nội dung bạn muốn mã hóa vào QR
    const qrContent = `https://tce-restaurant-api.onrender.com/order?idBan=${idBan}`;

    // Tạo mã QR và lưu thành file
    const qrPath = `./public/qrcodes/qrcode_ban_${idBan}.png`;
    await QRCode.toFile(qrPath, qrContent);

    // Tạo URL của mã QR để lưu vào database
    const qrUrl = `https://localhost:3000/qrcodes/qrcode_ban_${idBan}.png`;

    // Cập nhật URL mã QR cho bàn
    savedBan.maQRCode = qrUrl;
    await savedBan.save();

    res.status(201).json({
      msg: "Tạo bàn và mã QR thành công",
      ban: savedBan,
    });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Cập nhật bàn
exports.cap_nhat_ban = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenBan, sucChua, trangThai, ghiChu, id_khuVuc } = req.body;

    // Tìm bàn theo ID
    const ban = await Ban.findById(id);
    if (!ban) {
      return res.status(404).json({ msg: "Bàn không tồn tại" });
    }

    // Kiểm tra xem khu vực mới có tồn tại không
    const khuVuc = await KhuVuc.findById(id_khuVuc);
    if (!khuVuc) {
      return res.status(404).json({ msg: "Khu vực không tồn tại" });
    }

    // Kiểm tra xem tên bàn có trùng trong khu vực không
    if (tenBan !== undefined && tenBan !== ban.tenBan) {
      const existingBan = await Ban.findOne({ tenBan, id_khuVuc });
      if (existingBan) {
        return res
          .status(400)
          .json({ msg: "Tên bàn đã tồn tại trong khu vực này" });
      }
      ban.tenBan = tenBan; // Cập nhật tên bàn nếu không trùng
    }

    // Kiểm tra và cập nhật các trường khác
    if (sucChua !== undefined && sucChua !== ban.sucChua) {
      ban.sucChua = sucChua;
    }
    if (trangThai !== undefined && trangThai !== ban.trangThai) {
      ban.trangThai = trangThai;
    }
    if (ghiChu !== undefined && ghiChu !== ban.ghiChu) {
      ban.ghiChu = ghiChu;
    }
    if (id_khuVuc !== undefined && id_khuVuc !== ban.id_khuVuc) {
      ban.id_khuVuc = id_khuVuc;
    }

    // Nếu trạng thái là "Trống", xóa ghi chú
    if (trangThai === "Trống") {
      ban.trangThai = trangThai;
      ban.ghiChu = "";
    }

    // Lưu lại thông tin bàn đã cập nhật
    const result = await ban.save();

    const io = req.app.get("io");
    io.emit("capNhatBan", {
      msg: "Cập nhật thông tin bàn!",
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Xóa bàn
exports.xoa_ban = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id_nhanVien, id_nhaHang } = req.body;

    // Kiểm tra vai trò của nhân viên
    const nhanVien = await NhanVien.findById(id_nhanVien);

    if (!nhanVien) {
      return res.status(404).json({ msg: "Không tìm thấy nhân viên!" });
    }

    if (nhanVien.vaiTro !== "Quản lý") {
      return res.status(403).json({ msg: "Chỉ Quản lý mới có quyền xóa bàn!" });
    }

    // Kiểm tra trạng thái của ca làm việc
    const caLamHienTai = await CaLamViec.findOne({
      id_nhaHang: id_nhaHang,
      ketThuc: null,
    });

    if (caLamHienTai) {
      return res.status(404).json({
        msg: "Ca làm việc hiện tại chưa kết thúc, không thể xóa bàn!",
      });
    }

    // Xóa bàn theo ID
    const ban = await Ban.findByIdAndDelete(id);
    if (!ban) {
      return res.status(404).json({ msg: "Bàn không tồn tại!" });
    }

    res.status(200).json(ban);
  } catch (error) {
    console.error("Lỗi khi xóa bàn:", error);
    res.status(500).json({ msg: "Lỗi server", error: error.message });
  }
};

// Lấy danh sách bàn theo khu vực
exports.lay_ds_ban = async (req, res, next) => {
  try {
    const { id_khuVuc } = req.query;

    const bans = await Ban.find({ id_khuVuc })
      .populate("id_khuVuc")
      .sort({ createdAt: -1 });

    res.status(200).json(bans);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

exports.tim_kiem_ban = async (req, res, next) => {
  try {
    const { textSearch } = req.query;

    // Kiểm tra nếu có từ khóa tìm kiếm và thiết lập tiêu chí tìm kiếm với regex
    const searchCriteria = textSearch
      ? { tenBan: { $regex: textSearch, $options: "i" } } // Tìm kiếm không phân biệt hoa thường
      : {};

    // Tìm các món ăn với tên khớp tiêu chí tìm kiếm
    const results = await Ban.find(searchCriteria);
    res.status(200).json(results);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

exports.tao_lich_hen = async (req, res) => {
  try {
    const { hoTen, thoiGian, ghiChu, id_nhaHang } = req.body;

    const nhaHang = await NhaHang.findOne({ _id: id_nhaHang });

    if (!nhaHang) {
      return res.status(400).json({ msg: "Không tìm thấy nhà hàng!" });
    }

    const lichHen = new LichDatBan({ hoTen, thoiGian, ghiChu, id_nhaHang });
    await lichHen.save();

    const lichDatBans = await LichDatBan.find().sort({ createdAt: -1 });
    return res.status(200).json(lichDatBans);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};

exports.lay_ds_lich_hen = async (req, res) => {
  try {
    const { id_nhaHang } = req.query;

    // Lấy danh sách lịch đặt bàn trong tương lai
    const lichDatBans = await LichDatBan.find({
      id_nhaHang,
      ngayDat: { $gte: new Date() }, // Chỉ lấy lịch hẹn trong tương lai
    }).sort({ ngayDat: 1 }); // Sắp xếp tăng dần theo ngày đặt

    if (!lichDatBans || lichDatBans.length === 0) {
      return res
        .status(404)
        .json({ msg: "Không có lịch đặt bàn nào trong thời gian tới!" });
    }

    return res.status(200).json(lichDatBans);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách lịch hẹn:", error);
    return res.status(500).json({ msg: "Lỗi server", error: error.message });
  }
};

exports.xoa_lich_hen = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_nhaHang } = req.body;

    const lichHen = await LichDatBan.findByIdAndDelete({ _id: id, id_nhaHang });

    if (!lichHen) {
      return res
        .status(400)
        .json({ msg: "Không tồn tại lịch đặt bàn trong nhà hàng!" });
    } else {
      return res.status(200).json({ msg: "Đã xóa lịch đặt bàn." });
    }
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};
