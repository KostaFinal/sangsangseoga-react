/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { AuthorProfileView, SearchAuthorView } from "./features/authors";
import { LoginView } from './features/auth/components/LoginView';
import { SignupView } from './features/auth/components/SignupView';
import { MainDashboard } from './features/dashboard/components/MainDashboard';
import { PaymentView } from './features/subscription/components/PaymentView';
import { SubscriptionView } from './features/subscription/components/SubscriptionView';
import { AdminView } from './features/admin/components/AdminView';
import { ProfileEditView } from './features/profile/components/ProfileEditView';
import { PasswordResetView } from './features/auth/components/PasswordResetView';
import { BookCreationRouter } from './features/bookCreation';
import { LEGACY_BOOK_CREATION_REDIRECTS } from './features/bookCreation/routes/MemberCreationRoutes';

import { SocialAuthGateway } from './features/auth/components/SocialAuthGateway';
import { GuardianConsentView } from './features/auth/components/GuardianConsentView';
import { AppShell } from './shared/components/AppShell';
import { AuthProvider, useAuth } from './shared/context/AuthContext';
import { ProtectedRoute, GuestOnlyRoute, AdminRoute } from './shared/routes/guards';
import { CommonShowcaseView } from './shared/components/CommonShowcaseView';
import { ErrorPage404 } from './shared/components/ErrorPage404';
import { ErrorPage500 } from './shared/components/ErrorPage500';
import FriendsLibraryView from './features/library/components/FriendsLibraryView';
import BookReaderPage from './features/library/components/BookReaderPage';
import {
  MyLibraryLayout,
  MyLibraryBookshelfRoute,
  MyLibraryWishlistRoute,
  MyLibraryReadingRoute,
  MyLibraryFinishedRoute,
  MyLibraryStatsRoute,
  MyLibraryCalendarRoute,
  MyLibraryAiChatRoute,
  MyLibraryAllBooksRoute,
  MyLibrarySavedAuthorsRoute,
  MyLibraryReaderRoute,
} from './shared/components/MyLibraryLayout';

function ForbiddenPanel() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="max-w-md mx-auto my-20 p-8 bg-white border border-neutral-200 rounded-2xl text-left shadow-2xl font-mono text-xs">
      <div className="flex items-center text-neutral-900 font-extrabold gap-2 text-sm mb-4 uppercase">
        <span className="w-2.5 h-2.5 rounded-full bg-black animate-pulse"></span>
        🚨 [403 Forbidden] Access Denied
      </div>
      <p className="text-neutral-900 font-black leading-relaxed mb-3">
        Spring Security 권한 부족 오류 (ACCESS_DENIED)
      </p>
      <div className="bg-neutral-950 text-neutral-300 p-4 leading-loose mb-5 rounded-xl font-sans text-[11px]">
        <p><span className="text-neutral-500">필요 권한 (Required):</span> <code className="text-white font-mono font-bold">ROLE_ADMIN</code></p>
        <p><span className="text-neutral-500">현재 계정 (Authenticated):</span> <span className="text-neutral-200">{currentUser.nickname} ({currentUser.email})</span></p>
        <p><span className="text-neutral-500">부여된 권한 (Granted Authority):</span> <span className="text-red-400 font-mono font-bold">{currentUser.role || 'NONE'}</span></p>
      </div>
      <p className="text-neutral-500 mb-6 font-sans text-[11.5px] leading-relaxed">
        해당 API 및 관리자 통제 패널은 최고 관리자 권한을 승인받은 세션만 인가용 토큰을 통해 접속할 수 있습니다. 메인 화면으로 귀가하시거나 어드민 전용 포털을 통해 로그인해 주십시오.
      </p>
      <div className="flex gap-2 font-sans">
        <button
          onClick={() => navigate('/')}
          className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-bold text-xs transition-all cursor-pointer"
        >
          메인 대시보드 대피
        </button>
        <button
          onClick={() => navigate('/login')}
          className="flex-1 py-3 bg-black hover:bg-neutral-900 text-white rounded-xl font-bold text-xs transition-all cursor-pointer"
        >
          기존 세션 로그아웃 후 어드민 로그인
        </button>
      </div>
    </div>
  );
}

function LoginRoute() {
  const navigate = useNavigate();
  const { setCurrentUser, setIsAuthenticated, refreshSubscriptionStatus, refreshUsage } = useAuth();
  return (
    <LoginView
      onSuccess={(userInfo) => {
        setCurrentUser(userInfo);
        setIsAuthenticated(true);
        refreshSubscriptionStatus();
        refreshUsage();
        navigate('/');
      }}
      onNavigateToSignup={() => navigate('/signup')}
      onNavigateToPasswordReset={() => navigate('/password-reset')}
      onNavigateToSocial={(provider) => navigate(`/login/social/${provider}`)}
    />
  );
}

function SignupRoute() {
  const navigate = useNavigate();
  const { setIsAuthenticated, refreshSubscriptionStatus, refreshUsage } = useAuth();
  return (
    <SignupView
      onSuccess={() => {
        setIsAuthenticated(true);
        refreshSubscriptionStatus();
        refreshUsage();
        navigate('/');
      }}
      onNavigateToLogin={() => navigate('/login')}
    />
  );
}

