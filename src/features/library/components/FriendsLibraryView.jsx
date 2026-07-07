import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, BookOpen, Heart, MessageSquare, ChevronLeft, ChevronRight, X, Trash2, SlidersHorizontal, Eye } from "lucide-react";
import BookDetailView from "./BookDetailView";

const genres = ["전체", "소설", "시", "에세이", "동화", "지식정보"];
const sortOptions = ["최신순", "인기순", "좋아요순"];
const itemsPerPage = 12;

const genreBadge = (genre) => {
  const map = {
    "소설": { cls: "bg-[#ddd6fe] text-[#5b21b6] border-[#c4b5fd]", label: "소설" },
    "시": { cls: "bg-[#e9d5ff] text-[#7e22ce] border-[#d8b4fe]", label: "시" },
    "에세이": { cls: "bg-[#ede9ff] text-[#6b54e7] border-[#d4cdf2]", label: "에세이" },
    "동화": { cls: "bg-[#f3e8ff] text-[#9333ea] border-[#e9d5ff]", label: "동화" },
    "지식정보": { cls: "bg-[#faf5ff] text-[#a855f7] border-[#f3e8ff]", label: "지식정보" },
  };
  return map[genre] || { cls: "bg-[#e6e2fc] text-[#6b54e7] border-[#d4cdf2]", label: genre };
};

