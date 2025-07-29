import { useEffect, useState, useContext } from 'preact/hooks';
import { route } from 'preact-router';
import { AuthContext } from '../shared/AuthContext';
import { JENIS_SURAT_OPTIONS, STATUS, USER_ROLES } from '../shared/enum.js';
import '../styles/entries.css';

export default function EntriesPage() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
  const formatDate = (date) => date.toISOString().split('T')[0];

  const apiUrl = import.meta.env.VITE_API_URL;
  const itemsPerPage = 10;

  const { isAdmin, user, loading } = useContext(AuthContext);

  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [expandedRow, setExpandedRow] = useState(null);
  const [pageLoading, setPageLoading] = useState(false); // ⬅️ Local page loading state

  const [filters, setFilters] = useState({
    startDate: formatDate(thirtyDaysAgo),
    endDate: formatDate(new Date()),
    status: '',
    jenisSurat: ''
  });

  useEffect(() => {
    if (!loading && !isAdmin) {
      route('/');
    } else if (!loading && isAdmin) {
      handleFilter(1);
    }
  }, [loading, isAdmin]);

  const handleFilter = async (page = 1) => {
    setPageLoading(true);
    try {
      const params = new URLSearchParams({
        ...filters,
        search,
        user,
        page,
        limit: itemsPerPage
      });

      const res = await fetch(`${apiUrl}/api/surat/entries?${params}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      setEntries(data.documents || []);
      setTotalItems(data.total || 0);
      setCurrentPage(data.page || 1);
    } catch (err) {
      console.error('Error filtering entries:', err);
      alert('Gagal memfilter data');
    } finally {
      setPageLoading(false);
    }
  };

  const handleResetFilter = () => {
    setSearch('');
    setFilters({
      startDate: formatDate(thirtyDaysAgo),
      endDate: formatDate(new Date()),
      status: '',
      jenisSurat: ''
    });
    handleFilter(1);
  };

  const handleState = async (id, aksi) => {
    if (!isAdmin) {
      alert('Hanya admin yang dapat menyetujui surat');
      return;
    }

    const text = aksi === 1 ? 'menyutujui' : 'menolak';
    if (!confirm(`Anda yakin ingin ${text} surat ini?`)) return;

    try {
      const res = await fetch(`${apiUrl}/api/surat/entries/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: aksi })
      });

      if (res.status === 403) {
        throw new Error('Sesi admin telah berakhir');
      }

      if (!res.ok) throw new Error('Approval Gagal');

      await handleFilter(currentPage);
      alert(`Berhasil ${text} surat!`);
    } catch (err) {
      alert(err.message || 'Gagal menyetujui surat');
    }
  };

  const stateToStr = (s) =>
    Object.keys(STATUS).find((k) => STATUS[k] === String(s));

  const formatFullDateTime = (isoString) => {
    const date = new Date(isoString);
    const datePart = new Intl.DateTimeFormat('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta'
    }).format(date);

    const timePart = new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false, timeZone: 'Asia/Jakarta'
    }).format(date).replace(/\./g, ':');

    return `${datePart} ${timePart}`;
  };

  const formatDateOnly = (isoString) =>
    new Intl.DateTimeFormat('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta'
    }).format(new Date(isoString));

  return (
    <div className="form-container">
      <div className="entries-header">
        <button className="back-button" onClick={() => route('/')}>Kembali</button>
      </div>

      <h2>Dashboard Nomor Surat</h2>

      <div className="search-filter-bar">
        <div className="filter-row">
          <select
            className="filter-item"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Semua Status</option>
            {Object.entries(STATUS).map(([key, value]) => (
              <option key={key} value={value}>{key}</option>
            ))}
          </select>

          <select
            className="filter-item"
            value={filters.jenisSurat}
            onChange={(e) => setFilters({ ...filters, jenisSurat: e.target.value })}
          >
            <option value="">Semua Jenis Surat</option>
            {JENIS_SURAT_OPTIONS.map((option, index) => (
              <option key={option} value={index}>{option}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Cari nomor surat/perihal..."
            value={search}
            onInput={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="date-input"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="date-input"
          />

          <div className="filter-actions">
            <button onClick={() => handleFilter(1)} className="filter-button">Cari</button>
            <button onClick={handleResetFilter} className="reset-button">Reset</button>
          </div>
        </div>
      </div>

      {pageLoading ? (
        <p>Memuat data...</p>
      ) : entries.length === 0 ? (
        <p>Tidak ada data ditemukan.</p>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Jenis Surat</th>
                <th>Perihal Surat</th>
                <th className="fit-content">Tanggal Surat</th>
                <th>Nomor Surat</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <>
                  <tr key={entry.id}>
                    <td className="fit-content">{JENIS_SURAT_OPTIONS[entry.jenis_surat_id - 1]}</td>
                    <td>{entry.perihal_surat}</td>
                    <td className="fit-content">{formatDateOnly(entry.tanggal_surat)}</td>
                    <td className="fit-content">{entry.nomor_surat}</td>
                    <td className="fit-content">{stateToStr(entry.status)}</td>
                    <td className="fit-content">
                      <button
                        className="action-button"
                        onClick={() => setExpandedRow(expandedRow === entry.id ? null : entry.id)}
                      >
                        {expandedRow === entry.id ? 'Hide' : 'Detail'}
                      </button>
                      {user.role === USER_ROLES.SUPER_ADMIN && entry.status === 0 && (
                        <>
                          <button onClick={() => handleState(entry.id, 1)} id="approve-button">Approve</button>
                          <button onClick={() => handleState(entry.id, 2)} id="reject-button">Reject</button>
                        </>
                      )}
                    </td>
                  </tr>
                  {expandedRow === entry.id && (
                    <tr className="detail-row">
                      <td colSpan={8}>
                        <div className="detail-content">
                          <strong>Pemohon:</strong> {entry.pemohon || '-'}<br />
                          <strong>Waktu masuk surat:</strong> {formatFullDateTime(entry.created_at)}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button
              onClick={() => handleFilter(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Prev
            </button>
            <span>{currentPage} / {Math.ceil(totalItems / itemsPerPage)}</span>
            <button
              onClick={() => handleFilter(currentPage + 1)}
              disabled={currentPage * itemsPerPage >= totalItems}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
