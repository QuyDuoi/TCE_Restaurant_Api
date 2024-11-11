const { mongoose } = require("../config/db");

const thuSchema = new mongoose.Schema(
  {
    soTienThu: { type: String, required: true },
    moTa: { type: String, required: false },
    id_caLamViec: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CaLamViec",
      required: true,
    },
  },
  {
    collection: "Thu",
    timestamps: true,
  }
);

let Thu = mongoose.model("Thu", thuSchema);
module.exports = { Thu };
