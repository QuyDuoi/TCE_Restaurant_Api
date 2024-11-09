const { CaLamViec } = require("../models/caLamViecModel");
const { NhanVien } = require("../models/nhanVienModel");
const { HoaDon } = require("../models/hoaDonModel");
const { ChiTietHoaDon } = require("../models/chiTietHoaDonModel");

// Thêm ca làm việc
exports.them_ca_lam_viec = async (req, res, next) => {
  try {
    const {
      batDau,
      ketThuc,
      soDuBanDau,
      soDuHienTai,
      tongTienMat,
      tongChuyenKhoan,
      tongDoanhThu,
      tongThu,
      tongChi,
      id_nhanVien
    } = req.body;

    // Kiểm tra xem nhân viên có tồn tại không
    const nhanVien = await NhanVien.findById(id_nhanVien);
    if (!nhanVien) {
      return res.status(404).json({ msg: "Nhân viên không tồn tại" });
    }

    // Tạo ca làm việc mới
    const caLamViec = new CaLamViec({
      batDau,
      ketThuc,
      soDuBanDau,
      soDuHienTai,
      tongTienMat,
      tongChuyenKhoan,
      tongDoanhThu,
      tongThu,
      tongChi,
      id_nhanVien
    });

    const result = await caLamViec.save();

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Cập nhật ca làm việc
exports.cap_nhat_ca_lam_viec = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      batDau,
      ketThuc,
      soDuBanDau,
      soDuHienTai,
      tongTienMat,
      tongChuyenKhoan,
      tongDoanhThu,
      tongThu,
      tongChi,
      id_nhanVien
    } = req.body;

    // Tìm ca làm việc theo ID
    const caLamViec = await CaLamViec.findById(id);
    if (!caLamViec) {
      return res.status(404).json({ msg: "Ca làm việc không tồn tại" });
    }

    // Kiểm tra xem nhân viên mới có tồn tại không
    if (id_nhanVien && id_nhanVien !== caLamViec.id_nhanVien) {
      const nhanVien = await NhanVien.findById(id_nhanVien);
      if (!nhanVien) {
        return res.status(404).json({ msg: "Nhân viên không tồn tại" });
      }
      caLamViec.id_nhanVien = id_nhanVien;
    }

    // Cập nhật các thông tin khác nếu có thay đổi
    if (batDau !== undefined && caLamViec.batDau != batDau) caLamViec.batDau = batDau;
    if (ketThuc !== undefined && caLamViec.ketThuc != ketThuc) caLamViec.ketThuc = ketThuc;
    if (soDuBanDau !== undefined && caLamViec.soDuBanDau != soDuBanDau) caLamViec.soDuBanDau = soDuBanDau;
    if (soDuHienTai !== undefined && caLamViec.soDuHienTai != soDuHienTai) caLamViec.soDuHienTai = soDuHienTai;
    if (tongTienMat !== undefined && caLamViec.tongTienMat != tongTienMat) caLamViec.tongTienMat = tongTienMat;
    if (tongChuyenKhoan !== undefined && caLamViec.tongChuyenKhoan != tongChuyenKhoan) caLamViec.tongChuyenKhoan = tongChuyenKhoan;
    if (tongDoanhThu !== undefined && caLamViec.tongDoanhThu != tongDoanhThu) caLamViec.tongDoanhThu = tongDoanhThu;
    if (tongThu !== undefined) caLamViec.tongThu = tongThu;
    if (tongChi !== undefined) caLamViec.tongChi = tongChi;

    const result = await caLamViec.save();

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Xóa ca làm việc
exports.xoa_ca_lam_viec = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Xóa ca làm việc theo ID
    const caLamViec = await CaLamViec.findByIdAndDelete(id);
    if (!caLamViec) {
      return res.status(404).json({ msg: "Ca làm việc không tồn tại" });
    }

    res.status(200).json({ msg: "Đã xóa ca làm việc" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Lấy danh sách ca làm việc theo nhân viên
exports.lay_ds_ca_lam_viec = async (req, res, next) => {
  try {
    const { id_nhanVien } = req.query;

    // Lọc ca làm việc theo nhân viên nếu có
    let filter = {};
    if (id_nhanVien) {
      filter.id_nhanVien = id_nhanVien;
    }

    const caLamViecs = await CaLamViec.find(filter)
      .populate("id_nhanVien")
      .sort({ createdAt: -1 });

    res.status(200).json(caLamViecs);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

exports.lay_chi_tiet_hoa_don_theo_ca_lam = async (req, res) => {
  try {
    const { id_caLam } = req.body;

    // Tìm Ca Làm Việc và populate hóa đơn cùng chi tiết hóa đơn
    const caLam = await CaLamViec.findById(id_caLam).populate({
      path: "id_hoaDon",
      populate: {
        path: "id_chiTietHoaDon", // Populate chi tiết hóa đơn
        populate: {
          path: "id_monAn", // Populate món ăn từ chi tiết hóa đơn
          model: "MonAn",
        }
      },
    });

    if (!caLam) {
      return res.status(404).json({ msg: "Không tìm thấy ca làm việc" });
    }

    // Lấy tất cả chi tiết hóa đơn từ các hóa đơn trong ca làm việc
    let chiTietHoaDons = [];
    caLam.id_hoaDon.forEach((hoaDon) => {
      chiTietHoaDons = chiTietHoaDons.concat(hoaDon.id_chiTietHoaDon);
    });

    // Sắp xếp chi tiết hóa đơn:
    // - Trạng thái chưa hoàn thành (false) lên đầu, cũ nhất trước
    // - Trạng thái hoàn thành (true) xuống sau, mới nhất trước
    chiTietHoaDons.sort((a, b) => {
      if (a.trangThai === b.trangThai) {
        return a.trangThai
          ? new Date(b.updatedAt) - new Date(a.updatedAt) // Hoàn thành: mới nhất trước
          : new Date(a.createdAt) - new Date(b.createdAt); // Chưa hoàn thành: cũ nhất trước
      }
      return a.trangThai - b.trangThai; // false (0) lên trước true (1)
    });

    return res.status(200).json(chiTietHoaDons);
  } catch (error) {
    res.status(500).json({ msg: "Lỗi server", error: error.message });
  }
};