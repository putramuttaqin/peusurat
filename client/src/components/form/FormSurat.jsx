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
  const renderSelect = ({
    id,
    label,
    value,
    options,
    onChange,
    disabled
  }) => (
    <div className="form-group short">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={onChange} disabled={disabled}>
        <option value="" disabled>
          Pilih...
        </option>
        {options.map(opt => (
          <option key={opt.id || opt} value={opt.id || opt}>
            {opt.name || opt}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className={`form-container ${compact ? 'compact' : ''}`}>
      {!compact && <h2>Permohonan Nomor Surat</h2>}

      <form onSubmit={onSubmit}>
        <div className="inline-row">
          {renderSelect({
            id: 'jenisSurat',
            label: 'Kategori Surat',
            value: formState.jenisSurat,
            options: jenisSuratOptions,
            onChange: onChange('jenisSurat')
          })}
        </div>

        <div className="inline-row">
          <div className="form-group short">
            <label>Tanggal Surat</label>
            <input
              type="date"
              value={formState.tanggalSurat}
              onInput={onChange('tanggalSurat')}
            />
          </div>

          <div className="form-group short">
            <label>Sifat Surat</label>
            <select
              value={formState.sifatSurat}
              onChange={onChange('sifatSurat')}
            >
              <option value={0}>Biasa</option>
              <option value={1}>Rahasia</option>
            </select>
          </div>
        </div>

        <div className="form-group full">
          <label>Perihal Surat</label>
          <textarea
            rows="4"
            value={formState.keterangan}
            onInput={onChange('keterangan')}
          />
        </div>

        <div className="inline-row">
          <div className="form-group short">
            <label>Kode Wilayah</label>
            <input value={formState.wilayah} readOnly />
          </div>

          {renderSelect({
            id: 'kode1',
            label: 'Masalah',
            value: formState.kode1,
            options: kode1Options,
            onChange: onKodeChange('kode1')
          })}

          {renderSelect({
            id: 'kode2',
            label: 'Angka',
            value: formState.kode2,
            options: kode2Options,
            onChange: onKodeChange('kode2'),
            disabled: !formState.kode1
          })}

          {renderSelect({
            id: 'kode3',
            label: 'Angka',
            value: formState.kode3,
            options: kode3Options,
            onChange: onKodeChange('kode3'),
            disabled: !formState.kode2
          })}
        </div>

        <div className="preview">
          <strong>Preview:</strong> {nomorPreview}
        </div>

        <div className="inline-row">
          <button type="submit" disabled={submitting || !isValid}>
            {submitting ? 'Menyimpan...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}
