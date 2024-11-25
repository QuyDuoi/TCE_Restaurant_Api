const { ChiTietHoaDon } = require("../models/chiTietHoaDonModel");
const { HoaDon } = require("../models/hoaDonModel");

//thongketong

exports.thongKeTongDoanhThu = async (req, res, next) => {
  try {
    let { type } = req.query; // type có thể là 'today','yesterday', '7days', '30days', 'custom'
    if (!type) {
      type = "today"; // Mặc định là hôm nay nếu không truyền type
    }
    let startDate, endDate;

    // Xác định ngày bắt đầu và kết thúc dựa trên loại thống kê
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Thiết lập thời gian bắt đầu của ngày hôm nay

    switch (type) {
      case "today":
        startDate = new Date(today);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999); // Kết thúc ngày hôm nay
        break;
      case "yesterday":
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 1); // Ngày hôm qua
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999); // Kết thúc ngày hôm qua
        break;
      case "7days":
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 6); // Bắt đầu từ 7 ngày trước
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999); // Kết thúc vào cuối ngày hôm nay
        break;
      case "30days":
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 29); // Bắt đầu từ 30 ngày trước
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999); // Kết thúc vào cuối ngày hôm nay
        break;
      case "lastMonth":
        const firstDayLastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        ); // Ngày đầu tiên của tháng trước
        const lastDayLastMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          0
        ); // Ngày cuối cùng của tháng trước
        startDate = firstDayLastMonth;
        endDate = lastDayLastMonth;
        endDate.setHours(23, 59, 59, 999); // Đặt thời điểm cuối ngày
        break;
      case "custom":
        startDate = new Date(req.query.startDate);
        endDate = new Date(req.query.endDate);
        if (!startDate || !endDate) {
          return res.status(400).json({
            msg: "Cần cung cấp ngày bắt đầu và kết thúc cho loại thống kê tùy chỉnh",
          });
        }
        break;
      case "choiceDay":
        const choiceDay = new Date(req.query.choiceDay);
        if (!choiceDay || isNaN(choiceDay.getTime())) {
          return res.status(400).json({ msg: "Ngày không hợp lệ" });
        }
        startDate = new Date(choiceDay);
        startDate.setHours(0, 0, 0, 0); // Thời gian bắt đầu
        endDate = new Date(choiceDay);
        endDate.setHours(23, 59, 59, 999); // Thời gian kết thúc
        break;
      default:
        return res.status(400).json({ msg: "Loại thống kê không hợp lệ" });
    }

    const thongKe = await HoaDon.aggregate([
      {
        $match: {
          trangThai: "Đã Thanh Toán",
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: null, // Nhóm tất cả kết quả lại với nhau
          tongDoanhThu: { $sum: "$tongGiaTri" }, // Tính tổng giá trị thanh toán
          tongKhuyenMai: { $sum: "$tienGiamGia" },
        },
      },
      {
        $project: {
          _id: 0,
          tongDoanhThu: 1, // Giữ trường tongDoanhThu
          tongKhuyenMai: 1,
        },
      },
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
      type = "today"; // Mặc định là hôm nay nếu không truyền type
    }
    let startDate, endDate;

    // Xác định ngày bắt đầu và kết thúc dựa trên loại thống kê
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Thiết lập thời gian bắt đầu của ngày hôm nay

    switch (type) {
      case "today":
        startDate = new Date(today);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999); // Kết thúc ngày hôm nay
        break;
      case "yesterday":
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 1); // Ngày hôm qua
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999); // Kết thúc ngày hôm qua
        break;
      case "7days":
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 6); // Bắt đầu từ 7 ngày trước
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999); // Kết thúc vào cuối ngày hôm nay
        break;
      case "30days":
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 29); // Bắt đầu từ 30 ngày trước
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999); // Kết thúc vào cuối ngày hôm nay
        break;
      case "lastMonth":
        const firstDayLastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        ); // Ngày đầu tiên của tháng trước
        const lastDayLastMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          0
        ); // Ngày cuối cùng của tháng trước
        startDate = firstDayLastMonth;
        endDate = lastDayLastMonth;
        endDate.setHours(23, 59, 59, 999); // Đặt thời điểm cuối ngày
        break;
      case "choiceDay":
        const choiceDay = new Date(req.query.choiceDay);
        if (!choiceDay || isNaN(choiceDay.getTime())) {
          return res.status(400).json({ msg: "Ngày không hợp lệ" });
        }
        startDate = new Date(choiceDay);
        startDate.setHours(0, 0, 0, 0); // Thời gian bắt đầu
        endDate = new Date(choiceDay);
        endDate.setHours(23, 59, 59, 999); // Thời gian kết thúc
        break;
      case "custom":
        startDate = new Date(req.query.startDate);
        endDate = new Date(req.query.endDate);
        if (!startDate || !endDate) {
          return res.status(400).json({
            msg: "Cần cung cấp ngày bắt đầu và kết thúc cho loại thống kê tùy chỉnh",
          });
        }
        break;
      default:
        return res.status(400).json({ msg: "Loại thống kê không hợp lệ" });
    }
    console.log("startDate", startDate);
    console.log("endDate", endDate);

    const topMonAn = await ChiTietHoaDon.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }, // Lọc theo ngày
        },
      },
      {
        $group: {
          _id: "$id_monAn", // Nhóm theo ID món ăn
          soLuongMon: { $sum: "$soLuongMon" }, // Tính tổng số lượng món ăn bán ra
        },
      },
      {
        $sort: { soLuongMon: -1 }, // Sắp xếp theo số lượng giảm dần
      },
      {
        $limit: 5, // Giới hạn lấy ra 5 bản ghi
      },
      {
        $lookup: {
          from: "MonAn", // Kết nối bảng MonAn
          localField: "_id", // ID món ăn trong bảng ChiTietHoaDon
          foreignField: "_id", // ID món ăn trong bảng MonAn
          as: "chiTietMonAn",
        },
      },
      {
        $unwind: "$chiTietMonAn", // Mở gói mảng chiTietMonAn để dễ truy xuất
      },
      {
        $project: {
          _id: 1, // ID món ăn
          tenMon: "$chiTietMonAn.tenMon", // Tên món ăn từ bảng MonAn
          anhMonAn: "$chiTietMonAn.anhMonAn", // Ảnh món ăn từ bảng MonAn
          soLuongMon: 1, // Số lượng món ăn
        },
      },
    ]);    

    res.status(200).json(topMonAn);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

