// Surat type mapping
const JENIS_SURAT = {
  UMUM: 1,
  YANKUM: 2,
  SK_KAKANWIL: 3,
  PERINTAH: 4,
  CUTI: 5,
  PLH_PLT: 6,
  P2L_KELUAR: 7,
  P2L_MASUK: 8,
  YANKUM_MASUK: 9
};

// Room / applicant origin mapping
const RUANG = {
  TU: 1,
  LPKA: 2,
  RUTAN: 3,
  LAPAS: 4
  // Add more if needed
};

// Document status
const STATUS = {
  PENDING: 0,
  APPROVED: 1,
  REJECTED: 2
};

module.exports = {
  JENIS_SURAT,
  RUANG,
  STATUS
};
