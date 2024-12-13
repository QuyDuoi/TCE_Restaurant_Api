
const { NhanVien } = require("../models/nhanVienModel");

const checkPhoneNumber = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    const nhanVien = await NhanVien.findOne({ soDienThoai: phoneNumber });
    if (!nhanVien) {
      return res.status(400).json({
        statusError: "404",
        message: "Số điện thoại chưa được đăng ký, vui lòng liên hệ Quản lý!",
      });
    } else if (!nhanVien.trangThai) {
      return res.status(400).json({
        statusError: "403",
        message: "Tài khoản hiện tại đang bị vô hiệu hóa",
      });
    }

    return res
      .status(200)
      .json({ message: "Số điện thoại hợp lệ. Tiếp tục gửi OTP." });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
  }
};

// Hàm xử lý đăng nhập (được gọi sau middleware)
const handleLogin = (req, res) => {
  try {
    const nhanVien = req.nhanVien;
    const token = req.token;
    const refreshToken = req.refreshToken;

    console.log(nhanVien);
    

    res.status(200).json({ token, refreshToken, nhanVien });
  } catch (error) {
    res.status(500).json({ error: "Lỗi hệ thống: " + error.message });
  }
};

// Hàm xử lý làm mới token
const handleRefreshToken = (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res
      .status(400)
      .json({ error: "Refresh token không được cung cấp." });
  }

  try {
    const decoded = jwt.verify(refreshToken, refreshSecretKey);

    NhanVien.findById(decoded.id)
      .then((nhanVien) => {
        if (!nhanVien) {
          return res.status(404).json({ error: "Nhân viên không tồn tại" });
        }

        const newToken = createToken(nhanVien);

        res.status(200).json({ token: newToken });
      })
      .catch((err) => {
        res.status(500).json({ error: "Lỗi hệ thống: " + err.message });
      });
  } catch (error) {
    res
      .status(401)
      .json({ error: "Refresh token không hợp lệ hoặc đã hết hạn." });
  }
};

module.exports = { handleLogin, handleRefreshToken, checkPhoneNumber };
