import { Router } from "express";
import { isAuthenticated } from "@/middleware/auth";
import {
  indexLaporan,
  createLaporan,
  updateLaporan,
  deleteLaporan,
} from "@/actions/LaporanSuvenir";
import { authorize } from "@/middleware/authorize";
import { upload } from "@/helpers/Multer";

const router = Router();
const uploadLaporan = upload.single("foto");

router.get(
  "/",
  isAuthenticated,
  authorize("SUPER ADMIN", "ADMIN"),
  indexLaporan
);
router.post(
  "/",
  uploadLaporan,
  isAuthenticated,
  authorize("SUPER ADMIN", "ADMIN"),
  createLaporan
);
router.put(
  "/:id",
  uploadLaporan,
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
