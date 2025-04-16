import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 7; // Maximum number of page buttons to show
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are fewer than maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Calculate start and end of visible pages
      let startPage = Math.max(2, currentPage - 2);
      let endPage = Math.min(totalPages - 1, currentPage + 2);
      
      // Adjust if we're near the beginning
      if (currentPage <= 4) {
        startPage = 2;
        endPage = Math.min(totalPages - 1, maxPagesToShow - 2);
      }
      
      // Adjust if we're near the end
      if (currentPage >= totalPages - 3) {
        startPage = Math.max(2, totalPages - maxPagesToShow + 2);
        endPage = totalPages - 1;
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      // Add the visible page numbers
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always show last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  const PageButton = ({ page, isCurrent }) => {
    // For ellipsis, render just the text
    if (page === '...') {
      return (
        <span className="px-3 py-2 text-gray-500 dark:text-gray-400">
          ...
        </span>
      );
    }
    
    // For page numbers
    return (
      <button
        onClick={() => onPageChange(page)}
        className={`px-3 py-2 rounded-md ${
          isCurrent
            ? 'bg-primary-600 text-white'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        disabled={isCurrent}
        aria-current={isCurrent ? 'page' : undefined}
      >
        {page}
      </button>
    );
  };

  return (
    <nav className="flex justify-center items-center space-x-1" aria-label="Pagination">
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 rounded-md ${
          currentPage === 1
            ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        aria-label="Previous page"
      >
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Page numbers */}
      <div className="hidden sm:flex space-x-1">
        {pageNumbers.map((page, index) => (
          <PageButton
            key={index}
            page={page}
            isCurrent={page === currentPage}
          />
        ))}
      </div>

      {/* Mobile pagination indicator */}
      <span className="sm:hidden text-sm text-gray-700 dark:text-gray-300">
        Page {currentPage} of {totalPages}
      </span>

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 rounded-md ${
          currentPage === totalPages
            ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        aria-label="Next page"
      >
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </nav>
  );
};

export default Pagination; 