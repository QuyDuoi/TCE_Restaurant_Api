const { mongoose } = require("../config/db");

const chiTietHoaDonSchema = new mongoose.Schema(
  {
    soLuongMon: { type: Number, required: true }, // Số lượng món ăn
    giaTien: { type: Number, required: true },    // Giá tiền tương ứng
    trangThai:{type: Boolean , default:true, require:false},
    id_monAn: { type: mongoose.Schema.Types.ObjectId, ref: "MonAn", required: true }, // Tham chiếu đến Món ăn
  },
  {
    collection: "ChiTietHoaDon",
    timestamps: true,
  }
);

let ChiTietHoaDon = mongoose.model("ChiTietHoaDon", chiTietHoaDonSchema);
module.exports = { ChiTietHoaDon };
