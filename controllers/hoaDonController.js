const { HoaDon } = require("../models/hoaDonModel");
const { CaLamViec } = require("../models/caLamViecModel");
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
    const { id_caLamViec } = req.query;
    
    const hoaDons = await HoaDon.find( {id_caLamViec} ).sort({ createdAt: -1 });

    res.status(200).json(hoaDons);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};


exports.lay_ds_hoa_don_theo_id_nha_hang = async (req, res, next) => {
  try {
    const { id_nhaHang } = req.query;
    
    // Step 1: Tìm ca làm hiện tại theo id_nhaHang và thời gian kết thúc
    const caLamHienTai = await CaLamViec.findOne({
      id_nhaHang: id_nhaHang,
      ketThuc: null
    }).populate({
      path: 'id_hoaDon', // Lấy các hóa đơn liên kết với ca làm
      match: { trangThai: "Chưa Thanh Toán" }, // Lọc chỉ các hóa đơn chưa thanh toán
      // Không sử dụng 'select' để chọn tất cả các trường từ HoaDon
      populate: {
        path: 'id_chiTietHoaDon',
        select: 'giaTien' // Lấy trường giaTien từ ChiTietHoaDon
      }
    });

    if (!caLamHienTai) {
      return res.status(400).json({ msg: "Hiện không có ca làm nào được mở!" });
    }

    // Step 2: Tính tổng tiền của tất cả chi tiết hóa đơn và trả về dữ liệu
    const result = caLamHienTai.id_hoaDon.map((invoice) => {
      // Tính tổng tiền từ tất cả các chi tiết hóa đơn
      const totalAmount = invoice.id_chiTietHoaDon.reduce(
        (sum, item) => sum + item.giaTien, 0
      );

      // Trả về tất cả các thuộc tính của hóa đơn cộng với tổng tiền
      return {
        ...invoice.toObject(),  // Chuyển hóa đơn thành object để giữ lại tất cả các thuộc tính
        tongTien: totalAmount,   // Thêm trường tongTien
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};




