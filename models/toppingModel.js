const { mongoose } = require('../config/db');


const toppingModel = new mongoose.Schema(
    {
        tenTopping: { type: String, require: true },
        giaTopping: { type: Number, require: true },
        trangThai: { type: Boolean, require: true },
        id_nhomTopping: { type: mongoose.Schema.Types.ObjectId, ref: "NhomTopping", require: true }
    },
    {
        timestamps: true,
        collection:"Topping"
    }
);
let Topping = mongoose.model("Topping", toppingModel);
module.exports = {Topping}