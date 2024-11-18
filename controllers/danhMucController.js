const { DanhMuc } = require("../models/danhMucModel");

// Thêm danh mục
exports.them_danh_muc = async (req, res, next) => {
  try {
    const { tenDanhMuc, id_nhaHang } = req.body;

    // Kiểm tra nếu danh mục đã tồn tại cho cửa hàng này
    const checkDanhMuc = await DanhMuc.findOne({ tenDanhMuc, id_nhaHang });
    if (checkDanhMuc) {
      return res.status(400).json({
        msg: "Danh mục đã tồn tại trong nhà hàng",
      });
    }

    await DanhMuc.updateMany({ id_nhaHang }, { $inc: { thuTu: 1 } });

    const danhMucMoi = new DanhMuc({ tenDanhMuc, id_nhaHang });
    const result = await danhMucMoi.save();

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      msg: "Lỗi khi thêm danh mục: " + error.message,
    });
  }
};

// Cập nhật danh mục
exports.cap_nhat_danh_muc = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenDanhMuc, id_nhaHang } = req.body;

    const danhMuc = await DanhMuc.findOne({ _id: id, id_nhaHang });
    if (!danhMuc) {
      return res.status(404).json({
        msg: "Danh mục không tồn tại trong nhà hàng",
      });
    }

    const checkDanhMuc = await DanhMuc.findOne({ tenDanhMuc, id_nhaHang });
    if (checkDanhMuc && checkDanhMuc._id.toString() !== id) {
      return res.status(400).json({
        msg: "Tên danh mục đã tồn tại trong nhà hàng",
      });
    }

    if (tenDanhMuc) {
      danhMuc.tenDanhMuc = tenDanhMuc;
    }
    const result = await danhMuc.save();
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      msg: "Lỗi khi cập nhật danh mục: " + error.message,
    });
  }
};

// Xóa danh mục
exports.xoa_danh_muc = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id_nhaHang } = req.body;

    const danhMuc = await DanhMuc.findOneAndDelete({ _id: id, id_nhaHang });
    if (!danhMuc) {
      return res.status(404).json({
        msg: "Danh mục không tồn tại trong nhà hàng",
      });
    }

    res.status(200).json({ msg: "Đã xóa danh mục thành công" });
  } catch (error) {
    res.status(400).json({
      msg: "Lỗi khi xóa danh mục: " + error.message,
    });
  }
};

// Lấy danh sách danh mục
exports.lay_ds_danh_muc = async (req, res, next) => {
  try {
    const { id_nhaHang } = req.query;
    if (!id_nhaHang) {
      return res.status(400).json({
        msg: "Thiếu id_nhaHang",
      });
    }

    const danhMucs = await DanhMuc.find({ id_nhaHang }).sort({ thuTu: -1 });

    res.status(200).json(danhMucs);
  } catch (error) {
    res.status(400).json({
      msg: "Lỗi khi lấy danh sách danh mục: " + error.message,
    });
  }
};

exports.sap_xep_vi_tri_danh_muc = async (req, res) => {
  try {
    const { id_nhaHang, danhMucs } = req.body;

    console.log("Id nhà hàng: " + id_nhaHang);
    

    // Kiểm tra dữ liệu đầu vào
    if (!id_nhaHang || !danhMucs || !Array.isArray(danhMucs)) {
      return res.status(400).json({ msg: "Dữ liệu không hợp lệ" });
    }

    // Tạo danh sách các thao tác cập nhật
    const bulkOperations = danhMucs.map((item, index) => ({
      updateOne: {
        filter: { _id: item._id, id_nhaHang },
        update: { thuTu: index }, // Gán thứ tự mới theo vị trí trong mảng
      },
    }));

    // Thực hiện cập nhật
    const result = await DanhMuc.bulkWrite(bulkOperations);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ msg: "Lỗi sắp xếp: " + error.message });
  }
};