export default function FriendsLibraryView({
  books,
  viewingBook,
  setViewingBook,
  setSelectedBook,
  previousScreen,
  setCurrentScreen,
  setPreviousScreen,
  setSelectedAuthor,
  setAuthorProfileMode,
  handleToggleLike,
  handleToggleBookmark,
  handleDeleteBook,
  handleDetailAddComment,
  handleAddReply,
  saveBooksToStorage,
  setBooks,
}) {
  const [selectedGenre, setSelectedGenre] = useState("전체");
  const [sortBy, setSortBy] = useState("최신순");
  const [actualQuery, setActualQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredBooks = books.filter(book => {
    if (selectedGenre !== "전체" && book.genre !== selectedGenre) return false;
    if (actualQuery.trim()) {
      const q = actualQuery.toLowerCase();
      return book.title.toLowerCase().includes(q) || book.author.toLowerCase().includes(q) || book.genre.toLowerCase().includes(q) || book.summary.toLowerCase().includes(q);
    }
    return true;
  });

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === "최신순") return b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id);
    if (sortBy === "인기순") return (b.likes + b.commentsCount * 2) - (a.likes + a.commentsCount * 2);
    if (sortBy === "좋아요순") return b.likes - a.likes;
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const paginatedBooks = sortedBooks.slice(indexOfLastItem - itemsPerPage, indexOfLastItem);
  const totalPages = Math.ceil(sortedBooks.length / itemsPerPage) || 1;

  const handlePageChange = pageNum => {
    setCurrentPage(pageNum);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.div
      key={viewingBook ? `detail-${viewingBook.id}` : "shelf"}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
    >
      {viewingBook ? (
        <BookDetailView
          mode={viewingBook?.mode === "owner" ? "owner" : "viewer"}
          book={viewingBook}
          onBack={() => {
            setViewingBook(null);
            if (previousScreen === 'my-library') {
              setCurrentScreen('my-library');
            }
            setPreviousScreen(null);
          }}
          onStartReading={(book) => { setSelectedBook(book); document.body.style.overflow = "hidden"; }}
          onToggleLike={e => { handleToggleLike(e, viewingBook.id); setTimeout(() => { setBooks(prev => { const f = prev.find(b => b.id === viewingBook.id); if (f) setViewingBook(f); return prev; }); }, 50); }}
          onToggleBookmark={e => { handleToggleBookmark(e, viewingBook.id); setTimeout(() => { setBooks(prev => { const f = prev.find(b => b.id === viewingBook.id); if (f) setViewingBook(f); return prev; }); }, 50); }}
          allBooks={books}
          onSelectRecommended={b => setViewingBook(b)}
          onSaveComment={(user, text) => handleDetailAddComment(viewingBook.id, user, text)}
          onSaveReply={(parentId, user, text) => handleAddReply(viewingBook.id, parentId, user, text)}
          onSelectAuthor={(name) => {
            setSelectedAuthor(name);
            setAuthorProfileMode(viewingBook?.mode === "owner" ? "owner" : "viewer");
            setCurrentScreen("author-search");
            setViewingBook(null);
          }}
        />
      ) : (
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 text-left">
          {/* ── 필터 바 ── */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b9b0dc]" />
              <input
                className="w-full bg-[#f8f7ff] border border-[#e6e2fc] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#2f2d59] placeholder:text-[#b9b0dc] focus:outline-none focus:border-[#6b54e7] focus:bg-white transition-all"
                placeholder="제목, 작가, 장르 검색"
                type="text"
                value={actualQuery}
                onChange={e => { setActualQuery(e.target.value); setCurrentPage(1); }}
              />
              {actualQuery && (
                <button onClick={() => setActualQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b9b0dc] hover:text-[#7c769d]">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none bg-[#f8f7ff] border border-[#e6e2fc] rounded-xl pl-4 pr-8 py-2.5 text-sm text-[#2f2d59] focus:outline-none focus:border-[#6b54e7] cursor-pointer transition-all"
              >
                {sortOptions.map(o => <option key={o}>{o}</option>)}
              </select>
              <SlidersHorizontal className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#b9b0dc] pointer-events-none" />
            </div>
          </div>

          {/* ── 장르 탭 ── */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => { setSelectedGenre(genre); setCurrentPage(1); }}
                className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium border transition-all duration-200 cursor-pointer ${selectedGenre === genre
                  ? "bg-[#6b54e7] text-white border-[#6b54e7] shadow-sm shadow-[#6b54e7]/20"
                  : "bg-white text-[#7c769d] border-[#e6e2fc] hover:border-[#6b54e7]/40 hover:text-[#6b54e7]"
                  }`}
              >
                {genre}
              </button>
            ))}
            <span className="shrink-0 ml-auto text-xs text-[#b9b0dc] whitespace-nowrap">
              총 {sortedBooks.length}권
            </span>
          </div>

          {/* ── 책 그리드 ── */}
          {sortedBooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <BookOpen className="w-10 h-10 text-[#d4cdf2] mb-3" />
              <p className="text-[#7c769d] text-sm font-medium">검색 결과가 없습니다</p>
              <p className="text-[#b9b0dc] text-xs mt-1">다른 키워드나 장르를 시도해보세요</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
              {paginatedBooks.map(book => {
                const badge = genreBadge(book.genre);
                return (
                  <div key={book.id} onClick={() => setViewingBook(book)} className="group cursor-pointer">
                    <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-sm border border-gray-200 group-hover:shadow-md group-hover:border-[#d4cdf2] transition-all duration-300 group-hover:-translate-y-1 bg-white">
                      <img
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        src={book.coverImage}
                        alt={book.title}
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/60 via-transparent to-transparent" />
                      <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold border backdrop-blur-sm ${badge.cls}`}>
                        {badge.label}
                      </div>
                      <div className="absolute bottom-0 inset-x-0 p-3 text-left">
                        <h4 className="text-white text-[13px] font-semibold leading-tight line-clamp-2 mb-1.5">{book.title}</h4>
                        <div className="flex items-center gap-2.5 text-white/80 text-[10px]">
                          <button onClick={e => handleToggleLike(e, book.id)} className="flex items-center gap-1 hover:text-white transition cursor-pointer">
                            <Heart className={`w-3.5 h-3.5 ${book.isLikedByMe ? "fill-red-400 stroke-red-400" : ""}`} />
                            {book.likes >= 1000 ? `${(book.likes / 1000).toFixed(1)}k` : book.likes}
                          </button>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            {book.commentsCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {book.viewCount ?? 0}
                          </span>
                          {book.isUserCreated && (
                            <button onClick={e => handleDeleteBook(e, book.id)} className="ml-auto hover:text-red-400 transition cursor-pointer">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <button
                        onClick={e => { e.stopPropagation(); setSelectedAuthor(book.author); setCurrentScreen("author-search"); setViewingBook(null); }}
                        className="text-[12px] font-medium text-[#2f2d59] hover:text-[#6b54e7] transition-colors cursor-pointer"
                      >
                        {book.author}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── 페이지네이션 ── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-12">
              <button
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e6e2fc] text-[#7c769d] hover:border-[#6b54e7] hover:text-[#6b54e7] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all cursor-pointer ${currentPage === p
                    ? "bg-[#6b54e7] text-white shadow-sm shadow-[#6b54e7]/30"
                    : "text-[#7c769d] hover:bg-[#f3f0ff] hover:text-[#6b54e7]"
                    }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e6e2fc] text-[#7c769d] hover:border-[#6b54e7] hover:text-[#6b54e7] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
