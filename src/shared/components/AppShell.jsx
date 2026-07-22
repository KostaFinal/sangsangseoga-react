import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { ConfirmModal } from './ConfirmModal';
import { SubscriptionModal } from './SubscriptionModal';
import { getBooks, likeBook, unlikeBook, addBookmark, removeBookmark } from '../../api/bookApi';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useAuth } from '../context/AuthContext';

const bookTypeToGenre = {
  "NOVEL": "소설", "POEM": "시", "ESSAY": "에세이", "FAIRY_TALE": "동화",
};

// AI 생성 429 응답의 code별 안내 문구 — BE가 내려주는 두 가지 쿼터 초과 사유를 구분해서 보여준다.
const QUOTA_MODAL_CONTENT = {
  DAILY_QUOTA_EXCEEDED: {
    title: '오늘의 생성 한도 소진',
    message: '오늘의 AI 생성 한도를 모두 사용했어요. 한도는 매일 자정에 초기화돼요.',
    confirmText: '확인',
    showUpsell: false,
  },
  FREE_TRIAL_CALL_LIMIT_EXCEEDED: {
    title: '무료 체험 횟수 소진',
    message: '무료 체험 AI 생성 횟수를 모두 사용했어요. 프리미엄으로 구독하면 계속 이용할 수 있어요.',
    confirmText: '구독하러 가기',
    showUpsell: true,
  },
};

export function AppShell() {
  const [books, setBooks] = useState([]);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const requireAuth = useRequireAuth();
  const location = useLocation();
  const { quotaExceededCode, setQuotaExceededCode } = useAuth();
  const quotaModal = quotaExceededCode ? QUOTA_MODAL_CONTENT[quotaExceededCode] : null;
  const isReaderRoute = /^\/books\/[^/]+\/read$/.test(location.pathname)
    || /^\/library\/read\/[^/]+$/.test(location.pathname);

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
      {!isReaderRoute && <Header />}
      <Outlet context={{ books, handleToggleLike, handleToggleBookmark }} />
      <ConfirmModal
        isOpen={!!quotaModal}
        onClose={() => setQuotaExceededCode(null)}
        onConfirm={() => {
          if (quotaModal?.showUpsell) setShowSubscriptionModal(true);
        }}
        title={quotaModal?.title}
        message={quotaModal?.message}
        confirmText={quotaModal?.confirmText}
        cancelText="닫기"
        type="brand"
      />
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </div>
  );
}
