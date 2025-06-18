import { useState } from 'preact/hooks';
import preactLogo from '../assets/preact.svg'; // corrected path
import viteLogo from '/vite.svg'; // Vite alias path is fine
import logoMitalon from '../assets/logo-mitalon.jpg'; // corrected path
import '../styles/app.css'; // good

export function HomePage() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://putramuttaqin.pythonanywhere.com" target="_blank" rel="noopener noreferrer">
          <img src={logoMitalon} class="logo" alt="Mitalon logo" />
        </a>
        <a href="/form">
          <img src={preactLogo} class="logo preact" alt="Go to Form" />
        </a>
      </div>
      <h1>Vion + Preon</h1>
      <div class="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/pages/HomePage.jsx</code> and save to test HMR
        </p>
      </div>
      <p>
        Check out{' '}
        <a
          href="https://preactjs.com/guide/v10/getting-started#create-a-vite-powered-preact-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          create-preact
        </a>
        , the official Preact + Vite starter
      </p>
      <p class="read-the-docs">
        Click on the Vite and Preact logos to learn more
      </p>
    </>
  );
}