function SocialAuthRoute() {
  const navigate = useNavigate();
  const { provider } = useParams();
  const { setCurrentUser, setIsAuthenticated, refreshSubscriptionStatus, refreshUsage } = useAuth();
  return (
    <SocialAuthGateway
      selectedProvider={provider}
      onNavigateToLogin={() => navigate('/login')}
      onSuccess={() => {
        setCurrentUser({
          email: 'social.writer@sangsang.com',
          role: 'USER',
          nickname: '소셜 작가'
        });
        setIsAuthenticated(true);
        refreshSubscriptionStatus();
        refreshUsage();
        navigate('/');
      }}
    />
  );
}

function SubscriptionRoute() {
  const navigate = useNavigate();
  const { isPremium, isSubscriptionCanceled, benefitEndDate, currentPlanType, usage, refreshSubscriptionStatus, refreshUsage } = useAuth();
  return (
    <SubscriptionView
      onSelectPlan={(planType, price) => {
        navigate('/subscription/payment', { state: { subType: planType, price } });
      }}
      onNavigateHome={() => navigate('/')}
      onCancelSubscription={() => {
        refreshSubscriptionStatus();
        refreshUsage();
      }}
      onResumeSubscription={() => {
        refreshSubscriptionStatus();
        refreshUsage();
      }}
      onPlanChanged={() => {
        refreshSubscriptionStatus();
        refreshUsage();
      }}
      isPremium={isPremium}
      isSubscriptionCanceled={isSubscriptionCanceled}
      benefitEndDate={benefitEndDate}
      currentPlanType={currentPlanType}
      usage={usage}
    />
  );
}

function PaymentRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshSubscriptionStatus, refreshUsage } = useAuth();
  const paymentParams = location.state || { subType: 'monthly', price: 9900 };
  return (
    <PaymentView
      paymentParams={paymentParams}
      onPaymentSuccess={() => {
        refreshSubscriptionStatus();
        refreshUsage();
        navigate('/subscription');
      }}
      onNavigateBack={() => navigate('/subscription')}
    />
  );
}

function ProfileEditRoute() {
  const navigate = useNavigate();
  const { currentUser, isPremium, setCurrentUser, handleLogout: logoutFromServer } = useAuth();
  addWishlist,
  getWishlist,
  getReadingList,
  getFinishedList,
  updateReadingProgress,
  completeReading,
  rereadBook,
  deleteWishlist,
  getLastReadingPosition
} from './api/myLibraryApi';

const bookTypeToGenre = {
  "NOVEL": "소설", "POEM": "시", "ESSAY": "에세이", "FAIRY_TALE": "동화",
};

