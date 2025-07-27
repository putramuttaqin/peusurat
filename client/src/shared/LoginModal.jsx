import { useState, useContext } from 'preact/hooks';
import { AuthContext } from './AuthContext';
import '../styles/app.css'; // or modal.css if you separate styles

export default function LoginModal({ onClose }) {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(username, password);
    if (result.success) {
      onClose();
    } else {
      setError(result.message || 'Login gagal');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Login Admin</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onInput={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onInput={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error-text">{error}</p>}
          <div className="modal-actions">
            <button type="submit">Login</button>
            <button type="button" onClick={onClose}>Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
}
