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
  authorize("SUPER ADMIN", "ADMIN", "USER"),
  indexLaporan
);

router.post(
  "/",
  uploadLaporan.single("foto"),
  isAuthenticated,
  authorize("SUPER ADMIN", "ADMIN", "USER"),
  createLaporan
);

router.put(
  "/:id",
  uploadLaporan.single("foto"),
  isAuthenticated,
  authorize("SUPER ADMIN", "ADMIN", "USER"),
  updateLaporan
);

router.delete(
  "/:id",
  isAuthenticated,
  authorize("SUPER ADMIN", "ADMIN"),
  deleteLaporan
);

// Approve/Reject

export default router;
