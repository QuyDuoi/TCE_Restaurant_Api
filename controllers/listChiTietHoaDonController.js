const { ChiTietHoaDon } = require("../models/chiTietHoaDonModel");
const { HoaDon } = require("../models/hoaDonModel");
const { MonAn } = require("../models/monAnModel");

exports.addListChiTietHoaDon = async (req, res, next) => {
  try {
    const { id_hoaDon, monAn } = req.body; // Nhận id_hoaDon và danh sách món ăn

    if (!id_hoaDon || !Array.isArray(monAn) || monAn.length === 0) {
      return res.status(400).json({ msg: "Dữ liệu không hợp lệ" });
    }

    // Kiểm tra xem hóa đơn có tồn tại không
    const hoaDon = await HoaDon.findById(id_hoaDon);
    if (!hoaDon) {
      return res.status(404).json({ msg: "Không tìm thấy hóa đơn" });
    }

    // Lặp qua các món ăn truyền lên
    for (let item of monAn) {
      const { id_monAn, tenMon, giaMonAn, soLuong, giaTien, ghiChu } = item;

      // Lấy thông tin món ăn từ bảng MonAn
      let monAnData = null;
      if (id_monAn) {
        monAnData = await MonAn.findById(id_monAn);
        if (!monAnData) {
          return res
            .status(404)
            .json({ msg: `Không tìm thấy món ăn với id ${id_monAn}` });
        }
      }

      // Kiểm tra xem đã có chi tiết hóa đơn cho món ăn này và hóa đơn hiện tại chưa
      const checkChiTietHD = await ChiTietHoaDon.findOne({
        id_hoaDon,
        "monAn.tenMon": monAnData ? monAnData.tenMon : null, // So sánh theo tên món ăn nếu tồn tại
      });

      if (checkChiTietHD) {
        // Nếu số lượng bằng 0 thì xóa chi tiết hóa đơn
        if (soLuong === 0) {
          await ChiTietHoaDon.findByIdAndDelete(checkChiTietHD._id);
        } else {
          // Cập nhật số lượng và giá tiền nếu số lượng khác 0
          checkChiTietHD.soLuongMon = soLuong;
          checkChiTietHD.giaTien = giaTien;
          checkChiTietHD.ghiChu = ghiChu || checkChiTietHD.ghiChu;
          await checkChiTietHD.save();
        }
      } else if (soLuong > 0) {
        // Nếu món ăn chưa có và số lượng > 0 thì thêm chi tiết hóa đơn mới
        const newChiTiet = new ChiTietHoaDon({
          id_hoaDon: id_hoaDon,
          soLuongMon: soLuong,
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
                // Trường hợp món ăn không có trong bảng `MonAn` (món ăn tùy chọn)
                tenMon: tenMon,
                giaMonAn: giaMonAn,
              },
        });
        await newChiTiet.save();
      }
    }

    // Tính tổng giá trị hóa đơn
    const chiTietList = await ChiTietHoaDon.find({ id_hoaDon });
    const tongGiaTri = chiTietList.reduce((total, chiTiet) => total + chiTiet.giaTien, 0);

    // Cập nhật tổng giá trị trong hóa đơn
    hoaDon.tongGiaTri = tongGiaTri;
    await hoaDon.save();

    const io = req.app.get("io");
    io.emit("lenMon", {
      msg: "Món ăn mới được tạo!",
    });

    res.status(200).json({
      msg: "Cập nhật chi tiết hóa đơn thành công",
      data: await ChiTietHoaDon.find({ id_hoaDon }), // Trả về tất cả các chi tiết của hóa đơn sau khi cập nhật
    });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
