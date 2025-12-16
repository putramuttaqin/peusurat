export default function EntryCard({
  entry,
  jenisSurat,
  statusLabel,
  statusClass,
  showActions,
  expanded,
  onToggleDetail,
  onApprove,
  onReject,
}) {
  return (
    <article
      className="entry-card"
      aria-labelledby={`entry-${entry.id}-perihal`}
    >
      {/* HEADER */}
      <header className="entry-card-header">
        <span className="entry-jenis">{jenisSurat}</span>
        <span className={`entry-status-badge ${statusClass}`}>
          {statusLabel}
        </span>
      </header>

      {/* META */}
      <div className="entry-meta">
        <div className="entry-nomor">{entry.nomor_surat || '—'}</div>

        <div className="entry-meta-secondary">
          <span className="entry-user">{entry.pemohon || '—'}</span>
          <span className="entry-separator">•</span>
          <span className="entry-date">{entry.tanggalLabel}</span>
        </div>
      </div>

      {/* BODY */}
      <div className="entry-body">
        <p
          id={`entry-${entry.id}-perihal`}
          className="entry-perihal"
          title={entry.perihalFull}
        >
          {entry.perihalDisplay}
        </p>
      </div>

      {/* FOOTER */}
      <footer className="entry-footer">
        <button className="detail-toggle" onClick={onToggleDetail}>
          Detail
        </button>

        {showActions && (
          <div className="entry-actions">
            <button className="approve-btn" onClick={onApprove}>
              Approve
            </button>
            <button className="reject-btn" onClick={onReject}>
              Reject
            </button>
          </div>
        )}
      </footer>

      {/* DETAILS */}
      {expanded && (
        <section className="entry-details">
          <div className="entry-detail-row">
            <span className="entry-detail-label">Waktu Masuk</span>
            <span className="entry-detail-value">
              {entry.createdAtLabel}
            </span>
          </div>
        </section>
      )}
    </article>
  );
}
