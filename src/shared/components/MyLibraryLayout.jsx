import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Outlet, useOutletContext } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import SideMenu from './SideMenu';
import { BookReaderView } from '../../features/library';
import { MainBookshelf, MyBookTab, FinishedTab, ReadingTab, WishlistTab, ReportHistoryTab, } from '../../features/bookshelf';
import { SavedAuthorTab } from '../../features/library';
import { ReviewWithAI } from '../../features/review';
import { BookCalendar } from '../../features/calendar';
import { BookStats } from '../../features/stats';
import BookMemoListModal from "../../features/library/components/BookMemoListModal";
import { mapBookPagesByGenre } from '../../features/library/utils/mapBookPages';
import { getBookGenreLabel } from '../utils/bookGenre';
import {
  getBookContents,
  getBookmark,
  addBookmark,
} from '../../api/bookApi';
import {
  getWishlist as getWishlistBookshelf,
  getReadingList as getReadingBookshelf,
  getFinishedList as getFinishedBookshelf,
  updateReadingProgress,
  completeReading,
  rereadBook as rereadFinishedBook,
  deleteWishlist as removeWishlistBook,
  getReadingStats,
  getMyWrittenBooks,
  updateMyWrittenBookStatus,
  updateMyWrittenBookDescription,
  deleteMyWrittenBook,
} from '../../api/myLibraryApi';

const resolveBookCategory = (book = {}) => getBookGenreLabel(book, '');


