import { useState } from 'preact/hooks';
import logoEntries from '../assets/icons/logo-entries.jpg'; // corrected path
import logoForm from '../assets/icons/logo-form.png'; // corrected path
import '../styles/app.css'; // good

export function HomePage() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
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
