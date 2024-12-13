// middlewares/authMiddleware.js
const admin = require("../config/firebaseConfig");
const { NhanVien } = require("../models/nhanVienModel");
const jwt = require("jsonwebtoken");

// Secret keys
const secretKey = "123456";
const refreshSecretKey = "abcdef"; // Secret key cho refresh token

// Thời gian hết hạn của token
const tokenExpiryTime = "1h";
const refreshExpiryTime = "7d";

// Hàm xác minh token Firebase
const verifyFirebaseToken = async (idToken) => {
  try {
    console.log("Verifying Firebase Token:", idToken);
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log("Decoded Token:", decodedToken);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying Firebase token:", error.message);
    throw new Error("Token không hợp lệ");
  }
};

// Hàm tạo JWT token
const createToken = (nhanVien) => {
  return jwt.sign({ id: nhanVien._id, vaiTro: nhanVien.vaiTro }, secretKey, {
    expiresIn: tokenExpiryTime,
  });
};

// Hàm tạo refresh token
const createRefreshToken = (nhanVien) => {
  return jwt.sign({ id: nhanVien._id }, refreshSecretKey, {
    expiresIn: refreshExpiryTime,
  });
};

// Middleware xác thực token Firebase và tạo token
const authenticateFirebaseToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Token không được cung cấp hoặc không hợp lệ" });
  }

  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await verifyFirebaseToken(idToken);

    const phoneNumber = decodedToken.phone_number;

    // Tìm nhân viên trong cơ sở dữ liệu
    let nhanVien = await NhanVien.findOne({
      soDienThoai: parsePhoneNumber(phoneNumber),
    }).populate("id_nhaHang");
    if (!nhanVien) {
      return res.status(404).json({ error: "Nhân viên không tồn tại" });
    }

    // Tạo token và refresh token
    const token = createToken(nhanVien);
    const refreshToken = createRefreshToken(nhanVien);

    console.log("------------------ Access Token  ----------------");
    console.log(token);
    console.log("------------------ Refesh Token  ----------------");
    console.log(refreshToken);

    // Gắn thông tin nhân viên và token vào request
    req.nhanVien = nhanVien;
    req.token = token;
    req.refreshToken = refreshToken;

    next(); // Chuyển tiếp đến controller
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const parsePhoneNumber = (phoneNumber) => {
  if (phoneNumber.startsWith("+84")) {
    return "0" + phoneNumber.slice(3);
  }
  return phoneNumber;
};

module.exports = { authenticateFirebaseToken };
