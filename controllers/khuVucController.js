const { Ban } = require("../models/banModel");
const { KhuVuc } = require("../models/khuVucModel");

// Thêm khu vực
exports.them_khu_vuc = async (req, res, next) => {
  try {
    const { tenKhuVuc, id_nhaHang } = req.body;

    const timKhuVuc = await KhuVuc.findOne({
      tenKhuVuc: tenKhuVuc,
    });

    if (timKhuVuc) {
      return res.status(400).json({ msg: "Tên khu vực đã tồn tại!" });
    }

    const khuVuc = new KhuVuc({ tenKhuVuc, id_nhaHang });
    const result = await khuVuc.save();

    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};

// Cập nhật khu vực
exports.cap_nhat_khu_vuc = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenKhuVuc, id_nhaHang } = req.body;

    const khuVuc = await KhuVuc.findById(id);
    if (!khuVuc) {
      return res.status(404).json({ msg: "Khu vực không tồn tại" });
    }
    // Kiểm tra và cập nhật thông tin khu vực nếu có thay đổi
    if (tenKhuVuc !== undefined && tenKhuVuc !== khuVuc.tenKhuVuc) {
      khuVuc.tenKhuVuc = tenKhuVuc;
    }
    if (id_nhaHang !== undefined && id_nhaHang !== khuVuc.id_nhaHang) {
      khuVuc.id_nhaHang = id_nhaHang;
    }

    const result = await khuVuc.save();

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Xóa khu vực
exports.xoa_khu_vuc = async (req, res, next) => {
  try {
    const { id } = req.params;

    const khuVuc = await KhuVuc.findByIdAndDelete(id);
    if (!khuVuc) {
      return res.status(404).json({ msg: "Khu vực không tồn tại" });
    }

    res.status(200).json({ msg: "Đã xóa khu vực" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Lấy danh sách khu vực
exports.lay_ds_khu_vuc = async (req, res, next) => {
  try {
    const { id_nhaHang } = req.query;

    if (!id_nhaHang) {
      return res.status(400).json({ msg: "Không có thông tin id_nhaHang!" });
    }

    const khuVucs = await KhuVuc.find({ id_nhaHang }).sort({ createdAt: -1 });

    // Lấy danh sách món ăn cho từng danh mục
    const khuVucVaBans = await Promise.all(
      khuVucs.map(async (khuVuc) => {
        const bans = await Ban.find({ id_khuVuc: khuVuc._id }).sort({
          createdAt: -1,
        });
        return { ...khuVuc.toObject(), bans };
      })
    );

    console.log(khuVucVaBans);

    res.status(200).json(khuVucVaBans);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
