const { Topping } = require("../models/toppingModel");

// Thêm topping
exports.them_topping = async (req, res, next) => {
  try {
    const { tenTopping, giaTopping, trangThai, id_nhomTopping } = req.body;

    const topping = new Topping({
      tenTopping,
      giaTopping,
      trangThai,
      id_nhomTopping,
    });
    const result = await topping.save();

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Cập nhật topping
exports.cap_nhat_topping = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tenTopping, giaTopping, trangThai, id_nhomTopping } = req.body;

    const topping = await Topping.findById(id);
    if (!topping) {
      return res.status(404).json({ msg: "Topping không tồn tại" });
    }

    if (tenTopping !== undefined && tenTopping !== topping.tenTopping) {
      topping.tenTopping = tenTopping;
    }
    if (giaTopping !== undefined && giaTopping !== topping.giaTopping) {
      topping.giaTopping = giaTopping;
    }
    if (trangThai !== undefined && trangThai !== topping.trangThai) {
      topping.trangThai = trangThai;
    }
    if (id_nhomTopping !== undefined && id_nhomTopping !== topping.id_nhomTopping) {
      topping.id_nhomTopping = id_nhomTopping;
    }

    const result = await topping.save();

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Xóa topping
exports.xoa_topping = async (req, res, next) => {
  try {
    const { id } = req.params;

    const topping = await Topping.findByIdAndDelete(id);
    if (!topping) {
      return res.status(404).json({ msg: "Topping không tồn tại" });
    }

    res.status(200).json({ msg: "Đã xóa topping" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Lấy danh sách topping
exports.lay_ds_topping = async (req, res, next) => {
  try {
    const { id_nhomTopping } = req.query;

    const toppings = await Topping.find({ id_nhomTopping }).sort({
      createdAt: -1,
    });

    res.status(200).json(toppings);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
