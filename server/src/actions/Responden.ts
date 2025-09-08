import { prisma } from "../helpers/Prisma";
import { Request, Response } from "express";

export const indexResponden = async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string | undefined)?.trim();
    const field = (req.query.field as string | undefined)?.trim();

    const allowed = new Set(["nama", "telp", "level", "pasar", "kabupaten"]);
    const useField = field && allowed.has(field) ? field : undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let where: any = undefined;
    if (q && useField) {
      if (useField === "pasar") where = { pasar: { nama: { contains: q } } };
      else if (useField === "kabupaten")
        where = { kabupatenKota: { nama: { contains: q } } };
      else where = { [useField]: { contains: q } };
    } else if (q) {
      where = {
        OR: [
          { nama: { contains: q } },
          { telp: { contains: q } },
          { level: { contains: q } },
          { pasar: { nama: { contains: q } } },
          { kabupatenKota: { nama: { contains: q } } },
        ],
      };
    }

    const responden = await prisma.responden.findMany({
      where,
      include: {
        pasar: { select: { nama: true } },
        kabupatenKota: { select: { nama: true } },
        _count: { select: { LaporanSuvenir: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalResponden = await prisma.responden.count({ where });

    return res.status(200).json({
      message: "Berhasil mengambil semua data Responden.",
      responden,
      totalResponden,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
  }
};

export const createResponden = async (req: Request, res: Response) => {
  try {
    const { nama, telp, level, kabupatenKotaId, pasarId } = req.body;
    const responden = await prisma.responden.create({
      data: {
        nama,
        telp,
        level,
        kabupatenKotaId,
        pasarId,
        createdBy: req.session.loggedIn?.id ?? "",
      },
    });
    return res.status(200).json({
      message: `Responden dengan nama <b>${responden.nama}</b> berhasil dibuat`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
  }
};

export const showResponden = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const responden = await prisma.responden.findUnique({ where: { id } });
    if (!responden)
      return res
        .status(400)
        .json({ message: "Responden dengan ID tersebut tidak ditemukan" });
    return res.status(200).json({
      message: `Menampilkan Responden dengan nama <b>${responden?.nama}</b>"`,
      responden,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
  }
};

export const updateResponden = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nama, telp, level, kabupatenKotaId, pasarId } = req.body;

    const existing = await prisma.responden.findUnique({ where: { id } });
    if (!existing)
      res.status(404).json({ message: "Tidak ada responden terkait" });

    const responden = await prisma.responden.update({
      where: { id },
      data: {
        nama,
        telp,
        level,
        kabupatenKotaId,
        pasarId,
        updatedBy: req.session.loggedIn?.id ?? "",
      },
    });

    return res.status(200).json({
      message: `Responden dengan nama <b>${responden.nama}</b> berhasil di update`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
  }
};

export const deleteResponden = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.$transaction([
      prisma.laporanSuvenir.deleteMany({ where: { respondenId: id } }),
      prisma.responden.delete({ where: { id } }),
    ]);

    return res
      .status(200)
      .json({ message: "Responden tersebut berhasil dihapus" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
  }
};
