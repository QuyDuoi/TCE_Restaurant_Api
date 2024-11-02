const express = require("express");
const router = express.Router();
const upload = require("../config/upload");
const verifyToken = require("../Middleware/CheckTokenMiddleware");

// Controllers
const {
  them_nha_hang,
  cap_nhat_nha_hang,
  xoa_nha_hang,
  lay_ds_nha_hang,
} = require("../controllers/nhaHangController");

const {
  them_danh_muc,
  cap_nhat_danh_muc,
  xoa_danh_muc,
  lay_ds_danh_muc,
} = require("../controllers/danhMucController");

const {
  them_mon_an,
  cap_nhat_mon_an,
  xoa_mon_an,
  lay_ds_mon_an,
  tim_kiem_mon_an
} = require("../controllers/monAnController");

const {
  them_nhan_vien,
  cap_nhat_nhan_vien,
  xoa_nhan_vien,
  lay_ds_nhan_vien,
} = require("../controllers/nhanVienController");

const {
  them_khu_vuc,
  cap_nhat_khu_vuc,
  xoa_khu_vuc,
  lay_ds_khu_vuc,
} = require("../controllers/khuVucController");

const {
  them_ban,
  cap_nhat_ban,
  xoa_ban,
  lay_ds_ban,
  tim_kiem_ban
} = require("../controllers/banController");

const {
  them_nhom_topping,
  cap_nhat_nhom_topping,
  xoa_nhom_topping,
  lay_ds_nhom_topping,
} = require("../controllers/nhomToppingController");

const {
  them_topping,
  cap_nhat_topping,
  xoa_topping,
  lay_ds_topping,
} = require("../controllers/toppingController");

const {
  them_chi_tiet_hoa_don,
  cap_nhat_chi_tiet_hoa_don,
  xoa_chi_tiet_hoa_don,
  lay_ds_chi_tiet_hoa_don,
} = require("../controllers/chiTietHoaDonController");

const {
  them_hoa_don,
  cap_nhat_hoa_don,
  xoa_hoa_don,
  lay_ds_hoa_don,

} = require("../controllers/hoaDonController");

const {
  them_ca_lam_viec,
  cap_nhat_ca_lam_viec,
  xoa_ca_lam_viec,
  lay_ds_ca_lam_viec,
} = require("../controllers/caLamViecController");

const {
  them_thu,
  cap_nhat_thu,
  xoa_thu,
  lay_ds_thu,
} = require("../controllers/thuController");

const {
  them_chi,
  cap_nhat_chi,
  xoa_chi,
  lay_ds_chi,
} = require("../controllers/chiController");


const {
  lay_top_5_mon_an_ban_chay,
  thong_ke_hinh_thuc_thanh_toan,
  thongKeTongDoanhThu,
  thongKeDoanhThuTheoNguon

} = require("../controllers/thongKeController");

const {
  addListChiTietHoaDon
} = require("../controllers/listChiTietHoaDonController")


// Restful Api Cửa hàng
router.post("/themNhaHang", upload.single("hinhAnh"), them_nha_hang);
router.put("/capNhatNhaHang/:id", upload.single("hinhAnh"), cap_nhat_nha_hang);
router.delete("/xoaNhaHang/:id", xoa_nha_hang);
router.get("/layDsNhaHang", lay_ds_nha_hang);

// Restful Api Danh Mục
router.post("/themDanhMuc", them_danh_muc);
router.put("/capNhatDanhMuc/:id", cap_nhat_danh_muc);
router.delete("/xoaDanhMuc/:id", xoa_danh_muc);
router.get("/layDsDanhMuc", lay_ds_danh_muc);

// Restful Api Món Ăn
router.post("/themMonAn", upload.single("anhMonAn"), them_mon_an);
router.put("/capNhatMonAn/:id", upload.single("anhMonAn"), cap_nhat_mon_an);
router.delete("/xoaMonAn/:id", xoa_mon_an);
router.get("/layDsMonAn", lay_ds_mon_an);
router.post("/timKiemMonAn", tim_kiem_mon_an);

