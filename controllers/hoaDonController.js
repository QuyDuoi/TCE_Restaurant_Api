const { HoaDon } = require("../models/hoaDonModel");
const mongoose = require("mongoose");
const { CaLamViec } = require("../models/caLamViecModel");
const { Ban } = require("../models/banModel");
const { ChiTietHoaDon } = require("../models/chiTietHoaDonModel");

// Thêm hóa đơn
exports.them_hoa_don_moi = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { thoiGianVao, id_nhanVien, id_ban, id_nhaHang } = req.body;

    // Kiểm tra ca làm việc
    const caLamViec = await CaLamViec.findOne({
      id_nhaHang: id_nhaHang,
      ketThuc: null,
    });
    
    if (!caLamViec) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ msg: "Vui lòng mở ca làm mới trước khi tạo hóa đơn!" });
    }

    // Kiểm tra và cập nhật trạng thái bàn
    const thongTinBan = await Ban.findOneAndUpdate(
      { _id: id_ban, trangThai: "Trống" }, // Điều kiện: Bàn phải đang trống
      { $set: { trangThai: "Đang sử dụng" } }, // Cập nhật trạng thái
      { new: true, session } // Sử dụng session để đảm bảo tính nguyên tử
    );

    if (!thongTinBan) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        msg: "Bàn này không khả dụng hoặc đã được sử dụng!",
      });
    }

    // Tạo hóa đơn mới
    const hoaDonMoi = new HoaDon({
      thoiGianVao,
      id_nhanVien,
      id_ban,
      id_caLamViec: caLamViec._id,
    });

    const result = await hoaDonMoi.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json(result);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
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
      thoiGianVao,
      thoiGianRa,
      id_nhanVien,
      id_ban,
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
    if (
      hinhThucThanhToan !== undefined &&
      hinhThucThanhToan !== hoaDon.hinhThucThanhToan
    ) {
      hoaDon.hinhThucThanhToan = hinhThucThanhToan;
    }
    if (thoiGianVao !== undefined && thoiGianVao !== hoaDon.thoiGianVao) {
      hoaDon.thoiGianVao = thoiGianVao;
    }
    if (thoiGianRa !== undefined && thoiGianRa !== hoaDon.thoiGianRa) {
      hoaDon.thoiGianRa = thoiGianRa;
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
      id_chiTietHoaDon.forEach((id) => {
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

    const hoaDons = await HoaDon.find({ id_caLamViec }).sort({ createdAt: -1 });

    res.status(200).json(hoaDons);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

exports.lay_ds_hoa_don_theo_id_nha_hang = async (req, res, next) => {
  try {
    const { id_nhaHang } = req.query;

    // Step 1: Tìm ca làm hiện tại của nhà hàng (có ketThuc = null)
    const caLamHienTai = await CaLamViec.findOne({
      id_nhaHang: id_nhaHang,
      ketThuc: null,
    });

    if (!caLamHienTai) {
      return res.status(400).json({ msg: "Hiện không có ca làm nào được mở!" });
    }

    // Step 2: Tìm các hóa đơn có `id_caLamViec` là ca làm hiện tại và trạng thái "Chưa Thanh Toán"
    const hoaDons = await HoaDon.find({
      id_caLamViec: caLamHienTai._id,
      trangThai: "Chưa Thanh Toán",
    });

    if (!hoaDons.length) {
      return res
        .status(200)
        .json({ msg: "Không có hóa đơn nào trong ca làm này." });
    }

    // Lấy danh sách id của các hóa đơn
    const idHoaDons = hoaDons.map((hoaDon) => hoaDon._id);

    // Step 3: Tìm tất cả ChiTietHoaDon có `id_hoaDon` thuộc danh sách `idHoaDons`
    const chiTietHoaDons = await ChiTietHoaDon.find({
      id_hoaDon: { $in: idHoaDons },
    });

    // Step 4: Tính tổng tiền cho từng hóa đơn
    const result = hoaDons.map((hoaDon) => {
      // Lọc các ChiTietHoaDon thuộc về hóa đơn hiện tại
      const chiTietCuaHoaDon = chiTietHoaDons.filter(
        (chiTiet) => chiTiet.id_hoaDon.toString() === hoaDon._id.toString()
      );

      // Tính tổng tiền
      const tongTien = chiTietCuaHoaDon.reduce(
        (sum, chiTiet) => sum + chiTiet.giaTien,
        0
      );

      // Trả về hóa đơn cùng với tổng tiền
      return {
        ...hoaDon.toObject(),
        tongTien: tongTien,
      };
    });

    // Trả về danh sách hóa đơn kèm tổng tiền
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};

exports.danh_sach_hoa_don = async (req, res) => {
  try {
    const chiTietHoaDons = await ChiTietHoaDon.find();
    return res.status(200).json(chiTietHoaDons);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};

exports.thanh_toan_hoa_don = async (req, res) => {
  try {
    const { id_hoaDon, tienGiamGia, hinhThucThanhToan, ghiChu, thoiGianRa } =
      req.body;

    const hoaDon = await HoaDon.findById(id_hoaDon);

    if (!hoaDon) {
      return res.status(400).json({ msg: "Hóa đơn không tồn tại!" });
    } else if (hoaDon.trangThai === "Đã Thanh Toán") {
      return res.status(400).json({ msg: "Hóa đơn đã được thanh toán!" });
    } else {
      // Lấy id ca làm của hóa đơn
      const id_caLam = hoaDon.id_caLamViec;
      // Lấy thông tin ca làm hiện tại
      const caLamHienTai = await CaLamViec.findById(id_caLam);
      // Lấy tất cả chi tiết hóa đơn của hóa đơn
      const chiTietHoaDons = await ChiTietHoaDon.find({ id_hoaDon: id_hoaDon });
      console.log("Các chi tiết của hóa đơn: " + chiTietHoaDons);

      // Tính tổng tiền hóa đơn từ tất cả chi tiết hóa đơn
      const tongTienHoaDon = chiTietHoaDons.reduce(
        (total, recold) => total + recold.giaTien,
        0
      );

      const tongGiaTriHoaDon = tongTienHoaDon - tienGiamGia;
      // Cập nhật thông tin hóa đơn
      hoaDon.tienGiamGia = tienGiamGia;
      hoaDon.trangThai = "Đã Thanh Toán";
      hoaDon.hinhThucThanhToan = hinhThucThanhToan;
      hoaDon.ghiChu = ghiChu;
      hoaDon.thoiGianRa = thoiGianRa;
      hoaDon.tongGiaTri = tongGiaTriHoaDon;

      const result = await hoaDon.save();

      // Cập nhật tiền ca làm
      if (hinhThucThanhToan) {
        caLamHienTai.tongChuyenKhoan += tongGiaTriHoaDon;
      } else {
        caLamHienTai.tongTienMat += tongGiaTriHoaDon;
      }
      caLamHienTai.tongDoanhThu += tongGiaTriHoaDon;
      caLamHienTai.soDuHienTai += tongGiaTriHoaDon;
      await caLamHienTai.save();

      return res.status(200).json(result);
    }
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};

exports.thanh_toan_hoa_don_moi = async (req, res) => {
  try {
    const { chiTietHoaDons, hoaDon, id_nhaHang, _id } = req.body;

    // ChiTietHoaDons là mảng chứa tất cả các món ăn được thêm vào hóa đơn
    // hoaDon là thông tin của hóa đơn sẽ được tạo trước khi thêm chi tiết hóa đơn vào
    // _id là id của nhân viên (Sẽ được lấy sau khi đăng nhập thành công)

    const caLamHienTai = await CaLamViec.findOne({
      id_nhaHang: id_nhaHang,
      ketThuc: null,
    });

    if (!caLamHienTai) {
      return res.status(404).json({
        error: "Chưa mở ca",
        msg: "Hiện chưa có ca làm nào được mở!",
      });
    }

    const hoaDonMoi = new HoaDon({
      tongGiaTri: hoaDon.tongGiaTri,
      trangThai: hoaDon.trangThai,
      tienGiamGia: hoaDon.tienGiamGia,
      ghiChu: hoaDon.ghiChu,
      hinhThucThanhToan: hoaDon.hinhThucThanhToan,
      thoiGianRa: hoaDon.thoiGianVao,
      id_nhanVien: _id,
      id_caLamViec: caLamHienTai._id,
    });

    const hoaDonLuu = await hoaDonMoi.save();

    const danhSachChiTiet = [];
    for (let item of chiTietHoaDons) {
      const { id_monAn, soLuongMon, giaTien } = item;
      const chiTietHdMoi = new ChiTietHoaDon({
        id_hoaDon: hoaDonLuu._id, // Thêm id_hoaDon vào chi tiết hóa đơn mới
        id_monAn: id_monAn,
        soLuongMon: soLuongMon,
        giaTien: giaTien,
      });
      const chiTietLuu = await chiTietHdMoi.save();
      danhSachChiTiet.push(chiTietLuu);
    }

    // Trả về cả hóa đơn và danh sách chi tiết hóa đơn
    return res.status(200).json({
      msg: "Hóa đơn đã được tạo thành công!",
      hoaDon: hoaDonLuu, // Thông tin hóa đơn
      chiTietHoaDons: danhSachChiTiet, // Danh sách chi tiết hóa đơn
    });
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};
