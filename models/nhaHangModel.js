const { mongoose } = require("../config/db");

const nhaHangSchema = new mongoose.Schema(
  {
    tenNhaHang: { type: String, required: true },
    hinhAnh: { type: String, required: true },
    soDienThoai: { type: String, required: true },
    diaChi: { type: String, required: true },
    soTaiKhoan: { type: String, required: true },
    chuTaiKhoan: { type: String, required: true },
    nganHang: { type: String, required: true },
  },
  {
    collection: "NhaHang",
    timestamps: true,
  }
);

let NhaHang = mongoose.model("NhaHang", nhaHangSchema);
module.exports = { NhaHang };
