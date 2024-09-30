const { mongoose } = require("../config/db");

const danhMucSchema = new mongoose.Schema(
  {
    tenDanhMuc: { type: String, required: true },
    id_nhaHang: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NhaHang",
      required: true,
    },
  },
  {
    collection: "DanhMuc",
    timestamps: true,
  }
);

let DanhMuc = mongoose.model("DanhMuc", danhMucSchema);
module.exports = { DanhMuc };
