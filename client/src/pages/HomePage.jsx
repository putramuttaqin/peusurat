import { useState, useContext } from 'preact/hooks';
import { AuthContext } from '../shared/AuthContext';
import logoRapai from '../assets/icons/logo-rapai.png';
import '../styles/home.css';
import '../styles/animation.css';
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
            </aside>

         </section>

         {/* SUBMISSIONS */}
         <section className="home-submissions">
            <EntriesSection refreshKey={entriesRefreshKey}/>
         </section>

      </div>
   );
}
