const mongoose = require("mongoose");
const { HoaDon } = require("../models/hoaDonModel");

const getDateRange = (type, req) => {
  let startDate, endDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today

  switch (type) {
    case "today":
      startDate = new Date(today);
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
      break;

    case "yesterday":
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 1);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
      break;

    case "7days":
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 6); // Includes today
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
      break;

    case "30days":
      startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 29); // Includes today
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
      break;

    case "lastMonth":
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    case "custom":
      startDate = new Date(req.query.startDate);
      endDate = new Date(req.query.endDate);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error(
          "Cần cung cấp ngày bắt đầu và kết thúc hợp lệ cho loại thống kê tùy chỉnh"
        );
      }
      break;

    case "choiceDay":
      const choiceDay = new Date(req.query.choiceDay);
      if (isNaN(choiceDay.getTime())) {
        throw new Error("Ngày không hợp lệ");
      }
      startDate = new Date(choiceDay);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(choiceDay);
      endDate.setHours(23, 59, 59, 999);
      break;

    default:
      throw new Error("Loại thống kê không hợp lệ");
  }

  return { startDate, endDate };
};

/**
 * 1. Thống Kê Tổng Doanh Thu
 * Tính tổng doanh thu và tổng khuyến mãi cho một nhà hàng cụ thể trong khoảng thời gian xác định.
 */
