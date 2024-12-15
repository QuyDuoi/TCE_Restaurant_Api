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
  sap_xep_vi_tri_danh_muc,
} = require("../controllers/danhMucController");

const {
  them_mon_an,
  cap_nhat_mon_an,
  xoa_mon_an,
  lay_ds_mon_an,
  tim_kiem_mon_an,
  tim_kiem_mon_an_web,
  lay_danh_sach_thuc_don,
  cap_nhat_trang_thai_mon,
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
  them_ban_va_qrcode,
  cap_nhat_ban,
  xoa_ban,
  lay_ds_ban,
  tim_kiem_ban,
  tao_lich_hen,
  lay_ds_lich_hen,
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
  cap_nhat_trang_thai_cthd,
} = require("../controllers/chiTietHoaDonController");

const {
  them_hoa_don_moi,
  cap_nhat_hoa_don,
  xoa_hoa_don,
  lay_ds_hoa_don,
  lay_ds_hoa_don_theo_id_nha_hang,
  danh_sach_hoa_don,
  thanh_toan_hoa_don,
  thanh_toan_hoa_don_moi,
} = require("../controllers/hoaDonController");

const {
  mo_ca_lam_viec,
  cap_nhat_ca_lam_viec,
  xoa_ca_lam_viec,
  lay_ds_ca_lam_viec,
  lay_chi_tiet_hoa_don_theo_ca_lam,
  lay_ds_hoa_don_theo_ca_lam_viec,
  check_dong_ca_lam_viec,
  dong_ca_bat_chap,
} = require("../controllers/caLamViecController");

const {
  them_thu_chi,
  lay_ds_thu_chi,
} = require("../controllers/thuChiController");

const {
  lay_top_5_mon_an_ban_chay,
  thong_ke_hinh_thuc_thanh_toan,
  thongKeTongDoanhThu,
  thongKeDoanhThuTheoNguon,
} = require("../controllers/thongKeController");

const {
  addListChiTietHoaDon,
} = require("../controllers/listChiTietHoaDonController");

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
router.post("/sapXepDanhMuc", sap_xep_vi_tri_danh_muc);

// Restful Api Món Ăn
router.post("/themMonAn", upload.single("anhMonAn"), them_mon_an);
router.put("/capNhatMonAn/:id", upload.single("anhMonAn"), cap_nhat_mon_an);
router.put("/capNhatTrangThaiMon/:id", cap_nhat_trang_thai_mon);
router.delete("/xoaMonAn/:id", xoa_mon_an);
router.get("/layDsMonAn", lay_ds_mon_an);
router.get("/timKiemMonAn", tim_kiem_mon_an);
router.get("/timKiemMonAnWeb", tim_kiem_mon_an_web);
router.get("/layDanhSachThucDon", lay_danh_sach_thuc_don);

// Restful Api Nhân Viên
router.post("/themNhanVien", upload.single("hinhAnh"), them_nhan_vien);
router.put(
  "/capNhatNhanVien/:id",
  upload.single("hinhAnh"),
  cap_nhat_nhan_vien
);
router.delete("/xoaNhanVien/:id", xoa_nhan_vien);
router.get("/layDsNhanVien", lay_ds_nhan_vien);
// router.get("/layDsNhanVien", verifyToken, lay_ds_nhan_vien);

// Restful Api Khu Vực
router.post("/themKhuVuc", them_khu_vuc);
router.put("/capNhatKhuVuc/:id", cap_nhat_khu_vuc);
router.delete("/xoaKhuVuc/:id", xoa_khu_vuc);
router.get("/layDsKhuVuc", lay_ds_khu_vuc);

// Restful Api Bàn
router.post("/themBan", them_ban_va_qrcode);
router.put("/capNhatBan/:id", cap_nhat_ban);
router.delete("/xoaBan/:id", xoa_ban);
router.get("/layDsBan", lay_ds_ban);
router.post("/timKiemBan", tim_kiem_ban);
router.post("/taoLichHen", tao_lich_hen);
router.get("/layDsLichHen", lay_ds_lich_hen);

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
router.put("/capNhatTrangThaiCthd/:id", cap_nhat_trang_thai_cthd);
router.get("/layDanhSach", danh_sach_hoa_don);

// Restful Api Hóa Đơn
router.post("/themHoaDonMoi", them_hoa_don_moi);
router.put("/capNhatHoaDon/:id", cap_nhat_hoa_don);
router.delete("/xoaHoaDon/:id", xoa_hoa_don);
router.get("/layDsHoaDon", lay_ds_hoa_don);
router.get("/layDsHoaDonTheoNhaHang", lay_ds_hoa_don_theo_id_nha_hang);
router.post("/thanhToanHoaDon", thanh_toan_hoa_don);
router.post("/thanhToanHoaDonMoi", thanh_toan_hoa_don_moi);

// Restful Api Ca Làm Việc
router.post("/moCaLamViec", mo_ca_lam_viec);
router.put("/capNhatCaLamViec/:id", cap_nhat_ca_lam_viec);
router.delete("/xoaCaLamViec/:id", xoa_ca_lam_viec);
router.get("/layDsCaLamViec", lay_ds_ca_lam_viec);
router.get("/layCthdTheoCaLam", lay_chi_tiet_hoa_don_theo_ca_lam);
router.get("/layHdTheoCaLam", lay_ds_hoa_don_theo_ca_lam_viec);
router.post("/checkDongCaLam", check_dong_ca_lam_viec);
router.post("/dongCaBatChap", dong_ca_bat_chap);

// Restful Api Thu
router.post("/themThuChi", them_thu_chi);
router.get("/layDsThuChi", lay_ds_thu_chi);

// Restful Api Thống Kê Doanh Thu
router.get("/thongKeDoanhThu", thongKeTongDoanhThu);

// Restful Api Thống Kê Top 5 Món Ăn
router.get("/top5MatHangBanChay", lay_top_5_mon_an_ban_chay);

// // Restful Api Thống Kê Hình Thức Thanh Toán
router.get("/thongKeHinhThucThanhToan", thong_ke_hinh_thuc_thanh_toan);

// Restful Api Thống Kê Doanh Thu Theo Nguồn
router.get("/thongKeDoanhThuTheoNguon", thongKeDoanhThuTheoNguon);

// Restful API List Chi Tiết Hoá Đơn
router.post("/addListChiTietHoaDon", addListChiTietHoaDon);

module.exports = router;
