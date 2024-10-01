const {NhaHang} = require('../models/nhaHangModel');

// Thêm nhà hàng với hình ảnh
exports.them_nha_hang = async (req, res, next) => {
  try {
    const { tenNhaHang, soDienThoai, diaChi } = req.body;
    let hinhAnh = "";

    if (req.file) {
      hinhAnh = `${req.protocol}://${req.get("host")}/public/uploads/${
        req.file.filename
      }`;
    }

    // Kiểm tra nếu nhà hàng đã tồn tại
    const existingStore = await NhaHang.findOne({ tenNhaHang });
    if (existingStore) {
      return res.status(400).json({ msg: "nhà hàng đã tồn tại" });
    }

    const nhaHang = new NhaHang({ tenNhaHang, soDienThoai, diaChi, hinhAnh });
    const result = await nhaHang.save();

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Cập nhật nhà hàng với hình ảnh
exports.cap_nhat_nha_hang = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenNhaHang, soDienThoai, diaChi } = req.body;
    console.log(req.body)
    let hinhAnh = "";


    // Kiểm tra nhà hàng có tồn tại không
    const store = await NhaHang.findById(id);
    
    if (!store) {
      return res.status(404).json({ msg: "Nhà hàng không tồn tại" });
    }

    // Kiểm tra nếu nhà hàng mới đã tồn tại (ngoại trừ nhà hàng hiện tại)
    const existingStore = await NhaHang.findOne({ tenNhaHang });
    if (existingStore && existingStore._id.toString() !== id) {
      return res.status(400).json({ msg: "Nhà hàng đã tồn tại" });
    }

    // Cập nhật các thuộc tính của nhà hàng
   // Chỉ cập nhật các thuộc tính nếu chúng được truyền vào
   if (tenNhaHang) {
    store.tenNhaHang = tenNhaHang;
  }

  if (soDienThoai) {
    store.soDienThoai = soDienThoai;
  }

  if (diaChi) {
    store.diaChi = diaChi;
  }

  // Cập nhật đường dẫn hình ảnh nếu có file mới được tải lên
  if (req.file) {
    hinhAnh = `${req.protocol}://${req.get("host")}/public/uploads/${req.file.filename}`;
  }
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

// Xóa nhà hàng
exports.xoa_nha_hang = async (req, res, next) => {
  try {
    const { id } = req.params;

    const store = await NhaHang.findByIdAndDelete(id);
    if (!store) {
      return res.status(404).json({ msg: "Nhà hàng không tồn tại" });
    }

    res.status(200).json({ msg: "Đã xóa nhà hàng" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Lấy danh sách nhà hàng
exports.lay_ds_nha_hang = async (req, res, next) => {
  try {
    const stores = await NhaHang.find().sort({ createdAt: -1 });

    res.status(200).json(stores);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
