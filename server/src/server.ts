import express, { Response } from "express";
import session from "express-session";
import cors from "cors";
import cookieParser from "cookie-parser";
import { login, logout, register } from "./actions/Auth";
import {
  createResponden,
  deleteResponden,
  indexResponden,
  updateResponden,
} from "./actions/Responden";
import { isAuthenticated } from "./middleware/auth";
import { authorize } from "./middleware/authorize";

const app = express();
const PORT = 3000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use(cookieParser());

app.use(
  session({
    secret: "eitha, kiel, sera, joe",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24 Hours
    },
  })
);

// Test Api
app.get("/api/test", (req, res: Response) => {
  res.json({ message: "Testing!" });
});

// Authentication
app.post("/api/login", login);
app.post("/api/register", register);
app.post("/api/logout", isAuthenticated, logout);

// Responden
app.get(
  "/api/responden",
  isAuthenticated,
  authorize("SUPER ADMIN", "MANAGER", "USER"),
  indexResponden
);
app.post(
  "/api/responden",
  isAuthenticated,
  authorize("SUPER ADMIN", "MANAGER", "USER"),
  createResponden
);
app.put(
  "/api/responden/:id",
  isAuthenticated,
  authorize("SUPER ADMIN", "MANAGER", "USER"),
  updateResponden
);
app.delete(
  "/api/responden/:id",
  isAuthenticated,
  authorize("SUPER ADMIN", "MANAGER", "USER"),
  deleteResponden
);

app.listen(PORT, () => {
  console.log("Server running in port 3000");
});
