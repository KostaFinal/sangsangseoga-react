import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Search, BookOpen, Heart, MessageSquare, ChevronLeft, ChevronRight, X, SlidersHorizontal, Eye } from "lucide-react";
import BookDetailView from "./BookDetailView";
import { getBooks, getBook, likeBook, unlikeBook } from "../../../api/bookApi";
import { addComment, addReply } from "../../../api/commentApi";
import { useAuth } from "../../../shared/context/AuthContext";
import { useRequireAuth } from "../../../shared/hooks/useRequireAuth";
import { addWishlist, deleteWishlist, updateMyWrittenBookDescription, updateMyWrittenBookStatus } from "../../../api/myLibraryApi";

const bookTypeOptions = [
  { label: "전체", value: null },
  { label: "소설", value: "NOVEL" },
  { label: "시", value: "POEM" },
  { label: "에세이", value: "ESSAY" },
  { label: "동화", value: "FAIRY_TALE" },
];

const sortOptions = [
  { label: "최신순", value: "latest" },
  { label: "인기순", value: "popular" },
  { label: "좋아요순", value: "likes" },
];

const bookTypeToGenre = {
  "NOVEL": "소설", "POEM": "시", "ESSAY": "에세이",
  "FAIRY_TALE": "동화",
};

const mapBookForDetail = (book, currentUser) => {
  console.log("authorId:", book.authorId, "memberId:", currentUser?.memberId);
  return {
    ...book,
    coverImage: book.coverImageUrl,
    likes: book.likeCount,
    commentsCount: book.commentCount,
    genre: bookTypeToGenre[book.bookType] || book.bookType,
    comments: book.comments || [],
    pages: book.pages || [],
    mode: currentUser?.memberId && book.authorId && String(currentUser.memberId) === String(book.authorId) ? "owner" : "viewer",
  };
};


const genreBadge = (genre) => {
  const map = {
    "NOVEL": { cls: "bg-[#ddd6fe] text-[#5b21b6] border-[#c4b5fd]", label: "소설" },
    "POEM": { cls: "bg-[#e9d5ff] text-[#7e22ce] border-[#d8b4fe]", label: "시" },
    "ESSAY": { cls: "bg-[#ede9ff] text-[#6b54e7] border-[#d4cdf2]", label: "에세이" },
    "FAIRY_TALE": { cls: "bg-[#f3e8ff] text-[#9333ea] border-[#e9d5ff]", label: "동화" },
  };
  return map[genre] || { cls: "bg-[#e6e2fc] text-[#6b54e7] border-[#d4cdf2]", label: genre };
};

