import { useState, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import '../styles/form.css';

export function FormPage() {
  const jenisSuratOpsi = ['Surat Keluar Umum', 'Surat Keputusan', 'Nota Dinas'];
  const wilayahOptions = ['W.1', 'W.2', 'W.3'];
  const masalahOptions = ['UM', 'PID', 'HT'];
  const klasifikasiOptions = ['01.01', '02.02', '03.03'];
  const divisiOptions = ['Kepegawaian', 'Keuangan', 'Umum'];

  const [nomorSurat, setNomorSurat] = useState(null);
  const [jenisSurat, setJenisSurat] = useState('');
  const [wilayah, setWilayah] = useState('');
  const [masalah, setMasalah] = useState('');
  const [klasifikasi, setKlasifikasi] = useState('');
  const [tanggalSurat, setTanggalSurat] = useState('');
  const [divisi, setDivisi] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [finalNomorSurat, setFinalNomorSurat] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/last-number')
      .then((res) => res.json())
      .then((data) => {
        setNomorSurat(data.lastNumber + 1);
      })
      .catch((err) => {
        console.error('Failed to fetch last number:', err);
        setNomorSurat(101);
      });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const finalNomor = `${wilayah}.${masalah}.${klasifikasi}-${nomorSurat}`;
    const formData = {
      nomorSurat: finalNomor,
      tanggalSurat,
      divisi,
      keterangan,
    };

    try {
      const res = await fetch('http://localhost:3001/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (json.success) {
        setFinalNomorSurat(finalNomor); // ✅ Correct: this is the value sent to backend
        setNomorSurat((prev) => prev + 1); // Prepare next one
        setSubmitted(true);
      } else {
        alert('Gagal menyimpan: ' + json.error);
      }
    } catch (err) {
      alert('Server error: ' + err.message);
    }
  }

  const handleBackToHome = () => {
    route('/');
  };

  return (
    <div className="form-container">
      <h2>{submitted ? 'Nomor Surat' : 'Form Nomor Surat'}</h2>

      {!submitted ? (
        <form onSubmit={handleSubmit}>
          {/* First row */}
          <div className="inline-row">
            <div className="form-group short">
              <label htmlFor="jenisSurat">Jenis Surat</label>
              <input
                list="jenisSuratOpsi"
                id="jenisSurat"
                value={jenisSurat}
                onInput={(e) => setJenisSurat(e.target.value)}
              />
              <datalist id="jenisSuratOpsi">
                {jenisSuratOpsi.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </div>

            <div className="form-group short">
              <label htmlFor="wilayah">Kode Wilayah</label>
              <input
                list="wilayahOptions"
                id="wilayah"
                value={wilayah}
                onInput={(e) => setWilayah(e.target.value)}
              />
              <datalist id="wilayahOptions">
                {wilayahOptions.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </div>

            <div className="form-group short">
              <label htmlFor="masalah">Kode Masalah</label>
              <input
                list="masalahOptions"
                id="masalah"
                value={masalah}
                onInput={(e) => setMasalah(e.target.value)}
              />
              <datalist id="masalahOptions">
                {masalahOptions.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </div>

            <div className="form-group short">
              <label htmlFor="klasifikasi">Kode Klasifikasi</label>
              <input
                list="klasifikasiOptions"
                id="klasifikasi"
                value={klasifikasi}
                onInput={(e) => setKlasifikasi(e.target.value)}
              />
              <datalist id="klasifikasiOptions">
                {klasifikasiOptions.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Second row: Tanggal Surat and Divis */}
          <div className="inline-row">
            <div className="form-group short">
              <label htmlFor="tanggalSurat">Tanggal Surat</label>
              <input
                type="date"
                id="tanggalSurat"
                value={tanggalSurat}
                onInput={(e) => setTanggalSurat(e.target.value)}
              />
            </div>

            <div className="form-group short">
              <label htmlFor="divisi">Divisi</label>
              <input
                list="divisiOptions"
                id="divisi"
                value={divisi}
                onInput={(e) => setDivisi(e.target.value)}
              />
              <datalist id="divisiOptions">
                {divisiOptions.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Third row */}
          <div className="form-group full">
            <label htmlFor="keterangan">Keterangan Surat</label>
            <textarea
              id="keterangan"
              rows="4"
              list="keteranganOptions"
              value={keterangan}
              onInput={(e) => setKeterangan(e.target.value)}
              placeholder="Tuliskan keterangan surat di sini..."
            />
            <datalist id="keteranganOptions">
              <option value="Surat permohonan..." />
              <option value="Surat undangan rapat..." />
              <option value="Surat pengantar dokumen..." />
              <option value="Surat keterangan kerja..." />
            </datalist>
          </div>

          {/* Preview */}
          <div className="preview">
            <strong>Preview:</strong>{' '}
            {`${wilayah}.${masalah}.${klasifikasi}-...`}
          </div>

          <div className="inline-row">
            <button className="back-button" onClick={() => route('/')}>
              Kembali
            </button>
            <button type="submit" disabled={nomorSurat === null}>
              Submit
            </button>
          </div>
        </form>
      ) : (
        <div className="after-submit">
          <div className="preview">
            <strong>{finalNomorSurat}</strong>
          </div>
          <button onClick={handleBackToHome}>Daftar Surat Lain</button>
        </div>
      )}
    </div>
  );
}
