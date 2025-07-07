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
  'PEMASYARAKATAN',
  'KEIMIGRASIAN',
  'KEKAYAAN INTELEKTUAL',
  'HAK ASASI MANUSIA',
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
  const [submitted, setSubmitted] = useState(false);
  const [finalNomorSurat, setFinalNomorSurat] = useState(null);

  // Process kode-surat data for kode1
  const kode1Options = Object.entries(kodeSurat).map(([id, val]) => ({
    id,
    name: val.name,
    shortName: val.name.split(' - ')[0].substring(0, 2)
  }));

  useEffect(() => {
    fetch('http://localhost:3001/last-number')
      .then(res => res.json())
      .then(data => setFormState(prev => ({ ...prev, nomorSurat: data.lastNumber + 1 })))
      .catch(() => setFormState(prev => ({ ...prev, nomorSurat: 101 })));
  }, []);

  // Initialize Choices.js only for pemohon field
  useEffect(() => {
    const initPemohonChoices = () => {
      const el = document.getElementById('pemohon');
      if (el && !el.dataset.choices) {
        new Choices(el, {
          shouldSort: false,
          searchEnabled: true,
          itemSelectText: ''
        });
        el.dataset.choices = 'true';
      }
    };

    initPemohonChoices();
  }, []);

  // Update kode2 options when kode1 changes
  useEffect(() => {
    if (formState.kode1) {
      const selectedKode1 = kodeSurat[formState.kode1];
      const options = Object.entries(selectedKode1.children || {}).map(([id, val]) => ({
        id,
        name: val.name,
        shortName: val.name.split(' - ')[0].substring(0, 2)
      }));

      setKode2Options(options);
      setFormState(prev => ({
        ...prev,
        kode2: '',
        kode3: '',
        kode2Short: '',
        kode3Short: ''
      }));
      setKode3Options([]);
    } else {
      setKode2Options([]);
      setKode3Options([]);
    }
  }, [formState.kode1]);

  // Update kode3 options when kode2 changes
  useEffect(() => {
    if (formState.kode1 && formState.kode2) {
      const selectedKode1 = kodeSurat[formState.kode1];
      const selectedKode2 = selectedKode1.children[formState.kode2];
      const options = Object.entries(selectedKode2.children || {}).map(([id, val]) => ({
        id,
        name: val.name,
        shortName: val.name.split(' - ')[0].substring(0, 2)
      }));

      setKode3Options(options);
      setFormState(prev => ({ ...prev, kode3: '', kode3Short: '' }));
    } else {
      setKode3Options([]);
    }
  }, [formState.kode2]);

  const handleKode1Change = (e) => {
    const selectedId = e.target.value;
    const selectedOption = kode1Options.find(opt => opt.id === selectedId);
    setFormState(prev => ({
      ...prev,
      kode1: selectedId,
      kode1Short: selectedOption?.shortName || '',
      kode2: '',
      kode3: '',
      kode2Short: '',
      kode3Short: ''
    }));
  };

  const handleKode2Change = (e) => {
    const selectedId = e.target.value;
    const selectedOption = kode2Options.find(opt => opt.id === selectedId);
    setFormState(prev => ({
      ...prev,
      kode2: selectedId,
      kode2Short: selectedOption?.shortName || '',
      kode3: '',
      kode3Short: ''
    }));
  };

  const handleKode3Change = (e) => {
    const selectedId = e.target.value;
    const selectedOption = kode3Options.find(opt => opt.id === selectedId);
    setFormState(prev => ({
      ...prev,
      kode3: selectedId,
      kode3Short: selectedOption?.shortName || ''
    }));
  };

  const handleChange = (field) => (e) => {
    setFormState(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalNomor = `W.1.${formState.kode1Short}.${formState.kode2Short}.${formState.kode3Short}-${formState.nomorSurat}`;

    try {
      const res = await fetch('http://localhost:3001/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomorSurat: finalNomor,
          tanggalSurat: formState.tanggalSurat,
          divisi: formState.divisi,
          keterangan: formState.keterangan,
          pemohon: formState.pemohon
        })
      });

      const json = await res.json();
      if (json.success) {
        setFinalNomorSurat(finalNomor);
        setFormState(prev => ({ ...prev, nomorSurat: prev.nomorSurat + 1 }));
        setSubmitted(true);
      } else {
        alert('Gagal menyimpan: ' + json.error);
      }
    } catch (err) {
      alert('Server error: ' + err.message);
    }
  };

  const renderSelectField = ({ id, label, value, options, onChange, disabled = false }) => (
    <div className="form-group short">
      <label htmlFor={id}>{label}</label>
      <select 
        id={id} 
        value={value} 
        onChange={onChange}
        disabled={disabled}
      >
        <option value="" disabled>Pilih...</option>
        {options.map(item => (
          <option key={item.id || item} value={item.id || item}>
            {item.name || item}
          </option>
        ))}
      </select>
    </div>
  );

  const renderInputField = ({ id, label, type = 'text', value, onChange }) => (
    <div className="form-group short">
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} value={value} onInput={onChange} />
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
            {renderInputField({
              id: 'tanggalSurat',
              label: 'Tanggal Surat',
              type: 'date',
              value: formState.tanggalSurat,
              onChange: handleChange('tanggalSurat')
            })}
          </div>

          <div className="inline-row">
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
            <textarea
              id="perihal"
              rows="4"
              value={formState.keterangan}
              onInput={handleChange('keterangan')}
              placeholder="Tuliskan keterangan surat di sini..."
            />
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
              onChange: handleKode1Change
            })}
            {renderSelectField({
              id: 'kode2',
              label: 'Kode 2',
              value: formState.kode2,
              options: kode2Options,
              onChange: handleKode2Change,
              disabled: !formState.kode1
            })}
            {renderSelectField({
              id: 'kode3',
              label: 'Kode 3',
              value: formState.kode3,
              options: kode3Options,
              onChange: handleKode3Change,
              disabled: !formState.kode2
            })}
          </div>

          <div className="preview">
            <strong>Preview:</strong> {`W.1.${formState.kode1Short}.${formState.kode2Short}.${formState.kode3Short}-...`}
          </div>

          <div className="inline-row">
            <button type="button" className="back-button" onClick={() => route('/')}>Kembali</button>
            <button type="submit" disabled={formState.nomorSurat === null}>Submit</button>
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