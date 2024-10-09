const { HoaDon } = require("../models/hoaDonModel");
const moment = require("moment"); // Đảm bảo đã cài đặt thư viện moment

exports.thongKeDoanhThu = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let start, end;

    if (!startDate || !endDate) {
      // Mặc định là hôm nay nếu không có tham số
      start = moment().startOf('day'); // 00:00 ngày hôm nay
      end = moment().endOf('day');     // 23:59 ngày hôm nay
    } else {
      // Parse ngày bắt đầu và kết thúc từ query
      start = moment(startDate).startOf('day');
      end = moment(endDate).endOf('day');
    }

    // Aggregate query để tính doanh thu
    const result = await HoaDon.aggregate([
      {
        $match: {
          trangThai: "Đã Thanh Toán",
          createdAt: {
            $gte: start.toDate(), // Lớn hơn hoặc bằng ngày bắt đầu
            $lte: end.toDate()    // Nhỏ hơn hoặc bằng ngày kết thúc
          }
        }
      },
      {
        $group: {
          _id: null,
          tongDoanhThu: { $sum: "$tongGiaTri" }
        }
      }
    ]);

    if (result.length > 0) {
      res.status(200).json({ doanhThu: result[0].tongDoanhThu });
    } else {
      res.status(200).json({ doanhThu: 0 });
    }
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
