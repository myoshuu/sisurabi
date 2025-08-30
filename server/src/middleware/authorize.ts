import { Request, Response, NextFunction } from "express";

export const authorize =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.session?.loggedIn || !req.session.loggedIn) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userRole = req.session.loggedIn.role.nama;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }

    next();
  };
