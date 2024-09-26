const { mongoose } = require("../config/db");

const banSchema = new mongoose.Schema(
  {
    tenBan: { type: String, required: true },
    sucChua: { type: String, required: true },
    trangThai: { type: String, enum: ["Còn trống", "Đang sử dụng"], default: "Còn trống" },
  },
  {
    collection: "Ban",
    timestamps: true,
  }
);

let Ban = mongoose.model("Ban", banSchema);
module.exports = { Ban };
