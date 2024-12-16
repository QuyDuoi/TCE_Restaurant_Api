const { mongoose } = require("../config/db");

const banSchema = new mongoose.Schema(
  {
    tenBan: { type: String, required: true },
    sucChua: { type: Number, required: true },
    trangThai: {
      type: String,
      enum: ["Trống", "Đang sử dụng", "Đã đặt"],
      default: "Trống",
    },
    ghiChu: { type: String, required: false },
    maQRCode: { type: String, required: false },
    matKhau: { type: String, required: true },
    id_khuVuc: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KhuVuc",
      required: true,
    },
    trangThaiOrder: { type: Boolean, default: false },
    danhSachOrder: [
      {
        tenMon: String,
        soLuong: Number,
        giaMonAn: Number,
      },
    ],
  },
  {
    collection: "Ban",
    timestamps: true,
  }
);

let Ban = mongoose.model("Ban", banSchema);
module.exports = { Ban };
