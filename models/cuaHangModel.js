const { mongoose } = require("../config/db");

const cuaHangSchema = new mongoose.Schema(
  {
    tenCuaHang: { type: String, required: true },
    hinhAnh: { type: String, required: true },
    soDienThoai: { type: String, required: true },
    diaChi: { type: String, required: true },
  },
  {
    collection: "CuaHang",
    timestamps: true,
  }
);

let CuaHang = mongoose.model("CuaHang", cuaHangSchema);
module.exports = { CuaHang };
