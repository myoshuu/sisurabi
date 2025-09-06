import { Request, Response } from "express";
import { prisma } from "../helpers/Prisma";
import dayjs from "dayjs";

export const indexLaporan = async (req: Request, res: Response) => {
  try {
    const laporan = await prisma.laporanSuvenir.findMany();
    return res.status(200).json({ message: "Showing all Laporan.", laporan });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
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

    if (!req.file)
      return res.status(400).json({ message: "Anda harus mengunggah Foto" });

    const bulanMapping: Record<string, number> = {
      JANUARI: 0,
      FEBRUARI: 1,
      MARET: 2,
      APRIL: 3,
      MEI: 4,
      JUNI: 5,
      JULI: 6,
      AGUSTUS: 7,
      SEPTEMBER: 8,
      OKTOBER: 9,
      NOVEMBER: 10,
      DESEMBER: 11,
    };

    const responden = await prisma.responden.findUnique({
      where: { id: respondenId },
      select: { createdAt: true },
    });

    if (!responden)
      return res.status(401).json({ message: "Responden tidak ditemukan" });

    const targetMonth = bulanMapping[periodeBulan.toUpperCase()];
    const targetEndDate = dayjs()
      .year(Number(periodeTahun))
      .month(targetMonth)
      .endOf("month");

    const monthsDiff = targetEndDate.diff(dayjs(responden.createdAt), "month");
    const status = monthsDiff >= 3 ? "TERLAMBAT" : "PENDING";

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
        createdBy: req.session.loggedIn?.id ?? "",
        status,
      },
    });

    return res.status(200).json({
      message: `Laporan dengan nama "${laporan.nama}" berhasil dibuat`,
      laporan,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
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

    const existing = await prisma.laporanSuvenir.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ message: "Laporan tidak ditemukan" });
    }

    if (existing.status === "APPROVED") {
      return res
        .status(403)
        .json({ message: "Laporan sudah disetujui, tidak bisa diubah lagi" });
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
        updatedBy: req.session.loggedIn?.id ?? "",
      },
    });

    return res.status(200).json({
      message: `Laporan dengan Nama "${laporan.nama}" berhasil diperbarui`,
      laporan,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
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
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
  }
};

// Approve/Reject System
export const approveLaporan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.laporanSuvenir.findUnique({ where: { id } });
    if (existing?.status === "APPROVED")
      return res.status(401).json({
        message:
          "Laporan ini sudah di setujui, anda tidak perlu melakukanya berulang kali",
      });

    const laporan = await prisma.laporanSuvenir.update({
      where: { id },
      data: {
        status: "APPROVED",
        approvedBy: req.session.loggedIn?.id ?? "",
        approvedAt: new Date(),
      },
    });

    return res
      .status(200)
      .json({ mesage: "Laporan berhasil di approve", laporan });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Gagal approve laporan" });
  }
};

export const rejectLaporan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.laporanSuvenir.findUnique({ where: { id } });
    if (existing?.status === "REJECTED")
      return res.status(401).json({
        message:
          "Laporan ini sudah di tolak, anda tidak perlu melakukanya berulang kali",
      });

    const laporan = await prisma.laporanSuvenir.update({
      where: { id },
      data: {
        status: "REJECTED",
        approvedBy: req.session.loggedIn?.id ?? "",
        approvedAt: new Date(),
      },
    });

    return res
      .status(200)
      .json({ mesage: "Laporan berhasil di tolak", laporan });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Gagal reject laporan" });
  }
};
