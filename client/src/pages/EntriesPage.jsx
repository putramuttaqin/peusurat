import { useEffect, useState } from 'preact/hooks';
import { route } from 'preact-router';
import '../styles/entries.css';

export function EntriesPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/documents/entries');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setEntries(data.documents || []); // Ensure we always have an array
      } catch (err) {
        console.error('Error loading entries:', err);
        setEntries([]); // Fallback to empty array
        alert('Server connection failed. Please ensure the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  const handleDownload = () => {
    window.open('http://localhost:3001/api/documents/download', '_blank');
  };

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

        {!loading && entries.length > 0 && (
          <button onClick={handleDownload}>Download CSV</button>
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
              <th>No</th>
              <th>Timestamp</th>
              <th>Perihal Surat</th>
              <th>Ruang</th>
              <th>Pemohon</th>
              <th>Tanggal Surat</th>
              <th>Nomor Surat</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{highlight(entry['Timestamp'], search)}</td>
                <td>{highlight(entry['Perihal Surat'], search)}</td>
                <td>{highlight(entry['Ruang Pemohon'], search)}</td>
                <td>{highlight(entry['Pemohon'], search)}</td>
                <td>{highlight(entry['Tanggal Surat'], search)}</td>
                <td>{highlight(entry['Nomor Surat'], search)}</td>
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