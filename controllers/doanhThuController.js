
const { HoaDon } = require("../models/hoaDonModel");
exports.thongKeTongDoanhThu = async (req, res, next) => {
  try {
    let { type } = req.query; // type có thể là 'today', '7days', '30days', 'custom'
    if (!type) {
      type = 'today'; // Mặc định là hôm nay nếu không truyền type
    }
    let startDate, endDate;

    // Xác định ngày bắt đầu và kết thúc dựa trên loại thống kê
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Thiết lập thời gian bắt đầu của ngày hôm nay

    switch (type) {
      case 'today':
        startDate = new Date(today);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999); // Kết thúc ngày hôm nay
        break;
        case 'yesterday':
          startDate = new Date(today);
          startDate.setDate(startDate.getDate() - 1); // Ngày hôm qua
          endDate = new Date(startDate);
          endDate.setHours(23, 59, 59, 999); // Kết thúc ngày hôm qua
          break;
      case '7days':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 6); // Bắt đầu từ 7 ngày trước
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999); // Kết thúc vào cuối ngày hôm nay
        break;
      case '30days':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 29); // Bắt đầu từ 30 ngày trước
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999); // Kết thúc vào cuối ngày hôm nay
        break;
      case 'custom':
        startDate = new Date(req.query.startDate);
        endDate = new Date(req.query.endDate);
        if (!startDate || !endDate) {
          return res.status(400).json({ msg: "Cần cung cấp ngày bắt đầu và kết thúc cho loại thống kê tùy chỉnh" });
        }
        break;
      default:
        return res.status(400).json({ msg: "Loại thống kê không hợp lệ" });
    }

    const thongKe = await HoaDon.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: null, // Nhóm tất cả kết quả lại với nhau
          tongDoanhThu: { $sum: "$tongGiaTri" } // Tính tổng giá trị thanh toán
        }
      },
      {
        $project:{
          _id:0,
          tongDoanhThu: 1 // Giữ trường tongDoanhThu
        }
      }
    ]);

    res.status(200).json(thongKe);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};