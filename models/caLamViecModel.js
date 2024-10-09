const { mongoose } = require("../config/db");

const caLamViecSchema = new mongoose.Schema(
  {
    batDau: { type: Date, required: true }, 
    ketThuc: { type: Date, required: true },  
    soDuBanDau: {type: String, required: true } ,
    soDuHienTai: {type: String, required: true } ,
    tongTienMat: {type: String, required: true } ,
    tongChuyenKhoan: {type: String, required: true } ,
    tongDoanhThu: {type: String, required: true } ,
    tongThu: {type: String, required: true } ,
    tongChi: {type: String, required: true } ,
    id_nhanVien: { type: mongoose.Schema.Types.ObjectId, ref: "NhanVien", required: true }, 
  },
  {
    collection: "CaLamViec",
    timestamps: true,
  }
);

let CaLamViec = mongoose.model("CaLamViec", caLamViecSchema);
module.exports = { CaLamViec };
