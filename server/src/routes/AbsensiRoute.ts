import { Router } from "express";
import { isAuthenticated } from "@/middleware/auth";
import { clockIn, clockOut, indexAbsensi } from "@/actions/Absensi";
import { authorize } from "@/middleware/authorize";

const router = Router();

router.get(
  "/",
  isAuthenticated,
  authorize("SUPER ADMMIN", "ADMIN"),
  indexAbsensi
);
router.post(
  "/clockin",
  isAuthenticated,
  authorize("SUPER ADMIN", "ADMIN", "USER"),
  clockIn
);
router.put(
  "/clockout",
  isAuthenticated,
  authorize("SUPER ADMIN", "ADMIN", "USER"),
  clockOut
);

export default router;
