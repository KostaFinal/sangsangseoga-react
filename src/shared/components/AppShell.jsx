import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { getBooks, likeBook, unlikeBook, addBookmark, removeBookmark } from '../../api/bookApi';
import { useRequireAuth } from '../hooks/useRequireAuth';

const bookTypeToGenre = {
  "NOVEL": "소설", "POEM": "시", "ESSAY": "에세이", "FAIRY_TALE": "동화",
};

export function AppShell() {
  const [books, setBooks] = useState([]);
  const requireAuth = useRequireAuth();

  useEffect(() => {
    (async () => {
      try {
        const res = await getBooks({ size: 100 });
        const items = res.data?.data?.items || [];
        const mapped = items.map(b => ({
          ...b,
          coverImage: b.coverImageUrl,
          likes: b.likeCount,
          commentsCount: b.commentCount,
          genre: bookTypeToGenre[b.bookType] || b.bookType,
          comments: b.comments || [],
        }));
        setBooks(mapped);
      } catch (err) {
        console.error("책 목록 조회 실패", err);
      }
    })();
  }, []);

  const handleToggleLike = async (e, bookId) => {
    e.stopPropagation();
    if (!requireAuth()) return;
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
    setBooks(updated);
  };

  const handleToggleBookmark = async (e, bookId) => {
    e.stopPropagation();
    if (!requireAuth()) return;
    const book = books.find(b => b.id === bookId);
    try {
      if (book?.isBookmarkedByMe) {
        await removeBookmark(bookId);
      } else {
        // 목록/상세 화면에는 페이지 개념이 없으므로 책의 첫 페이지를 북마크 위치로 사용
        await addBookmark(bookId, 1);
      }
    } catch (err) {
      console.error("북마크 처리 실패", err);
    }
    const updated = books.map(b => (b.id === bookId ? { ...b, isBookmarkedByMe: !b.isBookmarkedByMe } : b));
    setBooks(updated);
  };

  return (
    <div className="relative min-h-screen selection:bg-black selection:text-white">
      <Header />
      <Outlet context={{ books, handleToggleLike, handleToggleBookmark }} />
    </div>
  );
}
