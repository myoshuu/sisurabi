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

    if (!req.file) {
      return res.status(400).json({ message: "Anda harus mengunggah Foto" });
    }

    const laporan = await prisma.laporanSuvenir.create({
      data: {
        nama,
        jenis,
        periodeBulan,
        periodeTahun: Number(periodeTahun),
        foto: `/uploads/${req.file.filename}`,
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
    return res.status(500).json({ message: "Terjadi kesalahan sistem." });
  }
};

export const updateLaporan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      nama,
      jenis,
      periodeBulan,
      periodeTahun,
      catatan,
      respondenId,
      userId,
    } = req.body;

    const existing = await prisma.laporanSuvenir.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Laporan tidak ditemukan" });
    }

    const fotoPath = req.file ? `/uploads/${req.file.filename}` : existing.foto;

    const laporan = await prisma.laporanSuvenir.update({
      where: { id },
      data: {
        nama,
        jenis,
        periodeBulan,
        periodeTahun: Number(periodeTahun),
        foto: fotoPath,
        catatan,
        respondenId,
        userId,
        updatedBy: req.session.loggedIn?.email ?? "",
      },
    });

    return res.status(200).json({
      message: `Laporan dengan Nama "${laporan.nama}" berhasil diperbarui`,
      laporan,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem." });
  }
};

export const deleteLaporan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const laporan = await prisma.laporanSuvenir.delete({ where: { id } });
    if (laporan)
      return res
        .status(200)
        .json({ message: "Laporan Suvenir tersebut berhasil dihapus." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem." });
  }
};
