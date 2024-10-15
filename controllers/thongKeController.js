const { ChiTietHoaDon } = require("../models/chiTietHoaDonModel");
const { HoaDon } = require("../models/hoaDonModel");

//thongketong
exports.thongKeTongDoanhThu = async (req, res, next) => {
  try {
    let { type } = req.query; // type có thể là 'today','yesterday', '7days', '30days', 'custom'
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
      case 'lastMonth':
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1); // Ngày đầu tiên của tháng trước
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0); // Ngày cuối cùng của tháng trước
        startDate = firstDayLastMonth;
        endDate = lastDayLastMonth;
        endDate.setHours(23, 59, 59, 999); // Đặt thời điểm cuối ngày
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
        $project: {
          _id: 0,
          tongDoanhThu: 1 // Giữ trường tongDoanhThu
        }
      }
    ]);

    res.status(200).json(thongKe);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

//top5
exports.lay_top_5_mon_an_ban_chay = async (req, res, next) => {
  try {
    let { type } = req.query; // type có thể là 'today','yesterday', '7days', '30days', 'custom'
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
      case 'lastMonth':
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1); // Ngày đầu tiên của tháng trước
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0); // Ngày cuối cùng của tháng trước
        startDate = firstDayLastMonth;
        endDate = lastDayLastMonth;
        endDate.setHours(23, 59, 59, 999); // Đặt thời điểm cuối ngày
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
    console.log('startDate', startDate)
    console.log('endDate', endDate)

    const topMonAn = await ChiTietHoaDon.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate } // Sử dụng trường createdAt cho việc lọc theo ngày
        }
      },
      {
        $group: {
          _id: "$id_monAn", // Nhóm theo ID món ăn
          soLuongMon: { $sum: "$soLuongMon" } // Tính tổng số lượng món ăn bán ra
        }
      },
      {
        $sort: { soLuongMon: -1 } // Sắp xếp theo số lượng giảm dần
      },
      {
        $limit: 5 // Giới hạn lấy ra 5 bản ghi
      },
      {
        $lookup: { // Thêm thông tin chi tiết về món ăn từ bảng MonAn
          from: "MonAn", // Bảng MonAn
          localField: "_id",
          foreignField: "_id",
          as: "chiTietMonAn"
        }
      },
      {
        $unwind: "$chiTietMonAn" // Bỏ bọc mảng để dễ dàng truy xuất thông tin món ăn
      },
      {
        $project: { // Chỉ định các trường sẽ trả về
          _id: 1,
          tenMon: "$chiTietMonAn.tenMon", // Lấy tên món ăn từ bảng MonAn
          soLuongMon: 1
        }
      }
    ]);

    res.status(200).json(topMonAn);

  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};


exports.thong_ke_hinh_thuc_thanh_toan = async (req, res, next) => {
  try {
    let { type, hinhThucThanhToan } = req.query; // type có thể là 'today','yesterday', '7days', '30days', 'custom'

    if (hinhThucThanhToan === "true") {
      hinhThucThanhToan = true;
    } else if (hinhThucThanhToan === "false") {
      hinhThucThanhToan = false;
    }
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
      case 'lastMonth':
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1); // Ngày đầu tiên của tháng trước
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0); // Ngày cuối cùng của tháng trước
        startDate = firstDayLastMonth;
        endDate = lastDayLastMonth;
        endDate.setHours(23, 59, 59, 999); // Đặt thời điểm cuối ngày
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
    console.log('startDate', hinhThucThanhToan)

    const thongKeHTTT = await HoaDon.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }, // Lọc các hóa đơn theo ngày
          hinhThucThanhToan: hinhThucThanhToan // Giả sử bạn muốn thanh toán bằng tiền mặt (true), bạn có thể đặt điều kiện này dựa trên tham số truyền vào nếu cần
        }
      },
      {
        $group: {
          _id: null, // Nhóm tất cả các hóa đơn lại với nhau
          tongDoanhThu: { $sum: "$tongGiaTri" } // Tính tổng giá trị của tất cả các hóa đơn

        }
      },
      {
        $project: {
          _id: 0, // Không hiển thị trường _id trong kết quả
          tongDoanhThu: 1 // Hiển thị chỉ tổng doanh thu
        }
      }
    ]);

    res.status(200).json(thongKeHTTT);


  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};


exports.thongKeDoanhThuTheoNguon = async (req, res, next) => {
  try {
    let { type, id_ban } = req.query; // type có thể là 'today','yesterday', '7days', '30days', 'custom'

    if (id_ban === "" || id_ban === undefined) {
      id_ban = null;
    }
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
      case 'lastMonth':
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1); // Ngày đầu tiên của tháng trước
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0); // Ngày cuối cùng của tháng trước
        startDate = firstDayLastMonth;
        endDate = lastDayLastMonth;
        endDate.setHours(23, 59, 59, 999); // Đặt thời điểm cuối ngày
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
    console.log('id_ban', id_ban)

    const thongKeNguon = await HoaDon.aggregate([
      
    ]);

    res.status(200).json(thongKeNguon);


  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};