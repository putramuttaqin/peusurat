const JENIS_SURAT_OPTIONS = [
  'BUKU KELUAR UMUM',
  'SK KAKANWIL',
  'BUKU KELUAR YANKUM',
  'BUKU MASUK UMUM',
  'BUKU SURAT PERINTAH',
  'BUKU CUTI',
  'BUKU KELUAR PLH/PLT',
  'BUKU KELUAR P2L',
  'BUKU MASUK P2L',
  'BUKU MASUK YANKUM'
];

const RUANG_OPTIONS = [
  'KU',
  'P2L',
  'Kepegawaian',
  'Humas',
  'RB',
  'Penyuluh',
  'AHU',
  'Kepegawaian',
  'Suncang',
  'BSK',
  'JDIH'
];

const STATUS = {
  PENDING: '0',
  APPROVED: '1',
  REJECTED: '2'
};

module.exports = { JENIS_SURAT_OPTIONS, RUANG_OPTIONS, STATUS };
