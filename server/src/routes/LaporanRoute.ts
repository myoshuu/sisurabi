import { Router } from "express";
import { isAuthenticated } from "../middleware/auth";
import {
  indexLaporan,
  createLaporan,
  updateLaporan,
  deleteLaporan,
} from "../actions/LaporanSuvenir";
import { authorize } from "@/middleware/authorize";

const router = Router();

router.get(
  "/",
  isAuthenticated,
  authorize("SUPER ADMIN", "ADMIN"),
  indexLaporan
);
router.post(
  "/",
  isAuthenticated,
  authorize("SUPER ADMIN", "ADMIN"),
  createLaporan
);
router.put(
  "/:id",
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
