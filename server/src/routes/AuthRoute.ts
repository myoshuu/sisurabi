import { Router } from "express";
import {
  getSession,
  login,
  logout,
  register,
  getRoles,
  getUsers,
  updateUser,
  deleteUser,
  changePassword,
  toggleUserStatus,
} from "@/actions/Auth";
import { isAuthenticated } from "@/middleware/auth";
import { authorize } from "@/middleware/authorize";

const router = Router();

// Public routes
router.post("/login", login); // http://localhost:3000/api/auth/login
router.post("/register", register); // http://localhost:3000/api/auth/register (public registration with default USER role)

// Authenticated routes
router.get("/session", isAuthenticated, getSession); // http://localhost:3000/api/auth/session
router.post("/logout", isAuthenticated, logout);

// Role management (public for getting roles)
router.get("/roles", getRoles); // http://localhost:3000/api/auth/roles

// User management (admin only)
router.get(
  "/users",
  isAuthenticated,
  authorize("SUPER ADMIN", "ADMIN"),
  getUsers
); // http://localhost:3000/api/auth/users
router.post(
  "/users",
  isAuthenticated,
  authorize("SUPER ADMIN", "ADMIN"),
  register
); // http://localhost:3000/api/auth/users (admin can create users with specific roles)
router.put(
  "/users/:id",
  isAuthenticated,
  authorize("SUPER ADMIN", "ADMIN"),
  updateUser
); // http://localhost:3000/api/auth/users/:id
router.delete(
  "/users/:id",
  isAuthenticated,
  authorize("SUPER ADMIN", "ADMIN"),
  deleteUser
); // http://localhost:3000/api/auth/users/:id

// Password management
router.put("/users/:id/password", isAuthenticated, changePassword); // http://localhost:3000/api/auth/users/:id/password (users can change their own password, admins can change any password)

// User status management (admin only)
router.put(
  "/users/:id/status",
  isAuthenticated,
  authorize("SUPER ADMIN", "ADMIN"),
  toggleUserStatus
); // http://localhost:3000/api/auth/users/:id/status

export default router;
