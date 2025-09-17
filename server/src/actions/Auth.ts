import { prisma } from "../helpers/Prisma";
import { Request, Response } from "express";
import bcrypt from "bcrypt";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
    if (!user) return res.status(401).json({ message: "Akun tidak ditemukan" });

    const comparePass = await bcrypt.compare(password, user.password);
    if (!comparePass)
      return res.status(401).json({ message: "Email atau Password salah" });

    req.session.loggedIn = {
      id: user.id,
      email: user.email,
      role: { nama: user.role.nama },
    };

    return res
      .status(200)
      .json({ message: "Login berhasil", user: req.session.loggedIn });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
  }
};

export const getSession = async (req: Request, res: Response) => {
  if (!req.session.loggedIn)
    return res
      .status(401)
      .json({ message: "Anda belum login, silahkan login terlebih dahulu" });

  res
    .status(200)
    .json({ message: "User didapatkan", user: req.session.loggedIn });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, roleId } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email dan password harus diisi",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Format email tidak valid",
      });
    }

    // Validate BI email domain
    if (!email.endsWith("@bi.go.id")) {
      return res.status(400).json({
        message: "Email harus menggunakan domain @bi.go.id",
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password minimal 8 karakter",
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User dengan email tersebut sudah ada",
      });
    }

    // Determine role - use provided roleId or default to USER
    let role;
    if (roleId) {
      role = await prisma.role.findUnique({
        where: { id: roleId },
      });
      if (!role) {
        return res.status(400).json({
          message: "Role tidak ditemukan",
        });
      }
    } else {
      // Default to USER role for public registration
      role = await prisma.role.findFirst({ where: { nama: "USER" } });
      if (!role) {
        return res
          .status(400)
          .json({ message: "Upss. Kamu tidak memiliki akses" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        roleId: role.id,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        role: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });
    return res.status(201).json({
      message: `Berhasil menambahkan user dengan email ${user.email}`,
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    if (!req.sessionID || !req.cookies["connect.sid"] || !req.session) {
      return res.status(401).json({ message: "Upss. Anda sudah log out" });
    }

    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ message: "Terjadi kesalahan sistem" });
        }
        res.clearCookie("connect.sid", { path: "/" });
        return res.status(200).json({
          message:
            "Berhasil untuk logout. Terima kasih sudah menggunakan Sisurabi",
        });
      });
    } else {
      res.clearCookie("connect.sid", { path: "/" });
      return res.status(401).json({ message: "Upss. Anda sudah log out" });
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
  }
};

// Get all roles
export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      select: {
        id: true,
        nama: true,
      },
      orderBy: {
        nama: "asc",
      },
    });

    return res.status(200).json({
      message: "Roles berhasil didapatkan",
      roles,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
  }
};

// Get all users with search and filter
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { q, field, role } = req.query;

    let whereClause: any = {};

    // Search functionality
    if (q && field) {
      if (field === "email") {
        whereClause.email = {
          contains: q as string,
          mode: "insensitive",
        };
      } else if (field === "role") {
        whereClause.role = {
          nama: {
            contains: q as string,
            mode: "insensitive",
          },
        };
      }
    } else if (q) {
      // Search in all fields
      whereClause.OR = [
        {
          email: {
            contains: q as string,
            mode: "insensitive",
          },
        },
        {
          role: {
            nama: {
              contains: q as string,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    // Role filter
    if (role) {
      whereClause.roleId = role as string;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Users berhasil didapatkan",
      users,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, password, roleId } = req.body;

    // Validate required fields
    if (!email || !roleId) {
      return res.status(400).json({
        message: "Email dan role harus diisi",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Format email tidak valid",
      });
    }

    // Validate BI email domain
    if (!email.endsWith("@bi.go.id")) {
      return res.status(400).json({
        message: "Email harus menggunakan domain @bi.go.id",
      });
    }

    // Validate password if provided
    if (password && password.length < 8) {
      return res.status(400).json({
        message: "Password minimal 8 karakter",
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    // Check if email is already taken by another user
    const emailTaken = await prisma.user.findFirst({
      where: {
        email,
        id: { not: id },
      },
    });

    if (emailTaken) {
      return res.status(400).json({
        message: "Email sudah digunakan oleh user lain",
      });
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return res.status(400).json({
        message: "Role tidak ditemukan",
      });
    }

    // Prepare update data
    const updateData: any = {
      email,
      roleId,
    };

    // Only update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: `User dengan email ${user.email} berhasil diperbarui`,
      user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        message: "User tidak ditemukan",
      });
    }

    // Prevent deleting own account
    if (req.session.loggedIn?.id === id) {
      return res.status(400).json({
        message: "Tidak dapat menghapus akun sendiri",
      });
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    return res.status(200).json({
      message: `User dengan email ${existingUser.email} berhasil dihapus`,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
  }
};
