import { useContext } from 'preact/hooks';
import { AuthContext } from './AuthContext';
import logoRapai from '../assets/icons/logo-rapai.png';
import '../styles/app.css'; // or create navbar.css if you prefer

export default function Navbar({ onLoginClick }) {
  const { isAdmin, logout, loading } = useContext(AuthContext);

  return (
    <header>
      <nav className="navbar">
        <div className="navbar-left">
          <img src={logoRapai} alt="Logo RAPA'I" className="navbar-logo" />
          <h1 className="navbar-title">RAPA'I</h1>
        </div>
        {!loading && (
          <div className="navbar-right">
            {isAdmin ? (
              <button className="navbar-button" onClick={logout}>Logout</button>
            ) : (
              <button className="navbar-button" onClick={onLoginClick}>Login</button>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