export default function App() {
  const [myLibraryKey, setMyLibraryKey] = useState(0);
  const [currentScreen, setCurrentScreen] = useState('login');
  const [previousScreen, setPreviousScreen] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showDevSwitcher, setShowDevSwitcher] = useState(true);
  const [selectedSocialProvider, setSelectedSocialProvider] = useState('google');
  const [currentUser, setCurrentUser] = useState({
    email: 'writer@sangsang.com',
    role: 'USER',
    nickname: '상상의작가',
    profileImage: CURRENT_USER_PROFILE
  });
  const [isSubscriptionCanceled, setIsSubscriptionCanceled] = useState(false); // 구독 해지 예약 신청 완료 여부
  const [benefitEndDate, setBenefitEndDate] = useState('2026.07.15');     // 해지 시 혜택 유지 종료 예정일

  const [paymentParams, setPaymentParams] = useState({
    subType: 'monthly',      // 'monthly' 또는 'yearly'
    price: 9900,
  });

  // --- Friends' Library & Authors State Management ---
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [authorProfileMode, setAuthorProfileMode] = useState("viewer");
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [viewingBook, setViewingBook] = useState(null);



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
          genre: bookTypeToGenre[b.bookType] || b.bookType,
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

  const viewingBookId = viewingBook?.id;
  const selectedBookId = selectedBook?.id;

  useEffect(() => {
    if (viewingBookId) {
      const updated = books.find(b => b.id === viewingBookId);
      if (updated) setViewingBook(prev => (!prev || prev.likes !== updated.likes || prev.comments.length !== updated.comments.length ? updated : prev));
    }
  }, [books, viewingBookId]);

  useEffect(() => {
    if (selectedBookId) {
      const updated = books.find(b => b.id === selectedBookId);
      if (updated) setSelectedBook(prev => (!prev || prev.likes !== updated.likes || prev.comments.length !== updated.comments.length ? updated : prev));
    }
  }, [books, selectedBookId]);

  const handleReaderProgressSave = async (bookId, currentPage, totalPages) => {
    const progress = Math.min(100, Math.max(1, Math.floor((currentPage / totalPages) * 100)));
    try {
      await updateReadingProgress(bookId, currentPage, progress);
    } catch (e) {
      console.error("진행률 저장 에러:", e);
    }
  };

  const handleReaderCompleteReading = async (bookId) => {
    try {
      await completeReading(bookId);
    } catch (e) {
      console.error("완독 처리 에러:", e);
    }
  };

  const handleToggleLike = async (e, bookId) => {
    e.stopPropagation();

    const book = books.find(b => b.id === bookId);

    try {
      if (book?.isLikedByMe) {
        await unlikeBook(bookId);
      } else {
        await likeBook(bookId);
        await addWishlist(bookId);
      }
    } catch (err) {
      console.error("좋아요/읽고 싶은 책 등록 실패", err);
      alert("좋아요 처리에 실패했습니다.");
      return;
    }

    const updated = books.map(b => {
      if (b.id === bookId) {
        const isLiked = !b.isLikedByMe;
        return {
          ...b,
          isLikedByMe: isLiked,
          likes: isLiked ? b.likes + 1 : b.likes - 1
        };
      }
      return b;
    });

    saveBooksToStorage(updated);

    if (selectedBook?.id === bookId) {
      setSelectedBook(updated.find(x => x.id === bookId));
    }

    if (viewingBook?.id === bookId) {
      setViewingBook(updated.find(x => x.id === bookId));
    }
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
    if (selectedBook?.id === bookId) setSelectedBook(updated.find(x => x.id === bookId));
  };

  const handleDeleteBook = (e, bookId) => {
    e.stopPropagation();
    if (window.confirm("이 책을 서재에서 영구히 삭제하시겠습니까?")) {
      const updated = books.filter(b => b.id !== bookId);
      saveBooksToStorage(updated);
      setSelectedBook(null);
    }
  };

  const handleDetailAddComment = async (bookId, authorName, textContent) => {
    try {
      await addComment(bookId, textContent);
    } catch (err) {
      console.error("댓글 작성 실패", err);
    }
    const newComment = {
      id: `comment-${Date.now()}`,
      user: authorName,
      text: textContent,
      date: new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\s/g, ""),
    };
    const updated = books.map(b => (b.id === bookId ? { ...b, comments: [newComment, ...b.comments], commentsCount: b.commentsCount + 1 } : b));
    saveBooksToStorage(updated);
    const updatedBook = updated.find(x => x.id === bookId);
    if (updatedBook) {
      setViewingBook(updatedBook);
      if (selectedBook?.id === bookId) setSelectedBook(updatedBook);
    }
  };

  const handleAddReply = async (bookId, parentCommentId, authorName, textContent) => {
    try {
      await addReply(parentCommentId, textContent);
    } catch (err) {
      console.error("답글 작성 실패", err);
    }
    const newReply = {
      id: `reply-${Date.now()}`,
      user: authorName,
      text: textContent,
      date: new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\s/g, ""),
    };
    const updated = books.map(b => {
      if (b.id !== bookId) return b;
      return { ...b, comments: b.comments.map(c => (c.id === parentCommentId ? { ...c, replies: [...(c.replies || []), newReply] } : c)) };
    });
    saveBooksToStorage(updated);
    const updatedBook = updated.find(x => x.id === bookId);
    if (updatedBook) {
      setViewingBook(updatedBook);
      if (selectedBook?.id === bookId) setSelectedBook(updatedBook);
    }
  };

  // 내 구독 상태 조회 (GET /api/subscriptions/me) — 로그인 상태일 때만 호출
  const [currentPlanType, setCurrentPlanType] = useState(null);
  const refreshSubscriptionStatus = async () => {
    if (!getAccessToken()) return;
    try {
      const sub = await subscriptionService.getMySubscription();
      setIsPremium(sub.isPremium);
      setIsSubscriptionCanceled(sub.isSubscriptionCanceled);
      setCurrentPlanType(sub.planType);
      if (sub.benefitEndDate) setBenefitEndDate(sub.benefitEndDate);
    } catch (err) {
      console.error("구독 상태 조회 실패", err);
    }
  };

  // 오늘 사용량 조회 (GET /api/usage/me) — Header의 실시간 사용량 배지에 사용
  const [usage, setUsage] = useState(null);
  const refreshUsage = async () => {
    if (!getAccessToken()) return;
    try {
      const data = await subscriptionService.getMyUsage();
      setUsage(data);
    } catch (err) {
      console.error("사용량 조회 실패", err);
    }
  };

  useEffect(() => {
    refreshSubscriptionStatus();
    refreshUsage();
  }, []);

  // 로그아웃: 백엔드 세션 종료(POST /api/auth/logout) 및 토큰 폐기 후 로컬 상태 초기화
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("로그아웃 처리 실패", err);
    }
    setIsPremium(false);
    setCurrentUser({
      email: 'writer@sangsang.com',
      role: 'USER',
      nickname: '상상의작가'
    });
    setCurrentScreen('login');
  };

  // Router dispatcher
  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return (
          <LoginView
            onSuccess={(userInfo) => {
              setCurrentUser(userInfo);
              refreshSubscriptionStatus();
              refreshUsage();
              setCurrentScreen('home');
            }}
            onNavigateToSignup={() => setCurrentScreen('signup')}
            onQuickNavigate={(screen) => {
              if (screen === 'admin') {
                setCurrentUser({
                  email: 'admin@sangsang.com',
                  role: 'ADMIN',
                  nickname: '상상관리팀장'
                });
              } else if (screen === 'home') {
                setCurrentUser({
                  email: 'writer@sangsang.com',
                  role: 'USER',
                  nickname: '상상의작가'
                });
              }
              setCurrentScreen(screen);
            }}
            onNavigateToPasswordReset={() => setCurrentScreen('password-reset')}
            onNavigateToSocial={(provider) => {
              setSelectedSocialProvider(provider);
              setCurrentScreen('social-auth');
            }}
          />
        );
      case 'social-auth':
        return (
          <SocialAuthGateway
            selectedProvider={selectedSocialProvider}
            onNavigateToLogin={() => setCurrentScreen('login')}
            onSuccess={() => {
              setCurrentUser({
                email: 'social.writer@sangsang.com',
                role: 'USER',
                nickname: '소셜 작가'
              });
              refreshSubscriptionStatus();
              refreshUsage();
              setCurrentScreen('home');
            }}
          />
        );
      case 'password-reset':
        return (
          <PasswordResetView
            onNavigateToLogin={() => setCurrentScreen('login')}
          />
        );
      case 'signup':
        return (
          <SignupView
            onSuccess={() => {
              refreshSubscriptionStatus();
              refreshUsage();
              setCurrentScreen('home');
            }}
            onNavigateToLogin={() => setCurrentScreen('login')}
          />
        );
      case 'home':
        return (
          <MainDashboard
            onNavigate={(view) => setCurrentScreen(view)}
            onLogout={handleLogout}
            setActiveTab={(tab) => {
              if (tab === 'friends') {
                setViewingBook(null);
                setPreviousScreen(null);
                setCurrentScreen('friends-library');
              } else if (tab === 'mylibrary') {
                setCurrentScreen('my-library');
              }
            }}
            isPremium={isPremium}
            isSubscriptionCanceled={isSubscriptionCanceled}
            usage={usage}
            setUsage={setUsage}
          />
        );
      case 'friends-library':
        return (
          <FriendsLibraryView
            viewingBook={viewingBook}
            setViewingBook={setViewingBook}
            setSelectedBook={setSelectedBook}
            previousScreen={previousScreen}
            setCurrentScreen={(screen) => {
              if (screen === "my-library") {
                setMyLibraryKey(prev => prev + 1);
              }
              setCurrentScreen(screen);
            }}
            setPreviousScreen={setPreviousScreen}
            setSelectedAuthor={setSelectedAuthor}
            setAuthorProfileMode={setAuthorProfileMode}
            handleToggleBookmark={handleToggleBookmark}
            currentUser={currentUser}
          />
        );
      case 'my-library':
        return (
          <MyLibraryApp key={myLibraryKey}
            setViewingBook={setViewingBook}
            setCurrentScreen={setCurrentScreen}
            setPreviousScreen={setPreviousScreen}
            setSelectedAuthor={setSelectedAuthor}
            setAuthorProfileMode={setAuthorProfileMode}
          />
        );
      case 'author-search':
        return (
          <motion.div
            key="authors"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="max-w-7xl mx-auto px-6 md:px-10 py-8"
          >
            {selectedAuthor ? (
              <AuthorProfileView
                authorName={selectedAuthor}
                allBooks={books}
                onSelectBook={b => { setViewingBook(b); setCurrentScreen("friends-library"); }}
                onBackToLibrary={() => setCurrentScreen("friends-library")}
                onBackToDirectory={() => setSelectedAuthor(null)}
                mode={authorProfileMode}
                currentUser={currentUser}
              />
            ) : (
              <SearchAuthorView onSelectAuthor={name => setSelectedAuthor(name)} />
            )}
          </motion.div>
        );
      case 'payment':
        return (
          <PaymentView
            paymentParams={paymentParams}
            onPaymentSuccess={() => {
              refreshSubscriptionStatus(); // 서버에 등록된 실제 구독 상태로 갱신
              refreshUsage(); // 플랜 변경으로 사용 한도도 바뀌므로 함께 갱신
              setCurrentScreen('subscription');
            }}
            onNavigateBack={() => setCurrentScreen('subscription')}
          />
        );
      case 'subscription':
        return (
          <SubscriptionView
            onSelectPlan={(planType, price) => {
              setPaymentParams({ subType: planType, price });
              setCurrentScreen('payment');
            }}
            onNavigateHome={() => setCurrentScreen('home')}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onCancelSubscription={() => {
              // 서버에 반영된 실제 해지 상태(isCanceled/benefitEndDate)로 갱신
              refreshSubscriptionStatus();
              refreshUsage();
            }}
            onResumeSubscription={() => {
              // 서버에 반영된 실제 해지 취소 상태로 갱신
              refreshSubscriptionStatus();
              refreshUsage();
            }}
            onPlanChanged={() => {
              // 요금제(월간↔연간) 변경 후 서버 값으로 갱신
              refreshSubscriptionStatus();
              refreshUsage();
            }}
            isPremium={isPremium}
            isSubscriptionCanceled={isSubscriptionCanceled}
            benefitEndDate={benefitEndDate}
            currentPlanType={currentPlanType}
            usage={usage}
          />
        );
      case 'admin':
        if (currentUser.role !== 'ADMIN') {
          return (
            <div className="max-w-md mx-auto my-20 p-8 bg-white border border-neutral-200 rounded-2xl text-left shadow-2xl font-mono text-xs">
              <div className="flex items-center text-neutral-900 font-extrabold gap-2 text-sm mb-4 uppercase">
                <span className="w-2.5 h-2.5 rounded-full bg-black animate-pulse"></span>
                🚨 [403 Forbidden] Access Denied
              </div>
              <p className="text-neutral-900 font-black leading-relaxed mb-3">
                Spring Security 권한 부족 오류 (ACCESS_DENIED)
              </p>
              <div className="bg-neutral-950 text-neutral-300 p-4 leading-loose mb-5 rounded-xl font-sans text-[11px]">
                <p><span className="text-neutral-500">필요 권한 (Required):</span> <code className="text-white font-mono font-bold">ROLE_ADMIN</code></p>
                <p><span className="text-neutral-500">현재 계정 (Authenticated):</span> <span className="text-neutral-200">{currentUser.nickname} ({currentUser.email})</span></p>
                <p><span className="text-neutral-500">부여된 권한 (Granted Authority):</span> <span className="text-red-400 font-mono font-bold">{currentUser.role || 'NONE'}</span></p>
              </div>
              <p className="text-neutral-500 mb-6 font-sans text-[11.5px] leading-relaxed">
                해당 API 및 관리자 통제 패널은 최고 관리자 권한을 승인받은 세션만 인가용 토큰을 통해 접속할 수 있습니다. 메인 화면으로 귀가하시거나 어드민 전용 포털을 통해 로그인해 주십시오.
              </p>
              <div className="flex gap-2 font-sans">
                <button
                  onClick={() => setCurrentScreen('home')}
                  className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  메인 대시보드 대피
                </button>
                <button
                  onClick={() => setCurrentScreen('login')}
                  className="flex-1 py-3 bg-black hover:bg-neutral-900 text-white rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  기존 세션 로그아웃 후 어드민 로그인
                </button>
              </div>
            </div>
          );
        }
        return (
          <AdminView
            onNavigateHome={() => setCurrentScreen('home')}
          />
        );
      case 'profile-edit':
        return (
          <ProfileEditView
            currentUser={{ ...currentUser, isSubscribed: isPremium }}
            onNavigateHome={() => setCurrentScreen('home')}
            onUpdateProfile={(updates) => setCurrentUser(prev => ({ ...prev, ...updates }))}
            onLogout={handleLogout}
          />
        );
      case 'common-showcase':
        return (
          <CommonShowcaseView
            onNavigate={(screen) => setCurrentScreen(screen)}
          />
        );
      case 'error404':
        return (
          <ErrorPage404
            onNavigateToHome={() => setCurrentScreen('home')}
          />
        );
      case 'error500':
        return (
          <ErrorPage500
            onReload={() => setCurrentScreen('common-showcase')}
          />
        );
      case 'create-poem':
        return <BookCreationRouter initialGenre="poem" />;
      case 'create-essay':
        return <BookCreationRouter initialGenre="essay" />;
      case 'create-nonfiction':
        return <BookCreationRouter initialGenre="nonfiction" />;
      case 'create-fairy-tale':
        return <BookCreationRouter initialGenre="fairy-tale" />;
      case 'create-novel':
        return <BookCreationRouter initialGenre="novel" />;
      default:
        return <div className="text-center py-20">알 수 없는 화면 요청입니다.</div>;
    }
  };

  return (
    <ProfileEditView
      currentUser={{ ...currentUser, isSubscribed: isPremium }}
      onNavigateHome={() => navigate('/')}
      onUpdateProfile={(updates) => setCurrentUser(prev => ({ ...prev, ...updates }))}
      onLogout={async () => { await logoutFromServer(); navigate('/login'); }}
    />
  );
}

