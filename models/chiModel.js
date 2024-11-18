const { mongoose } = require("../config/db");

const chiSchema = new mongoose.Schema(
  {
    soTienChi: { type: Number, required: true },
    moTa: { type: String, required: true },
    id_caLamViec: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CaLamViec",
      required: true,
    },
  },
  {
    collection: "Chi",
    timestamps: true,
  }
);

let Chi = mongoose.model("Chi", chiSchema);
module.exports = { Chi };
