import { useEffect, useState } from 'preact/hooks';
import { route } from 'preact-router';
import '../styles/entries.css';

export function EntriesPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // For Admin Login
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState(null); // 'success', 'error', null
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/surat/entries');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setEntries(data.documents || []);

        // Check admin status separately
        const adminCheck = await fetch('http://localhost:3001/api/auth/check-admin', {
          credentials: 'include'
        });
        setIsAdmin(adminCheck.ok);
      } catch (err) {
        console.error('Error loading entries:', err);
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);

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

  const handleDownload = () => {
    window.open('http://localhost:3001/api/surat/download', '_blank');
  };

  const handleApprove = async (id) => {
    if (!isAdmin) {
      alert('Hanya admin yang dapat menyetujui surat');
      setIsModalOpen(true); // Show login modal if not admin
      return;
    }

    if (!confirm('Anda yakin ingin menyetujui surat ini?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/surat/approve/${id}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.status === 403) {
        setIsAdmin(false);
        throw new Error('Sesi admin telah berakhir');
      }

      if (!response.ok) throw new Error('Approval failed');

      // Refresh entries
      const updatedResponse = await fetch('http://localhost:3001/api/surat/entries');
      const updatedData = await updatedResponse.json();
      setEntries(updatedData.documents || []);

      alert('Surat berhasil disetujui!');
    } catch (err) {
      console.error('Approval error:', err);
      alert(err.message || 'Gagal menyetujui surat');
    }
  };

  const stateToStr = (state) => {
    switch (state) {
      case "proposed": return "Permohonan";
      case "approved": return "Disetujui";
      default: return "Ditolak";
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
      <h2>Daftar Nomor Surat</h2>

      <div className="top-bar">
        <input
          type="text"
          placeholder="Cari..."
          value={search}
          onInput={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        {isAdmin ? (
          <>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <button onClick={() => setIsModalOpen(true)}>
            Admin Login
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

      {loading ? (
        <p>Memuat data...</p>
      ) : filtered.length === 0 ? (
        <p>Tidak ada data ditemukan.</p>
      ) : (
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
              <th>Aksi</th>
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
                <td>
                  {entry.Status === 'proposed' && (
                    <button
                      onClick={() => handleApprove(entry.ID)}
                      className="approve-button"
                      disabled={!isAdmin}
                    >
                      {isAdmin ? 'Setujui' : 'Login untuk Setujui'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button className="back-button" onClick={() => route('/')}>
          Kembali
        </button>
      </div>
    </div>
  );
}