function PasswordResetRoute() {
  const navigate = useNavigate();
  return <PasswordResetView onNavigateToLogin={() => navigate('/login')} />;
}

function ErrorPage404Route() {
  const navigate = useNavigate();
  return <ErrorPage404 onNavigateToHome={() => navigate('/')} />;
}

function ErrorPage500Route() {
  const navigate = useNavigate();
  return <ErrorPage500 onReload={() => navigate('/__dev/showcase')} />;
}

function CommonShowcaseRoute() {
  const navigate = useNavigate();
  return <CommonShowcaseView onNavigate={(screen) => navigate(`/${screen.replace('error', '')}`)} />;
}

function AppInner() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route element={<GuestOnlyRoute />}>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/signup" element={<SignupRoute />} />
          <Route path="/password-reset" element={<PasswordResetRoute />} />
          <Route path="/login/social/:provider" element={<SocialAuthRoute />} />
        </Route>

        {/* 이메일 링크로 접근 — 로그인 여부와 무관하게 토큰 자체가 자격증명 */}
        <Route path="/guardian-consent/:consentId" element={<GuardianConsentView />} />

        <Route element={<ProtectedRoute />}>
          <Route index element={<MainDashboard />} />
          <Route path="friends" element={<FriendsLibraryView />} />
          <Route path="friends/:bookId" element={<FriendsLibraryView />} />
          <Route path="authors" element={<SearchAuthorView />} />
          <Route path="authors/:authorName" element={<AuthorProfileView />} />
          <Route path="books/:bookId/read" element={<BookReaderPage />} />

          <Route path="library" element={<MyLibraryLayout />}>
            <Route index element={<MyLibraryBookshelfRoute />} />
            <Route path="all-books" element={<MyLibraryAllBooksRoute />} />
            <Route path="reading" element={<MyLibraryReadingRoute />} />
            <Route path="finished" element={<MyLibraryFinishedRoute />} />
            <Route path="wishlist" element={<MyLibraryWishlistRoute />} />
            <Route path="saved-authors" element={<MyLibrarySavedAuthorsRoute />} />
            <Route path="stats" element={<MyLibraryStatsRoute />} />
            <Route path="calendar" element={<MyLibraryCalendarRoute />} />
            <Route path="ai-chat" element={<MyLibraryAiChatRoute />} />
            <Route path="read/:bookId" element={<MyLibraryReaderRoute />} />
          </Route>

          <Route path="subscription" element={<SubscriptionRoute />} />
          <Route path="subscription/payment" element={<PaymentRoute />} />
          <Route path="profile/edit" element={<ProfileEditRoute />} />

          <Route path="create/poem" element={<BookCreationRouter key="poem" initialGenre="poem" />} />
          <Route path="create/essay" element={<BookCreationRouter key="essay" initialGenre="essay" />} />
          <Route path="create/nonfiction" element={<BookCreationRouter key="nonfiction" initialGenre="nonfiction" />} />
          <Route path="create/fairy-tale/*" element={<BookCreationRouter key="fairy-tale" initialGenre="fairy-tale" />} />
          <Route path="create/novel/*" element={<BookCreationRouter key="novel" initialGenre="novel" />} />
          {LEGACY_BOOK_CREATION_REDIRECTS.map(({ path, to }) => (
            <Route key={path} path={path} element={<Navigate to={to} replace />} />
          ))}

          <Route element={<AdminRoute forbidden={<ForbiddenPanel />} />}>
            <Route path="admin" element={<AdminView initialTab="member" />} />
            <Route path="admin/members" element={<AdminView initialTab="member" />} />
            <Route path="admin/reports" element={<AdminView initialTab="reports" />} />
            <Route path="admin/tokens" element={<AdminView initialTab="tokens" />} />
          </Route>
        </Route>

        <Route path="404" element={<ErrorPage404Route />} />
        <Route path="500" element={<ErrorPage500Route />} />
        {import.meta.env.DEV && <Route path="__dev/showcase" element={<CommonShowcaseRoute />} />}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
    <NavigationContext.Provider value={{
      currentScreen,
      currentUser: { ...currentUser, isSubscribed: isPremium },
      usage,
      onNavigate: (screen) => setCurrentScreen(screen),
      onLogout: handleLogout
    }}>
      <div className="relative min-h-screen selection:bg-black selection:text-white">

        {/* 1. Global Common Header standard */}
        <Header
          key={currentScreen}
          currentScreen={currentScreen}
          currentUser={{ ...currentUser, isSubscribed: isPremium }}
          usage={usage}
          onNavigate={(screen) => {
            if (screen === 'my-library') {
              setMyLibraryKey(prev => prev + 1);
            }
            if (screen === 'friends-library') {
              setViewingBook(null);
              setPreviousScreen(null);
            }
            if (screen === 'author-search') {
              setSelectedAuthor(null);
            }
            setCurrentScreen(screen)
          }
          }
          onLogout={handleLogout}
        />

        {/* Route Switch container with smooth fade effects */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="min-h-screen"
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>

        {/* ── 리더 오버레이 ── */}
        <AnimatePresence>
          {selectedBook && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#f3f0ff] overflow-y-auto animate-in fade-in duration-200"
            >
              <BookReaderView
                key={selectedBook.id}
                book={selectedBook}
                books={books}
                onBack={() => { setSelectedBook(null); document.body.style.overflow = "unset"; }}
                onProgressSave={handleReaderProgressSave}
                onCompleteReading={handleReaderCompleteReading}
                onExploreLibrary={() => { setSelectedBook(null); document.body.style.overflow = "unset"; setCurrentScreen('friends-library'); }}
                onToggleBookmark={e => handleToggleBookmark(e, selectedBook.id)}
                onToggleLike={e => handleToggleLike(e, selectedBook.id)}
                onSelectRecommended={async (rec) => {
                  setSelectedBook(null);
                  document.body.style.overflow = "unset";
                  try {
                    const res = await getBook(rec.id);
                    const full = res.data?.data;
                    if (full) {
                      setViewingBook({
                        ...full,
                        coverImage: full.coverImageUrl,
                        likes: full.likeCount,
                        commentsCount: full.commentCount,
                        genre: bookTypeToGenre[full.bookType] || full.bookType,
                        comments: full.comments || [],
                        pages: full.pages || [],
                        mode: currentUser?.memberId && full.authorId && String(currentUser.memberId) === String(full.authorId) ? "owner" : "viewer",
                      });
                    }
                  } catch (err) {
                    console.error("추천 도서 조회 실패", err);
                  }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </NavigationContext.Provider>
  );
}

function MyLibraryApp({ setViewingBook,
  setCurrentScreen,
  setPreviousScreen,
  setSelectedAuthor,
  setAuthorProfileMode }) {
  const initialBooks = myLibraryInitialBooks;
  const [activeTab, setActiveTab] = useState('bookshelf');
  const [books, setBooks] = useState([]);

  const getAuthHeaders = () => {
    const accessToken = localStorage.getItem("sangsang_access_token");

    return {
      Authorization: `Bearer ${accessToken}`,
    };
  };

  const handleProgressSave = async (bookId, currentPage, totalPages) => {
    const progress = Math.min(
      100,
      Math.max(1, Math.floor((currentPage / totalPages) * 100))
    );

    console.log("PATCH 요청", {
      bookId,
      currentPage,
      totalPages,
      progress,
    });

    try {
      await updateReadingProgress(bookId, currentPage, progress);
      await loadMyLibraryBooks();

      console.log("PATCH 성공");

    } catch (e) {
      console.error("진행률 저장 에러:", e);
      console.error("PATCH 실패", e);
    }

  };

  const handleCompleteReading = async (bookId) => {
    try {
      await completeReading(bookId);

      await loadMyLibraryBooks();

      setSelectedReaderBook(null);
      setActiveTab("finished");
    } catch (e) {
      console.error("완독 처리 에러:", e);
    }
  };

  const loadMyLibraryBooks = async () => {
    try {
      const [wishlistRes, readingRes, finishedRes] = await Promise.all([
        getWishlist(),
        getReadingList(),
        getFinishedList(),
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
          bookType: book.bookType,
          genre: book.bookType,
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
          bookType: book.bookType,
          genre: book.bookType,
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

  const [searchQuery, setSearchQuery] = useState('');

  // Active Viewer state
  const [selectedReaderBook, setSelectedReaderBook] = useState(null);


  // Favorite Authors List State
  const [favoriteAuthors, setFavoriteAuthors] = useState([
    { id: '1', name: '김마법 작가', genre: '정통 판타지 대모험', likes: 1205, avatar: '🧙', works: '크리스탈 드래곤의 비밀 등', isFavorite: true },
    { id: '2', name: '이온정 쉐프작가', genre: '따스한 치유계 빵 소설', likes: 980, avatar: '🥐', works: '꿈꾸는 심야 빵집 등', isFavorite: true },
    { id: '3', name: '초록 그림작가', genre: '몽글몽글 구름 숲 수채화', likes: 1530, avatar: '🎨', works: '구름 숲의 고래, 숲속 요정들 등', isFavorite: true },
    { id: '4', name: '銀河水 우주작가', genre: '무한한 우주 공상 과학', likes: 712, avatar: '🐳', works: '별을 삼킨 고래 등', isFavorite: false },
    { id: '5', name: '동백 꽃작가', genre: '사계절 아름다운 자연 일화', likes: 854, avatar: '🌸', works: '구름 숲의 고래 등', isFavorite: false }
  ]);

  // AI 생성 동화책 꽂기 콜백
  const handleFairyTaleCreated = (newTale) => {
    const customId = `user_${Date.now()}`;

    // 1. 책 목록 데이터에 추가
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

  const handleOpenViewer = async (bookId, currentBooks = books) => {
    const book = currentBooks.find(b => b.id === bookId);
    if (!book) return;

    const [res, lastPosition] = await Promise.all([
      fetch(`http://localhost:8080/api/books/${bookId}/contents`),
      getLastReadingPosition(bookId).then(r => r.data).catch(() => null),
    ]);
    const json = await res.json();

    const startPageIndex = lastPosition?.currentPage ? Math.max(0, lastPosition.currentPage - 1) : 0;

    const pageItems = json.data.items || [];

    const viewerPages = pageItems.map(page => ({
      id: `page-${page.pageNo}`,
      backgroundColor: "#ffffff",
      elements: [
        {
          id: `text-${page.pageNo}`,
          type: "text",
          x: 60,
          y: 80,
          w: 360,
          h: 260,
          fontSize: 18,
          lineHeight: 1.8,
          htmlKo: page.contentTextKo || page.contentTextEn || "",
          htmlEn: page.contentTextEn || page.contentTextKo || ""
        },
        ...(page.imageUrl ? [{
          id: `image-${page.pageNo}`,
          type: "image",
          x: 60,
          y: 370,
          w: 360,
          h: 180,
          src: page.imageUrl,
          radius: 12
        }] : [])
      ]
    }));



    setSelectedReaderBook({
      ...book,
      genre: book.bookType,
      coverImage: book.coverUrl,
      likes: book.totalLikes || 0,
      comments: book.reviews || [],
      startPageIndex,
      pages: viewerPages.length > 0 ? viewerPages : [
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
              fontSize: 18
            }
          ]
        }
      ]
    });
  };

  const handleRereadBook = async (bookId) => {
    try {
      await rereadBook(bookId);

      const updatedBooks = await loadMyLibraryBooks();

      await handleOpenViewer(bookId, updatedBooks);
    } catch (err) {
      console.error(err);
      alert("다시 읽기 처리에 실패했습니다.");
    }
  };

  const handleStartWishReading = async (bookId) => {
    try {
      await updateReadingProgress(bookId, 1, 1);

      const updatedBooks = await loadMyLibraryBooks();

      setActiveTab("reading");

      await handleOpenViewer(bookId, updatedBooks);
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
      await deleteWishlist(bookId);

      setBooks(prev => prev.filter(b => b.id !== bookId));
    } catch (err) {
      console.error(err);
      alert("삭제에 실패했습니다.");
    }
  };

  const handleLikeBook = (bookId) => {
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, totalLikes: b.totalLikes + 1 } : b));
  };

  const handleAddReview = (bookId, review) => {
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, reviews: [...b.reviews, { id: Date.now(), ...review }] } : b));
  };

  const handleUpdateReview = (bookId, reviewId, comment) => {
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, reviews: b.reviews.map(r => r.id === reviewId ? { ...r, comment } : r) } : b));
  };

  const handleDeleteReview = (bookId, reviewId) => {
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, reviews: b.reviews.filter(r => r.id !== reviewId) } : b));
  };

  const handleReportReview = (bookId, reviewId) => {
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, reviews: b.reviews.filter(r => r.id !== reviewId) } : b));
  };

  const filteredBooks = books.filter(b =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
    <div className="min-h-screen pb-24 relative overflow-x-hidden md:overflow-visible bg-white text-navy-purple">
      {/* Floating sliding Sidebar Navigation Bookmarks */}
      <SideMenu activeTab={activeTab} setActiveTab={setActiveTab} disabled={selectedReaderBook !== null} />

      {/* Outer wrapper container */}
      <main className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12 pt-24 bg-transparent text-navy-purple">

        {/* Dynamic Reader Book Viewer - Absolute Priority Overlay */}
        {selectedReaderBook ? (
          <BookReaderView
            book={selectedReaderBook}
            books={books}
            onBack={() => setSelectedReaderBook(null)}
            onProgressSave={handleProgressSave}
            onCompleteReading={handleCompleteReading}
            onExploreLibrary={() => { setSelectedReaderBook(null); setCurrentScreen('friends-library'); }}
            onToggleBookmark={() => handleToggleFavorite(selectedReaderBook.id)}
            onToggleLike={() => handleLikeBook(selectedReaderBook.id)}
            onSelectRecommended={(book) => {
              setSelectedReaderBook(book);
            }}
          />

        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="bg-transparent text-navy-purple"
            >
              {activeTab === 'bookshelf' && (
                <MainBookshelf
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'wishlist' && (
                <WishlistTab
                  filteredBooks={filteredBooks}
                  onStartReading={handleStartWishReading}
                  onOpenDetail={(book) => {
                    const convertedBook = {
                      ...book,
                      genre: book.bookType,
                      coverImage: book.coverUrl,
                      likes: book.totalLikes || 0,
                      isLikedByMe: book.isLikedByMe || false,
                      isBookmarked: book.isFavorite || false,
                      comments: book.reviews || [],
                      commentsCount: book.reviews?.length || 0
                    };

                    setPreviousScreen('my-library');
                    setViewingBook(convertedBook);
                    setCurrentScreen('friends-library');
                  }}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}

              {activeTab === 'reading' && (
                <ReadingTab
                  filteredBooks={filteredBooks}
                  onOpenViewer={handleOpenViewer}
                  onOpenDetail={(book) => {
                    const convertedBook = {
                      ...book,
                      genre: book.bookType,
                      coverImage: book.coverUrl,
                      likes: book.totalLikes || 0,
                      isLikedByMe: book.isLikedByMe || false,
                      isBookmarked: book.isFavorite || false,
                      comments: book.reviews || [],
                      commentsCount: book.reviews?.length || 0
                    };

                    setPreviousScreen('my-library');
                    setViewingBook(convertedBook);
                    setCurrentScreen('friends-library');
                  }}
                />
              )}

              {activeTab === 'finished' && (
                <FinishedTab
                  filteredBooks={filteredBooks}
                  onOpenViewer={handleOpenViewer}
                  onReread={handleRereadBook}
                  setActiveTab={setActiveTab}
                  onOpenDetail={(book) => {
                    const convertedBook = {
                      ...book,
                      genre: book.bookType,
                      coverImage: book.coverUrl,
                      likes: book.totalLikes || 0,
                      isLikedByMe: book.isLikedByMe || false,
                      isBookmarked: book.isFavorite || false,
                      comments: book.reviews || [],
                      commentsCount: book.reviews?.length || 0
                    };

                    setPreviousScreen('my-library');
                    setViewingBook(convertedBook);
                    setCurrentScreen('friends-library');
                  }}
                />
              )}

              {activeTab === 'stats' && (
                <BookStats books={books} />
              )}

              {activeTab === 'calendar' && (
                <BookCalendar books={books} />
              )}

              {activeTab === 'ai-chat' && (
                <ReviewWithAI onFairyTaleCreated={handleFairyTaleCreated} />
              )}

              {activeTab === 'all-books' && (
                <MyBookTab
                  filteredBooks={filteredBooks}
                  onOpenViewer={handleOpenViewer}
                  setActiveTab={setActiveTab}
                  onUpdateBook={handleUpdateBook}
                  onOpenDetail={(book) => {
                    const convertedBook = {
                      ...book,
                      genre: book.bookType,
                      coverImage: book.coverUrl,
                      likes: book.totalLikes || 0,
                      isLikedByMe: book.isLikedByMe || false,
                      isBookmarked: book.isFavorite || false,
                      comments: book.reviews || [],
                      commentsCount: book.reviews?.length || 0,
                      mode: 'owner'
                    };

                    setPreviousScreen('my-library');
                    setViewingBook(convertedBook);
                    setCurrentScreen('friends-library');
                  }}
                />
              )}

              {activeTab === 'saved-author' && (
                <SavedAuthorTab
                  favoriteAuthors={favoriteAuthors}
                  setFavoriteAuthors={setFavoriteAuthors}
                  setActiveTab={setActiveTab}
                  onSelectAuthor={(authorName) => {
                    setSelectedAuthor(authorName);
                    setAuthorProfileMode("viewer");
                    setCurrentScreen("author-search");
                  }}
                  onOpenAuthorSearch={() => {
                    setSelectedAuthor(null);
                    setAuthorProfileMode("viewer");
                    setCurrentScreen("author-search");
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}

      </main>
    </div>
  );
}
