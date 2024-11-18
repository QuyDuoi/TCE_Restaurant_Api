const { Chi } = require("../models/chiModel");
const { CaLamViec } = require("../models/caLamViecModel");

// Thêm khoản chi
exports.them_chi = async (req, res, next) => {
  try {
    const { soTienChi, moTa, id_caLamViec } = req.body;

    // Kiểm tra xem ca làm việc có tồn tại không
    const caLamViec = await CaLamViec.findById(id_caLamViec);
    if (!caLamViec) {
      return res.status(404).json({ msg: "Ca làm việc không tồn tại" });
    }

    caLamViec.tongChi -= soTienChi;
    caLamViec.soDuHienTai -= soTienChi;

    await caLamViec.save();

    // Tạo khoản chi mới
    const chi = new Chi({
      soTienChi,
      moTa,
      id_caLamViec
    });

    const result = await chi.save();

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Cập nhật khoản chi
exports.cap_nhat_chi = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { soTienChi, moTa, id_caLamViec } = req.body;

    // Tìm khoản chi theo ID
    const chi = await Chi.findById(id);
    if (!chi) {
      return res.status(404).json({ msg: "Khoản chi không tồn tại" });
    }

    // Kiểm tra xem ca làm việc có tồn tại không
    if (id_caLamViec && id_caLamViec !== chi.id_caLamViec) {
      const caLamViec = await CaLamViec.findById(id_caLamViec);
      if (!caLamViec) {
        return res.status(404).json({ msg: "Ca làm việc không tồn tại" });
      }
      chi.id_caLamViec = id_caLamViec;
    }

    // Cập nhật các thông tin khác nếu có thay đổi
    if (soTienChi !== undefined) chi.soTienChi = soTienChi;
    if (moTa !== undefined) chi.moTa = moTa;

    const result = await chi.save();

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Xóa khoản chi
exports.xoa_chi = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Xóa khoản chi theo ID
    const chi = await Chi.findByIdAndDelete(id);
    if (!chi) {
      return res.status(404).json({ msg: "Khoản chi không tồn tại" });
    }

    res.status(200).json({ msg: "Đã xóa khoản chi" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Lấy danh sách khoản chi theo ca làm việc
exports.lay_ds_chi = async (req, res, next) => {
  try {
    const { id_caLamViec } = req.query;

    // Lọc khoản chi theo ca làm việc nếu có
    let filter = {};
    if (id_caLamViec) {
      filter.id_caLamViec = id_caLamViec;
    }

    const chis = await Chi.find(filter)
      .populate("id_caLamViec")
      .sort({ createdAt: -1 });

    res.status(200).json(chis);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
