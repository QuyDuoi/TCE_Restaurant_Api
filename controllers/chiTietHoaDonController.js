const { ChiTietHoaDon } = require("../models/chiTietHoaDonModel");
const { MonAn } = require("../models/monAnModel");

// Thêm chi tiết hóa đơn
exports.them_chi_tiet_hoa_don = async (req, res, next) => {
  try {
    const { soLuongMon, giaTien, id_monAn } = req.body;
    // Kiểm tra xem món ăn có tồn tại hay không
    const monAn = await MonAn.findById(id_monAn);

    if (!monAn) {
      return res.status(404).json({ msg: "Món ăn không tồn tại" });
    }

    // Tạo chi tiết hóa đơn mới
    const chiTietHoaDon = new ChiTietHoaDon({ soLuongMon, giaTien, id_monAn });
    const result = await chiTietHoaDon.save();

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Cập nhật chi tiết hóa đơn
exports.cap_nhat_chi_tiet_hoa_don = async (req, res) => {
  try {
    const { id } = req.params;
    const { soLuongMon, giaTien, id_monAn } = req.body;

    // Tìm chi tiết hóa đơn theo ID
    const chiTietHoaDon = await ChiTietHoaDon.findById(id);
    if (!chiTietHoaDon) {
      return res.status(404).json({ msg: "Chi tiết hóa đơn không tồn tại" });
    }

    // Cập nhật các thông tin của chi tiết hóa đơn
    chiTietHoaDon.soLuongMon = soLuongMon;
    chiTietHoaDon.giaTien = giaTien;
    chiTietHoaDon.id_monAn = id_monAn;
  
    const result = await chiTietHoaDon.save();

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Xóa chi tiết hóa đơn
exports.xoa_chi_tiet_hoa_don = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Xóa chi tiết hóa đơn theo ID
    const chiTietHoaDon = await ChiTietHoaDon.findByIdAndDelete(id);
    if (!chiTietHoaDon) {
      return res.status(404).json({ msg: "Chi tiết hóa đơn không tồn tại" });
    }
    res.status(200).json({ msg: "Đã xóa chi tiết hóa đơn" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Lấy danh sách chi tiết hóa đơn
exports.lay_ds_chi_tiet_hoa_don = async (req, res, next) => {
  
  try {

    const chiTietHoaDons = await ChiTietHoaDon.find(filter)
      .populate("id_monAn")
      .sort({ createdAt: -1 });
    res.status(200).json(chiTietHoaDons);

  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
