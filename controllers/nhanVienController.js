const { NhanVien } = require("../models/nhanVienModel");

// Thêm nhân viên với hình ảnh
exports.them_nhan_vien = async (req, res, next) => {
  try {
    const { hoTen, soDienThoai, cccd, vaiTro } = req.body;
    let hinhAnh = "";

    if (req.file) {
      hinhAnh = `${req.protocol}://${req.get("host")}/public/uploads/${
        req.file.filename
      }`;
    }

    const nhanVien = new NhanVien({
      hoTen,
      hinhAnh,
      soDienThoai,
      cccd,
      vaiTro,
    });
    const result = await nhanVien.save();

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Cập nhật nhân viên với hình ảnh
exports.cap_nhat_nhan_vien = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { hoTen, soDienThoai, cccd, vaiTro } = req.body;
    let hinhAnh = "";

    const nhanVien = await NhanVien.findById(id);
    if (!nhanVien) {
      return res.status(404).json({ msg: "Nhân viên không tồn tại" });
    }

    if (req.file) {
      hinhAnh = `${req.protocol}://${req.get("host")}/public/uploads/${
        req.file.filename
      }`;
    }

    nhanVien.hoTen = hoTen;
    nhanVien.soDienThoai = soDienThoai;
    nhanVien.cccd = cccd;
    nhanVien.vaiTro = vaiTro;
    nhanVien.hinhAnh = hinhAnh || nhanVien.hinhAnh;

    const result = await nhanVien.save();

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Xóa nhân viên
exports.xoa_nhan_vien = async (req, res, next) => {
  try {
    const { id } = req.params;

    const nhanVien = await NhanVien.findByIdAndDelete(id);
    if (!nhanVien) {
      return res.status(404).json({ msg: "Nhân viên không tồn tại" });
    }

    res.status(200).json({ msg: "Đã xóa nhân viên" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// Lấy danh sách nhân viên
exports.lay_ds_nhan_vien = async (req, res, next) => {
  try {
    const nhanViens = await NhanVien.find().sort({ createdAt: -1 });

    res.status(200).json(nhanViens);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
