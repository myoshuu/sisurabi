import { prisma } from "@/helpers/Prisma";
import { Request, Response } from "express";

export const indexAbsensi = async (req: Request, res: Response) => {
  try {
    const absensi = await prisma.absensi.findMany({
      include: { user: { select: { email: true } } },
    });
    return res
      .status(200)
      .json({ message: "Mengambil semua data absensi", absensi });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem." });
  }
};

// Clock In
export const clockIn = async (req: Request, res: Response) => {
  try {
    const userId = req.session.loggedIn?.id;

    if (!userId)
      return res
        .status(401)
        .json({ message: "Anda harus login terlebih dahulu" });

    if (!req.file)
      return res.status(400).json({ message: "Anda harus mengunggah Foto" });

    const existing = await prisma.absensi.findFirst({
      where: {
        userId,
        clockIn: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });

    if (existing)
      return res.status(400).json({ message: "Anda sudah clock in hari ini" });

    const absensi = await prisma.absensi.create({
      data: {
        fotoClockIn: `/uploads/absensi/${req.file.filename}`,
        clockIn: new Date(),
        userId,
        createdBy: req.session.loggedIn?.email ?? "",
      },
    });

    res.status(200).json({ message: "Anda sudah berhasil clock in", absensi });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem." });
  }
};

// Clock Out
export const clockOut = async (req: Request, res: Response) => {
  try {
    const userId = req.session.loggedIn?.id;

    if (!userId)
      return res
        .status(401)
        .json({ message: "Anda harus login terlebih dahulu" });

    if (!req.file)
      return res.status(400).json({ message: "Anda harus mengunggah Foto" });

    const absensi = await prisma.absensi.findFirst({
      where: {
        userId,
        clockOut: null,
        clockIn: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });

    if (!absensi)
      return res.status(400).json({ message: "Belum clock in hari ini" });

    const updated = await prisma.absensi.update({
      where: { id: absensi.id },
      data: {
        fotoClockOut: `/uploads/absensi/${req.file.filename}`,
        clockOut: new Date(),
        createdBy: req.session.loggedIn?.email ?? "",
      },
    });

    res.status(200).json({ message: "Anda sudah berhasil clock out", updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem." });
  }
};

export const deleteAbsensi = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const absensi = await prisma.absensi.delete({ where: { id } });
    if (absensi)
      res.status(200).json({ message: "Data absensi berhasil di delete" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem." });
  }
};
