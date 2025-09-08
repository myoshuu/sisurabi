import { Router } from "express";
import { isAuthenticated } from "@/middleware/auth";
import { authorize } from "@/middleware/authorize";
import {
  getPasarByKabupaten,
  indexKabupatenKota,
} from "@/actions/KabupatenKota";

const router = Router();

router.get(
  "/",
  isAuthenticated,
  authorize("SUPER ADMIN", "ADMIN", "USER"),
  indexKabupatenKota
);

router.get(
  "/:kabupatenKotaId/pasar",
  isAuthenticated,
  authorize("SUPER ADMIN", "ADMIN", "USER"),
  getPasarByKabupaten
);

export default router;
