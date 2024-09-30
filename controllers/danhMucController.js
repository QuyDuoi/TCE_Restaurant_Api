const { DanhMuc } = require("../models/danhMucModel");

// Thêm danh mục
exports.them_danh_muc = async (req, res, next) => {
  try {
    const { tenDanhMuc, id_store } = req.body;

    // Kiểm tra nếu danh mục đã tồn tại cho cửa hàng này
    const checkDanhMuc = await DanhMuc.findOne({ tenDanhMuc, id_store });
    if (checkDanhMuc) {
      return res
        .status(400)
        .json({ msg: "Danh mục đã tồn tại cho cửa hàng này" });
    }

    const danhMuc = new DanhMuc({ tenDanhMuc, id_store });
    const result = await danhMuc.save();

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Cập nhật danh mục
exports.cap_nhat_danh_muc = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenDanhMuc, id_store } = req.body;

    // Kiểm tra danh mục có tồn tại cho cửa hàng này không
    const danhMuc = await DanhMuc.findOne({ _id: id, id_store });
    if (!danhMuc) {
      return res
        .status(404)
        .json({ msg: "Danh mục không tồn tại cho cửa hàng này" });
    }

    // Kiểm tra nếu danh mục mới đã tồn tại cho cửa hàng này (ngoại trừ danh mục hiện tại)
    const checkDanhMuc = await DanhMuc.findOne({ tenDanhMuc, id_store });
    if (checkDanhMuc && checkDanhMuc._id.toString() !== id) {
      return res
        .status(400)
        .json({ msg: "Danh mục đã tồn tại cho cửa hàng này" });
    }

    danhMuc.tenDanhMuc = tenDanhMuc;
    const result = await danhMuc.save();

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Xóa danh mục
exports.xoa_danh_muc = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id_store } = req.body;

    const danhMuc = await DanhMuc.findOneAndDelete({ _id: id, id_store });
    if (!danhMuc) {
      return res
        .status(404)
        .json({ msg: "Danh mục không tồn tại cho cửa hàng này" });
    }

    res.status(200).json({ msg: "Đã xóa danh mục" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Lấy danh sách danh mục
exports.lay_ds_danh_muc = async (req, res, next) => {
  try {
    const { id_store } = req.query;

    const danhMucs = await DanhMuc.find({ id_store }).sort({
      createdAt: -1,
    });

    res.status(200).json(danhMucs);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