export function MyLibraryLayout() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [memoListBook, setMemoListBook] = useState(null);

  // Favorite Authors List State
  const [favoriteAuthors, setFavoriteAuthors] = useState([]);

  const loadMyLibraryBooks = async () => {
    try {
      const [wishlistRes, readingRes, finishedRes, myBooksRes] = await Promise.all([
        getWishlistBookshelf(),
        getReadingBookshelf(1, 20),
        getFinishedBookshelf(),
        getMyWrittenBooks(),
      ]);

      const wishlistData = wishlistRes.data.data || [];
      const readingData = readingRes.data?.data?.content || [];
      const finishedData = finishedRes.data.data || [];
      const myBooksData = myBooksRes.data?.data?.content || [];

      const wishlistBooks = Array.isArray(wishlistData)
        ? wishlistData.map(book => ({
          id: book.bookId,
          bookId: book.bookId,
          title: book.title,
          coverUrl: book.coverImageUrl || "/default-book-cover.png",
          category: resolveBookCategory(book),
          bookType: book.bookType,
          genre: book.bookType,
          description: book.description,
          author: "상상서가",
          progress: 0,
          currentPage: 1,
          pageCount: book.pageCount || 1,
          pages: book.pageCount || 1,
          isFavorite: true,
          totalViews: book.viewCount || 0,
          totalLikes: book.likeCount || 0,
          reviews: []
        }))
        : [];

      const readingBooks = Array.isArray(readingData)

        ? readingData.map(book => ({
          id: book.bookId,
          bookId: book.bookId,
          title: book.title,
          coverUrl: book.coverImageUrl || "/default-book-cover.png",
          category: resolveBookCategory(book),
          bookType: book.bookType,
          genre: book.bookType,
          description: book.description,
          author: "상상서가",
          progress: book.progress || 1,
          currentPage: book.currentPage || 1,
          pageCount: book.pageCount || 1,
          pages: book.pageCount || 1,
          readingStatus: book.readingStatus,
          recentReadAt: book.recentReadAt,
          readingTime: book.readingTime || 0,
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
          category: resolveBookCategory(book),
          bookType: book.bookType,
          genre: book.bookType,
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
          totalViews: book.viewCount || 0,
          totalLikes: book.likeCount || 0,
          reviews: [],
          readingStatus: book.readingStatus,
          rereadCount: book.rereadCount || 0
        }))
        : [];

      const myWrittenBooks = Array.isArray(myBooksData)
        ? myBooksData.map(book => ({
          id: book.bookId,
          bookId: book.bookId,
          title: book.title,
          coverUrl: book.coverImageUrl || "/default-book-cover.png",
          category: resolveBookCategory(book),
          bookType: book.bookType,
          genre: book.bookType,
          description: book.description,
          author: book.author || book.authorNickname || '',
          progress: 0,
          currentPage: 1,
          pageCount: book.pageCount || 1,
          pages: book.pageCount || 1,
          isFavorite: false,
          totalViews: book.viewCount || 0,
          totalLikes: book.likeCount || 0,
          reviews: [],
          status: book.status || "PUBLISHED",
          isPublic: book.status !== "HIDDEN",
          isMyWrittenBook: true
        }))
        : [];

      const mergedBooks = [
        ...wishlistBooks,
        ...finishedBooks,
        ...myWrittenBooks,
        ...readingBooks,
      ];

      const dedupedBookMap = mergedBooks.reduce((map, book) => {
        const key = String(book.bookId || book.id);
        const existingBook = map.get(key);

        map.set(key, {
          ...existingBook,
          ...book,
          category:
            resolveBookCategory(book) ||
            resolveBookCategory(existingBook),
          progress: Math.max(
            Number(existingBook?.progress) || 0,
            Number(book.progress) || 0
          ),
          isFavorite:
            Boolean(existingBook?.isFavorite) ||
            Boolean(book.isFavorite),
        });

        return map;
      }, new Map());

      const dedupedBooks = Array.from(dedupedBookMap.values());

      setBooks(dedupedBooks);
      return dedupedBooks;

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

  const handleProgressSave = async (
    bookId,
    currentPage,
    totalPages,
    readingTime = 0
  ) => {
    const safeTotalPages = Math.max(1, totalPages);

    const progress = Math.min(
      100,
      Math.max(
        0,
        Math.floor((currentPage / safeTotalPages) * 100)
      )
    );

    try {
      await updateReadingProgress(
        bookId,
        currentPage,
        progress,
        readingTime
      );

      setBooks(prev =>
        prev.map(book =>
          String(book.bookId || book.id) === String(bookId)
            ? {
              ...book,
              currentPage,
              progress,
              readingStatus: "READING",
              readingTime: (book.readingTime || 0) + readingTime,
              recentReadAt: new Date().toISOString(),
            }
            : book
        )
      );
    } catch (err) {
      console.error("이어 읽기 위치 저장 실패", err);
      throw err;
    }
  };

  const handleReadingBookmarkSave = async (
    bookId,
    currentPage,
    totalPages,
    readingTime = 0
  ) => {
    const safeTotalPages = Math.max(1, totalPages);

    const progress = Math.min(
      100,
      Math.max(
        0,
        Math.floor((currentPage / safeTotalPages) * 100)
      )
    );

    try {
      // 책당 북마크는 하나뿐이라, 이미 이 페이지에 북마크돼 있지 않을 때만 등록/이동한다
      // (서버가 addBookmark에서 알아서 기존 북마크를 이 페이지로 옮겨준다 - 같은 페이지에
      // 다시 등록하면 BOOKMARK_ALREADY_EXISTS로 거부하므로 그 경우만 걸러낸다).
      const bookmarkRes = await getBookmark(bookId);
      const bookmark = bookmarkRes.data?.data;

      if (!(bookmark?.isBookmarkedByMe && bookmark?.pageNo === currentPage)) {
        await addBookmark(bookId, currentPage);
      }

      // 북마크 페이지를 읽는 중 위치에도 반영
      await updateReadingProgress(
        bookId,
        currentPage,
        progress,
        readingTime
      );

      setBooks(prev =>
        prev.map(book =>
          String(book.bookId || book.id) === String(bookId)
            ? {
              ...book,
              currentPage,
              progress,
              readingStatus: "READING",
              readingTime: (book.readingTime || 0) + readingTime,
              recentReadAt: new Date().toISOString(),
            }
            : book
        )
      );
    } catch (err) {
      console.error("이어 읽기 책갈피 저장 실패", err);
      throw err;
    }
  };

  const handleReadingTimeSave = async (
    bookId,
    readingTime = 0
  ) => {
    if (!Number.isFinite(readingTime) || readingTime < 1) {
      return;
    }

    const targetBook = books.find(
      book => String(book.bookId || book.id) === String(bookId)
    );

    if (!targetBook) {
      return;
    }

    const currentPage = Math.max(
      1,
      Number(targetBook.currentPage) || 1
    );

    const totalPages = Math.max(
      1,
      Number(targetBook.pageCount) || 1
    );

    const progress = Math.min(
      100,
      Math.max(
        0,
        Math.floor((currentPage / totalPages) * 100)
      )
    );

    try {
      await updateReadingProgress(
        bookId,
        currentPage,
        progress,
        readingTime
      );

      setBooks(prev =>
        prev.map(book =>
          String(book.bookId || book.id) === String(bookId)
            ? {
              ...book,
              readingTime: (book.readingTime || 0) + readingTime,
              recentReadAt: new Date().toISOString(),
            }
            : book
        )
      );
    } catch (err) {
      console.error("독서 시간 저장 실패", err);
      throw err;
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

  const handleDeleteBook = async (bookId) => {
    try {
      await deleteMyWrittenBook(bookId);

      setBooks(prev =>
        prev.filter(
          book =>
            String(book.bookId || book.id) !== String(bookId)
        )
      );

      navigate("/library/all-books");
    } catch (err) {
      console.error(err);
      alert("책 삭제에 실패했습니다.");
      throw err;
    }
  };

  const handleOpenMemos = book => {
    setMemoListBook(book);
  };

  const handleCloseMemos = () => {
    setMemoListBook(null);
  };

  const handleSelectMemo = (book, pageNo) => {
    const targetBookId = book.bookId || book.id;

    setMemoListBook(null);

    navigate(`/library/read/${targetBookId}`, {
      state: {
        startPageKey: Number(pageNo),
      },
    });
  };

  const handleToggleFavorite = async (bookId) => {
    try {
      await removeWishlistBook(bookId);
      await loadMyLibraryBooks();
    } catch (err) {
      console.error(err);
      alert("삭제에 실패했습니다.");
    }
  };

  const handleLikeBook = (bookId) => {
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, totalLikes: b.totalLikes + 1 } : b));
  };

  const handleUpdateDescription = async (bookId, description) => {
    try {
      await updateMyWrittenBookDescription(bookId, description);

      setBooks(prev =>
        prev.map(book =>
          String(book.id) === String(bookId) ||
            String(book.bookId) === String(bookId)
            ? {
              ...book,
              description,
            }
            : book
        )
      );
    } catch (err) {
      console.error(err);
      alert("책 소개 수정에 실패했습니다.");
      throw err;
    }
  };

  const handleUpdateStatus = async (bookId, status) => {
    try {
      await updateMyWrittenBookStatus(bookId, status);

      setBooks(prev =>
        prev.map(book =>
          String(book.id) === String(bookId) ||
            String(book.bookId) === String(bookId)
            ? {
              ...book,
              status,
              isPublic: status === "PUBLISHED",
            }
            : book
        )
      );
    } catch (err) {
      console.error(err);
      alert("공개 여부 변경에 실패했습니다.");
      throw err;
    }
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
    books,
    filteredBooks,
    searchQuery,
    setSearchQuery,
    favoriteAuthors,
    setFavoriteAuthors,
    onOpenDetail,
    onOpenViewer: (bookId) => navigate(`/library/read/${bookId}`),
    onOpenMemos: handleOpenMemos,
    onStartWishReading: handleStartWishReading,
    onReread: handleRereadBook,
    onToggleFavorite: handleToggleFavorite,
    onUpdateBook: handleUpdateBook,
    onUpdateDescription: handleUpdateDescription,
    onUpdateStatus: handleUpdateStatus,
    onDeleteBook: handleDeleteBook,
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
            <Outlet context={{ ...outletContext, handleProgressSave, handleReadingBookmarkSave, handleCompleteReading, handleReadingTimeSave, handleLikeBook }} />
          </motion.div>
        </AnimatePresence>
      </main>
      <BookMemoListModal
        book={memoListBook}
        onClose={handleCloseMemos}
        onSelectMemo={handleSelectMemo}
      />
    </div>
  );
}

