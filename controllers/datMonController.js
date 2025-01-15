const { Ban } = require("../models/banModel");
const { CaLamViec } = require("../models/caLamViecModel");
const { ChiTietHoaDon } = require("../models/chiTietHoaDonModel");
const { HoaDon } = require("../models/hoaDonModel");
const { KhuVuc } = require("../models/khuVucModel");
const { MonAn } = require("../models/monAnModel");
const { NhanVien } = require("../models/nhanVienModel");
const mongoose = require("mongoose");

exports.dat_mon_an = async (req, res) => {
  try {
    const { id, danhSachMon, id_nhaHang } = req.body;

    const checkCaLam = await CaLamViec.findOne({
      id_nhaHang: id_nhaHang,
      ketThuc: null,
    });

    if (!checkCaLam) {
      return res.status(400).json({
        status: false,
        msg: "Hiện đã ngoài giờ làm việc, không thể đặt món!",
      });
    }

    const checkBan = await Ban.findById(id);
    const checkKhuVuc = await KhuVuc.findById(checkBan.id_khuVuc);

    if (!checkBan) {
      return res.status(404).json({ msg: "Bàn không tồn tại!" });
    }

    if (checkBan.trangThai === "Đã đặt") {
      return res.status(400).json({ msg: "Bàn đã có người đặt!" });
    }

    const locDanhSach = danhSachMon.map((item) => ({
      tenMon: item.tenMon,
      soLuong: item.soLuongMon,
      giaMonAn: item.giaMonAn,
    }));

    if (
      checkBan.trangThai === "Trống" ||
      checkBan.trangThai === "Đang sử dụng"
    ) {
      // Nếu bàn trống hoặc đang sử dụng, kiểm tra xem có món nào trong danh sách order chưa
      if (checkBan.danhSachOrder && checkBan.danhSachOrder.length > 0) {
        // Nếu đã có order, chỉ cần thêm món mới vào
        checkBan.danhSachOrder.push(...locDanhSach);
      } else {
        // Nếu chưa có order, tạo mới danh sách order
        checkBan.danhSachOrder = locDanhSach;
      }

      checkBan.trangThaiOrder = true; // Đánh dấu bàn đã có order

      // Lưu thông tin bàn đã cập nhật
      await checkBan.save();

      const io = req.app.get("io");
      io.emit("khachOrder", {
        msg: `Bàn ${checkBan.tenBan} - Khu vực ${checkKhuVuc.tenKhuVuc} có Order mới!`,
      });

      return res.status(200).json({
        msg: "Đã gửi thông tin món, vui lòng đợi nhân viên xác nhận.",
      });
    }
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};

exports.kiem_tra_mat_khau = async (req, res) => {
  try {
    const { id_ban, matKhau } = req.body;

    const checkBan = await Ban.findById(id_ban);

    if (!checkBan) {
      return res.status(404).json({ msg: "Thông tin bàn không còn khả dụng!" });
    }

    if (checkBan.matKhau !== matKhau) {
      return res.status(200).json(false);
    }

    return res.status(200).json(true);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};

exports.xac_nhan_dat_mon = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id_ban, id_nhanVien } = req.body;

    // 1. Kiểm tra sự tồn tại và trạng thái của bàn
    const ban = await Ban.findById(id_ban).session(session);

    if (!ban) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ msg: "Bàn không khả dụng!" });
    }

    const orders = ban.danhSachOrder;

    if (orders.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ msg: "Không có món nào để đặt!" });
    }

    // 2. Kiểm tra món ăn trong danh sách order
    for (let item of orders) {
      const monAn = await MonAn.findOne({
        tenMon: item.tenMon,
        giaMonAn: item.giaMonAn,
      }).session(session);

      if (!monAn) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          msg: `Món ăn ${item.tenMon} với giá ${item.giaMonAn} không tồn tại!`,
        });
      }

      if (!monAn.trangThai) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          msg: `Món ăn ${item.tenMon} hiện tại không còn bán!`,
        });
      }
    }

    // 3. Lấy thông tin nhân viên và ca làm việc hiện tại
    const nhanVien = await NhanVien.findById(id_nhanVien).session(session);

    if (!nhanVien) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ msg: "Nhân viên không tồn tại!" });
    }

    const caLamViec = await CaLamViec.findOne({
      id_nhaHang: nhanVien.id_nhaHang,
      ketThuc: null,
    }).session(session);

    if (!caLamViec) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ msg: "Không tìm thấy ca làm việc hiện tại!" });
    }

    // 4. Kiểm tra xem bàn đã có hóa đơn chưa
    // Tìm HoaDon với id_ban và trangThai "Chưa Thanh Toán"
    let hoaDon = await HoaDon.findOne({
      id_ban: id_ban,
      trangThai: "Chưa Thanh Toán",
    }).session(session);

    let isNewHoaDon = false;

    if (!hoaDon) {
      // Nếu bàn chưa có hóa đơn, tạo mới
      hoaDon = new HoaDon({
        tongGiaTri: 0,
        id_nhanVien: id_nhanVien,
        nhanVienTao: nhanVien.hoTen,
        id_caLamViec: caLamViec._id,
        thoiGianVao: new Date(),
        id_ban: id_ban,
        trangThai: "Chưa Thanh Toán", // Hoặc trạng thái phù hợp
      });
      const savedHoaDon = await hoaDon.save({ session });
      hoaDon = savedHoaDon;
      isNewHoaDon = true;
    }

    // 5. Tạo ChiTietHoaDon mới cho mỗi món trong danh sách order
    let totalGiaTriMoi = 0;

    for (let item of orders) {
      const monAn = await MonAn.findOne({
        tenMon: item.tenMon,
        giaMonAn: item.giaMonAn,
      }).session(session);

      if (!monAn) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          msg: `Món ăn ${item.tenMon} với giá ${item.giaMonAn} không tồn tại!`,
        });
      }

      const chiTiet = new ChiTietHoaDon({
        soLuongMon: item.soLuong,
        giaTien: monAn.giaMonAn * item.soLuong,
        id_monAn: monAn._id,
        monAn: {
          tenMon: monAn.tenMon,
          anhMonAn: monAn.anhMonAn,
          giaMonAn: monAn.giaMonAn,
        },
        id_hoaDon: hoaDon._id,
      });
      await chiTiet.save({ session });

      totalGiaTriMoi += monAn.giaMonAn * item.soLuong;
    }

    // 6. Cập nhật tổng giá trị của hóa đơn
    hoaDon.tongGiaTri += totalGiaTriMoi;
    await hoaDon.save({ session });

    // 7. Cập nhật trạng thái bàn và danh sách order
    ban.trangThai = "Đang sử dụng"; // Cập nhật trạng thái bàn
    ban.danhSachOrder = []; // Reset danh sách order của bàn
    ban.trangThaiOrder = false;
    await ban.save({ session }); // Lưu thay đổi vào cơ sở dữ liệu

    // Commit transaction nếu mọi thứ đều thành công
    await session.commitTransaction();
    session.endSession();

    const io = req.app.get("io");

    if (isNewHoaDon) {
      io.emit("capNhatBan", {
        msg: "Đã tạo hóa đơn mới cho bàn!",
        id_ban: id_ban,
        hoaDon: hoaDon,
      });

      io.emit("xacNhanOrder", {
        msg: `Order của bạn đã được xác nhận, món ăn đang được chuẩn bị.`,
        id_ban: id_ban,
        hoaDon: hoaDon,
      });
    } else {
      io.emit("capNhatHoaDon", {
        msg: "Hóa đơn đã được cập nhật với các món mới!",
        id_ban: id_ban,
        hoaDon: hoaDon,
      });

      io.emit("xacNhanOrder", {
        msg: `Các món mới đã được thêm vào hóa đơn của bạn.`,
        id_ban: id_ban,
        hoaDon: hoaDon,
      });
    }

    res.status(201).json({
      msg: isNewHoaDon
        ? "Đặt món thành công, đã tạo hóa đơn!"
        : "Đặt món thành công, đã cập nhật hóa đơn!",
      hoaDon: hoaDon,
    });
  } catch (error) {
    // Rollback nếu có lỗi xảy ra
    await session.abortTransaction();
    session.endSession();
    console.error("Lỗi trong quá trình xử lý:", error.message);
    return res.status(400).json({ msg: error.message });
  }
};

