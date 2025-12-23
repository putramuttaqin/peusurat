import { useEffect, useState, useContext } from 'preact/hooks';
import { AuthContext } from '../shared/AuthContext';
import logoRapai from '../assets/icons/logo-rapai.png';
import '../styles/home.css';
import '../styles/animation.css';
import EntriesSection from '../components/entries/EntriesSection';
import FormSection from '../components/form/FormSection';
import { USER_ROLES } from '../shared/enum.js';

export default function HomePage({ setLoginModalVisible }) {
   const { isAdmin, user } = useContext(AuthContext);
   const [entriesRefreshKey, setEntriesRefreshKey] = useState(0);
   const isCollapsible = isAdmin && user?.role === USER_ROLES.SUPER_ADMIN;
   const [collapsed, setCollapsed] = useState(isCollapsible);

   const triggerEntriesRefresh = () => {
      setEntriesRefreshKey((prevKey) => prevKey + 1);
   };

   useEffect(() => {
      if (isCollapsible) {
         setCollapsed(true);
      }
   }, [isCollapsible]);

   return (
      <div className="home-page">
         {isCollapsible && (
            <button
               aria-expanded={!collapsed}
               aria-controls="home-top"
               className="home-collapse-toggle"
               onClick={() => setCollapsed(!collapsed)}
            >
               {collapsed ? 'Tampilkan Form & Info' : 'Sembunyikan Form & Info'}
            </button>
         )}
         {/* TOP SECTION */}
         <section className={`home-top ${collapsed && isCollapsible ? 'is-collapsed' : ''}`}>

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

               <div className="home-poem">
                  <p>Malam-malam butuh surat,</p>
                  <p>Ambil nomor harus ke kantor.</p>
                  <p>Sekarang ada aplikasi Peusurat,</p>
                  <p>Kapanpun dimanapun ambil nomor.</p>
               </div>
            </aside>
         </section>

         {/* SUBMISSIONS */}
         <section className="home-submissions">
            <EntriesSection refreshKey={entriesRefreshKey} />
         </section>

      </div>
   );
}
