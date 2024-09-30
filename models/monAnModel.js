const { mongoose } = require("../config/db");

const monAnSchema = new mongoose.Schema(
  {
    tenMon: { type: String, required: true },
    anhMonAn: { type: String, required: true }, // Đường dẫn hình ảnh
    moTa: { type: String, required: false },
    giaMonAn: { type: Number, required: true },
    trangThai: { type: Boolean, required: true, default: true }, // True: còn bán, False: ngừng bán
    id_danhMuc: { type: mongoose.Schema.Types.ObjectId, ref: "DanhMuc", required: true },
    id_nhomTopping: { type: mongoose.Schema.Types.ObjectId, ref: "NhomTopping", required: false }, // Có thể có hoặc không
  },
  {
    collection: "MonAn",
    timestamps: true,
  }
);

let MonAn = mongoose.model("MonAn", monAnSchema);
module.exports = { MonAn };
