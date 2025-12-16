export default function EntriesPagination({
   currentPage,
   totalItems,
   itemsPerPage,
   onPageChange
}) {
   const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

   if (totalPages <= 1) return null;

   return (
      <div className="pagination">
         <button
            className="pagination-button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
         >
            Prev
         </button>

         <span className="pagination-info">
            {currentPage} / {totalPages}
         </span>

         <button
            className="pagination-button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
         >
            Next
         </button>
      </div>
   );
}
