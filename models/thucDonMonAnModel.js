const { mongoose } = require('../config/db')

const thucdonmonanModel = new mongoose.Schema(
    {
        id_thucDon: { type: mongoose.Schema.Types.ObjectId, ref: "ThucDon", require: true },
        id_monAn: { type: mongoose.Schema.Types.ObjectId, ref: "MonAn", require: true }
    },
    {
        timestamps: true,
        collection:"ThucDonMonAn"
    }
);
let ThucDonMonAn = mongoose.model("ThucDonMonAn", thucdonmonanModel)
module.exports = { ThucDonMonAn }