import { useContext } from 'preact/hooks';
import { AuthContext } from '../shared/AuthContext';
import FormPage from './FormPage';
import EntriesPage from './EntriesPage';
import logoRapai from '../assets/icons/logo-rapai.png';
import '../styles/home.css';

export default function HomePage({ setLoginModalVisible }) {
  const { isAdmin } = useContext(AuthContext);

  return (
    <div className="home-page">

      {/* HERO / BRAND */}
      <header className="home-hero">
        <img src={logoRapai} className="home-logo" alt="Logo Rapai" />
        <h1>PEUSURAT</h1>
        <p className="home-tagline">
          Penomoran Surat Keluar Elektronik
        </p>
      </header>

      {/* TOP SECTION */}
      <section className="home-top">

        {/* FORM AREA */}
        <div className="home-form-area">
          {isAdmin ? (
            <FormPage embedded />
          ) : (
            <div className="home-login-cta">
              <p>Login untuk mengajukan penomoran surat</p>
              <button
                className="login-button"
                onClick={() => setLoginModalVisible(true)}
              >
                Login
              </button>
            </div>
          )}
        </div>

        {/* INFO / ANNOUNCEMENT */}
        <aside className="home-info-area">
          <h3>Informasi</h3>
          <ul>
            <li>Gunakan sistem ini untuk penomoran surat keluar</li>
            <li>Status pengajuan dapat dilihat di bawah</li>
            <li>Hubungi admin jika ada kendala</li>
          </ul>
        </aside>

      </section>

      {/* SUBMISSIONS (PHASE 2) */}
      <section className="home-submissions">
        <EntriesPage embedded />
      </section>

    </div>
  );
}
