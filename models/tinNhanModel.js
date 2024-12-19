const { mongoose } = require("../config/db");

const tinNhanSchema = new mongoose.Schema(
  {
    noiDung: { type: String, required: true },
    nguoiGui: { type: Boolean, default: true },
    trangThai: { type: Boolean, default: false },
    id_ban: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ban",
      required: true,
    },
    id_nhanVien: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NhanVien",
      required: false,
    },
  },
  {
    collection: "TinNhan",
    timestamps: true,
  }
);

let TinNhan = mongoose.model("TinNhan", tinNhanSchema);
module.exports = { TinNhan };
