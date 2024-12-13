const admin = require("firebase-admin");
const serviceAccount = require("../config/tce-restaurant-main-firebase-adminsdk-7kntl-25e0eafb7c.json"); // Đường dẫn đến tệp JSON của bạn

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://tce-restaurant-main.firebaseio.com", // Cập nhật ID dự án
});

module.exports = admin;