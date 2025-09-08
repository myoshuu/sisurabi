import { Router } from "express";
import { getSession, login, logout, register } from "@/actions/Auth";
import { isAuthenticated } from "@/middleware/auth";

const router = Router();

router.post("/login", login); // http://localhost:3000/api/auth/login
router.get("/session", isAuthenticated, getSession); // http://localhost:3000/api/auth/session
router.post("/register", register); // http://localhost:3000/api/auth/register
router.post("/logout", isAuthenticated, logout);

export default router;
