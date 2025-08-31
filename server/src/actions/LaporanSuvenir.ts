import { Request, Response } from "express";
import { prisma } from "../helpers/Prisma";

export const indexLaporan = async (req: Request, res: Response) => {
  try {
    const laporan = await prisma.laporanSuvenir.findMany();
    return res.status(200).json({ message: "Showing all Laporan.", laporan });
  } catch (err) {
    console.error(err);
  }
};

export const createLaporan = async (req: Request, res: Response) => {
  try {
    const {
      nama,
      jenis,
      periodeBulan,
      periodeTahun,
      catatan,
      respondenId,
      userId,
    } = req.body;

    const file = req.file;
    if (!file) return res.status(400).json({ message: "Foto is required" });

    const laporan = await prisma.laporanSuvenir.create({
      data: {
        nama,
        jenis,
        periodeBulan,
        periodeTahun,
        foto: `/uploads/${file.filename}`,
        catatan,
        respondenId,
        userId,
        createdBy: req.session.loggedIn?.email ?? "",
      },
    });

    return res.status(200).json({
      message: `Laporan dengan nama "${laporan.nama}" berhasil dibuat`,
      laporan,
    });
  } catch (err) {
    console.error(err);
  }
};
