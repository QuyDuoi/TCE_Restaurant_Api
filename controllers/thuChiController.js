const { CaLamViec } = require("../models/caLamViecModel");
const { PhieuThuChi } = require("../models/phieuThuChiModel");

// Thêm khoản thu
exports.them_thu_chi = async (req, res, next) => {
  try {
    const { soTien, phanLoai, moTa, id_caLamViec } = req.body;

    // Kiểm tra xem ca làm việc có tồn tại không
    const caLamViec = await CaLamViec.findById(id_caLamViec);

    if (!caLamViec) {
      return res.status(404).json({ msg: "Ca làm việc không tồn tại" });
    }

    if (phanLoai) {
      caLamViec.tongThu += soTien;
      caLamViec.soDuHienTai += soTien;
      await caLamViec.save();
    } else {
      caLamViec.tongChi += soTien;
      caLamViec.soDuHienTai -= soTien;
      await caLamViec.save();
    }

    // Tạo khoản thu mới
    const luuPhieu = new PhieuThuChi({
      soTien,
      phanLoai,
      moTa,
      id_caLamViec,
    });

    const result = await luuPhieu.save();

    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
};

exports.lay_ds_thu_chi = async (req, res, next) => {
  try {
    const { id_caLamViec } = req.query;

    if (!id_caLamViec) {
      return res.status(400).json({
        success: false,
        message: "Thiếu id_caLamViec trong yêu cầu",
      });
    }

    // Lấy tất cả các phiếu thu chi liên quan đến ca làm việc
    const phieuThuChiRecords = await PhieuThuChi.find({ id_caLamViec }).sort({
      createdAt: -1,
    });

    // Phân loại phiếu thu và chi dựa trên phanLoai
    const thuRecords = phieuThuChiRecords.filter(record => record.phanLoai);
    const chiRecords = phieuThuChiRecords.filter(record => !record.phanLoai);

    // Trả về phản hồi với cả bản ghi thu và chi
    res.status(200).json({
      tatCa: phieuThuChiRecords,
      thu: thuRecords,
      chi: chiRecords,
    });
  } catch (error) {
    // Xử lý lỗi
    console.error("Lỗi khi lấy danh sách thu chi:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy được dữ liệu",
      error: error.message,
    });
  }
};

