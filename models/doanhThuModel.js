const { mongoose } = require("../config/db");


const doanhThuSchema = new mongoose.Schema({
  soTien: {
    type: Number,
    required: true, // Bắt buộc
  },
  ngay: {
    type: Date,
    required: true, // Bắt buộc
  },
}, {
  timestamps: true, // Tự động thêm createdAt và updatedAt
});


const DoanhThu = mongoose.model('DoanhThu', doanhThuSchema);

module.exports = DoanhThu; // Xuất mô hình
