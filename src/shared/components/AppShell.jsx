import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { getBooks, likeBook, unlikeBook, addBookmark, removeBookmark } from '../../api/bookApi';

const bookTypeToGenre = {
  "NOVEL": "소설", "POEM": "시", "ESSAY": "에세이", "FAIRY_TALE": "동화",
};

export function AppShell() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const cachedBooks = localStorage.getItem("sangsang_books");
    if (cachedBooks) {
      try {
        setBooks(JSON.parse(cachedBooks));
        return;
      } catch (e) {
        // 캐시 파싱 실패 시 아래에서 API로 새로 조회
      }
    }

    (async () => {
      try {
        const res = await getBooks({ size: 100 });
        const items = res.data?.data?.items || [];
        const mapped = items.map(b => ({
          ...b,
          coverImage: b.coverImageUrl,
          likes: b.likeCount,
          commentsCount: b.commentCount,
          genre: bookTypeToGenre[b.genre] || b.genre,
          comments: b.comments || [],
        }));
        setBooks(mapped);
        localStorage.setItem("sangsang_books", JSON.stringify(mapped));
      } catch (err) {
        console.error("책 목록 조회 실패", err);
      }
    })();
  }, []);

  const saveBooksToStorage = updatedBooks => {
    setBooks(updatedBooks);
    localStorage.setItem("sangsang_books", JSON.stringify(updatedBooks));
  };

  const handleToggleLike = async (e, bookId) => {
    e.stopPropagation();
    const book = books.find(b => b.id === bookId);
    try {
      if (book?.isLikedByMe) {
        await unlikeBook(bookId);
      } else {
        await likeBook(bookId);
      }
    } catch (err) {
      console.error("좋아요 처리 실패", err);
    }
    const updated = books.map(b => {
      if (b.id === bookId) {
        const isLiked = !b.isLikedByMe;
        return { ...b, isLikedByMe: isLiked, likes: isLiked ? b.likes + 1 : b.likes - 1 };
      }
      return b;
    });
    saveBooksToStorage(updated);
  };

  const handleToggleBookmark = async (e, bookId) => {
    e.stopPropagation();
    const book = books.find(b => b.id === bookId);
    try {
      if (book?.isBookmarked) {
        await removeBookmark(bookId, 1);
      } else {
        await addBookmark(bookId, 1);
      }
    } catch (err) {
      console.error("북마크 처리 실패", err);
    }
    const updated = books.map(b => (b.id === bookId ? { ...b, isBookmarked: !b.isBookmarked } : b));
    saveBooksToStorage(updated);
  };

  return (
    <div className="relative min-h-screen selection:bg-black selection:text-white">
      <Header />
      <Outlet context={{ books, handleToggleLike, handleToggleBookmark }} />
    </div>
  );
}
