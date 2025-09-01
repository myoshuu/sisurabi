import express, { Response } from "express";
import session from "express-session";
import cors from "cors";
import cookieParser from "cookie-parser";

import AuthRoute from "@/routes/AuthRoute";
import RespondenRoute from "@/routes/RespondenRoute";

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

// API
app.use("/api/auth", AuthRoute);
app.use("/api/responden", RespondenRoute);

app.listen(PORT, () => {
  console.log(`Server running in port http://localhost:${PORT}`);
});
