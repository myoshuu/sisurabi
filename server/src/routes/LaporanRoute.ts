import { Router } from "express";
import { isAuthenticated } from "@/middleware/auth";
import {
  indexLaporan,
  createLaporan,
  updateLaporan,
  deleteLaporan,
} from "@/actions/LaporanSuvenir";
import { authorize } from "@/middleware/authorize";
import { uploader } from "@/helpers/Multer";

const router = Router();
const uploadLaporan = uploader("Laporan");

router.get(
  "/",
  isAuthenticated,
  authorize("SUPER ADMIN", "ADMIN"),
  indexLaporan
);

router.post(
  "/",
  uploadLaporan.single("foto"),
  isAuthenticated,
  authorize("SUPER ADMIN", "ADMIN"),
  createLaporan
);

router.put(
  "/:id",
  uploadLaporan.single("foto"),
  isAuthenticated,
  authorize("SUPER ADMIN", "ADMIN"),
  updateLaporan
);

router.delete(
  "/:id",
  isAuthenticated,
  authorize("SUPER ADMIN", "ADMIN"),
  deleteLaporan
);

export default router;
