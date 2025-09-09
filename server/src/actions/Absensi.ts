import { prisma } from "@/helpers/Prisma";
import { Request, Response } from "express";
import fs from "fs";
import path from "path";

export const indexAbsensi = async (req: Request, res: Response) => {
  try {
    const userId = req.session.loggedIn?.id;
    if (!userId)
      return res
        .status(401)
        .json({ message: "Anda harus login terlebih dahulu" });

    const q = (req.query.q as string | undefined)?.trim();
    const field = (req.query.field as string | undefined)?.trim();

    const allowed = new Set(["catatan", "tanggal"]);
    const useField = field && allowed.has(field) ? field : undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let where: any = { userId };

    if (q && useField) {
      if (useField === "catatan") {
        where = { ...where, catatan: { contains: q } };
      } else if (useField === "tanggal") {
        const searchDate = new Date(q);
        if (!isNaN(searchDate.getTime())) {
          const startOfDay = new Date(searchDate);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(searchDate);
          endOfDay.setHours(23, 59, 59, 999);
          where = {
            ...where,
            clockIn: {
              gte: startOfDay,
              lte: endOfDay,
            },
          };
        }
      }
    } else if (q) {
      where = {
        ...where,
        OR: [
          { catatan: { contains: q } },
          ...(isNaN(Date.parse(q))
            ? []
            : [
                {
                  clockIn: {
                    gte: new Date(new Date(q).setHours(0, 0, 0, 0)),
                    lte: new Date(new Date(q).setHours(23, 59, 59, 999)),
                  },
                },
              ]),
        ],
      };
    }

    const absensi = await prisma.absensi.findMany({
      where,
      include: { user: { select: { email: true } } },
      orderBy: { clockIn: "desc" },
    });

    return res.status(200).json({ message: "Mengambil data absensi", absensi });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
  }
};

// Check Status
export const statusAbsensi = async (req: Request, res: Response) => {
  try {
    const userId = req.session.loggedIn?.id;
    if (!userId)
      return res
        .status(401)
        .json({ message: "Anda harus login terlebih dahulu" });

    const openSession = await prisma.absensi.findFirst({
      where: { userId, clockOut: null },
      orderBy: { clockIn: "desc" },
    });

    if (openSession) {
      return res.status(400).json({ mode: "clockIn", absensi: openSession });
    } else {
      return res.status(400).json({ mode: "clockOut" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
  }
};

// Clock In
export const clockIn = async (req: Request, res: Response) => {
  try {
    const userId = req.session.loggedIn?.id;
    const { catatan } = req.body;

    if (!userId)
      return res
        .status(401)
        .json({ message: "Anda harus login terlebih dahulu" });

    if (!req.file)
      return res.status(400).json({ message: "Anda harus mengunggah Foto" });

    const openSession = await prisma.absensi.findFirst({
      where: { userId, clockOut: null },
      orderBy: { clockIn: "desc" },
    });

    if (openSession)
      return res.status(400).json({
        message:
          "Masih ada absensi yang belum di Clock Out. Silahkan Clock Out terlebih dahulu",
      });

    const absensi = await prisma.absensi.create({
      data: {
        fotoClockIn: `/uploads/${req.file.filename}`,
        clockIn: new Date(),
        catatan,
        userId,
        createdBy: req.session.loggedIn?.id ?? "",
      },
    });

    res.status(200).json({ message: "Anda sudah berhasil Clock In", absensi });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
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

    const openSession = await prisma.absensi.findFirst({
      where: { userId, clockOut: null },
      orderBy: { clockIn: "desc" },
    });

    if (!openSession) {
      return res.status(400).json({
        message:
          "Anda belum melakukan Clock In. Silakan Clock In terlebih dahulu",
      });
    }

    const updated = await prisma.absensi.update({
      where: { id: openSession.id },
      data: {
        fotoClockOut: `/uploads/${req.file.filename}`,
        clockOut: new Date(),
        updatedBy: req.session.loggedIn?.id ?? "",
      },
    });

    res.status(200).json({ message: "Anda sudah berhasil Clock Out", updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
  }
};

export const deleteAbsensi = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const absensi = await prisma.absensi.findUnique({ where: { id } });
    if (!absensi) {
      return res.status(404).json({ message: "Data absensi tidak ditemukan" });
    }

    await prisma.absensi.delete({ where: { id } });

    const deleteFile = (filePath: string) => {
      if (filePath) {
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

    if (absensi.fotoClockIn) {
      console.log(
        `Attempting to delete clock in photo: ${absensi.fotoClockIn}`
      );
      deleteFile(absensi.fotoClockIn);
    }

    if (absensi.fotoClockOut) {
      console.log(
        `Attempting to delete clock out photo: ${absensi.fotoClockOut}`
      );
      deleteFile(absensi.fotoClockOut);
    }

    res.status(200).json({ message: "Data absensi berhasil di delete" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
  }
};
