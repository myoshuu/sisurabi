import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const main = async () => {
  await prisma.$transaction([
    prisma.laporanSuvenir.deleteMany(),
    prisma.absensi.deleteMany(),
    prisma.responden.deleteMany(),
    prisma.pasar.deleteMany(),
    prisma.kabupatenKota.deleteMany(),
    prisma.user.deleteMany(),
    prisma.role.deleteMany(),
  ]);

  // 1. Creating dummy data Role
  const superAdminRole = await prisma.role.create({
    data: { nama: "SUPER ADMIN" },
  });
  const adminRole = await prisma.role.create({ data: { nama: "ADMIN" } });
  const userRole = await prisma.role.create({ data: { nama: "USER" } });
  /* -- */ console.log("🟢 Role successfully created");

  // 2. Creating dummy data User
  const superAdmin = await prisma.user.create({
    data: {
      email: "admin@bi.go.id",
      password: await bcrypt.hash("admin123", 12),
      roleId: superAdminRole.id,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "manager@bi.go.id",
      password: await bcrypt.hash("manager123", 12),
      roleId: adminRole.id,
    },
  });

  const user = await prisma.user.create({
    data: {
      email: "user@bi.go.id",
      password: await bcrypt.hash("user123", 12),
      roleId: userRole.id,
    },
  });
  /* -- */ console.log("🟢 User successfully created");

  // 3. Creating dummy data Kabupaten & Kota
  const kabupatenKota = await Promise.all(
    [
      { nama: "Kota Manado" },
      { nama: "Kota Kotamobagu" },
      { nama: "Kabupaten Minahasa Selatan" },
      { nama: "Kabupaten Minahasa Utara" },
    ].map((kt) => {
      return prisma.kabupatenKota.create({ data: kt });
    })
  );
  /* -- */ console.log("🟢 Kabupaten & Kota successfully created");

  // 4. Creating dummy data Pasar
  const pasar = await Promise.all(
    [
      { nama: "Bersehati", kabupatenKotaId: kabupatenKota[0].id },
      { nama: "Karombasan", kabupatenKotaId: kabupatenKota[0].id },
      { nama: "Poyowa Kecil", kabupatenKotaId: kabupatenKota[1].id },
      { nama: "23 Maret", kabupatenKotaId: kabupatenKota[1].id },
      { nama: "54 Amurang", kabupatenKotaId: kabupatenKota[2].id },
      { nama: "Airmadidi", kabupatenKotaId: kabupatenKota[3].id },
    ].map((ps) => {
      return prisma.pasar.create({ data: ps });
    })
  );
  /* -- */ console.log("🟢 Pasar successfully created");

  // 5. Creating dummy data Responden
  const respondenList = await Promise.all(
    [
      {
        nama: "Budi",
        telp: "08952697",
        level: "Pedagang Eceran",
        kabupatenKotaId: kabupatenKota[0].id,
        pasarId: pasar[0].id,
        createdBy: superAdmin.email,
      },
      {
        nama: "Miyagi",
        telp: "2983492834",
        level: "Pasar Modern",
        kabupatenKotaId: kabupatenKota[2].id,
        pasarId: pasar[3].id,
        createdBy: superAdmin.email,
      },
      {
        nama: "Myo",
        telp: "12345678",
        level: "Pasar Modern",
        kabupatenKotaId: kabupatenKota[3].id,
        pasarId: pasar[2].id,
        createdBy: superAdmin.email,
      },
    ].map((rd) => prisma.responden.create({ data: rd }))
  );
  /* -- */ console.log("🟢 Responden successfully created");

  // 6. Creating dummy data Absensi
  await Promise.all(
    [
      {
        fotoClockIn: "foto",
        fotoClockOut: "foto",
        clockIn: new Date("2025-08-29 07:00:00"),
        clockOut: new Date("2025-08-29 17:00:00"),
        catatan: "Pasar Manado",
        userId: user.id,
        createdBy: user.email,
      },
      {
        fotoClockIn: "foto2",
        fotoClockOut: "foto2",
        clockIn: new Date("2025-08-27 08:00:00"),
        clockOut: new Date("2025-08-27 20:00:00"),
        catatan: "Pasar Itulah",
        userId: user.id,
        createdBy: user.email,
      },
    ].map((ab) => {
      return prisma.absensi.create({ data: ab });
    })
  );
  /* -- */ console.log("🟢 Absensi successfully created");

  // 7. Creating dummy data Laporan Suvenir
  await Promise.all(
    [
      {
        nama: "Greitha Pelealu",
        jenis: "Gantungan Kunci",
        periodeBulan: "Agustus",
        periodeTahun: 2025,
        foto: "foto3",
        catatan: "Berjalan dengan baik",
        respondenId: respondenList[1].id,
        userId: user.id,
        createdBy: user.email,
      },
      {
        nama: "Gracia",
        jenis: "Tumbler",
        periodeBulan: "Agustus",
        periodeTahun: 2025,
        foto: "foto4",
        catatan: "Berjalan dengan baik",
        respondenId: respondenList[0].id,
        userId: user.id,
        createdBy: user.email,
      },
    ].map((ls) => prisma.laporanSuvenir.create({ data: ls }))
  );
  /* -- */ console.log("🟢 Laporan Suvenir successfully created");
};

main()
  .catch((e) => {
    console.log("🔴 Something went wrong!");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
