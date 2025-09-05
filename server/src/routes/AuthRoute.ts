import { Router } from "express";
import { getSession, login, logout, register } from "@/actions/Auth";
import { isAuthenticated } from "@/middleware/auth";

const router = Router();

router.post("/login", login);
router.get("/session", isAuthenticated, getSession);
router.post("/register", register);
router.post("/logout", isAuthenticated, logout);

export default router;
