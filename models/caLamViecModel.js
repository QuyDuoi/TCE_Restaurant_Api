const { mongoose } = require("../config/db");

const caLamViecSchema = new mongoose.Schema(
  {
    batDau: { type: Date, required: true },
    ketThuc: { type: Date, required: false },
    soDuBanDau: { type: String, required: true },
    soDuHienTai: { type: String, required: true },
    tongTienMat: { type: String, required: false },
    tongChuyenKhoan: { type: String, required: false },
    tongDoanhThu: { type: String, required: false },
    tongThu: { type: Number, default: 0 },
    tongChi: { type: Number, default: 0 },
    id_nhanVien: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NhanVien",
      required: true,
    },
    id_nhaHang: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NhaHang",
      required: true,
    },
  },
  {
    collection: "CaLamViec",
    timestamps: true,
  }
);

let CaLamViec = mongoose.model("CaLamViec", caLamViecSchema);
module.exports = { CaLamViec };
