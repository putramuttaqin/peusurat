import { useState } from 'preact/hooks'
import preactLogo from './assets/preact.svg'
import viteLogo from '/vite.svg'
import '../styles/app.css'
import logoMitalon from './assets/logo-mitalon.jpg';

export function HomePage() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://putramuttaqin.pythonanywhere.com" target="_blank">
          <img src={logoMitalon} class="logo" alt="Mitalon logo" />
        </a>
        <a href="/form">
          <img src={preactLogo} class="logo preact" alt="Go to Home" />
        </a>
      </div>
      <h1>Vion + Preon</h1>
      <div class="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/app.jsx</code> and save to test HMR
        </p>
      </div>
      <p>
        Check out{' '}
        <a
          href="https://preactjs.com/guide/v10/getting-started#create-a-vite-powered-preact-app"
          target="_blank"
        >
          create-preact
        </a>
        , the official Preact + Vite starter
      </p>
      <p class="read-the-docs">
        Click on the Vite and Preact logos to learn more
      </p>
    </>
  )
}
