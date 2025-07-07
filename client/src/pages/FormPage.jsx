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

const KLASIFIKASI_OPTIONS = ['01.01', '02.02', '03.03'];

export function FormPage() {
  const [formState, setFormState] = useState({
    nomorSurat: null,
    jenisSurat: '',
    wilayah: 'W.1',
    masalahId: '',
    kode1 : '',
    klasifikasi: '',
    klasifikasiDetail: '',
    tanggalSurat: '',
    divisi: '',
    keterangan: '',
    pemohon: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [finalNomorSurat, setFinalNomorSurat] = useState(null);

  const klass1 = Object.entries(kodeSurat).map(([id, val]) => ({
    id,
    name: `${val.name}`,
    kode: `${val.name.split(' - ')[0]}`
  }));

  useEffect(() => {
    fetch('http://localhost:3001/last-number')
      .then(res => res.json())
      .then(data => setFormState(prev => ({ ...prev, nomorSurat: data.lastNumber + 1 })))
      .catch(() => setFormState(prev => ({ ...prev, nomorSurat: 101 })));
  }, []);

  useEffect(() => {
    ['divisi', 'masalah', 'klasifikasi', 'klasifikasiDetail', 'pemohon'].forEach(id => {
      const el = document.getElementById(id);
      if (el && !el.dataset.choices) {
        new Choices(el, {
          shouldSort: false,
          searchEnabled: true,
          itemSelectText: ''
        });
        el.dataset.choices = 'true';
      }
    });
  }, []);

  const handleChange = (field) => (e) => {
    console.log("field: " + field);
    console.log("value e: " + e.target.value);
    setFormState(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalNomor = `W.1.${formState.masalahId}.${formState.klasifikasi}-${formState.nomorSurat}`;

    try {
      const res = await fetch('http://localhost:3001/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomorSurat: finalNomor,
          tanggalSurat: formState.tanggalSurat,
          divisi: formState.divisi,
          keterangan: formState.keterangan
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

  const renderSelectField = ({ id, label, value, options, onChange }) => (
    <div className="form-group short">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={onChange}>
        <option value="" disabled>Pilih...</option>
        {options.map(item =>
          typeof item === 'string'
            ? <option key={item} value={item}>{item}</option>
            : <option key={item.id} value={item.id}>{item.name}</option>
        )}
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
              options: klass1,
              onChange: handleChange('divisi')
            })}
            {renderSelectField({
              id: 'pemohon',
              label: 'Pemohon',
              value: formState.pemohon,
              options: namaPemohon.map(name => ({ id: name, name })),
              onChange: handleChange('pemohon')
            })}
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
              id: 'masalah',
              label: 'Kode 1',
              value: formState.masalahId,
              options: klass1,
              onChange: handleChange('masalahId')
            })}
            {renderSelectField({
              id: 'klasifikasi',
              label: 'Kode 2',
              value: formState.klasifikasi,
              options: KLASIFIKASI_OPTIONS,
              onChange: handleChange('klasifikasi')
            })}
            {renderSelectField({
              id: 'klasifikasiDetail',
              label: 'Kode 3',
              value: formState.klasifikasiDetail,
              options: KLASIFIKASI_OPTIONS,
              onChange: handleChange('klasifikasiDetail')
            })}
          </div>

          <div className="preview">
            <strong>Preview:</strong> {`W.1.${formState.masalahId}.${formState.klasifikasi}-...`}
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
