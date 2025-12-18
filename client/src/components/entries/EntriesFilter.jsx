import { JENIS_SURAT_OPTIONS, STATUS } from '../../shared/enum.js';

export default function EntriesFilter({
  compact = false,
  search,
  setSearch,
  filters,
  setFilters,
  onSearch,
  onReset
}) {
  return (
    <div className={`entries-filter ${compact ? 'is-compact' : ''}`}>
      {/* Row 1 */}
      <div className="filter-row filter-row-primary">
        <select
          className="filter-item"
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value })
          }
        >
          <option value="">Semua Status</option>
          {Object.entries(STATUS).map(([key, value]) => (
            <option key={key} value={value}>
              {key}
            </option>
          ))}
        </select>

        <select
          className="filter-item"
          value={filters.jenisSurat}
          onChange={(e) =>
            setFilters({ ...filters, jenisSurat: e.target.value })
          }
        >
          <option value="">Semua Jenis Surat</option>
          {JENIS_SURAT_OPTIONS.map((option, index) => (
            <option key={option} value={index}>
              {option}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Cari nomor surat / perihal…"
          value={search}
          onInput={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Row 2 */}
      <div className="filter-row filter-row-secondary">
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
          className="date-input"
        />

        <input
          type="date"
          value={filters.endDate}
          onChange={(e) =>
            setFilters({ ...filters, endDate: e.target.value })
          }
          className="date-input"
        />

        <div className="filter-actions">
          <button onClick={onSearch} className="filter-button">
            Cari
          </button>
          <button onClick={onReset} className="reset-button">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
