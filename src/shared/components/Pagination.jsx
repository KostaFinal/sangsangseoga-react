import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const PAGE_GROUP_SIZE = 10;

const navBtnCls = "w-8 h-8 flex items-center justify-center rounded-lg border-2 border-[#c4b5fd] text-[#5c5480] hover:border-[#6b54e7] hover:text-[#6b54e7] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer";

export function Pagination({ currentPage, totalPages, onPageChange, className = "" }) {
  if (!totalPages || totalPages < 1) return null;

  const groupStart = Math.floor((currentPage - 1) / PAGE_GROUP_SIZE) * PAGE_GROUP_SIZE + 1;
  const groupEnd = Math.min(groupStart + PAGE_GROUP_SIZE - 1, totalPages);
  const pages = Array.from({ length: groupEnd - groupStart + 1 }, (_, i) => groupStart + i);

  return (
    <div className={`flex items-center justify-center gap-1.5 ${className}`}>
      <button
        onClick={() => onPageChange(groupStart - 1)}
        disabled={groupStart === 1}
        className={navBtnCls}
        aria-label="이전 10페이지"
      >
        <ChevronsLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={navBtnCls}
        aria-label="이전 페이지"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium border-2 transition-all cursor-pointer ${currentPage === p
            ? "bg-[#6b54e7] text-white border-[#6b54e7] shadow-sm shadow-[#6b54e7]/30"
            : "text-[#5c5480] border-[#c4b5fd] hover:border-[#6b54e7] hover:text-[#6b54e7]"
            }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={navBtnCls}
        aria-label="다음 페이지"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      <button
        onClick={() => onPageChange(groupEnd + 1)}
        disabled={groupEnd === totalPages}
        className={navBtnCls}
        aria-label="다음 10페이지"
      >
        <ChevronsRight className="w-4 h-4" />
      </button>
    </div>
  );
}
