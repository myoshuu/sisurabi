import { Router } from "express";
import { login, logout, register } from "../actions/Auth";
import { isAuthenticated } from "../middleware/auth";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/logout", isAuthenticated, logout);

export default router;
