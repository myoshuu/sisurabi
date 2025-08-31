import { prisma } from "../helpers/Prisma";
import { Request, Response } from "express";
import bcrypt from "bcrypt";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
    if (!user)
      return res.status(401).json({ message: "Akun tidak ditemukan." });

    const comparePass = await bcrypt.compare(password, user.password);
    if (!comparePass)
      return res.status(401).json({ message: "Email atau Password salah." });

    req.session.loggedIn = {
      id: user.id,
      email: user.email,
      role: { nama: user.role.nama },
    };

    return res
      .status(200)
      .json({ message: "Login success", user: req.session.loggedIn });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem." });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const role = await prisma.role.findFirst({ where: { nama: "USER" } });
    if (!role)
      return res
        .status(400)
        .json({ message: "Upss. Kamu tidak memiliki akses." });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        roleId: role.id,
      },
    });
    return res.status(201).json({ message: "Registrasi berhasil.", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan sistem." });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    if (!req.sessionID || !req.cookies["connect.sid"] || !req.session) {
      return res.status(401).json({ message: "Upss. Anda sudah log out." });
    }

    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ message: "Terjadi kesalahan sistem." });
        }
        res.clearCookie("connect.sid", { path: "/" });
        return res.status(200).json({ message: "Berhasil untuk logout." });
      });
    } else {
      res.clearCookie("connect.sid", { path: "/" });
      return res.status(401).json({ message: "Upss. Anda sudah log out." });
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem." });
  }
};
