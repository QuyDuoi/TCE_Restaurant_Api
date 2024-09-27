const { mongoose } = require("../config/db");

const nhomToppingSchema = new mongoose.Schema(
  {
    tenCuaHang: { type: String, required: true },
    hinhAnh: { type: String, required: true },
    soDienThoai: { type: String, required: true },
    diaChi: { type: String, required: true },
  },
  {
    collection: "NhomTopping",
    timestamps: true,
  }
);

let NhomTopping = mongoose.model("NhomTopping", nhomToppingSchema);
module.exports = { NhomTopping };
