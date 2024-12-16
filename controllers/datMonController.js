const { Ban } = require("../models/banModel");
const { CaLamViec } = require("../models/caLamViecModel");
const { ChiTietHoaDon } = require("../models/chiTietHoaDonModel");
const { HoaDon } = require("../models/hoaDonModel");
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
        msg: `Bàn ${checkBan.tenBan} có Order!`,
      });

      return res.status(200).json({
        msg: "Đã gửi thông tin món, hãy liên hệ nhân viên để xác nhận món!",
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
  const session = await mongoose.startSession(); // Bắt đầu một session
  session.startTransaction(); // Khởi động transaction

  try {
    const { id_ban, id_nhanVien } = req.body;

    // 1. Kiểm tra sự tồn tại và trạng thái của bàn
    const xacNhanBan = await Ban.findById(id_ban).session(session);

    if (!xacNhanBan) {
      return res.status(400).json({msg: "Bàn không khả dụng!"});
    }

    const orders = xacNhanBan.danhSachOrder;

    // 2. Kiểm tra món ăn trong danh sách order
    for (let item of orders) {
      const monAn = await MonAn.findOne({
        tenMon: item.tenMon,
        giaMonAn: item.giaMonAn,
      }).session(session);

      if (!monAn) {
        return res.status(400).json({msg: `Món ăn ${item.tenMon} với giá ${item.giaMonAn} không tồn tại!`});
      }

      if (!monAn.trangThai) {
        return res.status(400).json({msg: `Món ăn ${item.tenMon} hiện tại không còn bán!`});
      }
    }

    const nhanVienXacNhan = await NhanVien.findById(id_nhanVien).session(
      session
    );

    const caLamHienTai = await CaLamViec.findOne({
      id_nhaHang: nhanVienXacNhan.id_nhaHang,
      ketThuc: null,
    }).session(session);

    // 3. Tạo hóa đơn mới
    const hoaDon = new HoaDon({
      tongGiaTri: orders.reduce(
        (total, item) => total + item.giaMonAn * item.soLuong,
        0
      ),
      id_nhanVien: id_nhanVien,
      nhanVienTao: nhanVienXacNhan.hoTen,
      id_caLamViec: caLamHienTai._id,
      thoiGianVao: new Date(),
      id_ban: id_ban,
    });
    const savedHoaDon = await hoaDon.save({ session });

    // 4. Tạo chi tiết hóa đơn (ChiTietHoaDon) cho mỗi món trong danh sách
    for (let item of orders) {
      const monAn = await MonAn.findOne({
        tenMon: item.tenMon,
        giaMonAn: item.giaMonAn,
      }).session(session);

      const chiTiet = new ChiTietHoaDon({
        soLuongMon: item.soLuong,
        giaTien: monAn.giaMonAn * item.soLuong,
        id_monAn: monAn._id,
        monAn: {
          tenMon: monAn.tenMon,
          anhMonAn: monAn.anhMonAn,
          giaMonAn: monAn.giaMonAn,
        },
        id_hoaDon: savedHoaDon._id,
      });
      await chiTiet.save({ session }); // Lưu chi tiết hóa đơn vào cơ sở dữ liệu
    }

    // 5. Cập nhật trạng thái bàn và danh sách order
    xacNhanBan.trangThai = "Đang sử dụng"; // Cập nhật trạng thái bàn
    xacNhanBan.danhSachOrder = []; // Reset danh sách order của bàn
    xacNhanBan.trangThaiOrder = false;
    await xacNhanBan.save({ session }); // Lưu thay đổi vào cơ sở dữ liệu

    // Commit transaction nếu mọi thứ đều thành công
    await session.commitTransaction();
    session.endSession();

    const io = req.app.get("io");
    io.emit("capNhatBan", {
      msg: "Cập nhật thông tin bàn!",
    });

    io.emit("xacNhanOrder", {
      msg: `Order của bạn đã được xác nhận, món ăn đang được chuẩn bị.`,
    });

    res.status(201).json({
      msg: "Đặt món thành công, đã tạo hóa đơn!",
      hoaDon: savedHoaDon,
    });
  } catch (error) {
    // Rollback nếu có lỗi xảy ra
    await session.abortTransaction();
    session.endSession();
    console.error("Lỗi trong quá trình xử lý:", error.message);
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
    const tenNhanVien = nhanVien
      ? nhanVien.hoTen
      : "Nhân viên chưa xác định";

    // 4. Gửi thông báo đến khách hàng thông qua socket.io
    const io = req.app.get("io");
    io.emit("huyDatMon", {
      msg: `Order của bạn đã bị hủy bởi ${tenNhanVien}.`,
      id_ban: id_ban
    });

    // 5. Phản hồi thành công
    return res.status(200).json({
      msg: "Order đã được hủy thành công!",
    });
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};
