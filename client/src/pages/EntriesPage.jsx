import { useEffect, useState } from 'preact/hooks';
import { route } from 'preact-router';
import '../styles/entries.css';

export function EntriesPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterOptions, setFilterOptions] = useState({
    jenisSuratOptions: [
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
    ],
    ruangOptions: [
      'PERENCANAAN',
      'ORGANISASI DAN TATA LAKSANA',
      'KEPEGAWAIAN',
      'KEUANGAN',
      'PENGELOLAAN BARANG MILIK NEGARA',
      'KEHUMASAN DAN HUKUM',
      'UMUM',
      'PENGAWASAN',
      'TEKNOLOGI DAN INFORMASI',
      'PERATURAN PERUNDANG-UNDANGAN',
      'ADMINISTRASI HUKUM UMUM',
      'PEMASYARAKATAN',
      'KEIMIGRASIAN',
      'KEKAYAAN INTELEKTUAL',
      'HAK ASASI MANUSIA',
      'PEMBINAAN HUKUM NASIONAL',
      'SUMBER DAYA MANUSIA',
      'PENELITIAN DAN PENGEMBANGAN'
    ]
  });
  const today = new Date().toISOString().split('T')[0];
  const [filters, setFilters] = useState({
    startDate: today,
    endDate: today,
    status: '',
    jenisSurat: '',
    ruang: ''
  });

  // For Admin Login
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // For Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20; // Match server limit

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch entries
        const entriesResponse = await fetch('http://localhost:3001/api/surat/entries');
        if (!entriesResponse.ok) throw new Error(`HTTP error! status: ${entriesResponse.status}`);
        const entriesData = await entriesResponse.json();
        setEntries(entriesData.documents || []);

        // Fetch filter options
        const optionsResponse = await fetch('http://localhost:3001/api/surat/filter-options');
        if (optionsResponse.ok) {
          const optionsData = await optionsResponse.json();
          setFilterOptions({
            jenisSuratOptions: optionsData.jenisSuratOptions || [],
            ruangOptions: optionsData.ruangOptions || []
          });
        }

        // Check admin status
        const adminCheck = await fetch('http://localhost:3001/api/auth/check-admin', {
          credentials: 'include'
        });
        setIsAdmin(adminCheck.ok);
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
      const queryParams = new URLSearchParams();
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.jenisSurat) queryParams.append('jenisSurat', filters.jenisSurat);
      if (filters.ruang) queryParams.append('ruang', filters.ruang);
      queryParams.append('page', page);
      queryParams.append('limit', itemsPerPage);

      const response = await fetch(`http://localhost:3001/api/surat/entries?${queryParams.toString()}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
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

  const handleResetFilter = async () => {
    setSearch('');
    setFilters({
      startDate: today,
      endDate: today,
      status: '',
      jenisSurat: '',
      ruang: ''
    });
    setCurrentPage(1);
    await handleFilter(1);
  };

  // Modify handleLogin
  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        credentials: 'include', // Required for cookies
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        setIsAdmin(true);
        setLoginStatus('success');
        setTimeout(() => setIsModalOpen(false), 1000);
      } else {
        setLoginStatus('error');
      }
    } catch (err) {
      setLoginStatus('error');
    }
  };

  // Add logout handler
  const handleLogout = async () => {
    await fetch('http://localhost:3001/api/auth/logout', {
      credentials: 'include'
    });
    setIsAdmin(false);
  };

  const handleState = async (id, aksi) => {
    if (!isAdmin) {
      alert('Hanya admin yang dapat menyetujui surat');
      setIsModalOpen(true); // Show login modal if not admin
      return;
    }
    const aksiTeks = aksi == "approve" ? "menyutujui" : "menolak";
    if (!confirm(`Anda yakin ingin ${aksiTeks} surat ini?`)) return;

    try {
      const response = await fetch(`http://localhost:3001/api/surat/entries/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json' // Required for CORS preflight
        },
        body: JSON.stringify({ action: aksi }) // Send minimal data
      });

      if (response.status === 403) {
        setIsAdmin(false);
        throw new Error('Sesi admin telah berakhir');
      }

      if (!response.ok) throw new Error('Approval Gagal');

      // Refresh entries
      const updatedResponse = await fetch('http://localhost:3001/api/surat/entries');
      const updatedData = await updatedResponse.json();
      setEntries(updatedData.documents || []);

      alert(`Berhasil ${aksiTeks} Surat!`);
    } catch (err) {
      console.error('Approval error:', err);
      alert(err.message || 'Gagal menyetujui surat');
    }
  };

  const stateToStr = (state) => {
    switch (state) {
      case "0": return "Pending";
      case "1": return "Disetujui";
      case "2": return "Ditolak";
      default: return "Error";
    }
  };

  const highlight = (text, keyword) => {
    if (!keyword || !text) return text;
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.toString().split(regex).map((part, i) =>
      regex.test(part) ? <mark key={i}>{part}</mark> : part
    );
  };

  const filtered = entries
    .filter(entry =>
      Object.values(entry).some(val =>
        val && val.toString().toLowerCase().includes(search.toLowerCase())
      )
    )
    .slice(0, 20);

  return (
    <div className="form-container">
      <div className="entries-header">
        <button className="back-button" onClick={() => route('/')}>
          Kembali
        </button>
        {isAdmin ? (
          <button onClick={handleLogout} className="admin-button">
            Logout Admin
          </button>
        ) : (
          <button onClick={() => setIsModalOpen(true)} className="admin-button">
            Login Admin
          </button>
        )}

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
                <input
                  type="text"
                  value={username}
                  onInput={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  value={password}
                  onInput={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button onClick={handleLogin} className="login-button">
                  Login
                </button>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setLoginStatus(null);
                  }}
                  className="cancel-button"
                >
                  Kembali
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <h2>Dashboard Nomor Surat</h2>

      <div className="search-filter-bar">
        {/* Row 1: Search and Date Filters */}
        <div className="filter-controls">
          <div className="filter-item">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>

          <div className="filter-item">
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>

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
              <option value="">{filters.jenisSurat || "Jenis Surat"}</option>
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
              <option value="">{filters.ruang || "Semua Ruang"}</option>
              {filterOptions.ruangOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: Buttons */}
        <div className="filter-controls">
          <div className="filter-item">
            <input
              type="text"
              placeholder="Cari nomor surat/perihal..."
              value={search}
              onInput={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-actions">
            <button onClick={() => handleFilter(1)} className="filter-button">Cari</button>
            <button onClick={() => handleResetFilter()} className="reset-button">Reset</button>
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
                <th hidden={!isAdmin}>Aksi</th>
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
                  <td hidden={!isAdmin}>
                    {entry.Status === '0' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleState(entry.ID, "approve")}
                          className="action-button"
                          hidden={!isAdmin}
                        >
                          Setujui
                        </button>
                        <button
                          type="button"
                          onClick={() => handleState(entry.ID, "reject")}
                          className="action-button"
                          hidden={!isAdmin}
                        >
                          Tolak
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="pagination">
            <button
              onClick={() => handleFilter(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span>Halaman {currentPage} dari {Math.ceil(totalItems / itemsPerPage)}</span>
            <button
              onClick={() => handleFilter(currentPage + 1)}
              disabled={currentPage * itemsPerPage >= totalItems}
            >
              Next
            </button>
          </div>
        </>
      )
      }
    </div >
  );
}