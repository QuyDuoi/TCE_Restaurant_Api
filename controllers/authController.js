// controllers/authController.js
const { NhanVien } = require("../models/nhanVienModel");

// Hàm xử lý đăng nhập (được gọi sau middleware)
const handleLogin = (req, res) => {
    try {
        const nhanVien = req.nhanVien;
        const token = req.token;
        const refreshToken = req.refreshToken;

        res.status(200).json({ token, refreshToken, nhanVien });
    } catch (error) {
        res.status(500).json({ error: "Lỗi hệ thống: " + error.message });
    }
};

// Hàm xử lý làm mới token
const handleRefreshToken = (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ error: "Refresh token không được cung cấp." });
    }

    try {
        const decoded = jwt.verify(refreshToken, refreshSecretKey);

        NhanVien.findById(decoded.id).then((nhanVien) => {
            if (!nhanVien) {
                return res.status(404).json({ error: "Nhân viên không tồn tại" });
            }

            const newToken = createToken(nhanVien);

            res.status(200).json({ token: newToken });
        }).catch((err) => {
            res.status(500).json({ error: "Lỗi hệ thống: " + err.message });
        });
    } catch (error) {
        res.status(401).json({ error: "Refresh token không hợp lệ hoặc đã hết hạn." });
    }
};

module.exports = { handleLogin, handleRefreshToken };