//doi thanh tra ve tong tien mat va tong ck
exports.thong_ke_hinh_thuc_thanh_toan = async (req, res, next) => {
  try {
    let { type, hinhThucThanhToan } = req.query; // type có thể là 'today','yesterday', '7days', '30days', 'custom'

    if (hinhThucThanhToan === "true") {
      hinhThucThanhToan = true;
    } else if (hinhThucThanhToan === "false") {
      hinhThucThanhToan = false;
    }
    if (!type) {
      type = "today"; // Mặc định là hôm nay nếu không truyền type
    }
    let startDate, endDate;

    // Xác định ngày bắt đầu và kết thúc dựa trên loại thống kê
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Thiết lập thời gian bắt đầu của ngày hôm nay

    switch (type) {
      case "today":
        startDate = new Date(today);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999); // Kết thúc ngày hôm nay
        break;
      case "yesterday":
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 1); // Ngày hôm qua
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999); // Kết thúc ngày hôm qua
        break;
      case "7days":
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 6); // Bắt đầu từ 7 ngày trước
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999); // Kết thúc vào cuối ngày hôm nay
        break;
      case "30days":
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 29); // Bắt đầu từ 30 ngày trước
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999); // Kết thúc vào cuối ngày hôm nay
        break;
      case "lastMonth":
        const firstDayLastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        ); // Ngày đầu tiên của tháng trước
        const lastDayLastMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          0
        ); // Ngày cuối cùng của tháng trước
        startDate = firstDayLastMonth;
        endDate = lastDayLastMonth;
        endDate.setHours(23, 59, 59, 999); // Đặt thời điểm cuối ngày
        break;
      case "choiceDay":
        const choiceDay = new Date(req.query.choiceDay);
        if (!choiceDay || isNaN(choiceDay.getTime())) {
          return res.status(400).json({ msg: "Ngày không hợp lệ" });
        }
        startDate = new Date(choiceDay);
        startDate.setHours(0, 0, 0, 0); // Thời gian bắt đầu
        endDate = new Date(choiceDay);
        endDate.setHours(23, 59, 59, 999); // Thời gian kết thúc
        break;
      case "custom":
        startDate = new Date(req.query.startDate);
        endDate = new Date(req.query.endDate);
        if (!startDate || !endDate) {
          return res.status(400).json({
            msg: "Cần cung cấp ngày bắt đầu và kết thúc cho loại thống kê tùy chỉnh",
          });
        }
        break;
      default:
        return res.status(400).json({ msg: "Loại thống kê không hợp lệ" });
    }
    console.log("startDate", hinhThucThanhToan);

    // Lấy tổng Tiền Mặt và Chuyển Khoản
    const thongKeHTTT = await HoaDon.aggregate([
      {
        $match: {
          trangThai: "Đã Thanh Toán",
          createdAt: { $gte: startDate, $lte: endDate }, // Lọc các hóa đơn theo ngày
        },
      },
      {
        $group: {
          _id: null, // Nhóm tất cả các hóa đơn lại với nhau
          tongTienMat: {
            $sum: {
              $cond: [{ $eq: ["$hinhThucThanhToan", true] }, "$tongGiaTri", 0], // Tổng tiền mặt
            },
          },
          tongChuyenKhoan: {
            $sum: {
              $cond: [{ $eq: ["$hinhThucThanhToan", false] }, "$tongGiaTri", 0], // Tổng chuyển khoản
            },
          },
        },
      },
      {
        $project: {
          _id: 0, // Không hiển thị trường _id trong kết quả
          tongTienMat: 1,
          tongChuyenKhoan: 1,
        },
      },
    ]);

    res.status(200).json(thongKeHTTT);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

