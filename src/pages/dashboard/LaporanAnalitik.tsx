import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faFileAlt,
  faDownload,
  faGift,
  faUsers,
  faCalendarCheck,
  faEye,
  faTimes,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import type React from "react";
import { useState } from "react";
import axios from "../../helpers/Axios";
import type { AxiosError } from "axios";

type ExcelPreviewData = {
  message: string;
  data: Record<string, string | number>[];
  totalRows: number;
  columns: string[];
};

const LaporanAnalitik: React.FC = () => {
  const [previewData, setPreviewData] = useState<ExcelPreviewData | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const closePreview = () => {
    setPreviewData(null);
    setError(null);
  };

  const previewSouvenirReport = async () => {
    setLoading("souvenir");
    setError(null);
    try {
      const response = await axios.get(
        "/api/excel/laporan-suvenir?preview=true"
      );
      setPreviewData(response.data);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error?.response?.data?.message || "Gagal memuat preview data");
    } finally {
      setLoading(null);
    }
  };

  const previewRespondentReport = async () => {
    setLoading("respondent");
    setError(null);
    try {
      const response = await axios.get(
        "/api/excel/data-responden?preview=true"
      );
      setPreviewData(response.data);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error?.response?.data?.message || "Gagal memuat preview data");
    } finally {
      setLoading(null);
    }
  };

  const previewLogBook = async () => {
    setLoading("absensi");
    setError(null);
    try {
      const response = await axios.get(
        "/api/excel/log-book-absensi?preview=true"
      );
      setPreviewData(response.data);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error?.response?.data?.message || "Gagal memuat preview data");
    } finally {
      setLoading(null);
    }
  };

  const downloadSouvenirReport = async () => {
    setLoading("download-souvenir");
    try {
      const response = await axios.get("/api/excel/laporan-suvenir", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Laporan_Suvenir_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error?.response?.data?.message || "Gagal mengunduh file");
    } finally {
      setLoading(null);
    }
  };

  const downloadRespondentReport = async () => {
    setLoading("download-respondent");
    try {
      const response = await axios.get("/api/excel/data-responden", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Data_Responden_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error?.response?.data?.message || "Gagal mengunduh file");
    } finally {
      setLoading(null);
    }
  };

  const downloadLogBook = async () => {
    setLoading("download-absensi");
    try {
      const response = await axios.get("/api/excel/log-book-absensi", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Log_Book_Absensi_${new Date().toISOString().split("T")[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error?.response?.data?.message || "Gagal mengunduh file");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div id="reports" className="w-full p-6">
      {/* Page Header */}
      <div className="mb-8 border-b-2 border-gray-200 pb-4">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
          <FontAwesomeIcon icon={faChartBar} className="h-7 w-7 " />
          <span>Laporan Analitik</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Ringkasan dan analisis data sistem Bank Indonesia
        </p>
      </div>

      {/* Download Reports Card */}
      <div className="rounded-xl shadow-md bg-white overflow-hidden">
        <div className="bg-gradient-to-br from-rose-50 to-red-50 border-b border-red-200 p-6">
          <h2 className="text-red-600 text-xl font-bold flex items-center gap-2">
            <FontAwesomeIcon icon={faFileAlt} className="h-6 w-6" />
            Unduh Laporan
          </h2>
          <p className="text-red-900/80 text-sm font-medium mt-1">
            Pilih jenis laporan yang ingin Anda unduh dalam format Excel
          </p>
        </div>

        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-800 border border-red-300">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Laporan Suvenir */}
            <div className="bg-white border-2 border-gray-100 rounded-xl p-6 hover:border-red-200 transition-colors">
              <div className="text-center mb-4">
                <FontAwesomeIcon
                  icon={faGift}
                  className="h-12 w-12 text-red-600 mb-3"
                />
                <h3 className="text-lg font-semibold text-gray-800">
                  Laporan Suvenir
                </h3>
                <p className="text-sm text-gray-500">
                  Data laporan pemberian suvenir
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  onClick={previewSouvenirReport}
                  disabled={loading === "souvenir"}
                >
                  {loading === "souvenir" ? (
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="h-4 w-4 animate-spin"
                    />
                  ) : (
                    <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                  )}
                  Preview
                </button>
                <button
                  className="bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  onClick={downloadSouvenirReport}
                  disabled={loading === "download-souvenir"}
                >
                  {loading === "download-souvenir" ? (
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="h-4 w-4 animate-spin"
                    />
                  ) : (
                    <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />
                  )}
                  Download
                </button>
              </div>
            </div>

            {/* Data Responden */}
            <div className="bg-white border-2 border-gray-100 rounded-xl p-6 hover:border-red-200 transition-colors">
              <div className="text-center mb-4">
                <FontAwesomeIcon
                  icon={faUsers}
                  className="h-12 w-12 text-red-600 mb-3"
                />
                <h3 className="text-lg font-semibold text-gray-800">
                  Data Responden
                </h3>
                <p className="text-sm text-gray-500">
                  Database responden survey
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  onClick={previewRespondentReport}
                  disabled={loading === "respondent"}
                >
                  {loading === "respondent" ? (
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="h-4 w-4 animate-spin"
                    />
                  ) : (
                    <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                  )}
                  Preview
                </button>
                <button
                  className="bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  onClick={downloadRespondentReport}
                  disabled={loading === "download-respondent"}
                >
                  {loading === "download-respondent" ? (
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="h-4 w-4 animate-spin"
                    />
                  ) : (
                    <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />
                  )}
                  Download
                </button>
              </div>
            </div>

            {/* Log Book Absensi */}
            <div className="bg-white border-2 border-gray-100 rounded-xl p-6 hover:border-red-200 transition-colors">
              <div className="text-center mb-4">
                <FontAwesomeIcon
                  icon={faCalendarCheck}
                  className="h-12 w-12 text-red-600 mb-3"
                />
                <h3 className="text-lg font-semibold text-gray-800">
                  Log Book Absensi
                </h3>
                <p className="text-sm text-gray-500">
                  Riwayat kehadiran karyawan
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  onClick={previewLogBook}
                  disabled={loading === "absensi"}
                >
                  {loading === "absensi" ? (
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="h-4 w-4 animate-spin"
                    />
                  ) : (
                    <FontAwesomeIcon icon={faEye} className="h-4 w-4" />
                  )}
                  Preview
                </button>
                <button
                  className="bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  onClick={downloadLogBook}
                  disabled={loading === "download-absensi"}
                >
                  {loading === "download-absensi" ? (
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="h-4 w-4 animate-spin"
                    />
                  ) : (
                    <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />
                  )}
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Excel Preview Modal */}
      {previewData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-br from-rose-50 to-red-50 border-b border-red-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-red-600 text-xl font-bold flex items-center gap-2">
                    <FontAwesomeIcon icon={faEye} className="h-6 w-6" />
                    Preview Excel
                  </h2>
                  <p className="text-red-900/80 text-sm font-medium mt-1">
                    {previewData.message} - Total {previewData.totalRows} baris
                    data
                  </p>
                </div>
                <button
                  onClick={closePreview}
                  className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                >
                  <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
              {previewData.data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        {previewData.columns.map((column, index) => (
                          <th
                            key={index}
                            className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50">
                          {previewData.columns.map((column, colIndex) => (
                            <td
                              key={colIndex}
                              className="border border-gray-300 px-4 py-2 text-sm text-gray-600"
                            >
                              {row[column] || "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewData.totalRows > 10 && (
                    <div className="mt-4 text-center text-sm text-gray-500">
                      Menampilkan 10 dari {previewData.totalRows} baris data
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FontAwesomeIcon
                    icon={faFileAlt}
                    className="h-12 w-12 mb-4 opacity-30"
                  />
                  <p className="font-medium">
                    Tidak ada data untuk ditampilkan
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t border-gray-200 p-6">
              <div className="flex justify-end gap-3">
                <button
                  onClick={closePreview}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    // Determine which download function to call based on the preview data
                    if (previewData.message.includes("suvenir")) {
                      downloadSouvenirReport();
                    } else if (previewData.message.includes("responden")) {
                      downloadRespondentReport();
                    } else if (previewData.message.includes("absensi")) {
                      downloadLogBook();
                    }
                    closePreview();
                  }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-br from-red-600 to-red-700 text-white font-medium hover:from-red-700 hover:to-red-800 transition-colors cursor-pointer"
                >
                  <FontAwesomeIcon icon={faDownload} className="h-4 w-4 mr-2" />
                  Download Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaporanAnalitik;
