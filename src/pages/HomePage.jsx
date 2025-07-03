import { useState } from 'preact/hooks';
import preactLogo from '../assets/preact.svg'; // corrected path
import viteLogo from '/vite.svg'; // Vite alias path is fine
import logoMitalon from '../assets/logo-mitalon.jpg'; // corrected path
import logoEntries from '../assets/logo-entries.jpg'; // corrected path
import logoForm from '../assets/logo-form.png'; // corrected path
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
          <img src={logoForm} class="logo" alt="Go to Form" />
        </a>
        <a href="/entries">
          <img src={logoEntries} class="logo" alt="Go to Entries" />
        </a>
      </div>
      <h1>Kementrian Hukum Wilayah Aceh</h1>
      <div class="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </>
  );
}