// 탭 컴포넌트들이 내부적으로 쓰는 tab id('saved-author' 등, 단수형)를 URL 세그먼트('saved-authors', 복수형)로 매핑
const TAB_ID_TO_PATH = { 'saved-author': 'saved-authors', 'reports': 'reports', };
const tabToLibraryPath = (tab) => `/library/${tab === 'bookshelf' ? '' : (TAB_ID_TO_PATH[tab] || tab)}`;

export function MyLibraryBookshelfRoute() {
  const navigate = useNavigate();
  return <MainBookshelf setActiveTab={(tab) => navigate(tabToLibraryPath(tab))} />;
}

export function MyLibraryWishlistRoute() {
  const {
    filteredBooks,
    onOpenDetail,
    onToggleFavorite,
    onStartWishReading
  } = useOutletContext();

  return (
    <WishlistTab
      filteredBooks={filteredBooks}
      onOpenDetail={onOpenDetail}
      onToggleFavorite={onToggleFavorite}
      onStartReading={onStartWishReading}
    />
  );
}
export function MyLibraryReadingRoute() {
  const {
    filteredBooks,
    onOpenDetail,
    onOpenViewer,
    onOpenMemos,
  } = useOutletContext();

  return (
    <ReadingTab
      filteredBooks={filteredBooks}
      onOpenViewer={onOpenViewer}
      onOpenDetail={onOpenDetail}
      onOpenMemos={onOpenMemos}
    />
  );
}

