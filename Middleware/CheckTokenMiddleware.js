const jwt = require("jsonwebtoken");
const secretKey = "123456";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Token không được cung cấp hoặc không hợp lệ" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({ error: "Token không hợp lệ hoặc đã hết hạn." });
    }
    req.user = decoded;
    next();
  });
};

module.exports = verifyToken;
