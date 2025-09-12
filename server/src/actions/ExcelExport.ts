import { Request, Response } from "express";
import { prisma } from "../helpers/Prisma";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

// Helper function to format data for Excel
const formatDate = (date: Date | string) => {
  return dayjs(date).format("DD/MM/YYYY HH:mm:ss");
};

const formatDateOnly = (date: Date | string) => {
  return dayjs(date).format("DD/MM/YYYY");
};

// Helper function to add borders and styling to worksheet
const addBordersAndStyling = (worksheet: XLSX.WorkSheet) => {
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");

  // Define border style
  const borderStyle = {
    top: { style: "thin", color: { rgb: "000000" } },
    bottom: { style: "thin", color: { rgb: "000000" } },
    left: { style: "thin", color: { rgb: "000000" } },
    right: { style: "thin", color: { rgb: "000000" } },
  };

  // Apply borders to all cells
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (!worksheet[cellAddress]) {
        worksheet[cellAddress] = { v: "", t: "s" };
      }

      // Initialize cell style if not exists
      if (!worksheet[cellAddress].s) {
        worksheet[cellAddress].s = {};
      }

      // Add borders
      worksheet[cellAddress].s.border = borderStyle;

      // Header row styling (first row)
      if (row === range.s.r) {
        worksheet[cellAddress].s.fill = {
          fgColor: { rgb: "E5E7EB" }, // Light gray background
        };
        worksheet[cellAddress].s.font = {
          bold: true,
          color: { rgb: "1F2937" }, // Dark gray text
        };
        worksheet[cellAddress].s.alignment = {
          horizontal: "center",
          vertical: "center",
        };
      } else {
        // Data rows styling
        worksheet[cellAddress].s.font = {
          color: { rgb: "374151" }, // Medium gray text
        };
        worksheet[cellAddress].s.alignment = {
          vertical: "center",
        };
      }
    }
  }

  // Set row heights
  const rowHeights: XLSX.RowInfo[] = [];
  for (let row = range.s.r; row <= range.e.r; row++) {
    if (row === range.s.r) {
      rowHeights[row] = { hpt: 25 }; // Header row height
    } else {
      rowHeights[row] = { hpt: 20 }; // Data row height
    }
  }
  worksheet["!rows"] = rowHeights;

  return worksheet;
};