export default function FriendsLibraryView() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const scrollToCommentId = searchParams.get("commentId");
  const {
    handleToggleBookmark,
    onUpdateDescription,
    onUpdateStatus,
  } = useOutletContext();
  const { currentUser } = useAuth();
  const requireAuth = useRequireAuth();

  const [selectedBookType, setSelectedBookType] = useState(null);
  const [sortBy, setSortBy] = useState("latest");
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [books, setBooks] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);



  // :bookId가 있으면 상세 화면 — 목록에서 이미 불러온 항목이면 그대로 쓰고,
  // 딥링크/새로고침 등으로 로컬 목록에 없으면 직접 조회. BookDetailView가 기대하는
  // 형태(likes/coverImage/mode 등)로 항상 mapBookForDetail을 거쳐서 내려줌
  const [fetchedBook, setFetchedBook] = useState(null);
  const rawViewingBook = bookId
    ? (books.find(b => String(b.id) === String(bookId)) || fetchedBook)
    : null;
  const viewingBook = rawViewingBook ? mapBookForDetail(rawViewingBook, currentUser) : null;

  useEffect(() => {
    if (!bookId) {
      setFetchedBook(null);
      return;
    }
    if (books.find(b => String(b.id) === String(bookId))) return;
    (async () => {
      try {
        const res = await getBook(bookId);
        setFetchedBook(res.data.data);
      } catch (err) {
        console.error("책 상세 조회 실패", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, books]);

  const setViewingBook = (book) => {
    if (!book) {
      navigate("/friends");
    } else {
      navigate(`/friends/${book.id}`);
    }
  };

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBooks({
        bookType: selectedBookType,
        sort: sortBy,
        keyword: keyword.trim() || undefined,
        page: currentPage,
        size: 12,
      });
      const data = res.data.data;
      setBooks(data.items);
      setTotalCount(data.totalCount);
      setHasNext(data.hasNext);
      setTotalPages(Math.ceil(data.totalCount / 12) || 1);
    } catch (err) {
      console.error("책 목록 조회 실패", err);
    } finally {
      setLoading(false);
    }
  }, [selectedBookType, sortBy, keyword, currentPage]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // books 목록에 있으면 그쪽을, 딥링크로 대신 조회해 둔 fetchedBook이면 그쪽을 갱신
  const patchBookById = (bookId, updater) => {
    setBooks(prev => prev.map(b => (String(b.id) === String(bookId) ? updater(b) : b)));
    setFetchedBook(prev => (prev && String(prev.id) === String(bookId) ? updater(prev) : prev));
  };

  // 같은 책에 대해 좋아요 요청이 진행 중일 때 중복 클릭으로 재요청되는 것을 막는 락
  const pendingLikesRef = useRef(new Set());

  const handleToggleLike = async (e, bookId) => {
    e.stopPropagation();
    if (!requireAuth()) return;
    if (pendingLikesRef.current.has(String(bookId))) return; // 처리 중이면 무시
    const book = books.find(b => String(b.id) === String(bookId)) || fetchedBook;
    if (!book) return;

    pendingLikesRef.current.add(String(bookId));

    // 낙관적 업데이트 - API 응답 전에 UI 먼저 반영
    const wasLiked = book.isLikedByMe;
    const updater = b => ({ ...b, isLikedByMe: !wasLiked, likeCount: wasLiked ? b.likeCount - 1 : b.likeCount + 1, likes: wasLiked ? b.likeCount - 1 : b.likeCount + 1 });
    patchBookById(bookId, updater);

    try {
      if (wasLiked) {
        await unlikeBook(bookId);
      } else {
        await likeBook(bookId);
      }
    } catch (err) {
      // 좋아요/취소 자체가 실패한 경우에만 원복
      const revert = b => ({ ...b, isLikedByMe: wasLiked, likeCount: wasLiked ? b.likeCount + 1 : b.likeCount - 1, likes: wasLiked ? b.likeCount + 1 : b.likeCount - 1 });
      patchBookById(bookId, revert);
      console.error("좋아요 처리 실패", err);
      pendingLikesRef.current.delete(String(bookId));
      return;
    }

    // 위시리스트 동기화는 별도 실패 단위 - 실패해도 이미 성공한 좋아요 상태는 그대로 둔다
    try {
      if (wasLiked) {
        await deleteWishlist(bookId);
      } else {
        await addWishlist(bookId);
      }
    } catch (err) {
      console.error("위시리스트 동기화 실패", err);
    } finally {
      pendingLikesRef.current.delete(String(bookId));
    }
  };

  const handleDetailAddComment = async (bookId, authorName, textContent) => {
    if (!requireAuth()) return;
    const res = await addComment(bookId, textContent);
    patchBookById(bookId, (prev) => ({
      ...prev,
      commentCount: (prev.commentCount || 0) + 1,
    }));
    return res;
  };

  const handleAddReply = async (bookId, parentCommentId, authorName, textContent) => {
    if (!requireAuth()) return;
    try {
      const res = await addReply(parentCommentId, textContent);
      return res;
    } catch (err) {
      console.error("답글 작성 실패", err);
      throw err;
    }
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
          onBack={() => navigate("/friends")}
          onUpdateDescription={onUpdateDescription}
          onUpdateStatus={onUpdateStatus}
          onViewCountSynced={(id, viewCount) => patchBookById(id, prev => ({ ...prev, viewCount }))}
          scrollToCommentId={scrollToCommentId}

          onStartReading={(book) => navigate(`/books/${book.id}/read`)}
          // onToggleLike={e => handleToggleLike(e, viewingBook.id)}
          onToggleLike={(e, bookId) => handleToggleLike(e, bookId)}
          onToggleBookmark={e => handleToggleBookmark(e, viewingBook.id)}

          allBooks={books}
          onSelectRecommended={async (rec) => {
            try {
              const res = await getBook(rec.id);
              const full = res.data?.data;
              if (full) setViewingBook(mapBookForDetail(full, currentUser));
            } catch (err) {
              console.error("추천 도서 조회 실패", err);
            }
          }}
          onSaveComment={(user, text) => handleDetailAddComment(viewingBook.id, user, text)}
          onSaveReply={(parentId, user, text) => handleAddReply(viewingBook.id, parentId, user, text)}
          currentUser={currentUser}
          onSelectAuthor={(name) => {
            const mode = viewingBook?.mode === "owner" ? "owner" : "viewer";
            navigate(`/authors/${encodeURIComponent(name)}${mode === "owner" ? "?mode=owner" : ""}`);
          }}
        />
      ) : (
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 text-left">
          {/* ── 필터 바 ── */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b54e7]" />
              <input
                className="w-full bg-white border-2 border-[#c4b5fd] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#2f2d59] placeholder:text-[#7c769d] focus:outline-none focus:border-[#6b54e7] transition-all"
                placeholder="제목, 작가 검색"
                type="text"
                value={keyword}
                onChange={e => { setKeyword(e.target.value); setCurrentPage(1); }}
              />
              {keyword && (
                <button onClick={() => { setKeyword(""); setCurrentPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7c769d] hover:text-[#2f2d59]">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="relative" ref={sortDropdownRef}>
              <button
                type="button"
                onClick={() => setIsSortOpen(prev => !prev)}
                className="w-full sm:w-auto flex items-center justify-between gap-3 bg-white border-2 border-[#c4b5fd] rounded-xl pl-4 pr-3 py-2.5 text-sm text-[#2f2d59] hover:border-[#6b54e7] focus:outline-none transition-all cursor-pointer"
              >
                <span>{sortOptions.find(o => o.value === sortBy)?.label}</span>
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#6b54e7] shrink-0" />
              </button>

              {isSortOpen && (
                <div className="absolute right-0 mt-2 w-full bg-white border-2 border-[#c4b5fd] rounded-xl shadow-lg overflow-hidden z-20">
                  {sortOptions.map(o => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => { setSortBy(o.value); setCurrentPage(1); setIsSortOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${sortBy === o.value
                        ? "bg-[#6b54e7] text-white font-semibold"
                        : "text-[#2f2d59] hover:bg-[#f3f0ff]"
                        }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── 장르 탭 ── */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
            {bookTypeOptions.map(opt => (
              <button
                key={opt.label}
                onClick={() => { setSelectedBookType(opt.value); setCurrentPage(1); }}
                className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium border-2 transition-all duration-200 cursor-pointer ${selectedBookType === opt.value
                  ? "bg-[#6b54e7] text-white border-[#6b54e7] shadow-sm shadow-[#6b54e7]/20"
                  : "bg-white text-[#5c5480] border-[#c4b5fd] hover:border-[#6b54e7] hover:text-[#6b54e7]"
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* ── 책 그리드 ── */}
          {loading ? (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 border-4 border-[#6b54e7] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : books.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <BookOpen className="w-10 h-10 text-[#d4cdf2] mb-3" />
              <p className="text-[#7c769d] text-sm font-medium">검색 결과가 없습니다</p>
              <p className="text-[#b9b0dc] text-xs mt-1">다른 키워드나 장르를 시도해보세요</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
              {books.map(book => {
                const badge = genreBadge(book.bookType);
                return (
                  <div key={book.id} onClick={() => setViewingBook(mapBookForDetail(book, currentUser))} className="group cursor-pointer">
                    <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-sm border border-gray-200 group-hover:shadow-md group-hover:border-[#d4cdf2] transition-all duration-300 group-hover:-translate-y-1 bg-white">
                      <img
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        src={book.coverImageUrl}
                        alt={book.title}
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/75 via-transparent to-transparent" />
                      <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold border backdrop-blur-sm ${badge.cls}`}>
                        {badge.label}
                      </div>
                      <div className="absolute bottom-0 inset-x-0 p-3 text-left">
                        <h4 className="text-white text-[13px] font-semibold leading-tight line-clamp-2 mb-1.5">{book.title}</h4>
                        <div className="flex items-center gap-2.5 text-white/80 text-[10px]">
                          <button onClick={e => handleToggleLike(e, book.id)} className="flex items-center gap-1 hover:text-white transition cursor-pointer">
                            <Heart className={`w-3.5 h-3.5 ${book.isLikedByMe ? "fill-red-400 stroke-red-400" : ""}`} />
                            {book.likeCount >= 1000 ? `${(book.likeCount / 1000).toFixed(1)}k` : book.likeCount}
                          </button>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            {book.commentCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {(book.viewCount ?? 0) >= 1000 ? `${(book.viewCount / 1000).toFixed(1)}k` : (book.viewCount ?? 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/authors/${encodeURIComponent(book.author)}`); }}
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
                className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-[#c4b5fd] text-[#5c5480] hover:border-[#6b54e7] hover:text-[#6b54e7] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium border-2 transition-all cursor-pointer ${currentPage === p
                    ? "bg-[#6b54e7] text-white border-[#6b54e7] shadow-sm shadow-[#6b54e7]/30"
                    : "text-[#5c5480] border-[#c4b5fd] hover:border-[#6b54e7] hover:text-[#6b54e7]"
                    }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-[#c4b5fd] text-[#5c5480] hover:border-[#6b54e7] hover:text-[#6b54e7] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
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
