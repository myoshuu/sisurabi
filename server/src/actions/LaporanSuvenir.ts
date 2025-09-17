import { Request, Response } from "express";
import { prisma } from "../helpers/Prisma";
import dayjs from "dayjs";
import fs from "fs";
import path from "path";

export const indexLaporan = async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string | undefined)?.trim();
    const field = (req.query.field as string | undefined)?.trim();
    const status = (req.query.status as string | undefined)?.trim();

    const allowed = new Set(["responden", "surveyor", "jenis", "periode"]);
    const useField = field && allowed.has(field) ? field : undefined;

    let where: any = {};
    if (status) where.status = status;

    if (q && useField) {
      if (useField === "responden")
        where = { ...where, responden: { nama: { contains: q } } };
      else if (useField === "surveyor")
        where = { ...where, user: { email: { contains: q } } };
      else if (useField === "jenis")
        where = { ...where, jenis: { contains: q } };
      else if (useField === "periode")
        where = {
          ...where,
          OR: [
            { periodeBulan: { contains: q } },
            { periodeTahun: { equals: Number(q) || 0 } },
          ],
        };
    } else if (q) {
      where = {
        ...where,
        OR: [
          { nama: { contains: q } },
          { jenis: { contains: q } },
          { periodeBulan: { contains: q } },
          { periodeTahun: { equals: Number(q) || 0 } },
          { responden: { nama: { contains: q } } },
          { user: { email: { contains: q } } },
        ],
      };
    }

    const laporan = await prisma.laporanSuvenir.findMany({
      where,
      include: {
        responden: { select: { nama: true } },
        user: { select: { email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalLaporan = await prisma.laporanSuvenir.count({ where });
    const totalPending = await prisma.laporanSuvenir.count({
      where: { ...where, status: "PENDING" },
    });
    const totalTerlambat = await prisma.laporanSuvenir.count({
      where: { ...where, status: "TERLAMBAT" },
    });

    return res.status(200).json({
      message: "Showing all Laporan.",
      laporan,
      totalLaporan,
      totalPending,
      totalTerlambat,
    });
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
    const statusCalc = monthsDiff >= 3 ? "TERLAMBAT" : "PENDING";

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
        status: statusCalc,
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
        responden: {
          select: {
            nama: true,
          },
        },
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

    // First, get the laporan record to access file path and user info
    const laporan = await prisma.laporanSuvenir.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
    if (!laporan) {
      return res.status(404).json({ message: "Laporan tidak ditemukan" });
    }

    // Delete the database record
    await prisma.laporanSuvenir.delete({ where: { id } });

    // Delete the actual file
    const deleteFile = (filePath: string) => {
      if (filePath) {
        // Remove the leading slash and construct the full path
        const cleanPath = filePath.startsWith("/")
          ? filePath.substring(1)
          : filePath;
        const fullPath = path.join(process.cwd(), cleanPath);
        console.log(`Looking for file at: ${fullPath}`);

        if (fs.existsSync(fullPath)) {
          try {
            fs.unlinkSync(fullPath);
            console.log(`Deleted file: ${fullPath}`);
          } catch (fileErr) {
            console.error(`Error deleting file ${fullPath}:`, fileErr);
          }
        } else {
          console.log(`File not found: ${fullPath}`);
          // Try alternative path in case the file is in server/uploads
          const altPath = path.join(process.cwd(), "server", cleanPath);
          console.log(`Trying alternative path: ${altPath}`);
          if (fs.existsSync(altPath)) {
            try {
              fs.unlinkSync(altPath);
              console.log(`Deleted file from alternative path: ${altPath}`);
            } catch (fileErr) {
              console.error(`Error deleting file ${altPath}:`, fileErr);
            }
          } else {
            console.log(`File not found at alternative path: ${altPath}`);
          }
        }
      }
    };

    // Delete the photo file
    if (laporan.foto) {
      console.log(`Attempting to delete laporan photo: ${laporan.foto}`);
      deleteFile(laporan.foto);
    }

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

    const existing = await prisma.laporanSuvenir.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

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
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
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

    const existing = await prisma.laporanSuvenir.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

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
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
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
