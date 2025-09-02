import { Router } from "express";
import { isAuthenticated } from "@/middleware/auth";
import {
  clockIn,
  clockOut,
  deleteAbsensi,
  indexAbsensi,
} from "@/actions/Absensi";
import { authorize } from "@/middleware/authorize";
import { uploader } from "@/helpers/Multer";

const router = Router();
const uploadAbsensi = uploader("Absensi");

router.get(
  "/",
  isAuthenticated,
  authorize("SUPER ADMIN", "ADMIN"),
  indexAbsensi
);

router.post(
  "/clockin",
  isAuthenticated,
  authorize("SUPER ADMIN", "ADMIN", "USER"),
  uploadAbsensi.single("fotoClockIn"),
  clockIn
);

router.put(
  "/clockout",
  isAuthenticated,
  authorize("SUPER ADMIN", "ADMIN", "USER"),
  uploadAbsensi.single("fotoClockOut"),
  clockOut
);

router.delete(
  "/:id",
  isAuthenticated,
  authorize("SUPER ADMIN", "ADMIN"),
  deleteAbsensi
);

export default router;
