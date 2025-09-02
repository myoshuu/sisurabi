import { prisma } from "@/helpers/Prisma";
import { Request, Response } from "express";

export const getPasarByKabupaten = async (req: Request, res: Response) => {
  try {
    const { kabupatenKotaId } = req.params;
    const pasar = await prisma.pasar.findMany({
      where: { kabupatenKotaId },
      orderBy: { nama: "asc" },
    });
    return res
      .status(400)
      .json({
        message: "Mengambil semua data pasar berdasarkan kabupaten",
        pasar,
      });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem." });
  }
};
