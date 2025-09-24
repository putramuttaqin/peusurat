import { useState, useEffect, useContext } from 'preact/hooks';
import { route } from 'preact-router';
import { AuthContext } from '../shared/AuthContext';
import Choices from 'choices.js';
import 'choices.js/public/assets/styles/choices.min.css';
import '../styles/form.css';
import kodeSurat from '../data/kode-surat.json';
import { SIFAT_SURAT, JENIS_SURAT_OPTIONS } from '../shared/enum.js';

export default function FormPage() {
  const { user, isAdmin, loading } = useContext(AuthContext);

  // 🚫 Redirect if not admin (after loading)
  useEffect(() => {
    if (!loading && !isAdmin) {
      route('/');
    }
  }, [loading, isAdmin]);

  const [formState, setFormState] = useState({
    nomorSurat: null,
    jenisSurat: '',
    wilayah: 'W.1',
    kode1: '',
    kode2: '',
    kode3: '',
    kode1Short: '',
    kode2Short: '',
    kode3Short: '',
    tanggalSurat: '',
    sifatSurat: SIFAT_SURAT.BIASA,
    divisi: '',
    keterangan: '',
    pemohon: ''
  });

  const [kode1Options, setKode1Options] = useState([]);
  const [kode2Options, setKode2Options] = useState([]);
  const [kode3Options, setKode3Options] = useState([]);
  const [originalKode1, setOriginalKode1] = useState([]);
  const [originalKode2, setOriginalKode2] = useState([]);
  const [originalKode3, setOriginalKode3] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [finalNomorSurat, setFinalNomorSurat] = useState(null);

  useEffect(() => {
    const options = Object.entries(kodeSurat).map(([id, val]) => ({
      id,
      name: val.name,
      shortName: val.name.split(' - ')[0].substring(0, 2)
    }));
    setKode1Options(options);
    setOriginalKode1(options);
  }, []);

  useEffect(() => {
    const el = document.getElementById('pemohon');
    if (el && !el.dataset.choices) {
      new Choices(el, {
        shouldSort: false,
        searchEnabled: true,
        itemSelectText: ''
      });
      el.dataset.choices = 'true';
    }
  }, []);

  useEffect(() => {
    if (formState.kode1) {
      const selected = kodeSurat[formState.kode1];
      const options = Object.entries(selected.children || {}).map(([id, val]) => ({
        id,
        name: val.name,
        shortName: val.name.split(' - ')[0].substring(0, 2)
      }));
      setKode2Options(options);
      setOriginalKode2(options);
      setFormState(prev => ({ ...prev, kode2: '', kode3: '', kode2Short: '', kode3Short: '' }));
      setKode3Options([]);
    }
  }, [formState.kode1]);

  useEffect(() => {
    if (formState.kode1 && formState.kode2) {
      const selected = kodeSurat[formState.kode1].children[formState.kode2];
      let options = Object.entries(selected.children || {}).map(([id, val]) => ({
        id,
        name: val.name,
        shortName: val.name.split(' - ')[0].substring(0, 2)
      }));
      options = addLainLainOption(options);
      setKode3Options(options);
      setOriginalKode3(options);
      setFormState(prev => ({ ...prev, kode3: '', kode3Short: '' }));
    }
  }, [formState.kode2]);

  const addLainLainOption = (options) => {
    let nextNumber = 1;

    if (options.length > 0) {
      const last = options[options.length - 1];
      const match = last.name.match(/^(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    const padded = String(nextNumber).padStart(2, "0");
    return [
      ...options,
      {
        id: "9999",
        name: `${padded} - Lain-lain`,
        shortName: padded,
      },
    ];
  };

  const handleSelectChange = (field, options, setOptionsFn, originalOptions) => e => {
    const selectedId = e.target.value;
    const selectedOption = options.find(opt => opt.id === selectedId);
    setFormState(prev => ({
      ...prev,
      [field]: selectedId,
      [`${field}Short`]: selectedOption?.shortName || '',
      ...(field === 'kode1' && { kode2: '', kode2Short: '', kode3: '', kode3Short: '' }),
      ...(field === 'kode2' && { kode3: '', kode3Short: '' })
    }));

    const updated = options.map(opt =>
      opt.id === selectedId ? { ...opt, name: opt.shortName } : opt
    );
    e.target.blur();
    setOptionsFn(updated);
  };

  const handleFocusReset = (setOptionsFn, originalOptions) => () => {
    setOptionsFn(originalOptions);
  };

  const handleChange = field => e => {
    setFormState(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return; // prevent double submit
    setSubmitting(true);

    const nomorSurat = `W.1-${formState.kode1Short}.${formState.kode2Short}.${formState.kode3Short}-xyz`;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/surat/submit`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          jenisSurat: formState.jenisSurat,
          sifatSurat: formState.sifatSurat,
          perihalSurat: formState.keterangan,
          tanggalSurat: formState.tanggalSurat,
          nomorSurat
        })
      });

      if (res.ok) {
        setFinalNomorSurat(nomorSurat);
        setSubmitted(true);
      } else {
        let errMsg = 'Gagal menyimpan data';
        try {
          const data = await res.json();
          errMsg = data.message || errMsg;
        } catch {
          const text = await res.text();
          if (text) errMsg = text;
        }
        throw new Error(errMsg);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setSubmitting(false); // always reset
    }
  };

  const renderSelectField = ({ id, label, value, options, onChange, onFocus, disabled = false }) => (
    <div className="form-group short">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={onChange} onFocus={onFocus} disabled={disabled}>
        <option value="" disabled>Pilih...</option>
        {options.map(item => (
          <option key={item.id || item} value={item.id || item}>
            {item.name || item}
          </option>
        ))}
      </select>
    </div>
  );

  if (loading || !isAdmin) return null;

  return (
    <div className="form-container-page">
      <h2>{submitted ? 'Menunggu Persetujuan Admin' : 'Permohonan Nomor Surat'}</h2>
      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <div className="inline-row">
            {renderSelectField({
              id: 'jenisSurat',
              label: 'Kategori Surat',
              value: formState.jenisSurat,
              options: JENIS_SURAT_OPTIONS,
              onChange: handleChange('jenisSurat')
            })}
            <div className="form-group short">
              <label htmlFor="tanggalSurat">Tanggal Surat</label>
              <input type="date" id="tanggalSurat" value={formState.tanggalSurat} onInput={handleChange('tanggalSurat')} />
            </div>
            <div className="form-group short">
              <label htmlFor="sifatSurat">Sifat Surat</label>
              <select
                id="sifatSurat"
                name="sifatSurat"
                value={formState.sifatSurat}
                onChange={e => setFormState(prev => ({ ...prev, sifatSurat: parseInt(e.target.value) }))}
                required
              >
                <option value={SIFAT_SURAT.BIASA}>Biasa</option>
                <option value={SIFAT_SURAT.RAHASIA}>Rahasia</option>
              </select>
            </div>
          </div>

          <div className="form-group full">
            <label htmlFor="keterangan">Perihal Surat</label>
            <textarea id="keterangan" rows="4" value={formState.keterangan} onInput={handleChange('keterangan')} />
          </div>

          <div className="inline-row">
            <div className="form-group short">
              <label htmlFor="wilayah">Kode Wilayah</label>
              <input id="wilayah" value={formState.wilayah} readOnly />
            </div>
            {renderSelectField({
              id: 'kode1',
              label: 'Masalah',
              value: formState.kode1,
              options: kode1Options,
              onChange: handleSelectChange('kode1', kode1Options, setKode1Options, originalKode1),
              onFocus: handleFocusReset(setKode1Options, originalKode1)
            })}
            {renderSelectField({
              id: 'kode2',
              label: 'Angka',
              value: formState.kode2,
              options: kode2Options,
              onChange: handleSelectChange('kode2', kode2Options, setKode2Options, originalKode2),
              onFocus: handleFocusReset(setKode2Options, originalKode2),
              disabled: !formState.kode1
            })}
            {renderSelectField({
              id: 'kode3',
              label: 'Angka',
              value: formState.kode3,
              options: kode3Options,
              onChange: handleSelectChange('kode3', kode3Options, setKode3Options, originalKode3),
              onFocus: handleFocusReset(setKode3Options, originalKode3),
              disabled: !formState.kode2
            })}
          </div>

          <div className="preview">
            <strong>Preview:</strong> {`W.1-${formState.kode1Short}.${formState.kode2Short}.${formState.kode3Short}-...`}
          </div>

          <div className="inline-row">
            <button type="button" className="back-button" onClick={() => route('/')}>Kembali</button>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Submit'}
            </button>
          </div>
        </form>
      ) : (
        <div className="after-submit">
          <div className="preview">
            <strong>{finalNomorSurat}</strong>
          </div>
          <button onClick={() => route('/')}>Kembali</button>
        </div>
      )}
    </div>
  );
}
