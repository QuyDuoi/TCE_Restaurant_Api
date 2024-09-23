const { mongoose } = require("../config/db");

const monAnSchema = new mongoose.Schema(
  {
    tenMon: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    description: { type: String },
    id_danhMuc: { type: mongoose.Schema.Types.ObjectId, ref: "DanhMuc", required: true },
  },
  {
    collection: "MonAn",
    timestamps: true,
  }
);

let MonAn = mongoose.model("MonAn", monAnSchema);
module.exports = { MonAn };
