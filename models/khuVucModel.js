const {mongoose} = require('../config/db');

const khuvucModel = new mongoose.Schema(
    {
        tenKhuVuc:{type:String, require:true},
        id_cuaHang:{type: mongoose.Schema.Types.ObjectId,ref:"CuaHang",require:true}
    },
    {
        timestamps:true
    }

);
let KhuVuc = mongoose.model("KhuVuc",khuvucModel)
module.exports = {KhuVuc}