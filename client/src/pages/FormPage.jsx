import { useState, useEffect, useContext, useMemo } from 'preact/hooks';
import { AuthContext } from '../shared/AuthContext';
import '../styles/form.css';
import kodeSurat from '../data/kode-surat.json';
import { SIFAT_SURAT, JENIS_SURAT_OPTIONS } from '../shared/enum.js';
import { submitSurat } from '../api/surat';

export default function FormPage({ compact = false, onSuccess }) {
  const { user, isAdmin, loading } = useContext(AuthContext);

  /* ------------------------------------------------------------------
   * Guard
   * ------------------------------------------------------------------ */
  if (loading) return null;
  if (!isAdmin) return null;

  /* ------------------------------------------------------------------
   * Form State
   * ------------------------------------------------------------------ */
  const [formState, setFormState] = useState({
    jenisSurat: '',
    wilayah: 'W.1',
    kode1: '',
    kode2: '',
    kode3: '',
    tanggalSurat: '',
    sifatSurat: SIFAT_SURAT.BIASA,
    keterangan: ''
  });

  const [submitting, setSubmitting] = useState(false);

  /* ------------------------------------------------------------------
   * Kode Surat Options (Derived State)
   * ------------------------------------------------------------------ */
  const kode1Options = useMemo(() => {
    return Object.entries(kodeSurat).map(([id, val]) => ({
      id,
      name: val.name,
      shortName: val.name.split(' - ')[0].substring(0, 2)
    }));
  }, []);

  const kode2Options = useMemo(() => {
    if (!formState.kode1) return [];
    return Object.entries(kodeSurat[formState.kode1].children || {}).map(
      ([id, val]) => ({
        id,
        name: val.name,
        shortName: val.name.split(' - ')[0].substring(0, 2)
      })
    );
  }, [formState.kode1]);

  const kode3Options = useMemo(() => {
    if (!formState.kode1 || !formState.kode2) return [];
    return Object.entries(
      kodeSurat[formState.kode1].children[formState.kode2].children || {}
    ).map(([id, val]) => ({
      id,
      name: val.name,
      shortName: val.name.split(' - ')[0].substring(0, 2)
    }));
  }, [formState.kode1, formState.kode2]);

  /* ------------------------------------------------------------------
   * Helpers
   * ------------------------------------------------------------------ */
  const getShort = (options, id) =>
    options.find(o => o.id === id)?.shortName || '';

  const nomorPreview = `W.1-${getShort(kode1Options, formState.kode1)}.${getShort(
    kode2Options,
    formState.kode2
  )}.${getShort(kode3Options, formState.kode3)}-...`;

  const isValid =
    formState.jenisSurat &&
    formState.kode1 &&
    formState.kode2 &&
    formState.kode3;

  /* ------------------------------------------------------------------
   * Effects
   * ------------------------------------------------------------------ */

  /* ------------------------------------------------------------------
   * Handlers
   * ------------------------------------------------------------------ */
  const handleChange = field => e => {
    setFormState(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleKodeChange = field => e => {
    const value = e.target.value;
    setFormState(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'kode1' && { kode2: '', kode3: '' }),
      ...(field === 'kode2' && { kode3: '' })
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);

    const nomorSurat = `W.1-${getShort(
      kode1Options,
      formState.kode1
    )}.${getShort(kode2Options, formState.kode2)}.${getShort(
      kode3Options,
      formState.kode3
    )}-xyz`;

    try {
      await submitSurat({
        userId: user.id,
        jenisSurat: formState.jenisSurat,
        sifatSurat: formState.sifatSurat,
        perihalSurat: formState.keterangan,
        tanggalSurat: formState.tanggalSurat,
        nomorSurat
      });

      onSuccess?.();

      // reset minimal
      setFormState(prev => ({
        ...prev,
        kode1: '',
        kode2: '',
        kode3: '',
        keterangan: ''
      }));
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ------------------------------------------------------------------
   * Render Helpers
   * ------------------------------------------------------------------ */
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

  /* ------------------------------------------------------------------
   * JSX
   * ------------------------------------------------------------------ */
  return (
    <div className={`form-container ${compact ? 'compact' : ''}`}>
      {!compact && <h2>Permohonan Nomor Surat</h2>}

      <form onSubmit={handleSubmit}>
        <div className="inline-row">
          {renderSelect({
            id: 'jenisSurat',
            label: 'Kategori Surat',
            value: formState.jenisSurat,
            options: JENIS_SURAT_OPTIONS,
            onChange: handleChange('jenisSurat')
          })}

          <div className="form-group short">
            <label>Tanggal Surat</label>
            <input
              type="date"
              value={formState.tanggalSurat}
              onInput={handleChange('tanggalSurat')}
            />
          </div>

          <div className="form-group short">
            <label>Sifat Surat</label>
            <select
              value={formState.sifatSurat}
              onChange={e =>
                setFormState(prev => ({
                  ...prev,
                  sifatSurat: parseInt(e.target.value)
                }))
              }
            >
              <option value={SIFAT_SURAT.BIASA}>Biasa</option>
              <option value={SIFAT_SURAT.RAHASIA}>Rahasia</option>
            </select>
          </div>
        </div>

        <div className="form-group full">
          <label>Perihal Surat</label>
          <textarea
            rows="4"
            value={formState.keterangan}
            onInput={handleChange('keterangan')}
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
            onChange: handleKodeChange('kode1')
          })}

          {renderSelect({
            id: 'kode2',
            label: 'Angka',
            value: formState.kode2,
            options: kode2Options,
            onChange: handleKodeChange('kode2'),
            disabled: !formState.kode1
          })}

          {renderSelect({
            id: 'kode3',
            label: 'Angka',
            value: formState.kode3,
            options: kode3Options,
            onChange: handleKodeChange('kode3'),
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
