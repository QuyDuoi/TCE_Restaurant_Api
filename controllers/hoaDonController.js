const { HoaDon } = require("../models/hoaDonModel");
const mongoose = require("mongoose");
const { CaLamViec } = require("../models/caLamViecModel");
const { Ban } = require("../models/banModel");
const { ChiTietHoaDon } = require("../models/chiTietHoaDonModel");
const { MonAn } = require("../models/monAnModel");
const { NhanVien } = require("../models/nhanVienModel");

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

    const nhanVien = await NhanVien.findOne({ _id: id_nhanVien });

    if (!caLamViec) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .json({ msg: "Vui lòng mở ca làm mới trước khi tạo hóa đơn!" });
    }

    // Kiểm tra và cập nhật trạng thái bàn
    const thongTinBan = await Ban.findOneAndUpdate(
      {
        _id: id_ban,
        trangThai: { $in: ["Trống", "Đã đặt"] }, // Cho phép bàn Trống hoặc Đã đặt
      },
      {
        $set: { trangThai: "Đang sử dụng" }, // Cập nhật trạng thái
      },
      {
        new: true,
        session, // Sử dụng session để đảm bảo tính nguyên tử
      }
    );

    if (!thongTinBan) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        msg: "Bàn này không khả dụng hoặc đang được sử dụng!",
      });
    }

    // Tạo hóa đơn mới
    const hoaDonMoi = new HoaDon({
      thoiGianVao,
      id_nhanVien,
      id_ban,
      nhanVienTao: nhanVien.hoTen,
      id_caLamViec: caLamViec._id,
    });

    const result = await hoaDonMoi.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    // Gửi thông báo qua Socket.IO
    const io = req.app.get("io");
    io.emit("themHoaDon", {
      msg: "Hóa đơn mới được tạo!",
      hoaDon: result,
      ban: thongTinBan,
    });

    res.status(201).json(result);
  } catch (error) {
    // Kiểm tra trạng thái của giao dịch trước khi gọi abort
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
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
  const session = await mongoose.startSession(); // Bắt đầu session
  session.startTransaction(); // Bắt đầu giao dịch

  try {
    const {
      id_hoaDon,
      tienGiamGia,
      hinhThucThanhToan,
      ghiChu,
      thoiGianRa,
      id_nhanVien,
    } = req.body;

    // Tìm hóa đơn
    const hoaDon = await HoaDon.findById(id_hoaDon).session(session);

    if (!hoaDon) {
      throw new Error("Hóa đơn không tồn tại!");
    }

    if (hoaDon.trangThai === "Đã Thanh Toán") {
      throw new Error("Hóa đơn đã được thanh toán!");
    }

    const nhanVien = await NhanVien.findOne({ _id: id_nhanVien });

    // Lấy id ca làm của hóa đơn
    const id_caLam = hoaDon.id_caLamViec;

    // Lấy thông tin ca làm việc
    const caLamHienTai = await CaLamViec.findById(id_caLam).session(session);

    if (!caLamHienTai) {
      throw new Error("Ca làm việc không tồn tại!");
    }

    // Lấy tất cả chi tiết hóa đơn
    const chiTietHoaDons = await ChiTietHoaDon.find({
      id_hoaDon: id_hoaDon,
    }).session(session);

    console.log("Các chi tiết của hóa đơn: " + chiTietHoaDons);

    // Tính tổng tiền hóa đơn từ tất cả chi tiết
    const tongTienHoaDon = chiTietHoaDons.reduce(
      (total, record) => total + record.giaTien,
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
    hoaDon.nhanVienThanhToan = nhanVien.hoTen;

    await hoaDon.save({ session });

    // Cập nhật tiền ca làm việc
    if (hinhThucThanhToan) {
      caLamHienTai.tongChuyenKhoan += tongGiaTriHoaDon;
    } else {
      caLamHienTai.tongTienMat += tongGiaTriHoaDon;
    }
    caLamHienTai.tongDoanhThu += tongGiaTriHoaDon;
    caLamHienTai.soDuHienTai += tongGiaTriHoaDon;

    await caLamHienTai.save({ session });

    // Cam kết giao dịch
    await session.commitTransaction();
    session.endSession();

    // Trả về kết quả
    return res.status(200).json({
      msg: "Thanh toán hóa đơn thành công!",
      hoaDon,
    });
  } catch (error) {
    // Hủy giao dịch nếu có lỗi
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ msg: error.message });
  }
};

