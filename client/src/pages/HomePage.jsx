import { useState } from 'preact/hooks';
import logoEntries from '../assets/icons/logo-entries.png'; // corrected path
import logoForm from '../assets/icons/logo-form.png'; // corrected path
import logoRapai from '../assets/icons/logo-rapai.png'; // corrected path
import '../styles/app.css'; // good

export function HomePage() {
  return (
    <>
      <div className='inline-row home-link'>
        <a href="/form">
          <img src={logoForm} class="logo" alt="Go to Form" />
          <p>Isi Form</p>
        </a>
        <a href="/entries">
          <img src={logoEntries} class="logo" alt="Go to Entries" />
          <p>List Nomor Surat</p>
        </a>
      </div>
      <h1>RAPA'I</h1>
      <img src={logoRapai} class="logo" alt="Logo Rapai" style={"padding: 0;"} />
      <h2>Registarasi Arsip dan Penomoran Administrasi Integrasi</h2>
    </>
  );
}
