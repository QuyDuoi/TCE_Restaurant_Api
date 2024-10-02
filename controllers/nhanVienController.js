const { NhanVien } = require("../models/nhanVienModel");

// Thêm nhân viên với hình ảnh
exports.them_nhan_vien = async (req, res, next) => {
  try {
    const { hoTen, soDienThoai, cccd, vaiTro, id_nhaHang } = req.body;
    let hinhAnh = "";

    if (req.file) {
      hinhAnh = `${req.protocol}://${req.get("host")}/public/uploads/${req.file.filename
        }`;
    }

    const nhanVien = new NhanVien({
      hoTen,
      hinhAnh,
      soDienThoai,
      cccd,
      vaiTro,
      id_nhaHang,
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
    const { hoTen, soDienThoai, cccd, vaiTro, id_nhaHang } = req.body;
    let hinhAnh = "";

    const nhanVien = await NhanVien.findById(id);
    if (!nhanVien) {
      return res.status(404).json({ msg: "Nhân viên không tồn tại" });
    }

    if (req.file) {
      hinhAnh = `${req.protocol}://${req.get("host")}/public/uploads/${req.file.filename
        }`;
      nhanVien.hinhAnh = hinhAnh || nhanVien.hinhAnh;
    }

    // Kiểm tra và cập nhật thông tin nhân viên nếu có thay đổi
    if (hoTen !== undefined && hoTen !== nhanVien.hoTen) {
      nhanVien.hoTen = hoTen;
    }
    if (soDienThoai !== undefined && soDienThoai !== nhanVien.soDienThoai) {
      nhanVien.soDienThoai = soDienThoai;
    }
    if (cccd !== undefined && cccd !== nhanVien.cccd) {
      nhanVien.cccd = cccd;
    }
    if (vaiTro !== undefined && vaiTro !== nhanVien.vaiTro) {
      nhanVien.vaiTro = vaiTro;
    }
    if (id_nhaHang !== undefined && id_nhaHang !== nhanVien.id_nhaHang) {
      nhanVien.id_nhaHang = id_nhaHang; 
    }


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
