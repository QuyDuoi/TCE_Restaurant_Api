const { mongoose } = require("../config/db");

const hoaDonSchema = new mongoose.Schema(
  {
    tongGiaTri: { type: Number, required: true },
    trangThai: {
      type: String,
      enum: ["Đã Thanh Toán", "Chưa Thanh Toán"],
      default: "Chưa Thanh Toán",
    },
    tienGiamGia: { type: Number, required: true },
    ghiChu: { type: String, required: false },
    hinhThucThanhToan: { type: Boolean, require: true },
    thoiGianVaoBan: { type: Date, require: false },
    thoiGianRaBan: { type: Date, require: false },
    id_nhanVien: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NhanVien",
      required: true,
    },
    id_ban: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ban",
      required: false,
    }, // Bán mang đi không cần id_ban
    id_chiTietHoaDon: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ChiTietHoaDon",
        required: false,
      },
    ],
  },
  {
    collection: "HoaDon",
    timestamps: true,
  }
);

let HoaDon = mongoose.model("HoaDon", hoaDonSchema);
module.exports = { HoaDon };
