// client/src/pages/EntriesPage.jsx

import { useEffect, useState } from 'preact/hooks';
import { route } from 'preact-router';
import { JENIS_SURAT_OPTIONS, RUANG_OPTIONS, STATUS } from '../shared/enum.js';
import '../styles/entries.css';

export function EntriesPage() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const formatDate = (date) => date.toISOString().split('T')[0];

  const apiUrl = import.meta.env.VITE_API_URL;
  const itemsPerPage = 20;

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  const [filters, setFilters] = useState({
    startDate: formatDate(thirtyDaysAgo),
    endDate: formatDate(today),
    status: '',
    jenisSurat: '',
    ruang: ''
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/auth/me`, {
          credentials: 'include'
        });
        const json = await res.json();
        setIsAdmin(json.isAdmin === true);

        await handleFilter(1);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleFilter = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...filters,
        search,
        page,
        limit: itemsPerPage
      });

      const res = await fetch(`${apiUrl}/api/surat/entries?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      setEntries(data.documents || []);
      setTotalItems(data.total || 0);
      setCurrentPage(data.page || 1);
    } catch (err) {
      console.error('Error filtering entries:', err);
      alert('Gagal memfilter data');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilter = () => {
    setSearch('');
    setFilters({
      startDate: formatDate(thirtyDaysAgo),
      endDate: formatDate(today),
      status: '',
      jenisSurat: '',
      ruang: ''
    });
    handleFilter(1);
  };

  const handleLogin = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/auth/session`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        setIsAdmin(true);
        setLoginStatus('success');
        setTimeout(() => setIsModalOpen(false), 1000);
      } else {
        setLoginStatus('error');
      }
    } catch {
      setLoginStatus('error');
    }
  };

  const handleLogout = async () => {
    await fetch(`${apiUrl}/api/auth/session`, {
      method: 'DELETE',
      credentials: 'include'
    });
    setIsAdmin(false);
  };

  const handleState = async (id, aksi) => {
    if (!isAdmin) {
      alert('Hanya admin yang dapat menyetujui surat');
      setIsModalOpen(true);
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
        setIsAdmin(false);
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
    s === 0 ? 'Pending' :
      s === 1 ? 'Approve' :
        s === 2 ? 'Reject' : 'Error';

  const formatFullDateTime = (isoString) => {
    const date = new Date(isoString);
    const datePart = new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta'
    }).format(date);

    const timePart = new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jakarta'
    }).format(date).replace(/\./g, ':');

    return `${datePart} ${timePart}`;
  };

  const formatDateOnly = (isoString) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta'
    }).format(date);
  };

  return (
    <div className="form-container">
      <div className="entries-header">
        <button className="back-button" onClick={() => route('/')}>Kembali</button>
        <button onClick={isAdmin ? handleLogout : () => setIsModalOpen(true)} className="admin-button">
          {isAdmin ? 'Logout Admin' : 'Login Admin'}
        </button>

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Admin Login</h3>
              <div className={`login-feedback ${loginStatus}`}>
                {loginStatus === 'success' && 'Login berhasil!'}
                {loginStatus === 'error' && 'Login gagal!'}
              </div>
              <div className="form-group">
                <label>Username:</label>
                <input type="text" value={username} onInput={(e) => setUsername(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input type="password" value={password} onInput={(e) => setPassword(e.target.value)} />
              </div>
              <div className="modal-actions">
                <button onClick={handleLogin} className="login-button">Login</button>
                <button onClick={() => { setIsModalOpen(false); setLoginStatus(null); }} className="cancel-button">Kembali</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <h2>Dashboard Nomor Surat</h2>

      <div className="search-filter-bar">
        <div className="filter-row">
          <select
            className='filter-item'
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Semua Status</option>
            {Object.entries(STATUS).map(([key, value]) => (
              <option key={key} value={value}>{key}</option>
            ))}
          </select>

          <select
            className='filter-item'
            value={filters.jenisSurat}
            onChange={(e) => setFilters({ ...filters, jenisSurat: e.target.value })}
          >
            <option value="">Semua Jenis Surat</option>
            {JENIS_SURAT_OPTIONS.map((option, index) => (
              <option key={option} value={index}>{option}</option>
            ))}
          </select>

          <select
            className='filter-item'
            value={filters.ruang}
            onChange={(e) => setFilters({ ...filters, ruang: e.target.value })}
          >
            <option value="">Semua Ruang</option>
            {RUANG_OPTIONS.map((option, index) => (
              <option key={option} value={index}>{option}</option>
            ))}
          </select>
        </div>

        <div className="filter-row">
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

      {loading ? (
        <p>Memuat data...</p>
      ) : entries.length === 0 ? (
        <p>Tidak ada data ditemukan.</p>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Waktu Masuk</th>
                <th>Jenis Surat</th>
                <th>Perihal Surat</th>
                <th>Tanggal Surat</th>
                <th>Nomor Surat</th>
                <th>Status</th>
                {isAdmin && <th>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <>
                  <tr key={entry.id}>
                    <td>{formatFullDateTime(entry.created_at)}</td>
                    <td>{JENIS_SURAT_OPTIONS[entry.jenis_surat]}</td>
                    <td>{entry.perihal_surat}</td>
                    <td>{formatDateOnly(entry.tanggal_surat)}</td>
                    <td>{entry.nomor_surat}</td>
                    <td>{stateToStr(entry.status)}</td>
                    {isAdmin && entry.status === 0 && (
                      <td>
                        <button onClick={() => handleState(entry.id, 1)} className="action-button">Approve</button>
                        <button onClick={() => handleState(entry.id, 2)} className="action-button">Reject</button>
                      </td>
                    )}
                    <td>
                      <button
                        className="action-button"
                        onClick={() =>
                          setExpandedRow(expandedRow === entry.id ? null : entry.id)
                        }
                      >
                        {expandedRow === entry.id ? 'Hide' : 'Detail'}
                      </button>
                    </td>
                  </tr>
                  {expandedRow === entry.id && (
                    <tr className="detail-row">
                      <td colSpan={isAdmin ? 8 : 7}>
                        <div className="detail-content">
                          <strong>Ruang:</strong>             {RUANG_OPTIONS[entry.ruang]}<br />
                          <strong>Pemohon:</strong>           {entry.pemohon || '-'}<br />
                          <strong>Jenis Surat:</strong>       {JENIS_SURAT_OPTIONS[entry.jenis_surat]}<br />
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
