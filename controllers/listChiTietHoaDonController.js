const { ChiTietHoaDon } = require("../models/chiTietHoaDonModel");
const { HoaDon } = require("../models/hoaDonModel");

exports.addListChiTietHoaDon = async (req, res, next) => {
    try {
        const { id_hoaDon, monAn } = req.body; // Nhận id_hoaDon và danh sách món ăn
    
        if (!id_hoaDon || !Array.isArray(monAn) || monAn.length === 0) {
          return res.status(400).json({ msg: "Dữ liệu không hợp lệ" });
        }
    
        // Lấy hóa đơn và kiểm tra xem có tồn tại không
        const hoaDon = await HoaDon.findById(id_hoaDon).populate('id_chiTietHoaDon');
    
        if (!hoaDon) {
          return res.status(404).json({ msg: "Không tìm thấy hóa đơn" });
        }
    
        // Lặp qua các món ăn truyền lên
        for (let item of monAn) {
          const { id_monAn, soLuong, giaTien} = item;
    
          // Kiểm tra món ăn đã có trong chi tiết hóa đơn hay chưa
          const existingChiTiet = hoaDon.id_chiTietHoaDon.find(chiTiet => chiTiet.id_monAn.toString() === id_monAn);
    
          if (existingChiTiet) {
            // Nếu số lượng bằng 0 thì xóa chi tiết hóa đơn
            if (soLuong === 0) {
              await ChiTietHoaDon.findByIdAndDelete(existingChiTiet._id);
              hoaDon.id_chiTietHoaDon = hoaDon.id_chiTietHoaDon.filter(chiTiet => chiTiet._id.toString() !== existingChiTiet._id.toString());
            } else {
              // Cập nhật số lượng nếu số lượng khác 0
              existingChiTiet.soLuongMon = soLuong;
              existingChiTiet.giaTien = giaTien;
              await existingChiTiet.save();
            }
          } else if (soLuong > 0) {
            // Nếu món ăn chưa có và số lượng > 0 thì thêm chi tiết hóa đơn mới
            const newChiTiet = new ChiTietHoaDon({
              soLuongMon: soLuong,
              giaTien: giaTien, // Tùy thuộc vào logic của bạn, giá tiền có thể được xác định theo id_monAn
              id_monAn: id_monAn
            });
            await newChiTiet.save();
            hoaDon.id_chiTietHoaDon.push(newChiTiet);
          }
        }
    
        // Lưu lại hóa đơn với danh sách chi tiết hóa đơn cập nhật
        await hoaDon.save();
    
        res.status(200).json({
          msg: "Cập nhật chi tiết hóa đơn thành công",
          data: hoaDon
        });
      } catch (error) {
        res.status(400).json({ msg: error.message });
      }
};
