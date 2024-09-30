const { mongoose } = require("../config/db");

const chiTietHoaDonSchema = new mongoose.Schema(
  {
    soLuongMon: { type: Number, required: true }, // Số lượng món ăn
    giaTien: { type: Number, required: true },    // Giá tiền tương ứng
    id_monAn: { type: mongoose.Schema.Types.ObjectId, ref: "MonAn", required: true }, // Tham chiếu đến Món ăn
    id_hoaDon: { type: mongoose.Schema.Types.ObjectId, ref: "HoaDon", required: true }, // Tham chiếu đến Hóa đơn
  },
  {
    collection: "ChiTietHoaDon",
    timestamps: true,
  }
);

let ChiTietHoaDon = mongoose.model("ChiTietHoaDon", chiTietHoaDonSchema);
module.exports = { ChiTietHoaDon };
