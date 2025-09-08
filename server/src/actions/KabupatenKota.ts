import { prisma } from "@/helpers/Prisma";
import { Request, Response } from "express";

export const indexKabupatenKota = async (req: Request, res: Response) => {
  try {
    const kabupatenKota = await prisma.kabupatenKota.findMany();
    return res
      .status(200)
      .json({ message: "Mengambil semua data Kabupaten/Kota", kabupatenKota });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
  }
};

export const getPasarByKabupaten = async (req: Request, res: Response) => {
  try {
    const { kabupatenKotaId } = req.params;
    const pasar = await prisma.pasar.findMany({
      where: { kabupatenKotaId },
      orderBy: { nama: "asc" },
    });
    return res.status(200).json({
      message: "Mengambil semua data pasar berdasarkan kabupaten",
      pasar,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
  }
};