// Phương thức gửi yêu cầu hủy món
exports.gui_yeu_cau_huy_mon = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id_chiTietHoaDon, id_nhanVien } = req.body;

    // 1. Tìm chi tiết hóa đơn
    const chiTietHoaDon = await ChiTietHoaDon.findById(
      id_chiTietHoaDon
    ).session(session);

    if (!chiTietHoaDon) {
      throw new Error("Chi tiết hóa đơn không tồn tại!");
    }

    // 2. Kiểm tra xem đã có yêu cầu hủy hay chưa
    if (chiTietHoaDon.lichSuXoa.isRequested) {
      throw new Error("Đã có yêu cầu hủy món này rồi!");
    }

    // 3. Cập nhật thông tin yêu cầu hủy
    chiTietHoaDon.lichSuXoa.isRequested = true;
    chiTietHoaDon.lichSuXoa.id_nhanVien = id_nhanVien;
    chiTietHoaDon.lichSuXoa.thoiGianYeuCau = new Date();

    await chiTietHoaDon.save({ session });

    // 4. Lấy thông tin bàn từ hóa đơn
    const hoaDon = await HoaDon.findById(chiTietHoaDon.id_hoaDon).session(
      session
    );
    if (!hoaDon) {
      throw new Error("Hóa đơn không tồn tại!");
    }

    const ban = await Ban.findById(hoaDon.id_ban).session(session);
    if (!ban) {
      throw new Error("Bàn không tồn tại!");
    }

    const khuVuc = await KhuVuc.findById(ban.id_khuVuc).session(session);
    if (!khuVuc) {
      throw new Error("Khu vực không tồn tại!");
    }

    // 5. Gửi yêu cầu hủy món đến đầu bếp thông qua Socket.IO
    const io = req.app.get("io");
    io.to("DauBeps").emit("yeuCauHuyMon", {
      id_chiTietHoaDon: id_chiTietHoaDon,
      tenMon: chiTietHoaDon.monAn.tenMon,
      soLuongMon: chiTietHoaDon.soLuongMon,
      ban: ban.tenBan,
      khuVuc: khuVuc.tenKhuVuc,
    });

    // Commit giao dịch
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      msg: "Đã gửi yêu cầu hủy món thành công. Đang chờ đầu bếp xác nhận.",
    });
  } catch (error) {
    // Rollback giao dịch nếu có lỗi
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ msg: error.message });
  }
};