// Export Laporan Suvenir to Excel
export const exportLaporanSuvenir = async (req: Request, res: Response) => {
  try {
    const { preview } = req.query;

    // Get all laporan suvenir data
    const laporan = await prisma.laporanSuvenir.findMany({
      include: {
        responden: {
          select: {
            nama: true,
            level: true,
            pasar: { select: { nama: true } },
            kabupatenKota: { select: { nama: true } },
          },
        },
        user: { select: { email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Prepare data for Excel
    const excelData = laporan.map((item, index) => ({
      No: index + 1,
      "Nama Surveyor": item.nama,
      "Email Surveyor": item.user?.email || "-",
      "Nama Responden": item.responden?.nama || "-",
      "Level Responden": item.responden?.level || "-",
      Pasar: item.responden?.pasar?.nama || "-",
      "Kabupaten/Kota": item.responden?.kabupatenKota?.nama || "-",
      "Jenis Suvenir": item.jenis,
      "Periode Bulan": item.periodeBulan,
      "Periode Tahun": item.periodeTahun,
      Status: item.status,
      Catatan: item.catatan || "-",
      "Tanggal Dibuat": formatDate(item.createdAt),
      "Tanggal Disetujui": item.approvedAt ? formatDate(item.approvedAt) : "-",
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 5 }, // No
      { wch: 20 }, // Nama Surveyor
      { wch: 25 }, // Email Surveyor
      { wch: 20 }, // Nama Responden
      { wch: 15 }, // Level Responden
      { wch: 20 }, // Pasar
      { wch: 20 }, // Kabupaten/Kota
      { wch: 20 }, // Jenis Suvenir
      { wch: 15 }, // Periode Bulan
      { wch: 12 }, // Periode Tahun
      { wch: 12 }, // Status
      { wch: 30 }, // Catatan
      { wch: 20 }, // Tanggal Dibuat
      { wch: 20 }, // Tanggal Disetujui
    ];
    worksheet["!cols"] = columnWidths;

    // Add borders and styling
    addBordersAndStyling(worksheet);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Suvenir");

    if (preview === "true") {
      // Return preview data as JSON
      return res.status(200).json({
        message: "Preview data laporan suvenir",
        data: excelData.slice(0, 10), // Show only first 10 rows for preview
        totalRows: excelData.length,
        columns: Object.keys(excelData[0] || {}),
      });
    } else {
      // Generate Excel file
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="Laporan_Suvenir_${dayjs().format(
          "YYYY-MM-DD"
        )}.xlsx"`
      );
      res.send(buffer);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
  }
};

// Export Data Responden to Excel
export const exportDataResponden = async (req: Request, res: Response) => {
  try {
    const { preview } = req.query;

    // Get all responden data
    const responden = await prisma.responden.findMany({
      include: {
        pasar: { select: { nama: true } },
        kabupatenKota: { select: { nama: true } },
        _count: { select: { LaporanSuvenir: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Prepare data for Excel
    const excelData = responden.map((item, index) => ({
      No: index + 1,
      "Nama Responden": item.nama,
      "Nomor Telepon": item.telp || "-",
      Level: item.level,
      "Nama Pasar": item.pasar?.nama || "-",
      "Kabupaten/Kota": item.kabupatenKota?.nama || "-",
      "Total Laporan Suvenir": item._count?.LaporanSuvenir || 0,
      "Tanggal Daftar": formatDate(item.createdAt),
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 5 }, // No
      { wch: 25 }, // Nama Responden
      { wch: 15 }, // Nomor Telepon
      { wch: 15 }, // Level
      { wch: 20 }, // Nama Pasar
      { wch: 20 }, // Kabupaten/Kota
      { wch: 20 }, // Total Laporan Suvenir
      { wch: 20 }, // Tanggal Daftar
    ];
    worksheet["!cols"] = columnWidths;

    // Add borders and styling
    addBordersAndStyling(worksheet);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Responden");

    if (preview === "true") {
      // Return preview data as JSON
      return res.status(200).json({
        message: "Preview data responden",
        data: excelData.slice(0, 10), // Show only first 10 rows for preview
        totalRows: excelData.length,
        columns: Object.keys(excelData[0] || {}),
      });
    } else {
      // Generate Excel file
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="Data_Responden_${dayjs().format(
          "YYYY-MM-DD"
        )}.xlsx"`
      );
      res.send(buffer);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
  }
};

export const exportLogBookAbsensi = async (req: Request, res: Response) => {
  try {
    const { preview } = req.query;

    const absensi = await prisma.absensi.findMany({
      include: {
        user: { select: { email: true } },
      },
      orderBy: { clockIn: "desc" },
    });

    const excelData = absensi.map((item, index) => ({
      No: index + 1,
      "Email User": item.user?.email || "-",
      Tanggal: formatDateOnly(item.clockIn),
      "Jam Clock In": dayjs(item.clockIn).format("HH:mm:ss"),
      "Jam Clock Out": item.clockOut
        ? dayjs(item.clockOut).format("HH:mm:ss")
        : "-",
      "Durasi (Jam)": item.clockOut
        ? dayjs(item.clockOut)
            .diff(dayjs(item.clockIn), "hour", true)
            .toFixed(2)
        : "-",
      Catatan: item.catatan || "-",
      Status: item.clockOut ? "Selesai" : "Sedang Bekerja",
      "Tanggal Dibuat": formatDate(item.createdAt),
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 5 }, // No
      { wch: 25 }, // Email User
      { wch: 12 }, // Tanggal
      { wch: 12 }, // Jam Clock In
      { wch: 12 }, // Jam Clock Out
      { wch: 12 }, // Durasi
      { wch: 30 }, // Catatan
      { wch: 15 }, // Status
      { wch: 20 }, // Tanggal Dibuat
    ];
    worksheet["!cols"] = columnWidths;

    // Add borders and styling
    addBordersAndStyling(worksheet);

    XLSX.utils.book_append_sheet(workbook, worksheet, "Log Book Absensi");

    if (preview === "true") {
      return res.status(200).json({
        message: "Preview log book absensi",
        data: excelData.slice(0, 10), // Show only first 10 rows for preview
        totalRows: excelData.length,
        columns: Object.keys(excelData[0] || {}),
      });
    } else {
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="Log_Book_Absensi_${dayjs().format(
          "YYYY-MM-DD"
        )}.xlsx"`
      );
      res.send(buffer);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Terjadi kesalahan sistem" });
  }
};
