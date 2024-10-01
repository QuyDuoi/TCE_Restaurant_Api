const { NhomTopping } = require("../models/nhomToppingModel");

// Thêm nhóm topping
exports.them_nhom_topping = async (req, res, next) => {
  try {
    const { tenNhomTopping } = req.body;

    // Kiểm tra xem nhóm topping đã tồn tại chưa
    const existingNhomTopping = await NhomTopping.findOne({ tenNhomTopping });
    if (existingNhomTopping) {
      return res.status(400).json({ msg: "Nhóm topping đã tồn tại" });
    }

    // Tạo mới nhóm topping
    const nhomTopping = new NhomTopping({ tenNhomTopping });
    const result = await nhomTopping.save();

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Cập nhật nhóm topping
exports.cap_nhat_nhom_topping = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenNhomTopping } = req.body;

    // Tìm nhóm topping theo ID
    const nhomTopping = await NhomTopping.findById(id);
    if (!nhomTopping) {
      return res.status(404).json({ msg: "Nhóm topping không tồn tại" });
    }

    // Kiểm tra xem nhóm topping mới đã tồn tại chưa (ngoại trừ nhóm topping hiện tại)
    const existingNhomTopping = await NhomTopping.findOne({ tenNhomTopping });
    if (existingNhomTopping && existingNhomTopping._id.toString() !== id) {
      return res.status(400).json({ msg: "Nhóm topping đã tồn tại" });
    }

    // Cập nhật nhóm topping
   if(tenNhomTopping !== undefined || tenNhomTopping !== nhomTopping.tenNhomTopping){
    nhomTopping.tenNhomTopping = tenNhomTopping;
   }

    const result = await nhomTopping.save();

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Xóa nhóm topping
exports.xoa_nhom_topping = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Xóa nhóm topping theo ID
    const nhomTopping = await NhomTopping.findByIdAndDelete(id);
    if (!nhomTopping) {
      return res.status(404).json({ msg: "Nhóm topping không tồn tại" });
    }

    res.status(200).json({ msg: "Đã xóa nhóm topping" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Lấy danh sách nhóm topping
exports.lay_ds_nhom_topping = async (req, res, next) => {
  try {
    const nhomToppings = await NhomTopping.find().sort({ createdAt: -1 });

    res.status(200).json(nhomToppings);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
