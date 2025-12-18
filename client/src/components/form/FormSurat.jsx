export default function FormSurat({
  compact,
  formState,
  jenisSuratOptions,
  kode1Options,
  kode2Options,
  kode3Options,
  nomorPreview,
  submitting,
  isValid,
  onChange,
  onKodeChange,
  onSubmit
}) {
  return (
    <section className={`form-surat ${compact ? 'is-compact' : ''}`}>
      {/* ───────────── Block A: Header ───────────── */}
      {!compact && (
        <header className="form-header">
          <h2 className="form-title">Penomoran Surat</h2>
        </header>
      )}

      <form className="form-body" onSubmit={onSubmit}>
        {/* ───────────── Block B: Meta ───────────── */}
        <section className="form-meta">
          <div className="meta-item">
            <select
              value={formState.jenisSurat}
              onChange={onChange('jenisSurat')}
            >
              {jenisSuratOptions.map(opt => (
                <option key={opt.id || opt} value={opt.id || opt}>
                  {opt.name || opt}
                </option>
              ))}
            </select>
          </div>

          <div className="meta-item">
            <input
              type="date"
              value={formState.tanggalSurat}
              onInput={onChange('tanggalSurat')}
            />
          </div>

          <div className="meta-item">
            <select
              value={formState.sifatSurat}
              onChange={onChange('sifatSurat')}
            >
              <option value={0}>Biasa</option>
              <option value={1}>Rahasia</option>
            </select>
          </div>
        </section>

        {/* ───────────── Block C: Number Builder ───────────── */}
        <section className="form-kode">
          <label className="kode-label">Kode Arsip / Surat</label>

          <div className="kode-builder">
            <div className="kode-segment kode-wilayah">
              <input value={formState.wilayah} readOnly />
            </div>

            <div className="kode-segment">
              <select
                value={formState.kode1}
                onChange={onKodeChange('kode1')}
              >
                <option value="">Pilih</option>
                {kode1Options.map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name || opt.shortName}
                  </option>
                ))}
              </select>
            </div>

            <div className="kode-segment">
              <select
                value={formState.kode2}
                onChange={onKodeChange('kode2')}
                disabled={!formState.kode1}
              >
                <option value="">—</option>
                {kode2Options.map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name || opt.shortName}
                  </option>
                ))}
              </select>
            </div>

            <div className="kode-segment">
              <select
                value={formState.kode3}
                onChange={onKodeChange('kode3')}
                disabled={!formState.kode2}
              >
                <option value="">—</option>
                {kode3Options.map(opt => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name || opt.shortName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="kode-preview">{nomorPreview}</div>
        </section>

        {/* ───────────── Block D: Perihal ───────────── */}
        <section className="form-perihal">
          <textarea
            rows="3"
            value={formState.keterangan}
            onInput={onChange('keterangan')}
            placeholder="Perihal surat"
          />
        </section>

        {/* ───────────── Block E: Action ───────────── */}
        <footer className="form-action">
          <button type="submit" disabled={submitting || !isValid}>
            {submitting ? 'Menyimpan…' : 'Submit'}
          </button>
        </footer>
      </form>
    </section>
  );
}
