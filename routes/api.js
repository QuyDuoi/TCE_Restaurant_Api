const express = require("express");
const router = express.Router();
const upload = require("../config/upload");

const {
  them_cua_hang,
  cap_nhat_cua_hang,
  xoa_cua_hang,
  lay_ds_cua_hang,
} = require("../controllers/cuaHangController");

// Restful Api Cửa hàng
router.post("/themCuaHang", upload.single("hinhAnh"), them_cua_hang);
router.put("/capNhatCuaHang/:id", upload.single("hinhAnh"), cap_nhat_cua_hang);
router.delete("/xoaCuaHang/:id", xoa_cua_hang);
router.get("/layDsCuaHang", lay_ds_cua_hang);

module.exports = router;
