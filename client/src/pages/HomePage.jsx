import { useContext } from 'preact/hooks';
import { AuthContext } from '../shared/AuthContext';
import logoEntries from '../assets/icons/logo-entries.png';
import logoForm from '../assets/icons/logo-form.png';
import logoRapai from '../assets/icons/logo-rapai.png';
import '../styles/app.css';

export default function HomePage({ setLoginModalVisible }) {
  const { isAdmin } = useContext(AuthContext);

  return (
    <>
      <div className="inline-row home-link">
        {isAdmin ? (
          <>
            <a href="/form">
              <img src={logoForm} class="logo" alt="Go to Form" />
              <p>Isi Form</p>
            </a>
            <a href="/entries">
              <img src={logoEntries} class="logo" alt="Go to Entries" />
              <p>List Nomor Surat</p>
            </a>
          </>
        ) : (
          <button onClick={() => setLoginModalVisible(true)} class="login-button">
            Login untuk akses fitur
          </button>
        )}
      </div>

      <h1>PEUSURAT</h1>
      <img src={logoRapai} class="logo" alt="Logo Rapai" style={{ padding: 0 }} />
      <h2>PENOMORAN SURAT KELUAR ELEKTRONIK</h2>
    </>
  );
}
