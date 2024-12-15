const { DanhMuc } = require("../models/danhMucModel");
const { MonAn } = require("../models/monAnModel");
const unidecode = require("unidecode");

// Thêm món ăn với hình ảnh
exports.them_mon_an = async (req, res, next) => {
  try {
    const { tenMon, moTa, giaMonAn, trangThai, id_danhMuc, id_nhomTopping } =
      req.body;
    let anhMonAn = "";

    // Kiểm tra file tải lên
    if (req.file) {
      anhMonAn = `${req.protocol}://${req.get("host")}/public/uploads/${
        req.file.filename
      }`;
    }

    // Tạo đối tượng món ăn mới
    const monAn = new MonAn({
      tenMon,
      anhMonAn,
      moTa,
      giaMonAn,
      trangThai,
      id_danhMuc,
      id_nhomTopping,
    });

    // Lưu món ăn vào cơ sở dữ liệu
    const result = await monAn.save();

    res.status(201).json(result); // Trả về thông tin món ăn khi lưu thành công
  } catch (error) {
    // Log lỗi vào console để dễ dàng theo dõi
    console.error("Error creating MonAn:", error);

    // Phân loại lỗi để trả về thông tin chi tiết
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ msg: "Dữ liệu không hợp lệ", details: error.errors });
    }

    // Nếu lỗi khác không xác định, trả về thông tin tổng quát hơn
    res
      .status(500)
      .json({ msg: "Lỗi khi thêm mới Món ăn", error: error.message });
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
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ msg: "Validation error", details: error.errors });
    }
    res
      .status(500)
      .json({ msg: "Internal server error", error: error.message });
  }
};

// Cập nhật trạng thái món ăn
exports.cap_nhat_trang_thai_mon = async (req, res) => {
  try {
    const {id} = req.params;
    const {trangThai} = req.body;

    const monAn = await MonAn.findById(id);

    monAn.trangThai = trangThai;

    const result = await monAn.save();

    const io = req.app.get("io");
    io.emit("doiTrangThaiMon", {
      msg: "Đổi trạng thái món ăn!",
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({msg: error.message});
  }
}

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
    res
      .status(500)
      .json({ msg: "Internal server error", error: error.message });
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
    res
      .status(500)
      .json({ msg: "Internal server error", error: error.message });
  }
};

exports.tim_kiem_mon_an = async (req, res, next) => {
  try {
    // Lấy dữ liệu từ `req.query`
    const { textSearch, id_nhaHang } = req.query;

    // Loại bỏ dấu của từ khóa tìm kiếm
    const textSearchNoAccents = unidecode(textSearch).toLowerCase();

    // 1. Lấy danh sách `id_danhMuc` thuộc nhà hàng
    const danhMucs = await DanhMuc.find({ id_nhaHang });
    const idDanhMucs = danhMucs.map((danhMuc) => danhMuc._id);

    if (idDanhMucs.length === 0) {
      return res.status(404).json({ msg: "Không tìm thấy danh mục nào!" });
    }

    // 2. Lấy danh sách món ăn thuộc các `id_danhMuc`
    const monAns = await MonAn.find({ id_danhMuc: { $in: idDanhMucs } });

    // 3. Lọc danh sách món ăn dựa trên từ khóa tìm kiếm
    const danhSachKetQua = monAns.filter((item) => {
      const tenMonNoAccents = unidecode(item.tenMon).toLowerCase();
      return tenMonNoAccents.includes(textSearchNoAccents);
    });    

    res.status(200).json(danhSachKetQua);
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(400).json({ msg: error.message });
  }
};

// API lấy cả danh mục và món ăn
exports.lay_danh_sach_thuc_don = async (req, res, next) => {
  try {
    const { id_nhaHang } = req.query;
    if (!id_nhaHang) {
      return res.status(400).json({ msg: "Không có thông tin id_nhaHang!" });
    }

    // Lấy danh sách danh mục
    const danhMucs = await DanhMuc.find({ id_nhaHang }).sort({ thuTu: 1 });

    // Lấy danh sách món ăn cho từng danh mục
    const danhMucWithMonAn = await Promise.all(
      danhMucs.map(async danhMuc => {
        const monAns = await MonAn.find({ id_danhMuc: danhMuc._id }).sort({
          createdAt: -1,
        });
        return { ...danhMuc.toObject(), monAns };
      })
    );

    res.status(200).json(danhMucWithMonAn);
  } catch (error) {
    console.error("Error fetching DanhMuc and MonAn:", error);
    res.status(500).json({ msg: "Internal server error", error: error.message });
  }
};

exports.tim_kiem_mon_an_web = async (req, res, next) => {
  try {
    // Lấy dữ liệu từ `req.query`
    const { textSearch, id_nhaHang } = req.query;

    // Kiểm tra nếu không có từ khóa tìm kiếm hoặc id nhà hàng
    if (!textSearch || !id_nhaHang) {
      return res.status(400).json({ msg: "Vui lòng cung cấp từ khóa tìm kiếm và id nhà hàng!" });
    }

    // Loại bỏ dấu của từ khóa tìm kiếm
    const textSearchNoAccents = unidecode(textSearch).toLowerCase();

    // 1. Lấy danh sách `id_danhMuc` thuộc nhà hàng
    const danhMucs = await DanhMuc.find({ id_nhaHang }).sort({ thuTu: 1 });
    const idDanhMucs = danhMucs.map((danhMuc) => danhMuc._id);

    if (idDanhMucs.length === 0) {
      return res.status(404).json({ msg: "Không tìm thấy danh mục nào!" });
    }

    // 2. Lấy tất cả các món ăn của các danh mục đã tìm được
    const monAns = await MonAn.find({ id_danhMuc: { $in: idDanhMucs } });

    // 3. Lọc danh sách món ăn dựa trên từ khóa tìm kiếm
    const danhSachKetQua = monAns.filter((item) => {
      const tenMonNoAccents = unidecode(item.tenMon).toLowerCase();
      return tenMonNoAccents.includes(textSearchNoAccents);
    });

    // 4. Tìm danh mục tương ứng cho mỗi món ăn trong danhSachKetQua và trả về danh mục cùng với món ăn
    const danhMucWithMonAn = await Promise.all(
      danhSachKetQua.map(async (monAn) => {
        // Tìm danh mục tương ứng với món ăn
        const danhMuc = await DanhMuc.findOne({ _id: monAn.id_danhMuc });

        // Trả về danh mục và món ăn của danh mục đó
        return { ...danhMuc.toObject(), monAns: [monAn] };
      })
    );

    // Trả về kết quả
    res.status(200).json(danhMucWithMonAn);
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(400).json({ msg: error.message });
  }
};