export function MyLibraryFinishedRoute() {
  const navigate = useNavigate();

  const {
    filteredBooks,
    onOpenDetail,
    onOpenViewer,
    onReread,
    onOpenMemos,
  } = useOutletContext();

  return (
    <FinishedTab
      filteredBooks={filteredBooks}
      onOpenViewer={onOpenViewer}
      onReread={onReread}
      onOpenMemos={onOpenMemos}
      setActiveTab={tab => navigate(tabToLibraryPath(tab))}
      onOpenDetail={onOpenDetail}
    />
  );
}

export function MyLibraryStatsRoute() {
  return <BookStats getReadingStats={getReadingStats} />;
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

  const {
    filteredBooks,
    onOpenViewer,
    onDeleteBook,
  } = useOutletContext();

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
      mode: "owner",
    };

    navigate(`/friends/${convertedBook.id}`, {
      state: { book: convertedBook },
    });
  };

  return (
    <MyBookTab
      filteredBooks={filteredBooks}
      onOpenViewer={onOpenViewer}
      onOpenDetail={onOpenDetail}
      onDeleteBook={onDeleteBook}
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

export function MyLibraryReportsRoute() {
  return <ReportHistoryTab />;
}

export function MyLibraryReaderRoute() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { books, handleProgressSave, handleReadingBookmarkSave, handleReadingTimeSave, handleCompleteReading } = useOutletContext();
  const [readerBook, setReaderBook] = useState(null);

  useEffect(() => {
    const book = books.find(b => String(b.id) === String(bookId));
    if (!book) return;

    (async () => {
      const res = await getBookContents(bookId);
      const pageItems = res.data.data.items || [];
      const viewerPages = mapBookPagesByGenre(book.bookType, pageItems);

      const finalPages =
        viewerPages.length > 0
          ? viewerPages
          : [
            {
              id: "page-empty",
              backgroundColor: "#ffffff",
              elements: [
                {
                  id: "text-empty",
                  type: "text",
                  x: 60,
                  y: 100,
                  w: 360,
                  h: 300,
                  html: "본문 준비 중입니다.",
                  fontSize: 18,
                },
              ],
            },
          ];

      const maxPageIndex = Math.max(0, finalPages.length - 1);

      const requestedPageKey = Number(location.state?.startPageKey);

      const hasRequestedPage =
        Number.isInteger(requestedPageKey) &&
        requestedPageKey >= 0;

      const startPageIndex = Math.min(
        Math.max(
          0,
          hasRequestedPage
            ? requestedPageKey
            : (book.currentPage || 1) - 1
        ),
        maxPageIndex
      );

      const currentPage = startPageIndex + 1;

      setReaderBook({
        ...book,
        genre: book.category,
        coverImage: book.coverUrl,
        likes: book.totalLikes || 0,
        comments: book.reviews || [],
        pages: finalPages,
        startPageIndex,
        currentPage,
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, books, location.state?.startPageKey,]);

  if (!readerBook) {
    return <div className="text-center py-20 text-sm text-[#7C769D]">불러오는 중...</div>;
  }




  return (
    <div className="fixed inset-0 z-50 bg-[#f3f0ff] overflow-y-auto animate-in fade-in duration-200">
      <BookReaderView
        key={`${readerBook.id}-${readerBook.startPageIndex}`}
        book={readerBook}
        onBack={() => navigate(-1)}
        onProgressSave={handleProgressSave}
        onReadingBookmarkSave={handleReadingBookmarkSave}
        onReadingTimeSave={handleReadingTimeSave}
        onCompleteReading={handleCompleteReading}
        onSelectRecommended={(book) => navigate(`/library/read/${book.id}`)}
        onExploreLibrary={() => navigate('/friends')}
      />
    </div>
  );
}
