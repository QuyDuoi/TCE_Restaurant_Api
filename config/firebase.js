const admin = require("firebase-admin");
const serviceAccount = require("../config/tce-firebase-main-74c1b-firebase-adminsdk-bcxiz-7cc04886bb.json"); // Đường dẫn đến tệp JSON của bạn

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;