exports.thanh_toan_hoa_don_moi = async (req, res) => {
  const session = await mongoose.startSession(); // Bắt đầu session
  session.startTransaction(); // Bắt đầu giao dịch

  try {
    const { chiTietHoaDons, hoaDon, id_nhaHang, id_nhanVien } = req.body;

    // Kiểm tra ca làm việc hiện tại
    const caLamHienTai = await CaLamViec.findOne({
      id_nhaHang: id_nhaHang,
      ketThuc: null,
    }).session(session); // Gắn session vào query

    const nhanVien = await NhanVien.findOne({ _id: id_nhanVien });

    if (!caLamHienTai) {
      throw new Error("Hiện chưa có ca làm nào được mở!");
    }

    // Tạo mới hóa đơn
    const hoaDonMoi = new HoaDon({
      tongGiaTri: hoaDon.tongGiaTri,
      trangThai: hoaDon.trangThai,
      tienGiamGia: hoaDon.tienGiamGia,
      ghiChu: hoaDon.ghiChu,
      hinhThucThanhToan: hoaDon.hinhThucThanhToan,
      thoiGianVao: hoaDon.thoiGianVao,
      thoiGianRa: hoaDon.thoiGianVao,
      id_nhanVien: id_nhanVien,
      nhanVienTao: nhanVien.hoTen,
      nhanVienThanhToan: nhanVien.hoTen,
      id_caLamViec: caLamHienTai._id,
    });

    const hoaDonLuu = await hoaDonMoi.save({ session });

    // Danh sách chi tiết hóa đơn
    const danhSachChiTiet = [];

    for (let item of chiTietHoaDons) {
      const { id_monAn, tenMon, giaMonAn, soLuongMon, giaTien, ghiChu } = item;

      let monAnData = null;
      if (id_monAn) {
        monAnData = await MonAn.findById(id_monAn).session(session);
        if (!monAnData) {
          throw new Error(`Không tìm thấy món ăn với id ${id_monAn}`);
        }
      }

      const chiTietHdMoi = new ChiTietHoaDon({
        id_hoaDon: hoaDonLuu._id,
        soLuongMon: soLuongMon,
        giaTien: giaTien,
        ghiChu: ghiChu || "",
        id_monAn: id_monAn,
        monAn: monAnData
          ? {
              tenMon: monAnData.tenMon,
              anhMonAn: monAnData.anhMonAn,
              giaMonAn: monAnData.giaMonAn,
            }
          : {
              tenMon: tenMon,
              giaMonAn: giaMonAn,
            },
      });

      const chiTietLuu = await chiTietHdMoi.save({ session });
      danhSachChiTiet.push(chiTietLuu);
    }

    // Cập nhật ca làm việc với giá trị của hóa đơn mới
    const hinhThucThanhToan = hoaDon.hinhThucThanhToan;

    let updateData = {};
    if (hinhThucThanhToan) {
      updateData = {
        $inc: {
          tongChuyenKhoan: hoaDon.tongGiaTri,
          tongDoanhThu: hoaDon.tongGiaTri,
        },
      };
    } else {
      updateData = {
        $inc: {
          tongTienMat: hoaDon.tongGiaTri,
          tongDoanhThu: hoaDon.tongGiaTri,
        },
      };
    }

    await CaLamViec.findByIdAndUpdate(caLamHienTai._id, updateData, {
      new: true,
      session,
    });

    // Cam kết giao dịch
    await session.commitTransaction();
    session.endSession();

    // Trả về kết quả
    return res.status(200).json({
      msg: "Hóa đơn đã được tạo thành công!",
      hoaDon: hoaDonLuu,
      chiTietHoaDons: danhSachChiTiet,
    });
  } catch (error) {
    // Hủy giao dịch nếu có lỗi
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ msg: error.message });
  }
};
