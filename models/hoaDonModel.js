const { mongoose } = require("../config/db");

const hoaDonSchema = new mongoose.Schema(
  {
    tongGiaTri: { type: Number, default: 0 },
    trangThai: {
      type: String,
      enum: ["Đã Thanh Toán", "Chưa Thanh Toán"],
      default: "Chưa Thanh Toán",
    },
    tienGiamGia: { type: Number, default: 0 },
    ghiChu: { type: String, required: false },
    hinhThucThanhToan: { type: Boolean, default: false },
    thoiGianVao: { type: Date, require: true },
    thoiGianRa: { type: Date, require: false },
    id_nhanVien: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NhanVien",
      required: true,
    },
    nhanVienTao: { type: String, require: true },
    nhanVienThanhToan: { type: String, require: false },
    id_ban: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ban",
      required: false,
    }, // Bán mang đi không cần id_ban
    id_caLamViec: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CaLamViec",
      require: true,
    },
  },
  {
    collection: "HoaDon",
    timestamps: true,
  }
);

let HoaDon = mongoose.model("HoaDon", hoaDonSchema);
module.exports = { HoaDon };
