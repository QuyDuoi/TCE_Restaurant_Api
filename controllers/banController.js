const { Ban } = require("../models/banModel");
const { KhuVuc } = require("../models/khuVucModel");
const QRCode = require("qrcode");
const { NhaHang } = require("../models/nhaHangModel");
const { LichDatBan } = require("../models/lichDatBan");

// Thêm bàn
exports.them_ban = async (req, res, next) => {
  try {
    const { tenBan, sucChua, trangThai, ghiChu, id_khuVuc } = req.body;

    console.log(req.body);

    // Kiểm tra xem khu vực có tồn tại không
    const khuVuc = await KhuVuc.findById(id_khuVuc);
    if (!khuVuc) {
      return res.status(404).json({ msg: "Khu vực không tồn tại" });
    }

    // Tạo bàn mới
    const ban = new Ban({ tenBan, sucChua, trangThai, ghiChu, id_khuVuc });
    const result = await ban.save();

    res.status(201).json(result);
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

    if (trangThai === "Trống") {
      ban.trangThai = trangThai;
      ban.ghiChu = "";
      const phanHoi = await ban.save();
      return res.status(200).json(phanHoi);
    } else {
      // Kiểm tra và cập nhật thông tin bàn nếu có thay đổi
      if (tenBan !== undefined && tenBan !== ban.tenBan) {
        ban.tenBan = tenBan;
      }
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

      const result = await ban.save();

      res.status(200).json(result);
    }
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Xóa bàn
exports.xoa_ban = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Xóa bàn theo ID
    const ban = await Ban.findByIdAndDelete(id);
    if (!ban) {
      return res.status(404).json({ msg: "Bàn không tồn tại" });
    }

    res.status(200).json({ msg: "Đã xóa bàn" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
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

exports.tao_qr_code = async (req, res) => {
  try {
    const { id } = req.query;

    console.log(id);

    // Tìm thông tin bàn từ MongoDB
    const ban = await Ban.findById(id);

    console.log(ban);

    if (!ban) {
      return res.status(404).json({ msg: "Bàn không tồn tại" });
    }

    // URL hoặc nội dung bạn muốn mã hóa vào QR
    const qrContent = `https://localhost:3000/order?idBan=${id}`;

    // Tạo mã QR và lưu thành file
    const qrPath = `./public/qrcodes/qrcode_ban_${id}.png`;
    await QRCode.toFile(qrPath, qrContent);

    // (Tùy chọn) Lưu URL file QR vào trường maQRCode
    const qrUrl = `https://localhost:3000/qrcodes/qrcode_ban_${id}.png`;

    // Cập nhật maQRCode của bàn
    ban.maQRCode = qrUrl;
    await ban.save();

    res.json({
      msg: "Mã QR đã được tạo và cập nhật",
      maQRCode: qrUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      msg: "Lỗi khi tạo mã QR",
      error: err.message,
    });
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

    const lichDatBans = await LichDatBan.find({ id_nhaHang }).sort({
      createdAt: -1,
    });

    if (!lichDatBans) {
      return res
        .status(400)
        .json({ msg: "Không có lịch đặt bàn trong nhà hàng!" });
    } else {
      return res.status(200).json(lichDatBans);
    }
  } catch (error) {
    return res.status(400).json({ msg: error.message });
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
