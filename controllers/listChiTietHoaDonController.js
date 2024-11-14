const { ChiTietHoaDon } = require("../models/chiTietHoaDonModel");
const { HoaDon } = require("../models/hoaDonModel");

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
      const { id_monAn, soLuong, giaTien } = item;

      // Kiểm tra xem đã có chi tiết hóa đơn cho món ăn này và hóa đơn hiện tại chưa
      const checkChiTietHD = await ChiTietHoaDon.findOne({ id_hoaDon, id_monAn });

      if (checkChiTietHD) {
        // Nếu số lượng bằng 0 thì xóa chi tiết hóa đơn
        if (soLuong === 0) {
          await ChiTietHoaDon.findByIdAndDelete(checkChiTietHD._id);
        } else {
          // Cập nhật số lượng nếu số lượng khác 0
          checkChiTietHD.soLuongMon = soLuong;
          checkChiTietHD.giaTien = giaTien;
          await checkChiTietHD.save();
        }
      } else if (soLuong > 0) {
        // Nếu món ăn chưa có và số lượng > 0 thì thêm chi tiết hóa đơn mới
        const newChiTiet = new ChiTietHoaDon({
          id_hoaDon: id_hoaDon, // Thêm id_hoaDon vào chi tiết hóa đơn mới
          id_monAn: id_monAn,
          soLuongMon: soLuong,
          giaTien: giaTien,
        });
        await newChiTiet.save();
      }
    }

    res.status(200).json({
      msg: "Cập nhật chi tiết hóa đơn thành công",
      data: await ChiTietHoaDon.find({ id_hoaDon }) // Trả về tất cả các chi tiết của hóa đơn sau khi cập nhật
    });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
