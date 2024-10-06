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

    if (tongGiaTri !== undefined && tongGiaTri !== hoaDon.tongGiaTri) {
      hoaDon.tongGiaTri = tongGiaTri;
    }
    if (tienGiamGia !== undefined && tienGiamGia !== hoaDon.tienGiamGia) {
      hoaDon.tienGiamGia = tienGiamGia;
    }
    if (ghiChu !== undefined && ghiChu !== hoaDon.ghiChu) {
      hoaDon.ghiChu = ghiChu;
    }
    if (trangThai !== undefined && trangThai !== hoaDon.trangThai) {
      hoaDon.trangThai = trangThai;
    }
    if (id_nhanVien !== undefined && id_nhanVien !== hoaDon.id_nhanVien) {
      hoaDon.id_nhanVien = id_nhanVien;
    }
    if (id_ban !== undefined && id_ban !== hoaDon.id_ban) {
      hoaDon.id_ban = id_ban;
    }
    if (id_chiTietHoaDon !== undefined && id_chiTietHoaDon !== hoaDon.id_chiTietHoaDon) {
      hoaDon.id_chiTietHoaDon = id_chiTietHoaDon;
    }

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
// Hình Thức Thanh toán

exports.thongKeHinhThucThanhToan = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query; // Lấy ngày bắt đầu và kết thúc từ query

    const thongKe = await HoaDon.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate), // Ngày bắt đầu
            $lte: new Date(endDate) // Ngày kết thúc
          }
        }
      },
      {
        $group: {
          _id: {
            hinhThucThanhToan: "$hinhThucThanhToan", // Nhóm theo hình thức thanh toán
            ngay: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } // Nhóm theo ngày
          },
          tongSoHoaDon: { $sum: 1 }, // Tính tổng số hóa đơn
          tongGiaTri: { $sum: "$tongGiaTri" } // Tính tổng giá trị thanh toán
        }
      },
      {
        $sort: { "_id.ngay": 1 } // Sắp xếp theo ngày
      }
    ]);

    res.status(200).json(thongKe);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
// Thống kê doanh  thu theo nguồn
exports.thongKeDoanhThuTheoNguon = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query; // Lấy ngày bắt đầu và kết thúc từ query

    const thongKe = await HoaDon.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate), // Ngày bắt đầu
            $lte: new Date(endDate) // Ngày kết thúc
          }
        }
      },
      {
        $group: {
          _id: {
            nguon: "$nguon", // Nhóm theo nguồn (mang đi hoặc ăn tại chỗ)
            ngay: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } // Nhóm theo ngày
          },
          tongDoanhThu: { $sum: "$tongGiaTri" } // Tính tổng doanh thu
        }
      },
      {
        $sort: { "_id.ngay": 1 } // Sắp xếp theo ngày
      }
    ]);

    res.status(200).json(thongKe);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};