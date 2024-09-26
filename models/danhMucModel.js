const { mongoose } = require("../config/db");

const danhMucSchema = new mongoose.Schema(
  {
    tenDanhMuc: { type: String, required: true },
  },
  {
    collection: "DanhMuc",
    timestamps: true,


    
  }
);

let DanhMuc = mongoose.model("DanhMuc", danhMucSchema);
module.exports = { DanhMuc };
