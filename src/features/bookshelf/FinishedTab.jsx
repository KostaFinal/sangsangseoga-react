import React, { useState } from 'react';
import { ThumbsUp, Eye, StickyNote } from 'lucide-react';

const GENRES = ["전체", "소설", "시", "에세이", "동화"];

export default function FinishedTab({ filteredBooks, onOpenViewer, onReread, setActiveTab, onOpenDetail, onOpenMemos, }) {
  const [selectedGenre, setSelectedGenre] = useState('전체');

  // Filter books by completed status and then by selected genre
  const finishedBooks = filteredBooks.filter(
    b => (b.rereadCount > 0 || b.progress === 100) && b.id !== 'stats_magic_book'
  );
  const genreFilteredBooks = selectedGenre === '전체'
    ? finishedBooks
    : finishedBooks.filter(b => b.category === selectedGenre);

  const getReadingPeriod = (startedDate, finishedDate) => {
    if (!startedDate || !finishedDate) return '-';

    const start = new Date(startedDate);
    const end = new Date(finishedDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return '-';
    }

    const diffDays =
      Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return diffDays > 0 ? `${diffDays}일` : '-';
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '-';

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '-';

    return date.toLocaleDateString('ko-KR');
  };

  return (
    <div className="space-y-4 bg-transparent text-navy-purple">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 select-none">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-black text-navy-purple">
            모두 읽은 책
          </h3>

          <span className="px-2.5 py-1 rounded-full bg-brand-purple/10 text-brand-purple text-xs font-bold">
            {finishedBooks.length}권
          </span>
        </div>
      </div>

      {/* Genre Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {GENRES.map(genre => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium border transition-all duration-200 cursor-pointer ${selectedGenre === genre
              ? "bg-brand-purple text-white border-brand-purple shadow-sm shadow-brand-purple/20"
              : "bg-white text-purple-gray-text border-lavender-border hover:border-brand-purple/40 hover:text-brand-purple"
              }`}
          >
            {genre}
          </button>
        ))}

      </div>

      {genreFilteredBooks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-lavender-border p-12 text-center text-purple-gray-text font-medium text-sm">
          이 카테고리에서 읽기 완료한 책이 없습니다.
        </div>
      ) : (
        /* Novel lists grids */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {genreFilteredBooks.map(book => (
            <div
              key={book.id}
              id={`finishedbook-${book.id}`}
              onClick={() => onOpenDetail(book)}
              className="bg-white rounded-2xl border border-lavender-border shadow-sm p-4 flex flex-col justify-between h-[340px] group hover:shadow-md hover:border-brand-purple/50 transition-all cursor-pointer"
            >
              <div className="flex gap-4">
                <div className="w-16 h-24 rounded-lg overflow-hidden shrink-0 border border-lavender-border shadow-sm">
                  <img src={book.coverUrl} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" alt="Cover" referrerPolicy="no-referrer" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-bold text-navy-purple bg-white border border-lavender-border px-2 py-0.5 rounded-full">{book.category}</span>
                  <h4 className="font-bold text-sm text-navy-purple mt-1 truncate tracking-tight">{book.title}</h4>
                  <p className="text-[10px] text-purple-gray-text mt-0.5">
                    독서 시작일: {formatDate(book.startedDate)}
                  </p>
                  <p className="text-[10px] text-purple-gray-text mt-0.5">
                    완독일: {formatDate(book.finishedDate)}
                  </p>
                  <p className="text-[10px] text-brand-purple font-bold mt-0.5">
                    독서 기간: {getReadingPeriod(book.startedDate, book.finishedDate)}
                  </p>

                  {/* Stats */}
                  <div className="flex gap-3 mt-1.5 text-[10px] text-purple-gray-text">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3 text-brand-purple" />
                      <span>{book.totalLikes || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-brand-purple" />
                      <span>{book.totalViews || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={event => {
                  event.stopPropagation();
                  onOpenMemos(book);
                }}
                className="w-full py-2 bg-white hover:bg-lavender-bg text-brand-purple font-bold text-xs rounded-full border border-lavender-border transition-all flex items-center justify-center gap-1 mt-2"
              >
                <StickyNote className="w-3 h-3" />
                메모 목록
              </button>

              <div className="flex gap-2 mt-2.5">
                <button
                  onClick={async (e) => {
                    e.stopPropagation();

                    if (book.readingStatus === "READING") {
                      onOpenViewer(book.id);
                    } else {
                      await onReread(book.id);
                    }
                  }}
                  className="flex-grow text-center py-2 bg-white hover:bg-lavender-bg text-brand-purple font-bold text-xs rounded-full border border-lavender-border transition-all"
                >
                  {book.readingStatus === "READING" ? "이어 읽기" : "다시 읽기"}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab('ai-chat');
                  }}
                  id={`write-journal-${book.id}`}
                  className="flex-grow text-center py-2 bg-brand-purple hover:bg-brand-dark text-white font-bold text-xs rounded-full cursor-pointer transition-all shadow-sm"
                >
                  독후감 작성/평가
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
