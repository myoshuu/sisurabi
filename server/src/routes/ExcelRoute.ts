import { Router } from "express";
import { exportLaporanSuvenir, exportDataResponden, exportLogBookAbsensi } from "../actions/ExcelExport";

const router = Router();

// Excel export routes
router.get("/laporan-suvenir", exportLaporanSuvenir);
router.get("/data-responden", exportDataResponden);
router.get("/log-book-absensi", exportLogBookAbsensi);

export default router;
