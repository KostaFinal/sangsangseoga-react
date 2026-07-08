import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Outlet, useOutletContext } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import SideMenu from './SideMenu';
import { BookReaderView } from '../../features/library';
import { MainBookshelf, MyBookTab, FinishedTab, ReadingTab, WishlistTab } from '../../features/bookshelf';
import { SavedAuthorTab } from '../../features/library';
import { ReviewWithAI } from '../../features/review';
import { BookCalendar } from '../../features/calendar';
import { BookStats } from '../../features/stats';
import { getBookContents } from '../../api/bookApi';
import {
  getWishlist as getWishlistBookshelf,
  getReadingList as getReadingBookshelf,
  getFinishedList as getFinishedBookshelf,
  updateReadingProgress,
  completeReading,
  rereadBook as rereadFinishedBook,
  deleteWishlist as removeWishlistBook,
} from '../../api/myLibraryApi';

export function MyLibraryLayout() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Favorite Authors List State
  const [favoriteAuthors, setFavoriteAuthors] = useState([
    { id: '1', name: '김마법 작가', genre: '정통 판타지 대모험', likes: 1205, avatar: '🧙', works: '크리스탈 드래곤의 비밀 등', isFavorite: true },
    { id: '2', name: '이온정 쉐프작가', genre: '따스한 치유계 빵 소설', likes: 980, avatar: '🥐', works: '꿈꾸는 심야 빵집 등', isFavorite: true },
    { id: '3', name: '초록 그림작가', genre: '몽글몽글 구름 숲 수채화', likes: 1530, avatar: '🎨', works: '구름 숲의 고래, 숲속 요정들 등', isFavorite: true },
    { id: '4', name: '銀河水 우주작가', genre: '무한한 우주 공상 과학', likes: 712, avatar: '🐳', works: '별을 삼킨 고래 등', isFavorite: false },
    { id: '5', name: '동백 꽃작가', genre: '사계절 아름다운 자연 일화', likes: 854, avatar: '🌸', works: '구름 숲의 고래 등', isFavorite: false }
  ]);

  const loadMyLibraryBooks = async () => {
    try {
      const [wishlistRes, readingRes, finishedRes] = await Promise.all([
        getWishlistBookshelf(),
        getReadingBookshelf(),
        getFinishedBookshelf(),
      ]);

      const wishlistData = wishlistRes.data;
      const readingData = readingRes.data;
      const finishedData = finishedRes.data;

      const wishlistBooks = Array.isArray(wishlistData)
        ? wishlistData.map(book => ({
          id: book.bookId,
          bookId: book.bookId,
          title: book.title,
          coverUrl: book.coverImageUrl || "/default-book-cover.png",
          category: book.category,
          description: book.description,
          author: "상상서가",
          progress: 0,
          currentPage: 1,
          pageCount: book.pageCount || 1,
          pages: book.pageCount || 1,
          isFavorite: true,
          totalViews: 0,
          totalLikes: 0,
          reviews: []
        }))
        : [];

      const readingBooks = Array.isArray(readingData)
        ? readingData.map(book => ({
          id: book.bookId,
          bookId: book.bookId,
          title: book.title,
          coverUrl: book.coverImageUrl || "/default-book-cover.png",
          category: book.category,
          description: book.description,
          author: "상상서가",
          progress: book.progress || 1,
          currentPage: book.currentPage || 1,
          pageCount: book.pageCount || 1,
          pages: book.pageCount || 1,
          isFavorite: false,
          totalViews: 0,
          totalLikes: 0,
          reviews: []
        }))
        : [];

      const finishedBooks = Array.isArray(finishedData)
        ? finishedData.map(book => ({
          id: book.bookId,
          bookId: book.bookId,
          title: book.title,
          coverUrl: book.coverImageUrl || "/default-book-cover.png",
          category: book.category,
          description: book.description,
          author: "상상서가",
          progress: 100,
          currentPage: book.pageCount || 1,
          pageCount: book.pageCount || 1,
          pages: book.pageCount || 1,
          startedDate: book.startedAt,
          finishedDate: book.completedAt,
          completedAt: book.completedAt,
          readingTime: book.readingTime || 0,
          isFavorite: false,
          totalViews: 0,
          totalLikes: 0,
          reviews: [],
          readingStatus: book.readingStatus,
          rereadCount: book.rereadCount || 0
        }))
        : [];

      const mergedBooks = [
        ...wishlistBooks,
        ...readingBooks,
        ...finishedBooks
      ];

      setBooks(mergedBooks);
      return mergedBooks;
    } catch (error) {
      console.error("내 서재 데이터 불러오기 실패:", error);
      setBooks([]);
      return [];
    }
  };

  useEffect(() => {
    loadMyLibraryBooks();
  }, []);

  // AI 생성 동화책 꽂기 콜백
  const handleFairyTaleCreated = (newTale) => {
    const customId = `user_${Date.now()}`;
    const newBookObj = {
      id: customId,
      title: newTale.title,
      author: '지우와 상상 AI',
      illustrator: '상상서가 인공지능 화가',
      coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPVBWqLsCBgg8PJuoJJomJC3f8OSvgE89YHcxnMWKBy4wvRvL1cZQN6QDSbPrmqpA04kfaFL2WLamfw2T7ahBXAP-9D0-TGdKVb_uoubDPsJezesu4X-K9HiU_oKXf_tB7Hy4Bok0W0ay0YbQVSQ9fXyrxDGxFAOPnnFbdoS6IibG-20KBf-1LDX2uNBWVRt8IaSkxGr-5Ju6m1k8HKa6v72K1NKdKOODyRlIvMbFo9t1A9QzUF49YmARdMrheFQYF97bn-chMLXQr',
      category: newTale.category,
      rating: 5.0,
      description: '창작 작가가 직접 재배한 모험 키워드를 은하수 믹서기로 갈아 수놓은, 나만의 자서전 같은 멋진 일러스트 소설책이랍니다.',
      readingTime: '10분',
      magicLevel: 'Lv. 5',
      pages: 15,
      progress: 0,
      isPublic: true
    };
    setBooks(prev => [newBookObj, ...prev]);
  };

  const handleProgressSave = async (bookId, currentPage, totalPages) => {
    const progress = Math.floor((currentPage / totalPages) * 100);
    try {
      await updateReadingProgress(bookId, currentPage, progress);
      setBooks(prev => prev.map(book => (book.id === bookId ? { ...book, currentPage, progress } : book)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompleteReading = async (bookId) => {
    try {
      await completeReading(bookId);
      await loadMyLibraryBooks();
      navigate('/library/finished');
    } catch (e) {
      console.error(e);
    }
  };

  const handleRereadBook = async (bookId) => {
    try {
      await rereadFinishedBook(bookId);
      await loadMyLibraryBooks();
      navigate(`/library/read/${bookId}`);
    } catch (err) {
      console.error(err);
      alert("다시 읽기 처리에 실패했습니다.");
    }
  };

  const handleStartWishReading = async (bookId) => {
    try {
      await updateReadingProgress(bookId, 1, 1);
      await loadMyLibraryBooks();
      navigate(`/library/read/${bookId}`);
    } catch (err) {
      console.error(err);
      alert("읽기 시작 처리에 실패했습니다.");
    }
  };

  const handleUpdateBook = (updatedBook) => {
    setBooks((prev) => prev.map((b) => (b.id === updatedBook.id ? { ...b, ...updatedBook } : b)));
  };

  const handleToggleFavorite = async (bookId) => {
    try {
      await removeWishlistBook(bookId);
      setBooks(prev => prev.filter(b => b.id !== bookId));
    } catch (err) {
      console.error(err);
      alert("삭제에 실패했습니다.");
    }
  };

  const handleLikeBook = (bookId) => {
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, totalLikes: b.totalLikes + 1 } : b));
  };

  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onOpenDetail = (book) => {
    const convertedBook = {
      ...book,
      genre: book.category,
      coverImage: book.coverUrl,
      likes: book.totalLikes || 0,
      isLikedByMe: book.isLikedByMe || false,
      isBookmarked: book.isFavorite || false,
      comments: book.reviews || [],
      commentsCount: book.reviews?.length || 0,
    };
    navigate(`/friends/${convertedBook.id}`, { state: { book: convertedBook } });
  };

  const outletContext = {
    books, filteredBooks, searchQuery, setSearchQuery,
    favoriteAuthors, setFavoriteAuthors,
    onOpenDetail,
    onOpenViewer: (bookId) => navigate(`/library/read/${bookId}`),
    onReread: handleRereadBook,
    onToggleFavorite: handleToggleFavorite,
    onUpdateBook: handleUpdateBook,
    handleFairyTaleCreated,
  };

  const location = useLocation();
  const isReaderRoute = location.pathname.startsWith('/library/read/');

  return (
    <div className="min-h-screen pb-24 relative overflow-x-hidden md:overflow-visible bg-white text-navy-purple">
      <SideMenu disabled={isReaderRoute} />
      <main className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12 pt-24 bg-transparent text-navy-purple">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className="bg-transparent text-navy-purple"
          >
            <Outlet context={{ ...outletContext, handleProgressSave, handleCompleteReading, handleLikeBook }} />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// 탭 컴포넌트들이 내부적으로 쓰는 tab id('saved-author' 등, 단수형)를 URL 세그먼트('saved-authors', 복수형)로 매핑
const TAB_ID_TO_PATH = { 'saved-author': 'saved-authors' };
const tabToLibraryPath = (tab) => `/library/${tab === 'bookshelf' ? '' : (TAB_ID_TO_PATH[tab] || tab)}`;

export function MyLibraryBookshelfRoute() {
  const navigate = useNavigate();
  return <MainBookshelf setActiveTab={(tab) => navigate(tabToLibraryPath(tab))} />;
}

export function MyLibraryWishlistRoute() {
  const { filteredBooks, onOpenDetail, onToggleFavorite } = useOutletContext();
  return <WishlistTab filteredBooks={filteredBooks} onOpenDetail={onOpenDetail} onToggleFavorite={onToggleFavorite} />;
}

export function MyLibraryReadingRoute() {
  const { filteredBooks, onOpenDetail, onOpenViewer } = useOutletContext();
  return <ReadingTab filteredBooks={filteredBooks} onOpenViewer={onOpenViewer} onOpenDetail={onOpenDetail} />;
}

export function MyLibraryFinishedRoute() {
  const navigate = useNavigate();
  const { filteredBooks, onOpenDetail, onOpenViewer, onReread } = useOutletContext();
  return (
    <FinishedTab
      filteredBooks={filteredBooks}
      onOpenViewer={onOpenViewer}
      onReread={onReread}
      setActiveTab={(tab) => navigate(tabToLibraryPath(tab))}
      onOpenDetail={onOpenDetail}
    />
  );
}

export function MyLibraryStatsRoute() {
  const { books } = useOutletContext();
  return <BookStats books={books} />;
}

export function MyLibraryCalendarRoute() {
  const { books } = useOutletContext();
  return <BookCalendar books={books} />;
}

export function MyLibraryAiChatRoute() {
  const { handleFairyTaleCreated } = useOutletContext();
  return <ReviewWithAI onFairyTaleCreated={handleFairyTaleCreated} />;
}

export function MyLibraryAllBooksRoute() {
  const navigate = useNavigate();
  const { filteredBooks, onOpenViewer, onUpdateBook } = useOutletContext();
  const onOpenDetail = (book) => {
    const convertedBook = {
      ...book,
      genre: book.category,
      coverImage: book.coverUrl,
      likes: book.totalLikes || 0,
      isLikedByMe: book.isLikedByMe || false,
      isBookmarked: book.isFavorite || false,
      comments: book.reviews || [],
      commentsCount: book.reviews?.length || 0,
      mode: 'owner',
    };
    navigate(`/friends/${convertedBook.id}`, { state: { book: convertedBook } });
  };
  return (
    <MyBookTab
      filteredBooks={filteredBooks}
      onOpenViewer={onOpenViewer}
      setActiveTab={(tab) => navigate(tabToLibraryPath(tab))}
      onUpdateBook={onUpdateBook}
      onOpenDetail={onOpenDetail}
    />
  );
}

export function MyLibrarySavedAuthorsRoute() {
  const navigate = useNavigate();
  const { favoriteAuthors, setFavoriteAuthors } = useOutletContext();
  return (
    <SavedAuthorTab
      favoriteAuthors={favoriteAuthors}
      setFavoriteAuthors={setFavoriteAuthors}
      setActiveTab={(tab) => navigate(tabToLibraryPath(tab))}
      onSelectAuthor={(authorName) => navigate(`/authors/${encodeURIComponent(authorName)}`)}
      onOpenAuthorSearch={() => navigate('/authors')}
    />
  );
}

export function MyLibraryReaderRoute() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { books, handleProgressSave, handleCompleteReading, handleLikeBook, onToggleFavorite } = useOutletContext();
  const [readerBook, setReaderBook] = useState(null);

  useEffect(() => {
    const book = books.find(b => String(b.id) === String(bookId));
    if (!book) return;

    (async () => {
      const res = await getBookContents(bookId);
      const pageItems = res.data.data.items || [];
      const viewerPages = pageItems.map(page => ({
        id: `page-${page.pageNo}`,
        backgroundColor: "#ffffff",
        elements: [
          {
            id: `text-${page.pageNo}`,
            type: "text",
            x: 60, y: 80, w: 360, h: 260,
            fontSize: 18,
            lineHeight: 1.8,
            html: page.contentTextKo || page.contentTextEn || "",
          },
          ...(page.imageUrl ? [{
            id: `image-${page.pageNo}`,
            type: "image",
            x: 60, y: 370, w: 360, h: 180,
            src: page.imageUrl,
            radius: 12,
          }] : []),
        ],
      }));

      setReaderBook({
        ...book,
        genre: book.category,
        coverImage: book.coverUrl,
        likes: book.totalLikes || 0,
        comments: book.reviews || [],
        pages: viewerPages.length > 0 ? viewerPages : [
          {
            id: "page-empty",
            backgroundColor: "#ffffff",
            elements: [{ id: "text-empty", type: "text", x: 60, y: 100, w: 360, h: 300, html: "본문 준비 중입니다.", fontSize: 18 }],
          },
        ],
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, books]);

  if (!readerBook) {
    return <div className="text-center py-20 text-sm text-[#7C769D]">불러오는 중...</div>;
  }

  return (
    <BookReaderView
      key={readerBook.id}
      book={readerBook}
      books={books}
      onBack={() => navigate(-1)}
      onProgressSave={handleProgressSave}
      onCompleteReading={handleCompleteReading}
      onToggleBookmark={() => onToggleFavorite(readerBook.id)}
      onToggleLike={() => handleLikeBook(readerBook.id)}
      onSelectRecommended={(book) => navigate(`/library/read/${book.id}`)}
    />
  );
}
