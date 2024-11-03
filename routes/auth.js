const express = require("express");
const { handleLogin, checkPhoneNumber, handleRefreshToken } = require("../controllers/authController");
const { authenticateFirebaseToken } = require("../Middleware/authMiddleware");

const router = express.Router();

router.post("/login", authenticateFirebaseToken, handleLogin);
router.post('/checkLogin', checkPhoneNumber);

module.exports = router;