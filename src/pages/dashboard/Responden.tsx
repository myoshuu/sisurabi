const Responden = () => {
  return (
    <section id="respondents" className="w-full p-6">
      {/* Page Header */}
      <div className="mb-8 border-b-2 border-gray-200 pb-4">
        <h1 className="flex items-center gap-3 text-3xl md:text-4xl font-bold text-gray-900">
          <i className="fas fa-users" aria-hidden />
          <span>Data Responden</span>
        </h1>
        <p className="text-gray-500 text-sm md:text-base mt-1">
          Kelola database responden survey Bank Indonesia
        </p>
        <button
          type="button"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-red-600 to-red-700 px-4 py-2 text-white font-semibold uppercase tracking-wide text-sm shadow transition-transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none"
        >
          <i className="fas fa-chart-bar" aria-hidden />
          <span>Lihat Laporan Analitik</span>
        </button>
      </div>

      {/* Tambah Responden Baru */}
      <div className="mb-8 overflow-hidden rounded-xl shadow-md bg-white">
        <div className="bg-gradient-to-br from-rose-50 to-red-50 border-b border-red-200 p-6">
          <h2 className="text-red-600 text-xl md:text-2xl font-bold flex items-center gap-2">
            <i className="fas fa-user-plus" aria-hidden />
            <span>Tambah Responden Baru</span>
          </h2>
          <p className="text-red-900/80 text-sm md:text-base font-medium mt-1">
            Daftarkan responden baru untuk survey
          </p>
        </div>
        <div className="p-6">
          <form id="respondentForm" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nama Lengkap */}
              <div className="space-y-2">
                <label
                  htmlFor="respondentName"
                  className="block text-gray-700 font-semibold"
                >
                  <i className="fas fa-user mr-2" aria-hidden /> Nama Lengkap *
                </label>
                <input
                  id="respondentName"
                  type="text"
                  required
                  placeholder="Masukkan nama lengkap"
                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-3 text-base transition focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                />
              </div>

              {/* Nomor Telepon */}
              <div className="space-y-2">
                <label
                  htmlFor="respondentPhone"
                  className="block text-gray-700 font-semibold"
                >
                  <i className="fas fa-phone mr-2" aria-hidden /> Nomor Telepon
                </label>
                <input
                  id="respondentPhone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-3 text-base transition focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Level */}
              <div className="space-y-2" id="respondentLevelGroup">
                <label
                  htmlFor="respondentLevel"
                  className="block text-gray-700 font-semibold"
                >
                  <i className="fas fa-layer-group mr-2" aria-hidden /> Level *
                </label>
                <select
                  id="respondentLevel"
                  required
                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-3 text-base transition focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                >
                  <option value="">Pilih level</option>
                  <option>Pedagang Eceran</option>
                  <option>Pedagang Besar</option>
                  <option>Pasokan</option>
                  <option>Produsen</option>
                  <option>Pasar Modern</option>
                </select>
              </div>

              {/* Kabupaten/Kota */}
              <div className="space-y-2" id="kabupatenKotaGroup">
                <label
                  htmlFor="kabupatenKota"
                  className="block text-gray-700 font-semibold"
                >
                  <i className="fas fa-city mr-2" aria-hidden /> Kabupaten/Kota
                  *
                </label>
                <select
                  id="kabupatenKota"
                  required
                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-3 text-base transition focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                >
                  <option value="">Pilih Kabupaten/Kota</option>
                  <option>Manado</option>
                  <option>Kotamobagu</option>
                  <option>Minsel</option>
                  <option>Minut</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nama Pasar */}
              <div className="space-y-2" id="marketNameGroup">
                <label
                  htmlFor="marketName"
                  className="block text-gray-700 font-semibold"
                >
                  <i className="fas fa-store mr-2" aria-hidden /> Nama Pasar *
                </label>
                <select
                  id="marketName"
                  required
                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-3 text-base transition focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                >
                  <option value="">Pilih nama pasar</option>
                </select>
              </div>

              {/* Kecamatan */}
              <div className="space-y-2">
                <label
                  htmlFor="respondentKecamatan"
                  className="block text-gray-700 font-semibold"
                >
                  <i className="fas fa-map-marker-alt mr-2" aria-hidden />{" "}
                  Kecamatan *
                </label>
                <input
                  id="respondentKecamatan"
                  type="text"
                  required
                  placeholder="Masukkan kecamatan"
                  className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-3 text-base transition focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
                />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-red-600 to-red-700 px-5 py-3 text-white font-semibold uppercase tracking-wide text-sm shadow transition-transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none"
            >
              <i className="fas fa-save" aria-hidden />
              <span>Simpan Responden</span>
            </button>
          </form>
        </div>
      </div>

      {/* Database Responden */}
      <div className="mb-8 overflow-hidden rounded-xl shadow-md bg-white">
        <div className="bg-gradient-to-br from-rose-50 to-red-50 border-b border-red-200 p-6">
          <h2 className="text-red-600 text-xl md:text-2xl font-bold flex items-center gap-2">
            <i className="fas fa-database" aria-hidden />
            <span>Database Responden</span>
          </h2>
          <p className="text-red-900/80 text-sm md:text-base font-medium mt-1">
            Daftar responden yang terdaftar dalam sistem
          </p>
        </div>

        <div className="p-6">
          <div className="relative mb-6">
            <i
              className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              aria-hidden
            />
            <input
              id="searchRespondent"
              type="text"
              placeholder="Cari responden berdasarkan nama, pasar, atau level..."
              className="w-full max-w-md rounded-full border-2 border-gray-200 pl-12 pr-4 py-3 text-base transition focus:outline-none focus:border-red-600 focus:ring-4 focus:ring-red-600/10"
            />
          </div>

          <div id="respondentList" className="min-h-[120px]">
            <div className="text-center text-gray-500 py-12">
              <i
                className="fas fa-box-open text-5xl opacity-30 mb-3 block"
                aria-hidden
              />
              <p className="font-medium">Belum ada data responden.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Responden;
