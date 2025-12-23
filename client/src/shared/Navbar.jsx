import { useContext } from 'preact/hooks';
import { AuthContext } from './AuthContext';
import logoRapai from '../assets/icons/logo-rapai.png';

export default function Navbar({ onLoginClick }) {
  const { isAdmin, user, logout, loading } = useContext(AuthContext);

  return (
    <header>
      <nav className="navbar">
        <div className="navbar-left">
          {isAdmin ? (
            <>
              <h5 className="navbar-title">{user.name}</h5>
            </>
          ) : (<>
          </>)}
        </div>
        {!loading && (
          <div className="navbar-right">
            {isAdmin ? (
              <>
                <button className="navbar-button" onClick={logout}>Logout</button>
              </>
            ) : (
              <button className="navbar-button" onClick={onLoginClick}>Login</button>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
