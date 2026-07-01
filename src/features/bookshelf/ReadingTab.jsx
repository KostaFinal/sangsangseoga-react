import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

const GENRES = ["전체", "소설", "시", "에세이", "동화", "지식정보"];

export default function ReadingTab({ filteredBooks, onOpenViewer, onOpenDetail }) {
  const [selectedGenre, setSelectedGenre] = useState('전체');

  // Filter books by progress and then by selected genre
  const readingBooks = filteredBooks.filter(b => b.progress && b.progress > 0 && b.progress < 100);
  const genreFilteredBooks = selectedGenre === '전체'
    ? readingBooks
    : readingBooks.filter(b => b.category === selectedGenre);

  // Helper to determine natural mock read dates based on book ID
  const getRecentReadDate = (book) => {
    if (book.lastReadDate) return book.lastReadDate;
    const dates = {
      'reading_space': '2026.06.25',
      'reading_time': '2026.06.24',
    };
    return dates[book.id] || '2026.06.25';
  };

  return (
    <div className="space-y-4 bg-transparent text-navy-purple">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h3 className="font-plus text-xl font-black text-navy-purple">현재 읽고 있는 책</h3>
        </div>
      </div>

      {/* Genre Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {GENRES.map(genre => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium border transition-all duration-200 cursor-pointer ${
              selectedGenre === genre
                ? "bg-brand-purple text-white border-brand-purple shadow-sm shadow-brand-purple/20"
                : "bg-white text-purple-gray-text border-lavender-border hover:border-brand-purple/40 hover:text-brand-purple"
            }`}
          >
            {genre}
          </button>
        ))}
        <span className="shrink-0 ml-auto text-xs text-purple-gray-text whitespace-nowrap">
          총 {genreFilteredBooks.length}권
        </span>
      </div>

      {genreFilteredBooks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-lavender-border p-12 text-center text-purple-gray-text font-medium text-sm">
          이 카테고리에서 읽고 있는 책이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {genreFilteredBooks.map(book => (
            <div 
              key={book.id} 
              id={`readingbook-${book.id}`}
              onClick={() => onOpenDetail(book)}
              className="bg-white rounded-2xl border border-lavender-border shadow-sm p-4 flex flex-col justify-between h-[235px] hover:shadow-md hover:border-brand-purple/50 transition-all group cursor-pointer"
            >
              <div className="flex gap-4">
                <div className="w-16 h-24 rounded-lg overflow-hidden shrink-0 border border-lavender-border shadow-sm">
                  <img src={book.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" alt="Cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-grow min-w-0">
                  <span className="text-[9px] font-bold text-navy-purple bg-white border border-lavender-border px-2 py-0.5 rounded-full">{book.category}</span>
                  <h4 className="font-plus font-bold text-sm text-navy-purple mt-1 truncate tracking-tight">{book.title}</h4>
                  <p className="text-[10px] text-purple-gray-text mt-0.5 truncate">
                    글쓴이: {book.author}
                  </p>
                  <p className="text-[9px] text-brand-purple font-medium mt-0.5">
                    최근 읽음: {getRecentReadDate(book)}
                  </p>
                  <span className="text-[9px] font-bold text-navy-purple bg-white border border-lavender-border px-2 py-0.5 rounded-md mt-1 inline-block">진행 {Math.min(book.pages, Math.max(1, Math.round((book.progress / 100) * book.pages)))} / {book.pages}쪽</span>
                </div>
              </div>

              {/* Progress meter */}
              <div className="space-y-1.5 mt-2.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-purple-gray-text">
                  <span>독서 진행률</span>
                  <span className="text-navy-purple font-plus">{book.progress}%</span>
                </div>
                <div className="w-full h-2 bg-lavender-bg rounded-full overflow-hidden">
                  <div className="h-full bg-brand-purple rounded-full" style={{ width: `${book.progress}%` }}></div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenViewer(book.id);
                }}
                id={`resume-read-${book.id}`}
                className="w-full text-center py-2 bg-brand-purple hover:bg-brand-dark text-white font-bold text-xs rounded-full cursor-pointer transition-all flex items-center justify-center gap-1 mt-2.5 shadow-sm"
              >
                이어 읽기 <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
