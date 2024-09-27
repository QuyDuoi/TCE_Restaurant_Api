const { mongoose } = require("../config/db");

const chiTietHoaDonSchema = new mongoose.Schema(
  {
    soLuongMon: { type: Number, required: true },
    giaTien: { type: Number, required: true },
    id_hoaDon: { type: mongoose.Schema.Types.ObjectId, ref: "HoaDon", required: true },

  },
  {
    collection: "ChiTietHoaDon",
    timestamps: true,
  }
);

let ChiTietHoaDon = mongoose.model("ChiTietHoaDon", chiTietHoaDonSchema);
module.exports = { ChiTietHoaDon };
