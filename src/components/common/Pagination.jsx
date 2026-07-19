import React from 'react';

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  locale = 'vi',
  showSummary = false,
  totalElements = 0,
  pageSize = 10,
  itemsCount = 0,
  variant = 'text' // 'text', 'round'
}) {
  if (totalPages <= 1) return null;

  const isVi = locale === 'vi';
  const prevLabel = isVi ? '‹ Trước' : 'Previous';
  const nextLabel = isVi ? 'Sau ›' : 'Next';

  const handlePrev = () => {
    if (page > 0) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages - 1) onPageChange(page + 1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      
      let start = Math.max(1, page - 1);
      let end = Math.min(totalPages - 2, page + 1);
      
      if (page <= 2) {
        end = 3;
      } else if (page >= totalPages - 3) {
        start = totalPages - 4;
      }
      
      if (start > 1) {
        pages.push('ellipsis1');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 2) {
        pages.push('ellipsis2');
      }
      
      pages.push(totalPages - 1);
    }
    return pages;
  };

  if (variant === 'round') {
    return (
      <div className="flex justify-center items-center gap-4 mt-12">
        <button
          onClick={handlePrev}
          disabled={page === 0}
          className="w-11 h-11 border border-brand-dark/15 text-brand-dark rounded-full flex items-center justify-center hover:bg-brand-dark hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-brand-dark cursor-pointer disabled:cursor-not-allowed"
        >
          ‹
        </button>
        <span className="text-gray-600 font-bold text-sm">
          {isVi 
            ? `Trang ${page + 1} / ${totalPages} (Tổng số: ${totalElements} tour)`
            : `Page ${page + 1} / ${totalPages} (Total: ${totalElements} tours)`
          }
        </span>
        <button
          onClick={handleNext}
          disabled={page === totalPages - 1}
          className="w-11 h-11 border border-brand-dark/15 text-brand-dark rounded-full flex items-center justify-center hover:bg-brand-dark hover:text-white transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-brand-dark cursor-pointer disabled:cursor-not-allowed"
        >
          ›
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-500 mt-6 ${showSummary ? 'justify-between' : 'justify-center'}`}>
      {showSummary && (
        <div>
          {isVi 
            ? <>Hiển thị <strong className="text-gray-800">{itemsCount}</strong> trong số <strong className="text-gray-800">{totalElements}</strong> kết quả</>
            : <>Showing <strong className="text-gray-800">{itemsCount}</strong> of <strong className="text-gray-800">{totalElements}</strong> results</>
          }
        </div>
      )}
      
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page === 0}
          onClick={handlePrev}
          className="px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-emerald-800/10"
        >
          {prevLabel}
        </button>
        
        {getPageNumbers().map((p, idx) => {
          if (p === 'ellipsis1' || p === 'ellipsis2') {
            return (
              <span key={idx} className="px-2 text-xs text-gray-400 select-none">
                ...
              </span>
            );
          }
          const isActive = page === p;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onPageChange(p)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all focus:outline-none ${
                isActive 
                  ? 'bg-[#012d1d] text-white shadow-sm' 
                  : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-emerald-800/10'
              }`}
            >
              {p + 1}
            </button>
          );
        })}
        
        <button
          type="button"
          disabled={page === totalPages - 1}
          onClick={handleNext}
          className="px-3 py-1.5 text-xs font-semibold border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-emerald-800/10"
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