exports.xac_nhan_yeu_cau_huy_mon = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id_chiTietHoaDon, isApproved, id_nhanVien } = req.body;

    // 1. Tìm chi tiết hóa đơn
    const chiTietHoaDon = await ChiTietHoaDon.findById(
      id_chiTietHoaDon
    ).session(session);

    if (!chiTietHoaDon) {
      throw new Error("Chi tiết hóa đơn không tồn tại!");
    }

    // 2. Kiểm tra xem đã có yêu cầu hủy hay chưa
    if (!chiTietHoaDon.lichSuXoa.isRequested) {
      throw new Error("Không tìm thấy yêu cầu hủy món này!");
    }

    if (chiTietHoaDon.lichSuXoa.isApproved !== null) {
      throw new Error("Yêu cầu hủy món đã được xử lý trước đó!");
    }

    // 3. Cập nhật kết quả xác nhận
    chiTietHoaDon.lichSuXoa.isApproved = isApproved;
    chiTietHoaDon.lichSuXoa.id_nhanVien = id_nhanVien; // Nhân viên đầu bếp xác nhận
    chiTietHoaDon.lichSuXoa.thoiGianXacNhan = new Date();

    if (isApproved) {
      // Nếu được phê duyệt, cập nhật trạng thái món ăn trong bàn và hóa đơn
      // Tìm hóa đơn
      const hoaDon = await HoaDon.findById(chiTietHoaDon.id_hoaDon).session(
        session
      );
      if (!hoaDon) {
        throw new Error("Hóa đơn không tồn tại!");
      }

      // Cập nhật tổng giá trị hóa đơn
      hoaDon.tongGiaTri -= chiTietHoaDon.giaTien;
      await hoaDon.save({ session });

      // Nếu cần, bạn có thể cập nhật trạng thái bàn nếu tổng giá trị hóa đơn giảm xuống 0
      if (hoaDon.tongGiaTri <= 0) {
        const ban = await Ban.findById(hoaDon.id_ban).session(session);
        if (ban) {
          ban.trangThai = "Trống";
          await ban.save({ session });
        }
      }
    }

    await chiTietHoaDon.save({ session });

    // 4. Gửi phản hồi đến nhân viên phục vụ bàn thông qua Socket.IO
    const io = req.app.get("io");
    io.to("NhanViens").emit("phanHoiHuyMon", {
      id_chiTietHoaDon: id_chiTietHoaDon,
      isApproved: isApproved,
    });

    // Commit giao dịch
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      msg: isApproved
        ? "Yêu cầu hủy món đã được phê duyệt."
        : "Yêu cầu hủy món đã bị từ chối.",
    });
  } catch (error) {
    // Rollback giao dịch nếu có lỗi
    await session.abortTransaction();
    session.endSession();
    return res.status(400).json({ msg: error.message });
  }
};

exports.tu_choi_dat_mon = async (req, res) => {
  try {
    const { id_ban, id_nhanVien } = req.body;

    // 1. Tìm thông tin bàn theo ID
    const thongTinBan = await Ban.findById(id_ban);
    if (!thongTinBan) {
      return res.status(400).json({ msg: "Bàn không còn khả dụng!" });
    }

    // 2. Xóa thông tin danh sách order và cập nhật trạng thái order
    thongTinBan.danhSachOrder = []; // Xóa danh sách món ăn đã order
    thongTinBan.trangThaiOrder = false; // Cập nhật trạng thái order về false
    await thongTinBan.save(); // Lưu thay đổi

    // 3. Lấy tên nhân viên từ ID nhân viên (giả định có model NhanVien)
    const nhanVien = await NhanVien.findById(id_nhanVien);
    const tenNhanVien = nhanVien ? nhanVien.hoTen : "Nhân viên chưa xác định";

    // 4. Gửi thông báo đến khách hàng thông qua socket.io
    const io = req.app.get("io");
    io.emit("huyDatMon", {
      msg: `Order của bạn đã bị hủy bởi ${tenNhanVien}.`,
      id_ban: id_ban,
    });

    // 5. Phản hồi thành công
    return res.status(200).json({
      msg: "Order đã được hủy thành công!",
    });
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};
