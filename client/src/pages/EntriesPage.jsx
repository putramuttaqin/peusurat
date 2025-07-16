import { useEffect, useState } from 'preact/hooks';
import { route } from 'preact-router';
import '../styles/entries.css';

export function EntriesPage() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const formatDate = (date) => date.toISOString().split('T')[0];

  // State
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  const [filters, setFilters] = useState({
    startDate: formatDate(thirtyDaysAgo),
    endDate: formatDate(today),
    status: '',
    jenisSurat: '',
    ruang: ''
  });

  const [filterOptions, setFilterOptions] = useState({
    jenisSuratOptions: [],
    ruangOptions: []
  });

  const itemsPerPage = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState(null);

  // Init
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const optionsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/surat/filter-options`);
        if (optionsRes.ok) {
          const data = await optionsRes.json();
          setFilterOptions({
            jenisSuratOptions: data.jenisSuratOptions || [],
            ruangOptions: data.ruangOptions || []
          });
        }

        const adminRes = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/check-admin`, {
          credentials: 'include'
        });
        setIsAdmin(adminRes.ok);

        await handleFilter(1);
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Handlers
  const handleFilter = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...filters,
        search,
        page,
        limit: itemsPerPage
      });

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/surat/entries?${params.toString()}`);
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
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
    await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
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

    const text = aksi === 'approve' ? 'menyutujui' : 'menolak';
    if (!confirm(`Anda yakin ingin ${text} surat ini?`)) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/surat/entries/${id}`, {
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
      alert(`Berhasil ${text} Surat!`);
    } catch (err) {
      alert(err.message || 'Gagal menyetujui surat');
    }
  };

  // Utils
  const stateToStr = (s) => (s === '0' ? 'Pending' : s === '1' ? 'Disetujui' : s === '2' ? 'Ditolak' : 'Error');

  const highlight = (text, keyword) => {
    if (!keyword || !text) return text;
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.toString().split(regex).map((part, i) =>
      regex.test(part) ? <mark key={i}>{part}</mark> : part
    );
  };

  const filtered = entries
    .filter((entry) =>
      Object.values(entry).some((val) =>
        val?.toString().toLowerCase().includes(search.toLowerCase())
      )
    )
    .slice(0, 20);

  // Render
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
        {/* Row 1: Date Filters */}
        <div className="filter-row">

        </div>

        {/* Row 1: Status, Jenis Surat, Ruang */}
        <div className="filter-row">
          <div className="filter-item">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">Status Surat</option>
              <option value="0">Pending</option>
              <option value="1">Disetujui</option>
              <option value="2">Ditolak</option>
            </select>
          </div>
          <div className="filter-item">
            <select
              value={filters.jenisSurat}
              onChange={(e) => setFilters({ ...filters, jenisSurat: e.target.value })}
            >
              <option value="">{filters.jenisSurat || 'Jenis Surat'}</option>
              {filterOptions.jenisSuratOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <select
              value={filters.ruang}
              onChange={(e) => setFilters({ ...filters, ruang: e.target.value })}
            >
              <option value="">{filters.ruang || 'Semua Ruang'}</option>
              {filterOptions.ruangOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Search + Buttons */}
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
      ) : filtered.length === 0 ? (
        <p>Tidak ada data ditemukan.</p>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Timestamp</th>
                <th>Jenis Surat</th>
                <th>Perihal Surat</th>
                <th>Ruang</th>
                <th>Pemohon</th>
                <th>Tanggal Surat</th>
                <th>Nomor Surat</th>
                <th>Status</th>
                {isAdmin && <th>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.ID}>
                  <td>{highlight(entry.ID, search)}</td>
                  <td>{highlight(entry.Timestamp, search)}</td>
                  <td>{highlight(entry['Jenis Surat'], search)}</td>
                  <td>{highlight(entry['Perihal Surat'], search)}</td>
                  <td>{highlight(entry.Ruang, search)}</td>
                  <td>{highlight(entry.Pemohon, search)}</td>
                  <td>{highlight(entry['Tanggal Surat'], search)}</td>
                  <td>{highlight(entry['Nomor Surat'], search)}</td>
                  <td>{stateToStr(entry.Status)}</td>
                  {isAdmin && entry.Status === '0' && (
                    <td>
                      <button onClick={() => handleState(entry.ID, 'approve')} className="action-button">Setujui</button>
                      <button onClick={() => handleState(entry.ID, 'reject')} className="action-button">Tolak</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button onClick={() => handleFilter(currentPage - 1)} disabled={currentPage === 1} className="pagination-button">Prev</button>
            <span>{currentPage} / {Math.ceil(totalItems / itemsPerPage)}</span>
            <button onClick={() => handleFilter(currentPage + 1)} disabled={currentPage * itemsPerPage >= totalItems} className="pagination-button">Next</button>
          </div>
        </>
      )}
    </div>
  );
}
