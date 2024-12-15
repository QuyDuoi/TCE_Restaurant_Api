const { NhanVien } = require("../models/nhanVienModel");

// Thêm nhân viên với hình ảnh
exports.them_nhan_vien = async (req, res, next) => {
  try {
    const { hoTen, soDienThoai, cccd, vaiTro, id_nhaHang } = req.body;
    let hinhAnh = "";

    if (req.file) {
      hinhAnh = `${req.protocol}://${req.get("host")}/public/uploads/${
        req.file.filename
      }`;
    }

    // Kiểm tra nhân viên đã tồn tại hay chưa
    const checkTenTrongNhaHang = await NhanVien.findOne({ hoTen, id_nhaHang });
    if (checkTenTrongNhaHang) {
      return res.status(400).json({
        error: "hoTen",
        msg: `Tên nhân viên ${hoTen} đã tồn tại!`,
      });
    }

    const checkSoDienThoai = await NhanVien.findOne({
      soDienThoai: soDienThoai,
    });

    if (checkSoDienThoai) {
      return res.status(400).json({
        error: "soDienThoai",
        msg: `Số điện thoại ${soDienThoai} đã được sử dụng!`,
      });
    }

    // Thêm nhân viên mới
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
    const { hoTen, soDienThoai, cccd, vaiTro, trangThai, id_nhaHang } =
      req.body;

    // Tìm nhân viên theo ID
    const nhanVien = await NhanVien.findById(id);
    if (!nhanVien) {
      return res.status(404).json({ msg: "Nhân viên không tồn tại!" });
    }

    // Kiểm tra số điện thoại chỉ nếu có thay đổi
    if (soDienThoai !== nhanVien.soDienThoai) {
      const checkSoDienThoai = await NhanVien.findOne({
        soDienThoai: soDienThoai,
      });

      if (checkSoDienThoai) {
        return res.status(400).json({
          error: "soDienThoai",
          msg: `Số điện thoại ${soDienThoai} đã được sử dụng!`,
        });
      }
    }

    // Kiểm tra xem tên nhân viên đã tồn tại trong cùng nhà hàng chưa
    const checkTen = await NhanVien.findOne({
      hoTen: hoTen,
      id_nhaHang: id_nhaHang,
    });
    if (checkTen && checkTen._id.toString() !== id) {
      // Nếu tên đã tồn tại và không phải là nhân viên hiện tại, trả về lỗi
      return res.status(400).json({
        error: "hoTen",
        msg: "Tên nhân viên đã tồn tại trong nhà hàng!",
      });
    }

    // Kiểm tra xem ảnh mới có được upload hay không
    if (req.file) {
      // Nếu có ảnh mới, cập nhật đường dẫn của ảnh
      const hinhAnh = `${req.protocol}://${req.get("host")}/public/uploads/${
        req.file.filename
      }`;
      nhanVien.hinhAnh = hinhAnh; // Cập nhật ảnh mới
    }

    // Kiểm tra và cập nhật thông tin khác nếu có thay đổi
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
    if (trangThai !== nhanVien.trangThai) {
      nhanVien.trangThai = trangThai;
    }
    if (id_nhaHang !== undefined && id_nhaHang !== nhanVien.id_nhaHang) {
      nhanVien.id_nhaHang = id_nhaHang;
    }

    // Lưu các thay đổi vào cơ sở dữ liệu
    const result = await nhanVien.save();

    // Trả về kết quả cập nhật thành công
    res.status(200).json(result);
  } catch (error) {
    // Xử lý lỗi
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
    const { id_nhaHang } = req.query;
    const nhanViens = await NhanVien.find({ id_nhaHang: id_nhaHang })
      .sort({ createdAt: -1 })
      .populate("id_nhaHang");

    res.status(200).json(nhanViens);
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
