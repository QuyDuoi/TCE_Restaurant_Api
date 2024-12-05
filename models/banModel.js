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
    id_khuVuc: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KhuVuc",
      required: true,
    },
  },
  {
    collection: "Ban",
    timestamps: true,
  }
);

let Ban = mongoose.model("Ban", banSchema);
module.exports = { Ban };
