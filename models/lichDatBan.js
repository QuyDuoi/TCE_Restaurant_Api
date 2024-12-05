const { mongoose } = require("../config/db");

const lichDatBanSchema = new mongoose.Schema(
  {
    hoTen: { type: String, required: true },
    thoiGian: { type: Date, required: true },
    ghiChu: { type: String, required: false },
    id_nhaHang: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NhaHang",
      required: true,
    },
  },
  {
    collection: "LichDatBan",
    timestamps: true,
  }
);

let LichDatBan = mongoose.model("LichDatBan", lichDatBanSchema);
module.exports = { LichDatBan };
