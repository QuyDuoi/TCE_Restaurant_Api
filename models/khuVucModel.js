const { mongoose } = require("../config/db");

const khuVucSchema = new mongoose.Schema(
  {
    tenKhuVuc: { type: String, require: true },
    id_nhaHang: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NhaHang",
      require: true,
    },
  },
  {
    timestamps: true,
    collection: "KhuVuc" // Đặt tên collection là "KhuVuc"
  }
);
let KhuVuc = mongoose.model("KhuVuc", khuVucSchema);
module.exports = { KhuVuc };
