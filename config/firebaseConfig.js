require("dotenv").config();
const admin = require("firebase-admin");

// Parse JSON từ biến môi trường
const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

// Khởi tạo Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tce-restaurant-main.firebaseio.com",
});

// Export đối tượng admin để sử dụng ở các tệp khác
module.exports = admin;
