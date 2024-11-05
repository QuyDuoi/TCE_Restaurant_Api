const {mongoose} =  require('../config/db');

const thucdonModel = new mongoose.Schema(
    {
        tenThucDon:{type:String,require:true},
        moTa:{type:String,require:true}
    },
    {
        timestamps:true,
        collection:"ThucDon"
    }
);

let ThucDon = mongoose.model("ThucDon",thucdonModel);
module.exports = {ThucDon}