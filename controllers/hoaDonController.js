const { HoaDon } = require("../models/hoaDonModel");

// Thêm hóa đơn
exports.them_hoa_don = async (req, res, next) => {
  try {
    const {
      tongGiaTri,
      trangThai,
      tienGiamGia,
      ghiChu,
      hinhThucThanhToan,
      thoiGianVaoBan,
      thoiGianRaBan,
      id_nhanVien,
      id_ban,
      id_chiTietHoaDon,
      id_caLamViec,
    } = req.body;

 
    
    const hoaDon = new HoaDon({
      tongGiaTri,
      trangThai,
      tienGiamGia,
      ghiChu,
      hinhThucThanhToan,
      thoiGianVaoBan,
      thoiGianRaBan,
      id_nhanVien,
      id_ban,
      id_chiTietHoaDon,
      id_caLamViec,
    });
    
    if (id_ban !== undefined) {
      if (id_ban === "") {
        hoaDon.id_ban = null; // Xử lý trường hợp id_ban là chuỗi rỗng
      } else if (id_ban !== hoaDon.id_ban) {
        hoaDon.id_ban = id_ban;
      }
    }
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
      trangThai,
      tienGiamGia,
      ghiChu,
      hinhThucThanhToan,
      thoiGianVaoBan,
      thoiGianRaBan,
      id_nhanVien,
      id_ban,
      id_chiTietHoaDon,
      id_caLamViec,
    } = req.body;

    const hoaDon = await HoaDon.findById(id);
    if (!hoaDon) {
      return res.status(404).json({ msg: "Hóa đơn không tồn tại" });
    }

    if (tongGiaTri !== undefined && tongGiaTri !== hoaDon.tongGiaTri) {
      hoaDon.tongGiaTri = tongGiaTri;
    }
    if (trangThai !== undefined && trangThai !== hoaDon.trangThai) {
      hoaDon.trangThai = trangThai;
    }
    if (tienGiamGia !== undefined && tienGiamGia !== hoaDon.tienGiamGia) {
      hoaDon.tienGiamGia = tienGiamGia;
    }
    if (ghiChu !== undefined && ghiChu !== hoaDon.ghiChu) {
      hoaDon.ghiChu = ghiChu;
    }
    if (hinhThucThanhToan !== undefined && hinhThucThanhToan !== hoaDon.hinhThucThanhToan) {
      hoaDon.hinhThucThanhToan = hinhThucThanhToan;
    }
    if (thoiGianVaoBan !== undefined && thoiGianVaoBan !== hoaDon.thoiGianVaoBan) {
      hoaDon.thoiGianVaoBan = thoiGianVaoBan;
    }
    if (thoiGianRaBan !== undefined && thoiGianRaBan !== hoaDon.thoiGianRaBan) {
      hoaDon.thoiGianRaBan = thoiGianRaBan;
    }
    if (id_nhanVien !== undefined && id_nhanVien !== hoaDon.id_nhanVien) {
      hoaDon.id_nhanVien = id_nhanVien;
    }
    if (id_ban !== undefined && id_ban !== hoaDon.id_ban) {
      hoaDon.id_ban = id_ban;
    }
    if (id_caLamViec !== undefined && id_caLamViec !== hoaDon.id_caLamViec) {
      hoaDon.id_caLamViec = id_caLamViec;
    }
       // Kiểm tra và thêm id mới vào id_chiTietHoaDon mà không trùng
    if (id_chiTietHoaDon !== undefined) {
      id_chiTietHoaDon.forEach(id => {
        if (!hoaDon.id_chiTietHoaDon.includes(id)) {
          hoaDon.id_chiTietHoaDon.push(id);
        }
      });
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
    const { id_caLamViec } = req.params;
    const hoaDons = await HoaDon.find( id_caLamViec ).sort({ createdAt: -1 });

    res.status(200).json(hoaDons);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

