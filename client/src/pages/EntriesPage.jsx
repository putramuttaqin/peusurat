import { useEffect, useState } from 'preact/hooks';
import { route } from 'preact-router';
import '../styles/entries.css';

export function EntriesPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/entries')
      .then(res => res.json())
      .then(data => {
        setEntries(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading entries:', err);
        setLoading(false);
      });
  }, []);

  const handleDownload = () => {
    window.open('http://localhost:3001/download', '_blank');
  };

  const highlight = (text, keyword) => {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.split(regex).map((part, i) =>
      regex.test(part) ? <mark key={i}>{part}</mark> : part
    );
  };

  const filtered = entries
    .filter((entry) =>
      Object.values(entry).some((val) =>
        val.toLowerCase().includes(search.toLowerCase())
      )
    )
    .slice(0, 20); // limit to 20 rows

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
              <th>Tanggal</th> {/* Add this */}
              <th>Nomor Surat</th>
              <th>Tanggal Surat</th>
              <th>Divisi</th>
              <th>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{highlight(entry.Tanggal, search)}</td> {/* Add this */}
                <td>{highlight(entry['Nomor Surat'], search)}</td>
                <td>{highlight(entry['Tanggal Surat'], search)}</td>
                <td>{highlight(entry.Divisi, search)}</td>
                <td>{highlight(entry.Keterangan, search)}</td>
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
