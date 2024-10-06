const DoanhThu = require('../models/doanhThuModel'); // Mô hình doanh thu

exports.thongKeDoanhThu = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    // Lấy các giao dịch trong khoảng thời gian được cung cấp
    const doanhThus = await DoanhThu.find({
      ngay: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });

    // Tính tổng doanh thu
    const tongDoanhThu = doanhThus.reduce((acc, doanhthu) => acc + doanhthu.soTien, 0);

    // Trả kết quả về cho người dùng
    res.status(200).json({
      tongDoanhThu,
      soLuongGiaoDich: doanhThus.length,
      doanhThus,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thống kê doanh thu' });
  }
};
