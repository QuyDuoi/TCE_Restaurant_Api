const { ChiTietHoaDon } = require("../models/chiTietHoaDonModel");
const { MonAn } = require("../models/monAnModel");

exports.lay_top_5_mon_an_ban_chay = async (req, res, next) => {
  try {
    const topMonAn = await ChiTietHoaDon.aggregate([
      {
        $group: {
          _id: "$id_monAn", // Nhóm theo id món ăn
          tongSoLuong: { $sum: "$soLuongMon" } // Tính tổng số lượng món ăn bán ra (dựa trên soLuongMon)
        }
      },
      {
        $sort: { tongSoLuong: -1 } // Sắp xếp theo tổng số lượng giảm dần
      },
      {
        $limit: 5 // Lấy 5 món bán chạy nhất
      },
      {
        $lookup: {
          from: "MonAn", // Tham chiếu sang bảng Món Ăn
          localField: "_id",
          foreignField: "_id",
          as: "monAn"
        }
      },
      {
        $unwind: "$monAn" // Trả về chi tiết món ăn
      }
    ]);

    res.status(200).json(topMonAn);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};