import { prisma } from "../helpers/Prisma";
import { Request, Response } from "express";

export const indexResponden = async (req: Request, res: Response) => {
  try {
    const responden = await prisma.responden.findMany({
      include: {
        pasar: { select: { nama: true } },
        kabupatenKota: { select: { nama: true } },
      },
    });

    return res
      .status(200)
      .json({ message: "Getting responden data", responden });
  } catch (err) {
    console.error(err);
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
        createdBy: req.session.loggedIn?.email ?? "",
      },
    });
    return res
      .status(200)
      .json({ message: `Responden "${responden.nama}" berhasil dibuat.` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const showResponden = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const responden = await prisma.responden.findUnique({ where: { id } });
    if (!responden)
      return res.status(400).json({ message: "The responden not found" });
    return res
      .status(200)
      .json({ message: `Showing Responden "${responden?.nama}"` });
  } catch (err) {
    console.error(err);
  }
};

export const updateResponden = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nama, telp, level, kabupatenKotaId, pasarId } = req.body;

    const responden = await prisma.responden.update({
      where: { id },
      data: {
        nama,
        telp,
        level,
        kabupatenKotaId,
        pasarId,
        updatedBy: req.session.loggedIn?.email ?? "",
      },
    });

    return res
      .status(200)
      .json({ message: `Responden "${responden.nama}" berhasil di update.` });
  } catch (err) {
    console.error(err);
  }
};

export const deleteResponden = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const responden = await prisma.responden.delete({ where: { id } });
    if (responden)
      return res.status(200).json({ message: "Responden berhasil dihapus." });
  } catch (err) {
    console.error(err);
  }
};
