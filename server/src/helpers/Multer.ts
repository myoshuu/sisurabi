import { Request } from "express";
import multer from "multer";
import path from "path";

export const uploader = (prefix: string) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      const email = req.session.loggedIn?.email || "BANKINDONESIA";
      cb(
        null,
        `${prefix}_${email}_${Date.now()}${path.extname(file.originalname)}`
      );
    },
  });

  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only images are allowed"));
  };

  return multer({ storage, fileFilter });
};
