const { Ban } = require("../models/banModel");
const { KhuVuc } = require("../models/khuVucModel");

// Thêm bàn
exports.them_ban = async (req, res, next) => {
  try {
    const { tenBan, sucChua, trangThai, ghiChu, id_khuVuc } = req.body;

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
    const { tenBan, sucChua, trangThai,ghiChu, id_khuVuc } = req.body;

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

    // Lọc bàn theo khu vực nếu có
    let filter = {};
    if (id_khuVuc) {
      filter.id_khuVuc = id_khuVuc;
    }

    const bans = await Ban.find(filter).populate("id_khuVuc").sort({ createdAt: -1 });

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
