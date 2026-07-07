import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import BookReaderView from './BookReaderView';

export default function BookReaderPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { books, handleToggleLike, handleToggleBookmark } = useOutletContext();
  const book = books.find(b => String(b.id) === String(bookId));

  if (!book) {
    return <div className="text-center py-20 text-sm text-[#7C769D]">책 정보를 불러오는 중입니다...</div>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#f3f0ff] overflow-y-auto animate-in fade-in duration-200">
      <BookReaderView
        key={book.id}
        book={book}
        books={books}
        onBack={() => { navigate(-1); document.body.style.overflow = "unset"; }}
        onToggleBookmark={e => handleToggleBookmark(e, book.id)}
        onToggleLike={e => handleToggleLike(e, book.id)}
        onSelectRecommended={b => navigate(`/books/${b.id}/read`)}
      />
    </div>
  );
}
