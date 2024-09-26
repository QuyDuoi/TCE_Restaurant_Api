const { mongoose } = require("../config/db");

const nhanVienSchema = new mongoose.Schema(
  {
    hoTen: { type: String, required: true },
    hinhAnh: { type: String, required: true },
    soDienThoai: { type: String, required: true },
    cccd: { type: String, required: true },
    vaiTro: {type: String, enum: ["Quản lý", "Nhân viên thu ngân", "Nhân viên phục vụ"], default: "Nhân viên phục vụ"}
  },
  {
    collection: "NhanVien",
    timestamps: true,
  }
);

let NhanVien = mongoose.model("NhanVien", nhanVienSchema);
module.exports = { NhanVien };
