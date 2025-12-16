import EntriesSection from '../components/entries/EntriesSection.jsx';

export default function EntriesPage({ embedded = false, refreshKey }) {
   useEffect(() => {
      if (!loading && isAdmin) {
         handleFilter(1);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [refreshKey]);
   
   return <EntriesSection />;
}