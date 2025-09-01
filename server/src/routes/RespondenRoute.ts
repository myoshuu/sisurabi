import { Router } from "express";
import { isAuthenticated } from "@/middleware/auth";
import {
  indexResponden,
  createResponden,
  updateResponden,
  deleteResponden,
} from "@/actions/Responden";
import { authorize } from "@/middleware/authorize";

const router = Router();

router.get(
  "/",
  isAuthenticated,
  authorize("SUPER ADMIN", "ADMIN", "USER"),
  indexResponden
);
router.post(
  "/",
  isAuthenticated,
  authorize("SUPER ADMIN", "ADMIN", "USER"),
  createResponden
);
router.put(
  "/:id",
  isAuthenticated,
  authorize("SUPER ADMIN", "ADMIN", "USER"),
  updateResponden
);
router.delete(
  "/:id",
  isAuthenticated,
  authorize("SUPER ADMIN", "ADMIN", "USER"),
  deleteResponden
);

export default router;
