const { HoaDon } = require("../models/hoaDonModel");

// Thêm hóa đơn
exports.them_hoa_don = async (req, res, next) => {
  try {
    const {
      tongGiaTri,
      tienGiamGia,
      ghiChu,
      id_nhanVien,
      id_ban,
      id_chiTietHoaDon,
    } = req.body;

    const hoaDon = new HoaDon({
      tongGiaTri,
      tienGiamGia,
      ghiChu,
      id_nhanVien,
      id_ban,
      id_chiTietHoaDon,
    });
    const result = await hoaDon.save();

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Cập nhật hóa đơn
exports.cap_nhat_hoa_don = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      tongGiaTri,
      tienGiamGia,
      ghiChu,
      trangThai,
      id_nhanVien,
      id_ban,
      id_chiTietHoaDon,
    } = req.body;

    const hoaDon = await HoaDon.findById(id);
    if (!hoaDon) {
      return res.status(404).json({ msg: "Hóa đơn không tồn tại" });
    }

    hoaDon.tongGiaTri = tongGiaTri;
    hoaDon.tienGiamGia = tienGiamGia;
    hoaDon.ghiChu = ghiChu;
    hoaDon.trangThai = trangThai;
    hoaDon.id_nhanVien = id_nhanVien;
    hoaDon.id_ban = id_ban;
    hoaDon.id_chiTietHoaDon = id_chiTietHoaDon;

    const result = await hoaDon.save();

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Xóa hóa đơn
exports.xoa_hoa_don = async (req, res, next) => {
  try {
    const { id } = req.params;

    const hoaDon = await HoaDon.findByIdAndDelete(id);
    if (!hoaDon) {
      return res.status(404).json({ msg: "Hóa đơn không tồn tại" });
    }

    res.status(200).json({ msg: "Đã xóa hóa đơn" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Lấy danh sách hóa đơn
exports.lay_ds_hoa_don = async (req, res, next) => {
  try {
    const hoaDons = await HoaDon.find().sort({ createdAt: -1 });

    res.status(200).json(hoaDons);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