exports.thongKeTongDoanhThu = async (req, res, next) => {
  try {
    let { type, id_nhaHang } = req.query; // 'today','yesterday', '7days', '30days', 'custom', 'lastMonth', 'choiceDay'

    if (!id_nhaHang) {
      return res.status(400).json({ msg: "Cần cung cấp id_nhaHang" });
    }

    if (!type) {
      type = "today"; // Default to today
    }

    let startDate, endDate;
    try {
      ({ startDate, endDate } = getDateRange(type, req));
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }

    const thongKe = await HoaDon.aggregate([
      {
        $match: {
          trangThai: "Đã Thanh Toán",
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $lookup: {
          from: "CaLamViec", // Ensure the collection name matches your database
          localField: "id_caLamViec",
          foreignField: "_id",
          as: "caLamViec",
        },
      },
      { $unwind: "$caLamViec" },
      {
        $match: {
          "caLamViec.id_nhaHang": new mongoose.Types.ObjectId(id_nhaHang),
        },
      },
      {
        $group: {
          _id: null,
          tongDoanhThu: { $sum: "$tongGiaTri" },
          tongKhuyenMai: { $sum: "$tienGiamGia" },
        },
      },
      {
        $project: {
          _id: 0,
          tongDoanhThu: 1,
          tongKhuyenMai: 1,
        },
      },
    ]);

    // If no data found, return zero values
    const result = thongKe[0] || { tongDoanhThu: 0, tongKhuyenMai: 0 };

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

/**
 * 2. Lấy Top 5 Món Ăn Bán Chạy
 * Truy xuất 5 món ăn bán chạy nhất cho một nhà hàng cụ thể trong khoảng thời gian xác định.
 */
exports.lay_top_5_mon_an_ban_chay = async (req, res, next) => {
  try {
    let { type, id_nhaHang } = req.query; // 'today','yesterday', '7days', '30days', 'custom', 'lastMonth', 'choiceDay'

    if (!id_nhaHang) {
      return res.status(400).json({ msg: "Cần cung cấp id_nhaHang" });
    }

    if (!type) {
      type = "today"; // Default to today
    }

    let startDate, endDate;
    try {
      ({ startDate, endDate } = getDateRange(type, req));
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }

    const topMonAn = await HoaDon.aggregate([
      {
        $match: {
          trangThai: "Đã Thanh Toán",
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $lookup: {
          from: "CaLamViec",
          localField: "id_caLamViec",
          foreignField: "_id",
          as: "caLamViec",
        },
      },
      { $unwind: "$caLamViec" },
      {
        $match: {
          "caLamViec.id_nhaHang": new mongoose.Types.ObjectId(id_nhaHang),
        },
      },
      {
        $lookup: {
          from: "ChiTietHoaDon",
          localField: "_id",
          foreignField: "id_hoaDon",
          as: "chiTietHoaDon",
        },
      },
      { $unwind: "$chiTietHoaDon" },
      {
        $group: {
          _id: "$chiTietHoaDon.id_monAn",
          soLuongMon: { $sum: "$chiTietHoaDon.soLuongMon" },
        },
      },
      { $sort: { soLuongMon: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: "MonAn",
          localField: "_id",
          foreignField: "_id",
          as: "chiTietMonAn",
        },
      },
      { $unwind: "$chiTietMonAn" },
      {
        $project: {
          _id: 1,
          tenMon: "$chiTietMonAn.tenMon",
          anhMonAn: "$chiTietMonAn.anhMonAn",
          soLuongMon: 1,
        },
      },
    ]);

    res.status(200).json(topMonAn);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

/**
 * 3. Thống Kê Hình Thức Thanh Toán
 * Tính tổng tiền mặt và tổng tiền chuyển khoản cho một nhà hàng cụ thể trong khoảng thời gian xác định.
 */
exports.thong_ke_hinh_thuc_thanh_toan = async (req, res, next) => {
  try {
    let { type, id_nhaHang } = req.query; // 'today','yesterday', '7days', '30days', 'custom', 'lastMonth', 'choiceDay'

    if (!id_nhaHang) {
      return res.status(400).json({ msg: "Cần cung cấp id_nhaHang" });
    }

    if (!type) {
      type = "today"; // Default to today
    }

    let startDate, endDate;
    try {
      ({ startDate, endDate } = getDateRange(type, req));
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }

    const thongKeHTTT = await HoaDon.aggregate([
      {
        $match: {
          trangThai: "Đã Thanh Toán",
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $lookup: {
          from: "CaLamViec",
          localField: "id_caLamViec",
          foreignField: "_id",
          as: "caLamViec",
        },
      },
      { $unwind: "$caLamViec" },
      {
        $match: {
          "caLamViec.id_nhaHang": new mongoose.Types.ObjectId(id_nhaHang),
        },
      },
      {
        $group: {
          _id: null,
          tongTienMat: {
            $sum: {
              $cond: [{ $eq: ["$hinhThucThanhToan", false] }, "$tongGiaTri", 0],
            },
          },
          tongChuyenKhoan: {
            $sum: {
              $cond: [{ $eq: ["$hinhThucThanhToan", true] }, "$tongGiaTri", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          tongTienMat: 1,
          tongChuyenKhoan: 1,
        },
      },
    ]);

    // If no data found, return zero values
    const result = thongKeHTTT[0] || { tongTienMat: 0, tongChuyenKhoan: 0 };

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

/**
 * 4. Thống Kê Doanh Thu Theo Nguồn
 * Tính tổng doanh thu từ bàn tại chỗ và bán mang đi cho một nhà hàng cụ thể trong khoảng thời gian xác định.
 */
exports.thongKeDoanhThuTheoNguon = async (req, res, next) => {
  try {
    let { type, id_nhaHang } = req.query; // 'today','yesterday', '7days', '30days', 'custom', 'lastMonth', 'choiceDay'

    if (!id_nhaHang) {
      return res.status(400).json({ msg: "Cần cung cấp id_nhaHang" });
    }

    if (!type) {
      type = "today"; // Default to today
    }

    let startDate, endDate;
    try {
      ({ startDate, endDate } = getDateRange(type, req));
    } catch (error) {
      return res.status(400).json({ msg: error.message });
    }

    const thongKeNguon = await HoaDon.aggregate([
      {
        $match: {
          trangThai: "Đã Thanh Toán",
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $lookup: {
          from: "CaLamViec",
          localField: "id_caLamViec",
          foreignField: "_id",
          as: "caLamViec",
        },
      },
      { $unwind: "$caLamViec" },
      {
        $match: {
          "caLamViec.id_nhaHang": new mongoose.Types.ObjectId(id_nhaHang),
        },
      },
      {
        $addFields: {
          nguon: {
            $cond: {
              if: { $or: [{ $eq: ["$id_ban", null] }, { $not: "$id_ban" }] },
              then: "banMangDi",
              else: "banTaiCho",
            },
          },
        },
      },
      {
        $group: {
          _id: "$nguon", // Nhóm theo trường 'nguon'
          tongDoanhThu: { $sum: "$tongGiaTri" },
        },
      },
      {
        $project: {
          _id: 0,
          nguon: "$_id",
          tongDoanhThu: 1,
        },
      },
    ]);

    // Normalize the result
    const result = {
      banTaiCho: 0,
      banMangDi: 0,
    };

    thongKeNguon.forEach((item) => {
      if (item.nguon === "banTaiCho") {
        result.banTaiCho = item.tongDoanhThu;
      } else if (item.nguon === "banMangDi") {
        result.banMangDi = item.tongDoanhThu;
      }
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
