import { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import BookReaderView from './BookReaderView';
import { getBook, getBookContents } from '../../../api/bookApi';
import { mapBookPagesByGenre } from '../utils/mapBookPages';

const EMPTY_PAGES = [
  {
    id: "page-empty",
    backgroundColor: "#ffffff",
    elements: [{ id: "text-empty", type: "text", x: 60, y: 100, w: 360, h: 300, htmlKo: "본문 준비 중입니다.", htmlEn: "본문 준비 중입니다.", fontSize: 18 }],
  },
];

const bookTypeToGenre = {
  "NOVEL": "소설", "POEM": "시", "ESSAY": "에세이", "FAIRY_TALE": "동화",
};

export default function BookReaderPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { books, handleToggleLike, handleToggleBookmark } = useOutletContext();
  const [fetchedBook, setFetchedBook] = useState(null);
  const [readerBook, setReaderBook] = useState(null);
  const book = books.find(b => String(b.id) === String(bookId)) || fetchedBook;

  // AppShell의 books는 최초 100권 스냅샷이라 그 밖의 책은 목록에 없을 수 있음 —
  // 없으면 직접 상세 조회로 폴백 (친구의 서재 검색/필터/페이지네이션 결과 등)
  useEffect(() => {
    setFetchedBook(null);
    if (books.find(b => String(b.id) === String(bookId))) return;
    (async () => {
      try {
        const res = await getBook(bookId);
        const full = res.data?.data;
        if (full) {
          setFetchedBook({
            ...full,
            coverImage: full.coverImageUrl,
            likes: full.likeCount,
            genre: bookTypeToGenre[full.bookType] || full.bookType,
          });
        }
      } catch (err) {
        console.error("책 정보 조회 실패", err);
      }
    })();
  }, [bookId, books]);

  useEffect(() => {
    setReaderBook(null);
    if (!book) return;

    (async () => {
      try {
        const res = await getBookContents(bookId);
        const pageItems = res.data?.data?.items || [];
        const pages = mapBookPagesByGenre(book.bookType, pageItems);
        setReaderBook({ ...book, pages: pages.length > 0 ? pages : EMPTY_PAGES });
      } catch (err) {
        console.error("책 본문 조회 실패", err);
        setReaderBook({ ...book, pages: EMPTY_PAGES });
      }
    })();
  }, [bookId, book]);

  if (!book) {
    return <div className="text-center py-20 text-sm text-[#7C769D]">책 정보를 불러오는 중입니다...</div>;
  }

  if (!readerBook) {
    return <div className="text-center py-20 text-sm text-[#7C769D]">본문을 불러오는 중입니다...</div>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#f3f0ff] overflow-y-auto animate-in fade-in duration-200">
      <BookReaderView
        key={readerBook.id}
        book={readerBook}
        books={books}
        onBack={() => { navigate(-1); document.body.style.overflow = "unset"; }}
        onToggleBookmark={e => handleToggleBookmark(e, readerBook.id)}
        onToggleLike={e => handleToggleLike(e, readerBook.id)}
        onSelectRecommended={b => navigate(`/books/${b.id}/read`)}
      />
    </div>
  );
}
