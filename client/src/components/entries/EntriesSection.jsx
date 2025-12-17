import { useEffect, useState, useContext } from 'preact/hooks';
import { route } from 'preact-router';
import { AuthContext } from '../../shared/AuthContext';
import { JENIS_SURAT_OPTIONS, STATUS, USER_ROLES } from '../../shared/enum.js';
import '../../styles/entries.css';

import EntryCard from './EntryCard.jsx';
import EntriesFilter from './EntriesFilter.jsx';
import EntriesPagination from './EntriesPagination.jsx';

export default function EntriesSection({ embedded = false, refreshKey }) {
   const today = new Date();
   const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
   const formatDate = (date) => date.toISOString().split('T')[0];

   const apiUrl = import.meta.env.VITE_API_URL;
   const itemsPerPage = 10;

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
      if (!embedded && !loading && !isAdmin) route('/');
      else if (!loading && isAdmin) handleFilter(1);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [loading, isAdmin]);

   const handleFilter = async (page = 1) => {
      setPageLoading(true);
      try {
         const params = new URLSearchParams({
            ...filters,
            search,
            user,
            page,
            limit: itemsPerPage
         });

         const res = await fetch(`${apiUrl}/api/surat/entries?${params}`, {
            credentials: 'include'
         });

         if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

         const data = await res.json();
         setEntries(data.documents || []);
         setTotalItems(data.total || 0);
         setCurrentPage(data.page || page);
      } catch (err) {
         console.error('Failed to fetch entries', err);
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
         const res = await fetch(`${apiUrl}/api/surat/entries/${id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: aksi })
         });

         if (res.status === 403) throw new Error('Admin session expired');
         if (!res.ok) throw new Error('Action failed');

         await handleFilter(currentPage);
         alert(`Successfully ${text}d.`);
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
      <div className="entries-embedded">
         <EntriesFilter
            search={search}
            setSearch={setSearch}
            filters={filters}
            setFilters={setFilters}
            onSearch={() => handleFilter(1)}
            onReset={handleResetFilter}
         />

         {pageLoading ? (
            <p>Memuat data...</p>
         ) : entries.length === 0 ? (
            <p>Tidak ada data ditemukan.</p>
         ) : (
            <>
               <div className="entries-card-list">
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
                        perihalFull: entry.perihal_surat,
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

               <EntriesPagination
                  currentPage={currentPage}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handleFilter}
               />
            </>
         )}
      </div>
   );
}
