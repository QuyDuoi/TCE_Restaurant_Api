const { Thu } = require("../models/thuModel");
const { Chi } = require("../models/chiModel");
const { CaLamViec } = require("../models/caLamViecModel");

// Thêm khoản thu
exports.them_thu = async (req, res, next) => {
  try {
    const { soTienThu, moTa, id_caLamViec } = req.body;

    // Kiểm tra xem ca làm việc có tồn tại không
    const caLamViec = await CaLamViec.findById(id_caLamViec);
    if (!caLamViec) {
      return res.status(404).json({ msg: "Ca làm việc không tồn tại" });
    }

    // Tạo khoản thu mới
    const thu = new Thu({
      soTienThu,
      moTa,
      id_caLamViec
    });

    const result = await thu.save();

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Cập nhật khoản thu
exports.cap_nhat_thu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { soTienThu, moTa, id_caLamViec } = req.body;

    // Tìm khoản thu theo ID
    const thu = await Thu.findById(id);
    if (!thu) {
      return res.status(404).json({ msg: "Khoản thu không tồn tại" });
    }

    // Kiểm tra xem ca làm việc có tồn tại không
    if (id_caLamViec && id_caLamViec !== thu.id_caLamViec) {
      const caLamViec = await CaLamViec.findById(id_caLamViec);
      if (!caLamViec) {
        return res.status(404).json({ msg: "Ca làm việc không tồn tại" });
      }
      thu.id_caLamViec = id_caLamViec;
    }

    // Cập nhật các thông tin khác nếu có thay đổi
    if (soTienThu !== undefined && thu.soTienThu != soTienThu) thu.soTienThu = soTienThu;
    if (moTa !== undefined && thu.moTa != moTa) thu.moTa = moTa;

    const result = await thu.save();

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Xóa khoản thu
exports.xoa_thu = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Xóa khoản thu theo ID
    const thu = await Thu.findByIdAndDelete(id);
    if (!thu) {
      return res.status(404).json({ msg: "Khoản thu không tồn tại" });
    }

    res.status(200).json({ msg: "Đã xóa khoản thu" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Lấy danh sách khu vực
exports.lay_ds_thu = async (req, res, next) => {
  try {
    const { id_caLamViec } = req.query;
    
    // Xây dựng điều kiện truy vấn dựa trên có hoặc không có id_caLamViec
    let query = {};
    if (id_caLamViec) {
      query.id_caLamViec = id_caLamViec;
    }

    const thus = await Thu.find(query).sort({ createdAt: -1 });

    res.status(200).json(thus);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};


exports.lay_ds_thu_chi = async (req, res, next) => {
  try {

    const {id_caLamViec} = req.query;
    // Lấy tất cả các bản ghi "Thu"
    const thuRecords = await Thu.find({id_caLamViec}).populate('id_caLamViec');

    // Lấy tất cả các bản ghi "Chi"
    const chiRecords = await Chi.find({id_caLamViec}).populate('id_caLamViec');

    // Trả về phản hồi với cả bản ghi thu và chi
    res.status(200).json({
      success: true,
      data: {
        thu: thuRecords,
        chi: chiRecords,
      },
    });
  } catch (error) {
    // Xử lý lỗi
    res.status(500).json({
      success: false,
      message: 'Không thể lấy được dữ liệu',
      error: error.message,
    });
  }
};

