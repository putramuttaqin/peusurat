import { useState, useContext } from 'preact/hooks';
import { AuthContext } from '../shared/AuthContext';
import FormPage from './FormPage';
import EntriesPage from './EntriesPage';
import logoRapai from '../assets/icons/logo-rapai.png';
import '../styles/home.css';
import EntriesSection from '../components/entries/EntriesSection';
import FormSection from '../components/form/FormSection';

export default function HomePage({ setLoginModalVisible }) {
   const { isAdmin } = useContext(AuthContext);
   const [entriesRefreshKey, setEntriesRefreshKey] = useState(0);

   const triggerEntriesRefresh = () => {
      setEntriesRefreshKey((prevKey) => prevKey + 1);
   };

   return (
      <div className="home-page">

         {/* TOP SECTION */}
         <section className="home-top">

            {/* FORM AREA */}
            <div className="home-form-area">
               {isAdmin ? (
                  <FormSection onSuccess={triggerEntriesRefresh} />
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

            {/* INFO / HERO AREA */}
            <aside className="home-info-area">
               <img src={logoRapai} className="home-logo" alt="Logo Rapai" />
               <h1 className="home-title">PEUSURAT</h1>
               <p className="home-tagline">
                  Penomoran Surat Keluar Elektronik
               </p>

               <div className="home-info-box">
                  <ul>
                     <li>Ajukan penomoran surat secara elektronik</li>
                     <li>Pantau status pengajuan secara real-time</li>
                     <li>Hubungi admin jika ada kendala</li>
                  </ul>
               </div>
            </aside>

         </section>

         {/* SUBMISSIONS */}
         <section className="home-submissions">
            <EntriesSection embedded refreshKey={entriesRefreshKey}/>
         </section>

      </div>
   );
}
