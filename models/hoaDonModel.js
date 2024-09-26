const { mongoose } = require("../config/db");

const hoaDonSchema = new mongoose.Schema(
  {
    tongGiaTri: { type: Number, required: true },
    trangThai: { type: String, enum: [], default: "" },
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
