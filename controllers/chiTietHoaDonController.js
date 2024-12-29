const { ChiTietHoaDon } = require("../models/chiTietHoaDonModel");
const { HoaDon } = require("../models/hoaDonModel");
const { MonAn } = require("../models/monAnModel");

// Thêm chi tiết hóa đơn
exports.them_chi_tiet_hoa_don = async (req, res, next) => {
  try {
    const { soLuongMon, trangThai, id_monAn } = req.body;
    // Kiểm tra xem món ăn có tồn tại hay không
    const monAn = await MonAn.findById(id_monAn);

    if (!monAn) {
      return res.status(404).json({ msg: "Món ăn không tồn tại" });
    }

    const giaTien = soLuongMon * monAn.giaMonAn;

    // Tạo chi tiết hóa đơn mới
    const chiTietHoaDon = new ChiTietHoaDon({
      soLuongMon,
      trangThai,
      giaTien,
      id_monAn,
    });
    const result = await chiTietHoaDon.save();

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Cập nhật chi tiết hóa đơn
exports.cap_nhat_chi_tiet_hoa_don = async (req, res) => {
  try {
    const { id } = req.params;
    const { soLuongMon, trangThai, giaTien, id_monAn } = req.body;

    // Tìm chi tiết hóa đơn theo ID
    const chiTietHoaDon = await ChiTietHoaDon.findById(id);
    if (!chiTietHoaDon) {
      return res.status(404).json({ msg: "Chi tiết hóa đơn không tồn tại" });
    }

    // Cập nhật các thông tin của chi tiết hóa đơn

    // Kiểm tra nếu soLuongMon = 0 thì xoá chi tiết hóa đơn
    if (soLuongMon === 0) {
      await ChiTietHoaDon.findByIdAndDelete(id);
      return res.status(200).json({ msg: "Chi tiết hóa đơn đã được xóa" });
    }
    // Kiểm tra và cập nhật thông tin nếu có thay đổi
    if (soLuongMon !== undefined && soLuongMon !== chiTietHoaDon.soLuongMon) {
      chiTietHoaDon.soLuongMon = soLuongMon;
    }
    if (trangThai !== undefined && trangThai !== chiTietHoaDon.trangThai) {
      chiTietHoaDon.trangThai = trangThai;
    }
    if (giaTien !== undefined && giaTien !== chiTietHoaDon.giaTien) {
      chiTietHoaDon.giaTien = giaTien;
    }
    if (id_monAn !== undefined && id_monAn !== chiTietHoaDon.id_monAn) {
      chiTietHoaDon.id_monAn = id_monAn;
    }

    const result = await chiTietHoaDon.save();

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Cập nhật trạng thái chi tiết hóa đơn
exports.cap_nhat_trang_thai_cthd = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm chi tiết hóa đơn theo ID
    const chiTietHoaDon = await ChiTietHoaDon.findById(id);

    // Kiểm tra nếu không tìm thấy chi tiết hóa đơn
    if (!chiTietHoaDon) {
      return res.status(404).json({ msg: "Không tìm thấy chi tiết hóa đơn" });
    }

    const hoaDon = await HoaDon.findById(chiTietHoaDon.id_hoaDon);

    // Kiểm tra trạng thái hiện tại và trạng thái mới
    const checkHoanThanh = !chiTietHoaDon.trangThai; // Nếu hiện tại false, muốn chuyển thành true

    if (checkHoanThanh) {
      // Tìm kiếm ChiTietHoaDon đã hoàn thành cho cùng một HoaDon và cùng một monAn
      const checkChiTietHT = await ChiTietHoaDon.findOne({
        id_hoaDon: chiTietHoaDon.id_hoaDon,
        "monAn.tenMon": chiTietHoaDon.monAn.tenMon,
        trangThai: true,
      });

      if (checkChiTietHT) {
        // Nếu đã có ChiTietHoaDon hoàn thành, cập nhật số lượng và giá tiền
        checkChiTietHT.soLuongMon += chiTietHoaDon.soLuongMon;
        checkChiTietHT.giaTien += chiTietHoaDon.giaTien;
        checkChiTietHT.ghiChu = chiTietHoaDon.ghiChu || checkChiTietHT.ghiChu;
        await checkChiTietHT.save();

        // Xóa ChiTietHoaDon hiện tại
        await ChiTietHoaDon.findByIdAndDelete(id);

        // Thông báo qua WebSocket
        const io = req.app.get("io");
        io.to(`ban_${hoaDon.id_ban}`)
          .to("NhanViens")
          .emit("hoanThanhMon", {
            msg: `Đầu bếp đã hoàn thành món ${chiTietHoaDon.monAn.tenMon}!`,
          });

        // Cập nhật tổng giá trị hóa đơn
        const chiTietList = await ChiTietHoaDon.find({
          id_hoaDon: chiTietHoaDon.id_hoaDon,
        });
        const tongGiaTri = chiTietList.reduce(
          (total, ct) => total + ct.giaTien,
          0
        );

        // Cập nhật tổng giá trị trong hóa đơn
        await HoaDon.findByIdAndUpdate(chiTietHoaDon.id_hoaDon, { tongGiaTri });

        return res.status(200).json({
          msg: "Cập nhật trạng thái và tổng giá trị hóa đơn thành công",
          data: await ChiTietHoaDon.find({
            id_hoaDon: chiTietHoaDon.id_hoaDon,
          }),
        });
      } else {
        // Nếu chưa có ChiTietHoaDon hoàn thành, cập nhật trạng thái của ChiTietHoaDon hiện tại
        chiTietHoaDon.trangThai = true;
        const result = await chiTietHoaDon.save();

        // Thông báo qua WebSocket
        const io = req.app.get("io");
        io.to(`ban_${hoaDon.id_ban}`)
          .to("NhanViens")
          .emit("hoanThanhMon", {
            msg: `Đầu bếp đã hoàn thành món ${chiTietHoaDon.monAn.tenMon}!`,
          });

        // Cập nhật tổng giá trị hóa đơn
        const chiTietList = await ChiTietHoaDon.find({
          id_hoaDon: chiTietHoaDon.id_hoaDon,
        });
        const tongGiaTri = chiTietList.reduce(
          (total, ct) => total + ct.giaTien,
          0
        );

        // Cập nhật tổng giá trị trong hóa đơn
        await HoaDon.findByIdAndUpdate(chiTietHoaDon.id_hoaDon, { tongGiaTri });

        return res.status(200).json({
          msg: "Cập nhật trạng thái hóa đơn thành công",
          data: result,
        });
      }
    } else {
      // Nếu đang đánh dấu thành không hoàn thành, chỉ đảo ngược trạng thái
      chiTietHoaDon.trangThai = false;
      const result = await chiTietHoaDon.save();

      return res.status(200).json({
        msg: "Cập nhật trạng thái hóa đơn thành công",
        data: result,
      });
    }
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};

// Xóa chi tiết hóa đơn
exports.xoa_chi_tiet_hoa_don = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Xóa chi tiết hóa đơn theo ID
    const chiTietHoaDon = await ChiTietHoaDon.findByIdAndDelete(id);
    if (!chiTietHoaDon) {
      return res.status(404).json({ msg: "Chi tiết hóa đơn không tồn tại" });
    }
    res.status(200).json({ msg: "Đã xóa chi tiết hóa đơn" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Lấy danh sách chi tiết hóa đơn
exports.lay_ds_chi_tiet_hoa_don = async (req, res, next) => {
  try {
    const { id_hoaDon } = req.body;

    const chiTietHoaDons = await ChiTietHoaDon.find({ id_hoaDon }).sort({
      createdAt: 1,
    });

    if (!chiTietHoaDons) {
      return res.status(400).json({ msg: "Không có chi tiết hóa đơn nào!" });
    } else {
      return res.status(200).json(chiTietHoaDons);
    }
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};
