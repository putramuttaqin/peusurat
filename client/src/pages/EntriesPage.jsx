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
  const [expandedId, setExpandedId] = useState(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [actionDisabled, setActionDisabled] = useState(false);

  const [filters, setFilters] = useState({
    startDate: formatDate(thirtyDaysAgo),
    endDate: formatDate(new Date()),
    status: '',
    jenisSurat: ''
  });

  useEffect(() => {
    if (!loading && !isAdmin) route('/');
    else if (!loading && isAdmin) handleFilter(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

      const data = await res.json();
      setEntries(data.documents || []);
      setTotalItems(data.total || 0);
      setCurrentPage(data.page || page);
    } catch (err) {
      console.error('Failed to fetch entries', err);
      alert('Failed to load data.');
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
    if (actionDisabled) return;
    setActionDisabled(true);

    if (!isAdmin) {
      alert('Only admin can perform this action');
      setActionDisabled(false);
      return;
    }

    const text = aksi === 1 ? 'approve' : 'reject';
    if (!confirm(`Are you sure you want to ${text} this entry?`)) {
      setActionDisabled(false);
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/api/surat/entries/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: aksi })
      });

      if (res.status === 403) throw new Error('Admin session expired');
      if (!res.ok) throw new Error('Action failed');

      await handleFilter(currentPage);
      alert(`Successfully ${text}d.`);
    } catch (err) {
      alert(err.message || 'Action failed');
    } finally {
      setActionDisabled(false);
    }
  };

  const stateToStr = (s) => Object.keys(STATUS).find((k) => STATUS[k] === String(s)) || String(s);

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

  const maskPerihal = (text) => {
    if (!text) return '';
    if (text.length <= 4) return '*'.repeat(text.length);
    return text.slice(0, 2) + '*'.repeat(text.length - 4) + text.slice(-2);
  };

  return (
    <div className="form-container">
      <div className="entries-header">
        <button className="back-button" onClick={() => route('/')}>Back</button>
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
            aria-label="Search entries"
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
          <div className="entries-card-list">
            {entries.map((entry) => {
              const jenisSurat =
                JENIS_SURAT_OPTIONS[entry.jenis_surat_id - 1] || '—';

              return (
                <article
                  className="entry-card"
                  key={entry.id}
                  aria-labelledby={`entry-${entry.id}-perihal`}
                >
                  {/* HEADER: jenis + status */}
                  <header className="entry-card-header">
                    <span className="entry-jenis">{jenisSurat}</span>

                    <span
                      className={`entry-status-badge status-${stateToStr(entry.status).toLowerCase()}`}
                    >
                      {stateToStr(entry.status)}
                    </span>
                  </header>

                  {/* META: nomor surat */}
                  <div className="entry-meta">
                    <div className="entry-nomor">{entry.nomor_surat || '—'}</div>

                    {/* unlabeled user + tanggal */}
                    <div className="entry-meta-secondary">
                      <span className="entry-user">{entry.pemohon || '—'}</span>
                      <span className="entry-separator">•</span>
                      <span className="entry-date">
                        {entry.tanggal_surat
                          ? formatDateOnly(entry.tanggal_surat)
                          : '—'}
                      </span>
                    </div>
                  </div>

                  {/* BODY: perihal (main content) */}
                  <div className="entry-body">
                    <p
                      id={`entry-${entry.id}-perihal`}
                      className="entry-perihal"
                    >
                      {entry.sifat_surat === 1
                        ? maskPerihal(entry.perihal_surat)
                        : entry.perihal_surat}
                    </p>
                  </div>

                  {/* FOOTER: actions / detail */}
                  <footer className="entry-footer">
                    <button
                      className="detail-toggle"
                      onClick={() =>
                        setExpandedId(expandedId === entry.id ? null : entry.id)
                      }
                    >
                      Detail
                    </button>

                    {entry.status === 0 &&
                      user?.role === USER_ROLES.SUPER_ADMIN ? (
                      <div className="entry-actions">
                        <button
                          className="approve-btn"
                          onClick={() => handleState(entry.id, 1)}
                        >
                          Approve
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => handleState(entry.id, 2)}
                        >
                          Reject
                        </button>
                      </div>
                    ) : null}
                  </footer>

                  {/* EXPANDED DETAILS */}
                  {expandedId === entry.id && (
                    <section className="entry-details">
                      <div className="entry-detail-row">
                        <span className="entry-detail-label">Waktu Masuk</span>
                        <span className="entry-detail-value">
                          {entry.created_at
                            ? formatFullDateTime(entry.created_at)
                            : '—'}
                        </span>
                      </div>
                    </section>
                  )}
                </article>
              );
            })}
          </div>

          <div className="pagination">
            <button
              onClick={() => handleFilter(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Prev
            </button>

            <span className="pagination-info">
              {currentPage} / {Math.max(1, Math.ceil(totalItems / itemsPerPage))}
            </span>

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
