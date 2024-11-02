const express = require("express");
const { handleLogin } = require("../controllers/authController");
const { authenticateFirebaseToken } = require("../Middleware/authMiddleware");
// const {
//     them_nhan_vien,
//     cap_nhat_nhan_vien,
//     xoa_nhan_vien,
//     lay_ds_nhan_vien,
// } = require("../controllers/nhanVienController");

const router = express.Router();

router.post("/login", authenticateFirebaseToken, handleLogin);
// router.get("/layDsNhanVien", lay_ds_nhan_vien);

module.exports = router;