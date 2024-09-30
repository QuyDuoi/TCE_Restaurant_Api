const { mongoose } = require("../config/db");

const nhomToppingSchema = new mongoose.Schema(
  {
    tenNhomTopping: { type: String, required: true },
  },
  {
    collection: "NhomTopping",
    timestamps: true,
  }
);

let NhomTopping = mongoose.model("NhomTopping", nhomToppingSchema);
module.exports = { NhomTopping };
