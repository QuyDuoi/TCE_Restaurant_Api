const { mongoose } = require("../config/db");

const phieuThuChiSchema = new mongoose.Schema(
  {
    soTien: { type: Number, required: true },
    phanLoai: { type: Boolean, required: true },
    moTa: { type: String, required: false },
    id_caLamViec: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CaLamViec",
      required: true,
    },
  },
  {
    collection: "PhieuThuChi",
    timestamps: true,
  }
);

let PhieuThuChi = mongoose.model("PhieuThuChi", phieuThuChiSchema);
module.exports = { PhieuThuChi };