// Restful Api Nhân Viên
router.post("/themNhanVien", upload.single("hinhAnh"), them_nhan_vien);
router.put("/capNhatNhanVien/:id", upload.single("hinhAnh"), cap_nhat_nhan_vien);
router.delete("/xoaNhanVien/:id", xoa_nhan_vien);
// router.get("/layDsNhanVien", lay_ds_nhan_vien);
router.get("/layDsNhanVien", verifyToken, lay_ds_nhan_vien);

// Restful Api Khu Vực
router.post("/themKhuVuc", them_khu_vuc);
router.put("/capNhatKhuVuc/:id", cap_nhat_khu_vuc);
router.delete("/xoaKhuVuc/:id", xoa_khu_vuc);
router.get("/layDsKhuVuc", lay_ds_khu_vuc);

// Restful Api Bàn
router.post("/themBan", them_ban);
router.put("/capNhatBan/:id", cap_nhat_ban);
router.delete("/xoaBan/:id", xoa_ban);
router.get("/layDsBan", lay_ds_ban);
router.post("/timKiemBan", tim_kiem_ban);

// Restful Api Nhóm Topping
router.post("/themNhomTopping", them_nhom_topping);
router.put("/capNhatNhomTopping/:id", cap_nhat_nhom_topping);
router.delete("/xoaNhomTopping/:id", xoa_nhom_topping);
router.get("/layDsNhomTopping", lay_ds_nhom_topping);

// Restful Api Topping
router.post("/themTopping", them_topping);
router.put("/capNhatTopping/:id", cap_nhat_topping);
router.delete("/xoaTopping/:id", xoa_topping);
router.get("/layDsTopping", lay_ds_topping);

// Restful Api Chi Tiết Hóa Đơn
router.post("/themChiTietHoaDon", them_chi_tiet_hoa_don);
router.put("/capNhatChiTietHoaDon/:id", cap_nhat_chi_tiet_hoa_don);
router.delete("/xoaChiTietHoaDon/:id", xoa_chi_tiet_hoa_don);
router.post("/layDsChiTietHoaDon", lay_ds_chi_tiet_hoa_don);

// Restful Api Hóa Đơn
router.post("/themHoaDon", them_hoa_don);
router.put("/capNhatHoaDon/:id", cap_nhat_hoa_don);
router.delete("/xoaHoaDon/:id", xoa_hoa_don);
router.get("/layDsHoaDon", lay_ds_hoa_don);

// Restful Api Ca Làm Việc
router.post("/themCaLamViec", them_ca_lam_viec);
router.put("/capNhatCaLamViec/:id", cap_nhat_ca_lam_viec);
router.delete("/xoaCaLamViec/:id", xoa_ca_lam_viec);
router.get("/layDsCaLamViec", lay_ds_ca_lam_viec);

// Restful Api Thu
router.post("/themThu", them_thu);
router.put("/capNhatThu/:id", cap_nhat_thu);
router.delete("/xoaThu/:id", xoa_thu);
router.get("/layDsThu", lay_ds_thu);

// Restful Api Chi
router.post("/themChi", them_chi);
router.put("/capNhatChi/:id", cap_nhat_chi);
router.delete("/xoaChi/:id", xoa_chi);
router.get("/layDsChi", lay_ds_chi);

// Restful Api Thống Kê Doanh Thu
router.get("/thongKeDoanhThu", thongKeTongDoanhThu);

// Restful Api Thống Kê Top 5 Món Ăn
router.get("/top5MatHangBanChay", lay_top_5_mon_an_ban_chay);

// // Restful Api Thống Kê Hình Thức Thanh Toán
router.get("/thongKeHinhThucThanhToan", thong_ke_hinh_thuc_thanh_toan);

// Restful Api Thống Kê Doanh Thu Theo Nguồn
router.get("/thongKeDoanhThuTheoNguon", thongKeDoanhThuTheoNguon);

// Restful API List Chi Tiết Hoá Đơn
router.post("/addListChiTietHoaDon", addListChiTietHoaDon)

module.exports = router;
