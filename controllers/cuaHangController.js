const { CuaHang } = require("../models/cuaHangModel");

// Thêm cửa hàng với hình ảnh
exports.them_cua_hang = async (req, res, next) => {
  try {
    const { tenCuaHang, soDienThoai, diaChi } = req.body;
    let hinhAnh = "";

    if (req.file) {
      hinhAnh = `${req.protocol}://${req.get("host")}/public/uploads/${
        req.file.filename
      }`;
    }

    // Kiểm tra nếu cửa hàng đã tồn tại
    const existingStore = await CuaHang.findOne({ tenCuaHang });
    if (existingStore) {
      return res.status(400).json({ msg: "Cửa hàng đã tồn tại" });
    }

    const cuaHang = new CuaHang({ tenCuaHang, soDienThoai, diaChi, hinhAnh });
    const result = await cuaHang.save();

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Cập nhật cửa hàng với hình ảnh
exports.cap_nhat_cua_hang = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenCuaHang, soDienThoai, diaChi } = req.body;
    let hinhAnh = "";

    // Kiểm tra cửa hàng có tồn tại không
    const store = await CuaHang.findById(id);
    if (!store) {
      return res.status(404).json({ msg: "Cửa hàng không tồn tại" });
    }

    // Kiểm tra nếu cửa hàng mới đã tồn tại (ngoại trừ cửa hàng hiện tại)
    const existingStore = await CuaHang.findOne({ tenCuaHang });
    if (existingStore && existingStore._id.toString() !== id) {
      return res.status(400).json({ msg: "Cửa hàng đã tồn tại" });
    }

    // Cập nhật các thuộc tính của cửa hàng
    store.tenCuaHang = tenCuaHang;
    store.soDienThoai = soDienThoai;
    store.diaChi = diaChi;

    // Cập nhật đường dẫn hình ảnh nếu có file mới được tải lên
    if (req.file) {
      hinhAnh = `${req.protocol}://${req.get("host")}/public/uploads/${
        req.file.filename
      }`;
    }
    store.hinhAnh = hinhAnh || store.hinhAnh;

    const result = await store.save();

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Xóa cửa hàng
exports.xoa_cua_hang = async (req, res, next) => {
  try {
    const { id } = req.params;

    const store = await CuaHang.findByIdAndDelete(id);
    if (!store) {
      return res.status(404).json({ msg: "Cửa hàng không tồn tại" });
    }

    res.status(200).json({ msg: "Đã xóa cửa hàng" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Lấy danh sách cửa hàng
exports.lay_ds_cua_hang = async (req, res, next) => {
  try {
    const stores = await CuaHang.find().sort({ createdAt: -1 });

    res.status(200).json(stores);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
