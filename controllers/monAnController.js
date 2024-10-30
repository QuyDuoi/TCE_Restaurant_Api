const { MonAn } = require("../models/monAnModel");

// Thêm món ăn với hình ảnh
exports.them_mon_an = async (req, res, next) => {
  try {
    const { tenMon, moTa, giaMonAn, trangThai, id_danhMuc, id_nhomTopping } = req.body;
    let anhMonAn = "";

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

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Cập nhật món ăn với hình ảnh
exports.cap_nhat_mon_an = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenMon, moTa, giaMonAn, trangThai, id_danhMuc, id_nhomTopping } = req.body;
    let anhMonAn = "";

    // Tìm món ăn theo ID
    const monAn = await MonAn.findById(id);
    if (!monAn) {
      return res.status(404).json({ msg: "Món ăn không tồn tại" });
    }

    // Nếu có file ảnh mới thì cập nhật đường dẫn ảnh
    if (req.file) {
      anhMonAn = `${req.protocol}://${req.get("host")}/public/uploads/${req.file.filename}`;
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
    if (id_nhomTopping !== undefined && id_nhomTopping !== monAn.id_nhomTopping) {
      monAn.id_nhomTopping = id_nhomTopping;
    }
    // Lưu cập nhật món ăn
    const result = await monAn.save();

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
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
    res.status(400).json({ msg: error.message });
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

    const monAns = await MonAn.find(filter).sort({ createdAt: -1 }).populate("id_danhMuc").populate("id_nhomTopping");

    res.status(200).json(monAns);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};


exports.tim_kiem_mon_an = async (req, res, next) => {
  try {
    const { textSearch } = req.query;

    // Kiểm tra nếu có từ khóa tìm kiếm và thiết lập tiêu chí tìm kiếm với regex
    const searchCriteria = textSearch
      ? { tenMon: { $regex: textSearch, $options: "i" } } // Tìm kiếm không phân biệt hoa thường
      : {};

    // Tìm các món ăn với tên khớp tiêu chí tìm kiếm
    const results = await MonAn.find(searchCriteria);

  
    
    res.status(200).json(results);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};