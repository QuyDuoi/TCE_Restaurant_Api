const { mongoose } = require("../config/db");

const chiTietHoaDonSchema = new mongoose.Schema(
  {
    tenCuaHang: { type: String, required: true },
    hinhAnh: { type: String, required: true },
    soDienThoai: { type: String, required: true },
    diaChi: { type: String, required: true },
  },
  {
    collection: "ChiTietHoaDon",
    timestamps: true,
  }
);

let ChiTietHoaDon = mongoose.model("ChiTietHoaDon", chiTietHoaDonSchema);
module.exports = { ChiTietHoaDon };
