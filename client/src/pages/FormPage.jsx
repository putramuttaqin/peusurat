import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import Choices from 'choices.js';
import 'choices.js/public/assets/styles/choices.min.css';
import '../styles/form.css';
import namaPemohon from '../data/pemohon.json';
import kodeSurat from '../data/kode-surat.json';

const JENIS_SURAT_OPTIONS = [
  'BUKU KELUAR UMUM',
  'SK KAKANWIL',
  'BUKU KELUAR YANKUM',
  'BUKU MASUK UMUM',
  'BUKU SURAT PERINTAH',
  'BUKU CUTI',
  'BUKU KELUAR PLH/PLT',
  'BUKU KELUAR P2L',
  'BUKU MASUK P2L',
  'BUKU MASUK YANKUM'
];

const RUANG_OPTIONS = [
  'PERENCANAAN',
  'ORGANISASI DAN TATA LAKSANA',
  'KEPEGAWAIAN',
  'KEUANGAN',
  'PENGELOLAAN BARANG MILIK NEGARA',
  'KEHUMASAN DAN HUKUM',
  'UMUM',
  'PENGAWASAN',
  'TEKNOLOGI DAN INFORMASI',
  'PERATURAN PERUNDANG-UNDANGAN',
  'ADMINISTRASI HUKUM UMUM',
  'KEKAYAAN INTELEKTUAL',
  'PEMBINAAN HUKUM NASIONAL',
  'SUMBER DAYA MANUSIA',
  'PENELITIAN DAN PENGEMBANGAN'
];

export function FormPage() {
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
    divisi: '',
    keterangan: '',
    pemohon: ''
  });

  const [kode2Options, setKode2Options] = useState([]);
  const [kode3Options, setKode3Options] = useState([]);
  const [kode1Options, setKode1Options] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [finalNomorSurat, setFinalNomorSurat] = useState(null);
  const [originalKode1, setOriginalKode1] = useState([]);
  const [originalKode2, setOriginalKode2] = useState([]);
  const [originalKode3, setOriginalKode3] = useState([]);

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
      const selectedKode1 = kodeSurat[formState.kode1];
      const options = Object.entries(selectedKode1.children || {}).map(([id, val]) => ({
        id,
        name: val.name,
        shortName: val.name.split(' - ')[0].substring(0, 2)
      }));
      setKode2Options(options);
      setOriginalKode2(options);
      setFormState(prev => ({ ...prev, kode2: '', kode3: '', kode2Short: '', kode3Short: '' }));
      setKode3Options([]);
    } else {
      setKode2Options([]);
      setKode3Options([]);
    }
  }, [formState.kode1]);

  useEffect(() => {
    if (formState.kode1 && formState.kode2) {
      const selectedKode2 = kodeSurat[formState.kode1].children[formState.kode2];
      const options = Object.entries(selectedKode2.children || {}).map(([id, val]) => ({
        id,
        name: val.name,
        shortName: val.name.split(' - ')[0].substring(0, 2)
      }));
      setKode3Options(options);
      setOriginalKode3(options);
      setFormState(prev => ({ ...prev, kode3: '', kode3Short: '' }));
    } else {
      setKode3Options([]);
    }
  }, [formState.kode2]);

  const handleSelectChange = (field, options, setOptionsFn, originalOptions) => (e) => {
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
    const nomorSurat = `W.1.${formState.kode1Short}.${formState.kode2Short}.${formState.kode3Short}-xyz`;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/surat/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jenisSurat: formState.jenisSurat,
          perihalSurat: formState.keterangan,
          ruangPemohon: formState.divisi,
          pemohon: formState.pemohon,
          tanggalSurat: formState.tanggalSurat,
          nomorSurat
        })
      });

      if (res.ok) {
        setFinalNomorSurat(nomorSurat);
        setSubmitted(true);
      } else throw new Error('Failed to save data');
    } catch (err) {
      alert('Error: ' + err.message);
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

  return (
    <div className="form-container">
      <h2>{submitted ? 'Nomor Surat' : 'Form Nomor Surat'}</h2>
      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <div className="inline-row">
            {renderSelectField({
              id: 'jenisSurat',
              label: 'Jenis Surat',
              value: formState.jenisSurat,
              options: JENIS_SURAT_OPTIONS,
              onChange: handleChange('jenisSurat')
            })}
            <div className="form-group short">
              <label htmlFor="tanggalSurat">Tanggal Surat</label>
              <input type="date" id="tanggalSurat" value={formState.tanggalSurat} onInput={handleChange('tanggalSurat')} />
            </div>

            {renderSelectField({
              id: 'divisi',
              label: 'Ruang',
              value: formState.divisi,
              options: RUANG_OPTIONS,
              onChange: handleChange('divisi')
            })}
            <div className="form-group short">
              <label htmlFor="pemohon">Pemohon</label>
              <select id="pemohon" value={formState.pemohon} onChange={handleChange('pemohon')}>
                <option value="" disabled>Pilih...</option>
                {namaPemohon.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group full">
            <label htmlFor="keterangan">Perihal Surat</label>
            <textarea id="perihal" rows="4" value={formState.keterangan} onInput={handleChange('keterangan')} placeholder="Tuliskan keterangan surat di sini..." />
          </div>

          <div className="inline-row">
            <div className="form-group short">
              <label htmlFor="wilayah">Nomor Surat</label>
              <input id="wilayah" value={formState.wilayah} readOnly />
            </div>
            {renderSelectField({
              id: 'kode1',
              label: 'Kode 1',
              value: formState.kode1,
              options: kode1Options,
              onChange: handleSelectChange('kode1', kode1Options, setKode1Options, originalKode1),
              onFocus: handleFocusReset(setKode1Options, originalKode1)
            })}
            {renderSelectField({
              id: 'kode2',
              label: 'Kode 2',
              value: formState.kode2,
              options: kode2Options,
              onChange: handleSelectChange('kode2', kode2Options, setKode2Options, originalKode2),
              onFocus: handleFocusReset(setKode2Options, originalKode2),
              disabled: !formState.kode1
            })}
            {renderSelectField({
              id: 'kode3',
              label: 'Kode 3',
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
            <button type="submit">Submit</button>
          </div>
        </form>
      ) : (
        <div className="after-submit">
          <div className="preview">
            <strong>{finalNomorSurat}</strong>
          </div>
          <button onClick={() => route('/')}>Daftar Surat Lain</button>
        </div>
      )}
    </div>
  );
}
