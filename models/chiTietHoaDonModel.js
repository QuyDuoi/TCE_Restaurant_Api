const { mongoose } = require("../config/db");

const chiTietHoaDonSchema = new mongoose.Schema(
  {
    soLuongMon: { type: Number, required: true },
    giaTien: { type: Number, required: true },
    trangThai: { type: Boolean, default: false },
    ghiChu: { type: String, required: false },
    id_monAn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MonAn",
      required: false,
    },
    monAn: {
      tenMon: { type: String, required: true },
      anhMonAn: { type: String, required: false },
      giaMonAn: { type: Number, required: true },
    },
    id_hoaDon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HoaDon",
      required: true,
    },
    lichSuXoa: {
      isRequested: { type: Boolean, default: false },
      isApproved: { type: Boolean, default: null }, // null: pending, true: approved, false: rejected
      id_nhanVien: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NhanVien",
        required: false,
      },
      thoiGianYeuCau: { type: Date, default: Date.now },
      thoiGianXacNhan: { type: Date, required: false },
    },
  },
  {
    collection: "ChiTietHoaDon",
    timestamps: true,
  }
);

let ChiTietHoaDon = mongoose.model("ChiTietHoaDon", chiTietHoaDonSchema);
module.exports = { ChiTietHoaDon };