exports.thongKeDoanhThuTheoNguon = async (req, res, next) => {
  try {
    let { type } = req.query; // type có thể là 'today','yesterday', '7days', '30days', 'custom', 'choiseDay'

    // Kiểm tra type
    if (!type) {
      type = "today"; // Mặc định là hôm nay nếu không truyền type
    }

    let startDate, endDate;

    // Xác định ngày bắt đầu và kết thúc dựa trên loại thống kê
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Thiết lập thời gian bắt đầu của ngày hôm nay

    switch (type) {
      case "today":
        startDate = new Date(today);
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999); // Kết thúc ngày hôm nay
        break;
      case "yesterday":
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 1); // Ngày hôm qua
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999); // Kết thúc ngày hôm qua
        break;
      case "7days":
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 6); // Bắt đầu từ 7 ngày trước
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999); // Kết thúc vào cuối ngày hôm nay
        break;
      case "30days":
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 29); // Bắt đầu từ 30 ngày trước
        endDate = new Date(today);
        endDate.setHours(23, 59, 59, 999); // Kết thúc vào cuối ngày hôm nay
        break;
      case "lastMonth":
        const firstDayLastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        ); // Ngày đầu tiên của tháng trước
        const lastDayLastMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          0
        ); // Ngày cuối cùng của tháng trước
        startDate = firstDayLastMonth;
        endDate = lastDayLastMonth;
        endDate.setHours(23, 59, 59, 999); // Đặt thời điểm cuối ngày
        break;
      case "choiceDay":
        const choiceDay = new Date(req.query.choiceDay);
        if (!choiceDay || isNaN(choiceDay.getTime())) {
          return res.status(400).json({ msg: "Ngày không hợp lệ" });
        }
        startDate = new Date(choiceDay);
        startDate.setHours(0, 0, 0, 0); // Thời gian bắt đầu
        endDate = new Date(choiceDay);
        endDate.setHours(23, 59, 59, 999); // Thời gian kết thúc
        break;
      case "custom":
        startDate = new Date(req.query.startDate);
        endDate = new Date(req.query.endDate);
        if (!startDate || !endDate) {
          return res.status(400).json({
            msg: "Cần cung cấp ngày bắt đầu và kết thúc cho loại thống kê tùy chỉnh",
          });
        }
        break;
      default:
        return res.status(400).json({ msg: "Loại thống kê không hợp lệ" });
    }

    // Truy vấn thống kê dựa trên id_ban
    const thongKeNguon = await HoaDon.aggregate([
      {
        $match: {
          trangThai: "Đã Thanh Toán", // Chỉ tính hóa đơn đã thanh toán
          createdAt: { $gte: startDate, $lte: endDate }, // Lọc theo ngày
        },
      },
      {
        $group: {
          _id: {
            banTaiCho: {
              $cond: {
                if: { $eq: ["$id_ban", null] },
                then: "banMangDi",
                else: "banTaiCho",
              },
            },
          },
          tongDoanhThu: { $sum: "$tongGiaTri" }, // Tính tổng doanh thu
        },
      },
    ]);

    // Chuẩn hóa dữ liệu trả về
    const result = {
      banTaiCho: 0,
      banMangDi: 0,
    };

    thongKeNguon.forEach((item) => {
      if (item._id.banTaiCho === "banTaiCho") {
        result.banTaiCho = item.tongDoanhThu;
      } else if (item._id.banTaiCho === "banMangDi") {
        result.banMangDi = item.tongDoanhThu;
      }
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
