const { mongoose } = require("../config/db");

const hoaDonSchema = new mongoose.Schema(
  {
    tongGiaTri: { type: Number, required: true },
    trangThai: { type: String, enum: ["Đã Thanh Toán", "Chưa Thanh Toán"], default: "Chưa Thanh Toán" },
    tienGiamGia: { type: Number, required: true },
    ghiChu: { type: String, required: false },
  },
  {
    collection: "HoaDon",
    timestamps: true,
  }
);

let HoaDon = mongoose.model("HoaDon", hoaDonSchema);
module.exports = { HoaDon };
