const { default: mongoose } = require("mongoose");
const { Ban } = require("../models/banModel");
const { CaLamViec } = require("../models/caLamViecModel");
const { ChiTietHoaDon } = require("../models/chiTietHoaDonModel");
const { HoaDon } = require("../models/hoaDonModel");
const { KhuVuc } = require("../models/khuVucModel");
const { NhanVien } = require("../models/nhanVienModel");

const taoMatKhau = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // Tạo chuỗi 6 số
};

// Thêm ca làm việc
exports.mo_ca_lam_viec = async (req, res, next) => {
  try {
    const { soDuBanDau, id_nhanVien, id_nhaHang } = req.body;

    // Kiểm tra xem nhân viên có tồn tại không
    const nhanVien = await NhanVien.findById(id_nhanVien);
    if (!nhanVien) {
      return res.status(404).json({ msg: "Nhân viên không tồn tại" });
    }

    const checkCaLam = await CaLamViec.findOne({
      id_nhaHang: id_nhaHang,
      ketThuc: null,
    });

    const khuVucs = await KhuVuc.find({ id_nhaHang: id_nhaHang });
    if (!khuVucs.length) {
      return res
        .status(404)
        .json({ msg: "Không tìm thấy khu vực nào trong nhà hàng này!" });
    }

    // 2. Lấy danh sách id_khuVuc từ các khu vực
    const khuVucIds = khuVucs.map((khuVuc) => khuVuc._id);

    // 3. Tìm tất cả bàn có id_khuVuc thuộc danh sách trên
    const bans = await Ban.find({ id_khuVuc: { $in: khuVucIds } }).populate(
      "id_khuVuc"
    );

    for (let ban of bans) {
      ban.matKhau = taoMatKhau();
      await ban.save();
    }

    if (checkCaLam) {
      return res
        .status(404)
        .json({ msg: "Chưa kết thúc ca làm cũ, không thể mở ca làm mới!" });
    } else {
      const batDau = new Date();
      const soDuHienTai = soDuBanDau;

      // Tạo ca làm việc mới
      let caLamViec = new CaLamViec({
        batDau,
        soDuBanDau,
        soDuHienTai,
        id_nhanVien,
        id_nhaHang,
      });

      caLamViec = await caLamViec.save();

      const result = await CaLamViec.findById(caLamViec._id).populate(
        "id_nhanVien"
      );

      res.status(201).json(result);
    }
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Check đóng ca làm
exports.check_dong_ca_lam_viec = async (req, res) => {
  const session = await mongoose.startSession(); // Khởi tạo session để bắt đầu transaction
  session.startTransaction(); // Bắt đầu transaction
  try {
    const { id_caLamViec } = req.body;

    // 1. Tìm ca làm việc hiện tại
    const caLamHienTai = await CaLamViec.findById(id_caLamViec).session(
      session
    );

    if (!caLamHienTai) {
      return res.status(400).json({ msg: "Không tìm thấy ca làm việc!" });
    }

    // 2. Kiểm tra xem có hóa đơn nào chưa thanh toán trong ca làm việc hay không
    const hoaDonChuaThanhToan = await HoaDon.find({
      id_caLamViec: id_caLamViec,
      trangThai: "Chưa Thanh Toán",
    }).session(session);

    if (hoaDonChuaThanhToan.length > 0) {
      return res.status(400).json({
        msg: `Không thể đóng ca làm việc! Vẫn còn ${hoaDonChuaThanhToan.length} hóa đơn chưa thanh toán.`,
      });
    }

    // 3. Lấy danh sách khu vực thuộc nhà hàng từ id_nhaHang
    const khuVucList = await KhuVuc.find({ id_nhaHang: caLamHienTai.id_nhaHang }).session(session);

    // Lấy danh sách id_khuVuc
    const idKhuVucList = khuVucList.map((khuVuc) => khuVuc._id);

    // Cập nhật tất cả bàn thuộc các khu vực này
    const result = await Ban.updateMany(
      { id_khuVuc: { $in: idKhuVucList } }, // Lọc các bàn theo id_khuVuc
      {
        $set: {
          trangThai: "Trống",
          ghiChu: "",
          matKhau: taoMatKhau(),
          danhSachOrder: [],
          trangThaiOrder: false
        },
      },
      { session }
    );

    console.log(result);

    const io = req.app.get("io");
    io.emit("dongCaLam", {
      msg: "Ca làm đã đóng!",
    });

    // Cập nhật thời gian kết thúc cho ca làm việc
    caLamHienTai.ketThuc = new Date();
    await caLamHienTai.save();

    // Commit transaction nếu thành công
    await session.commitTransaction();
    session.endSession();

    // Trả về thông tin ca làm việc đã được đóng
    res.status(200).json(caLamHienTai);
  } catch (error) {
    // Rollback transaction nếu có lỗi
    await session.abortTransaction();
    session.endSession();

    console.error("Lỗi khi đóng ca làm việc:", error.message);
    return res.status(400).json({ msg: error.message });
  }
};

exports.dong_ca_bat_chap = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { id_caLamViec, id_nhanVien } = req.body;

    // 1. Xác thực quyền của nhân viên
    const nhanVien = await NhanVien.findById(id_nhanVien).session(session);
    if (!nhanVien) {
      return res.status(400).json({ msg: "Không tìm thấy nhân viên!" });
    }
    if (nhanVien.vaiTro !== "Quản lý") {
      return res
        .status(403)
        .json({ msg: "Chỉ có Quản lý mới có quyền đóng ca!" });
    }

    // 2. Tìm ca làm việc hiện tại
    const caLamHienTai = await CaLamViec.findById(id_caLamViec).session(session);
    if (!caLamHienTai) {
      return res.status(400).json({ msg: "Không tìm thấy ca làm việc!" });
    }

    // 3. Xóa tất cả hóa đơn chưa thanh toán
    const hoaDonChuaThanhToan = await HoaDon.deleteMany(
      {
        id_caLamViec: id_caLamViec,
        trangThai: "Chưa Thanh Toán",
      },
      { session }
    );
    console.log(
      `Đã xóa ${hoaDonChuaThanhToan.deletedCount} hóa đơn chưa thanh toán.`
    );

    // 4. Lấy danh sách khu vực thuộc nhà hàng từ id_nhaHang trong ca làm việc
    const khuVucList = await KhuVuc.find({
      id_nhaHang: caLamHienTai.id_nhaHang,
    }).session(session);

    const idKhuVucList = khuVucList.map((khuVuc) => khuVuc._id);

    // 5. Cập nhật trạng thái các bàn trong khu vực
    const result = await Ban.updateMany(
      { id_khuVuc: { $in: idKhuVucList } }, // Lọc bàn theo khu vực thuộc nhà hàng
      {
        $set: {
          trangThai: "Trống",
          ghiChu: "",
          matKhau: taoMatKhau(),
          danhSachOrder: [],
        },
      },
      { session }
    );
    console.log(`Đã cập nhật ${result.modifiedCount} bàn.`);

    // 6. Cập nhật thời gian kết thúc của ca làm việc
    caLamHienTai.ketThuc = new Date();
    await caLamHienTai.save({ session });

    const io = req.app.get("io");
    io.emit("dongCaLam", {
      msg: "Ca làm đã đóng!",
    });

    // Commit transaction
    await session.commitTransaction();

    // 7. Trả về phản hồi thành công
    res.status(200).json({
      msg: "Đóng ca làm việc thành công. Các hóa đơn chưa thanh toán đã bị xóa và trạng thái bàn đã được cập nhật.",
      caLamViec: caLamHienTai,
      hoaDonDaXoa: hoaDonChuaThanhToan.deletedCount,
      banDaCapNhat: result.modifiedCount,
    });
  } catch (error) {
    // Rollback nếu xảy ra lỗi
    await session.abortTransaction();
    console.error("Lỗi khi đóng ca bất chấp:", error);
    res.status(500).json({ msg: "Lỗi server", error: error.message });
  } finally {
    session.endSession();
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
      id_nhanVien,
      id_nhaHang,
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
    if (batDau !== undefined && caLamViec.batDau != batDau)
      caLamViec.batDau = batDau;
    if (ketThuc !== undefined && caLamViec.ketThuc != ketThuc)
      caLamViec.ketThuc = ketThuc;
    if (soDuBanDau !== undefined && caLamViec.soDuBanDau != soDuBanDau)
      caLamViec.soDuBanDau = soDuBanDau;
    if (soDuHienTai !== undefined && caLamViec.soDuHienTai != soDuHienTai)
      caLamViec.soDuHienTai = soDuHienTai;
    if (tongTienMat !== undefined && caLamViec.tongTienMat != tongTienMat)
      caLamViec.tongTienMat = tongTienMat;
    if (
      tongChuyenKhoan !== undefined &&
      caLamViec.tongChuyenKhoan != tongChuyenKhoan
    )
      caLamViec.tongChuyenKhoan = tongChuyenKhoan;
    if (tongDoanhThu !== undefined && caLamViec.tongDoanhThu != tongDoanhThu)
      caLamViec.tongDoanhThu = tongDoanhThu;
    if (id_nhanVien !== undefined && caLamViec.id_nhanVien != id_nhanVien)
      caLamViec.id_nhanVien = id_nhanVien;
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
    const { id_nhaHang } = req.query;

    const caLams = await CaLamViec.find({ id_nhaHang: id_nhaHang })
      .populate("id_nhanVien")
      .sort({
        createdAt: -1,
      });

    res.status(200).json(caLams);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

exports.lay_chi_tiet_hoa_don_theo_ca_lam = async (req, res) => {
  try {
    const { id_nhaHang } = req.query;

    console.log(req.query);

    // Tìm ca làm việc hiện tại của nhà hàng
    const caLamViec = await CaLamViec.findOne({
      id_nhaHang: id_nhaHang,
      ketThuc: null,
    });

    if (!caLamViec) {
      return res
        .status(400)
        .json({ msg: "Hiện chưa có ca làm việc nào được mở!" });
    }

    const id_caLamViec = caLamViec._id;

    // Tìm tất cả các hóa đơn có id_caLamViec và có id_ban (chỉ hóa đơn bán tại chỗ)
    const hoaDons = await HoaDon.find(
      { id_caLamViec, id_ban: { $ne: null } },
      "_id id_ban"
    ).populate({
      path: "id_ban",
      select: "tenBan id_khuVuc",
      populate: {
        path: "id_khuVuc",
        model: "KhuVuc",
        select: "tenKhuVuc",
      },
    });

    if (!hoaDons || hoaDons.length === 0) {
      return res.status(404).json({ msg: "Chưa có hóa đơn nào được tạo!" });
    }

    // Lấy danh sách các id_hoaDon
    const hoaDonIds = hoaDons.map((hoaDon) => hoaDon._id);

    // Tìm tất cả các chi tiết hóa đơn có id_hoaDon nằm trong danh sách hoaDonIds
    const chiTietHoaDons = await ChiTietHoaDon.find({
      id_hoaDon: { $in: hoaDonIds },
    }).populate({
      path: "id_monAn",
      model: "MonAn",
    });

    if (chiTietHoaDons.length === 0) {
      return res.status(404).json({ msg: "Chưa có món ăn nào được gọi!" });
    }

    // Kết hợp chi tiết hóa đơn với thông tin khu vực và bàn
    const chiTietHdkvs = chiTietHoaDons.map((chiTiet) => {
      const hoaDon = hoaDons.find(
        (hd) => hd._id.toString() === chiTiet.id_hoaDon.toString()
      );

      console.log(hoaDon);

      return {
        ...chiTiet.toObject(),
        ban: hoaDon.id_ban, // Thông tin bàn
        khuVuc: hoaDon.id_ban.id_khuVuc, // Thông tin khu vực
      };
    });

    // Sắp xếp danh sách
    chiTietHdkvs.sort((a, b) => {
      if (a.trangThai === b.trangThai) {
        return a.trangThai
          ? new Date(b.updatedAt) - new Date(a.updatedAt) // Đã hoàn thành: mới nhất trước
          : new Date(a.createdAt) - new Date(b.createdAt); // Chưa hoàn thành: cũ nhất trước
      }
      return a.trangThai - b.trangThai; // false lên trước true
    });

    // Phân loại dữ liệu
    const groupedData = {
      chuaHoanThanh: chiTietHdkvs.filter((item) => item.trangThai === false), // Chưa hoàn thành
      hoanThanh: chiTietHdkvs.filter((item) => item.trangThai === true), // Hoàn thành
      theoTenMon: {},
    };

    // Nhóm theo tên món
    chiTietHdkvs.forEach((item) => {
      const tenMon = item.id_monAn?.tenMon;
      if (tenMon) {
        if (!groupedData.theoTenMon[tenMon]) {
          groupedData.theoTenMon[tenMon] = [];
        }
        groupedData.theoTenMon[tenMon].push(item);
      }
    });

    // Trả về dữ liệu đã phân loại
    return res.status(200).json(groupedData);
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết hóa đơn:", error);
    res.status(500).json({
      msg: "Lỗi server",
      error: error.message,
      stack: error.stack,
    });
  }
};

exports.lay_ds_hoa_don_theo_ca_lam_viec = async (req, res, next) => {
  try {
    const { id_caLamViec } = req.query;

    if (!id_caLamViec) {
      return res.status(400).json({ msg: "Không có thông tin id Ca làm việc" });
    }

    // Tìm tất cả các hóa đơn có id_caLamViec và trạng thái là "Đã Thanh Toán"
    const hoaDons = await HoaDon.find({
      id_caLamViec: id_caLamViec,
      trangThai: "Đã Thanh Toán", // Đảm bảo giá trị khớp với dữ liệu trong database
    });

    if (!hoaDons || hoaDons.length === 0) {
      return res.status(200).json({
        msg: "Không có hóa đơn nào đã thanh toán trong ca làm việc này",
      });
    }

    // Trả về danh sách hóa đơn đã thanh toán
    res.status(200).json(hoaDons);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Lỗi máy chủ nội bộ", error: error.message });
  }
};
