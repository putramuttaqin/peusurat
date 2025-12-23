import { useEffect, useState, useContext } from 'preact/hooks';
import { route } from 'preact-router';
import { AuthContext } from '../../shared/AuthContext';
import { JENIS_SURAT_OPTIONS, STATUS, USER_ROLES } from '../../shared/enum.js';
import '../../styles/entries.css';
import '../../styles/filter.css';
import { fetchEntries, updateEntryStatus } from '../../api/entries';
import EntryCard from './EntryCard.jsx';
import EntriesFilter from './EntriesFilter.jsx';
import EntriesPagination from './EntriesPagination.jsx';

export default function EntriesSection({ refreshKey }) {
   const today = new Date();
   const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
   const formatDate = (date) => date.toISOString().split('T')[0];

   const itemsPerPage = 12;

   const { isAdmin, user, loading } = useContext(AuthContext);

   const [entries, setEntries] = useState([]);
   const [search, setSearch] = useState('');
   const [currentPage, setCurrentPage] = useState(1);
   const [totalItems, setTotalItems] = useState(0);
   const [expandedId, setExpandedId] = useState(null);
   const [pageLoading, setPageLoading] = useState(false);
   const [actionDisabled, setActionDisabled] = useState(false);

   const [filters, setFilters] = useState({
      startDate: formatDate(thirtyDaysAgo),
      endDate: formatDate(new Date()),
      status: '',
      jenisSurat: ''
   });

   useEffect(() => {
      if (!loading && isAdmin) {
         handleFilter(1);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [refreshKey]);

   useEffect(() => {
      if (!loading && !isAdmin) route('/');
      else if (!loading && isAdmin) handleFilter(1);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [loading, isAdmin]);

   const handleFilter = async (page = 1) => {
      setPageLoading(true);

      try {
         const data = await fetchEntries({
            filters,
            search,
            user,
            page,
            limit: itemsPerPage
         });

         setEntries(data.documents || []);
         setTotalItems(data.total || 0);
         setCurrentPage(data.page || page);
      } catch (err) {
         console.error(err);
         alert('Failed to load data.');
      } finally {
         setPageLoading(false);
      }
   };

   const handleResetFilter = () => {
      setSearch('');
      setFilters({
         startDate: formatDate(thirtyDaysAgo),
         endDate: formatDate(new Date()),
         status: '',
         jenisSurat: ''
      });
      handleFilter(1);
   };

   const handleState = async (id, aksi) => {
      if (actionDisabled) return;
      setActionDisabled(true);

      if (!isAdmin) {
         alert('Only admin can perform this action');
         setActionDisabled(false);
         return;
      }

      const text = aksi === 1 ? 'approve' : 'reject';
      if (!confirm(`Are you sure you want to ${text} this entry?`)) {
         setActionDisabled(false);
         return;
      }

      try {
         await updateEntryStatus({ id, action: aksi });
         await handleFilter(currentPage);
      } catch (err) {
         alert(err.message || 'Action failed');
      } finally {
         setActionDisabled(false);
      }
   };

   const stateToStr = (s) =>
      Object.keys(STATUS).find((k) => STATUS[k] === String(s)) || String(s);

   const formatFullDateTime = (isoString) => {
      const date = new Date(isoString);
      const datePart = new Intl.DateTimeFormat('id-ID', {
         day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta'
      }).format(date);

      const timePart = new Intl.DateTimeFormat('id-ID', {
         hour: '2-digit', minute: '2-digit', second: '2-digit',
         hour12: false, timeZone: 'Asia/Jakarta'
      }).format(date).replace(/\./g, ':');

      return `${datePart} ${timePart}`;
   };

   const formatDateOnly = (isoString) =>
      new Intl.DateTimeFormat('id-ID', {
         day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta'
      }).format(new Date(isoString));

   const maskPerihal = (text) => {
      if (!text) return '';
      if (text.length <= 4) return '*'.repeat(text.length);
      return text.slice(0, 2) + '*'.repeat(text.length - 4) + text.slice(-2);
   };

   return (
      <section className={`entries-section`}>
         {/* Header */}
         <header className="entries-header">
            <h2 className="entries-title">Dashboard Surat</h2>
         </header>

         {/* Filters */}
         <div className="entries-filters">
            <EntriesFilter
               search={search}
               setSearch={setSearch}
               filters={filters}
               setFilters={setFilters}
               onSearch={() => handleFilter(1)}
               onReset={handleResetFilter}
            />
         </div>

         {/* Content */}
         <div className="entries-content">
            {pageLoading ? (
               <div className="entries-state is-loading">
                  <p>Memuat data...</p>
               </div>
            ) : entries.length === 0 ? (
               <div className="entries-state is-empty">
                  <p>Tidak ada data ditemukan.</p>
               </div>
            ) : (
               <>
                  <div className="entries-list">
                     {entries.map((entry) => {
                        const jenisSurat =
                           JENIS_SURAT_OPTIONS[entry.jenis_surat_id - 1] || '—';

                        const statusLabel = stateToStr(entry.status);

                        const viewEntry = {
                           ...entry,
                           tanggalLabel: entry.tanggal_surat
                              ? formatDateOnly(entry.tanggal_surat)
                              : '—',
                           createdAtLabel: entry.created_at
                              ? formatFullDateTime(entry.created_at)
                              : '—',
                           perihalDisplay:
                              entry.sifat_surat === 1
                                 ? maskPerihal(entry.perihal_surat)
                                 : entry.perihal_surat,
                           perihalFull: entry.perihal_surat
                        };

                        return (
                           <EntryCard
                              key={entry.id}
                              entry={viewEntry}
                              jenisSurat={jenisSurat}
                              statusLabel={statusLabel}
                              statusClass={`status-${statusLabel.toLowerCase()}`}
                              showActions={
                                 entry.status === 0 &&
                                 user?.role === USER_ROLES.SUPER_ADMIN
                              }
                              expanded={expandedId === entry.id}
                              onToggleDetail={() =>
                                 setExpandedId(expandedId === entry.id ? null : entry.id)
                              }
                              onApprove={() => handleState(entry.id, 1)}
                              onReject={() => handleState(entry.id, 2)}
                           />
                        );
                     })}
                  </div>

                  <footer className="entries-footer">
                     <EntriesPagination
                        currentPage={currentPage}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handleFilter}
                     />
                  </footer>
               </>
            )}
         </div>
      </section>
   );
}
