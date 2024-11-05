const { MonAn } = require("../models/monAnModel");

// Thêm món ăn với hình ảnh
exports.them_mon_an = async (req, res, next) => {
  try {
    const { tenMon, moTa, giaMonAn, trangThai, id_danhMuc, id_nhomTopping } = req.body;
    let anhMonAn = "";

    // Kiểm tra file tải lên
    if (req.file) {
      anhMonAn = `${req.protocol}://${req.get("host")}/public/uploads/${req.file.filename}`;
    }

    // Tạo đối tượng món ăn mới
    const monAn = new MonAn({
      tenMon,
      anhMonAn,
      moTa,
      giaMonAn,
      trangThai,
      id_danhMuc,
      id_nhomTopping
    });

    // Lưu món ăn vào cơ sở dữ liệu
    const result = await monAn.save();

    res.status(201).json(result); // Trả về thông tin món ăn khi lưu thành công
  } catch (error) {
    // Log lỗi vào console để dễ dàng theo dõi
    console.error("Error creating MonAn:", error);

    // Phân loại lỗi để trả về thông tin chi tiết
    if (error.name === 'ValidationError') {
      return res.status(400).json({ msg: "Dữ liệu không hợp lệ", details: error.errors });
    }
    
    // Nếu lỗi khác không xác định, trả về thông tin tổng quát hơn
    res.status(500).json({ msg: "Lỗi khi thêm mới Món ăn", error: error.message });
  }
};


// Cập nhật món ăn với hình ảnh
exports.cap_nhat_mon_an = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenMon, moTa, giaMonAn, trangThai, id_danhMuc, id_nhomTopping } =
      req.body;
    let anhMonAn = "";

    // Tìm món ăn theo ID
    const monAn = await MonAn.findById(id);
    if (!monAn) {
      return res.status(404).json({ msg: "Món ăn không tồn tại" });
    }

    // Nếu có file ảnh mới thì cập nhật đường dẫn ảnh
    if (req.file) {
      anhMonAn = `${req.protocol}://${req.get("host")}/public/uploads/${
        req.file.filename
      }`;
      monAn.anhMonAn = anhMonAn;
    }

    // Kiểm tra và cập nhật các thông tin của món ăn nếu có thay đổi
    if (tenMon !== undefined && tenMon !== monAn.tenMon) {
      monAn.tenMon = tenMon;
    }
    if (moTa !== undefined && moTa !== monAn.moTa) {
      monAn.moTa = moTa;
    }
    if (giaMonAn !== undefined && giaMonAn !== monAn.giaMonAn) {
      monAn.giaMonAn = giaMonAn;
    }
    if (trangThai !== undefined && trangThai !== monAn.trangThai) {
      monAn.trangThai = trangThai;
    }
    if (id_danhMuc !== undefined && id_danhMuc !== monAn.id_danhMuc) {
      monAn.id_danhMuc = id_danhMuc;
    }
    if (
      id_nhomTopping !== undefined &&
      id_nhomTopping !== monAn.id_nhomTopping
    ) {
      monAn.id_nhomTopping = id_nhomTopping;
    }
    // Lưu cập nhật món ăn
    const result = await monAn.save();

    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating MonAn:", error);
  if (error.name === 'ValidationError') {
    return res.status(400).json({ msg: "Validation error", details: error.errors });
  }
  res.status(500).json({ msg: "Internal server error", error: error.message });
  }
};

// Xóa món ăn
exports.xoa_mon_an = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Xóa món ăn theo ID
    const monAn = await MonAn.findByIdAndDelete(id);
    if (!monAn) {
      return res.status(404).json({ msg: "Món ăn không tồn tại" });
    }

    res.status(200).json({ msg: "Đã xóa món ăn" });
  } catch (error) {
    console.error("Error deleting MonAn:", error);
  res.status(500).json({ msg: "Internal server error", error: error.message });
  }
};

// Lấy danh sách món ăn
exports.lay_ds_mon_an = async (req, res, next) => {
  try {
    const { id_danhMuc, id_nhomTopping } = req.query;

    // Tìm món ăn theo danh mục hoặc nhóm topping (nếu có)
    let filter = {};
    if (id_danhMuc) filter.id_danhMuc = id_danhMuc;
    if (id_nhomTopping) filter.id_nhomTopping = id_nhomTopping;

    const monAns = await MonAn.find(filter)
      .sort({ createdAt: -1 })
      .populate("id_danhMuc")
      .populate("id_nhomTopping");

    res.status(200).json(monAns);
  } catch (error) {
    console.error("Error fetching MonAns:", error);
  res.status(500).json({ msg: "Internal server error", error: error.message });
  }
};

exports.tim_kiem_mon_an = async (req, res, next) => {
  try {
    const { textSearch, id_nhahang } = req.query;

    // Thiết lập tiêu chí tìm kiếm ban đầu
    const searchCriteria = {
      trangThai: true,
      ...(textSearch && { tenMon: { $regex: textSearch, $options: "i" } })
    };

    // Tìm kiếm món ăn và populate danh mục
    let results = await MonAn.find(searchCriteria)
      .populate({
        path: "id_danhMuc",
        match: { id_nhahang: id_nhahang }, // Lọc dựa trên id_nhahang trong DanhMuc
      })
      .exec();

    // Lọc ra các món ăn có danh mục khớp với id_nhahang
    results = results.filter(monAn => monAn.id_danhMuc);

    res.status(200).json(results);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
