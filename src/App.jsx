/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search, BookOpen, Heart, MessageSquare, Bookmark, ChevronLeft, ChevronRight, X, History, Trash2, SlidersHorizontal, HelpCircle } from "lucide-react";
import { initialBooks, BookDetailView, BookReaderView } from "./features/library";
import { AuthorProfileView, SearchAuthorView } from "./features/authors";
import { LoginView } from './features/auth/components/LoginView';
import { SignupView } from './features/auth/components/SignupView';
import { MainDashboard } from './features/dashboard/components/MainDashboard';
import { PricingView } from './features/subscription/components/PricingView';
import { PaymentView } from './features/subscription/components/PaymentView';
import { SubscriptionView } from './features/subscription/components/SubscriptionView';
import { AdminView } from './features/admin/components/AdminView';
import { ProfileEditView } from './features/profile/components/ProfileEditView';
import { PasswordResetView } from './features/auth/components/PasswordResetView';
import { NotificationsView } from './features/dashboard/components/NotificationsView';
import { BookCreationRouter } from './features/bookCreation';

import { SocialAuthGateway } from './features/auth/components/SocialAuthGateway';
import { Header, NavigationContext } from './shared/components/Header';
import { CommonShowcaseView } from './shared/components/CommonShowcaseView';
import { ErrorPage404 } from './shared/components/ErrorPage404';
import { ErrorPage500 } from './shared/components/ErrorPage500';
import { CURRENT_USER_PROFILE } from './shared/data';
import SideMenu from './shared/components/SideMenu';
import { MainBookshelf, MyBookTab, FinishedTab, ReadingTab, WishlistTab, BookCreationTab } from './features/bookshelf';
import { BookViewer } from './features/viewer';
import { ReviewWithAI } from './features/review';
import { BookCalendar } from './features/calendar';
import { BookStats } from './features/stats';
import { SavedAuthorTab } from './features/library';
import { initialBooks as myLibraryInitialBooks, bookContents as myLibraryBookContents } from './data.js';

export default function App() {
  const [myLibraryKey, setMyLibraryKey] = useState(0);
  const [currentScreen, setCurrentScreen] = useState('login');
  const [previousScreen, setPreviousScreen] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showDevSwitcher, setShowDevSwitcher] = useState(true);
  const [selectedSocialProvider, setSelectedSocialProvider] = useState('google');
  const [notifications, setNotifications] = useState([
    { id: 1, text: '신규 도서가 등록되었습니다.', time: '10분 전', read: false },
    { id: 2, text: '회원님의 도서가 신고되었습니다.', time: '1시간 전', read: false }
  ]);
  const [currentUser, setCurrentUser] = useState({
    email: 'writer@sangsang.com',
    role: 'USER',
    nickname: '상상의작가',
    profileImage: CURRENT_USER_PROFILE
  });

  // --- New Subscription & Token Limits State Management (2026-06-19 한국어 요구사항 완벽 준수) ---
  const [freeTrialRemaining, setFreeTrialRemaining] = useState(1);       // 가입 시 지급된 무료 체험 1회 (1 = 사용 가능, 0 = 소진)
  const [freeTrialTextTokens, setFreeTrialTextTokens] = useState(250);     // 텍스트 호출 누적 토큰 점수 (절대캡: 1000)
  const [freeTrialImageCount, setFreeTrialImageCount] = useState(1);      // 이미지 생성 누적 장수 (절대캡: 3장)

  const [extraCreditsRemaining, setExtraCreditsRemaining] = useState(0);  // 유료 추가 생성권 잔여 개수 (단건 결제 상품)

  const [dailyScore, setDailyScore] = useState(2400);                     // 오늘 사용한 환산 토큰 점수 (소프트캡: 5000)
  const [dailyTextTokens, setDailyTextTokens] = useState(1200);           // 오늘 실제 사용 텍스트 토큰수
  const [dailyImageCount, setDailyImageCount] = useState(1);              // 오늘 실제 생성 이미지수
  const [isSubscriptionCanceled, setIsSubscriptionCanceled] = useState(false); // 구독 해지 예약 신청 완료 여부
  const [benefitEndDate, setBenefitEndDate] = useState('2026.07.15');     // 해지 시 혜택 유지 종료 예정일

  const [paymentParams, setPaymentParams] = useState({
    type: 'subscription',    // 'subscription' (정기 결제) 또는 'credits' (단건 추가 생성권)
    subType: 'monthly',      // 'monthly' 또는 'yearly'
    price: 9900,
    creditsCount: 50
  });

  // --- Friends' Library & Authors State Management ---
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  const [authorProfileMode, setAuthorProfileMode] = useState("viewer");
  const [books, setBooks] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("전체");
  const [sortBy, setSortBy] = useState("최신순");
  const [searchFocused, setSearchFocused] = useState(false);
  const [actualQuery, setActualQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [selectedBook, setSelectedBook] = useState(null);
  const [viewingBook, setViewingBook] = useState(null);

  useEffect(() => {
    const cachedBooks = localStorage.getItem("sangsang_books");
    if (cachedBooks) {
      try {
        const parsed = JSON.parse(cachedBooks);
        const parsedIds = new Set(parsed.map(b => b.id));
        const missingInitial = initialBooks.filter(b => !parsedIds.has(b.id));
        const updatedParsed = parsed.map(pb => {
          const match = initialBooks.find(ib => ib.id === pb.id);
          if (match) {
            return {
              ...match,
              likes: Math.max(pb.likes, match.likes),
              isLikedByMe: pb.isLikedByMe,
              isBookmarked: pb.isBookmarked,
              comments: pb.comments.length > match.comments.length ? pb.comments : match.comments,
              commentsCount: Math.max(pb.commentsCount, match.commentsCount),
            };
          }
          return pb;
        });
        const merged = [...updatedParsed, ...missingInitial];
        setBooks(merged);
        localStorage.setItem("sangsang_books", JSON.stringify(merged));
      } catch (e) {
        setBooks(initialBooks);
        localStorage.setItem("sangsang_books", JSON.stringify(initialBooks));
      }
    } else {
      setBooks(initialBooks);
      localStorage.setItem("sangsang_books", JSON.stringify(initialBooks));
    }
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

  const handleToggleLike = (e, bookId) => {
    e.stopPropagation();
    const updated = books.map(b => {
      if (b.id === bookId) {
        const isLiked = !b.isLikedByMe;
        return { ...b, isLikedByMe: isLiked, likes: isLiked ? b.likes + 1 : b.likes - 1 };
      }
      return b;
    });
    saveBooksToStorage(updated);
    if (selectedBook?.id === bookId) setSelectedBook(updated.find(x => x.id === bookId));
  };

  const handleToggleBookmark = (e, bookId) => {
    e.stopPropagation();
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

  const handleDetailAddComment = (bookId, authorName, textContent) => {
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

  const handleAddReply = (bookId, parentCommentId, authorName, textContent) => {
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

  const autocompleteSuggestions = [
    { title: "기억을 걷는 서재", tag: "도서" },
    { title: "시간을 걷는 아이", tag: "도서" },
    { title: "바다 속 도서관", tag: "도서" },
    { title: "별빛이 머무는 밤", tag: "도서" },
  ];

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

  const genres = ["전체", "소설", "시", "에세이", "동화", "지식정보"];
  const sortOptions = ["최신순", "인기순", "좋아요순"];

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

  // Router dispatcher
  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return (
          <LoginView
            onSuccess={(userInfo) => {
              setCurrentUser(userInfo);
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
              // 소셜 가입 및 로그인 시 무료 체험 1회 초기 지급 보정
              setFreeTrialRemaining(1);
              setFreeTrialTextTokens(0);
              setFreeTrialImageCount(0);
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
              // 회원가입 성공 즉시 무료 체험 1회 권한 지급 활성화
              setFreeTrialRemaining(1);
              setFreeTrialTextTokens(0);
              setFreeTrialImageCount(0);
              setCurrentScreen('home');
            }}
            onNavigateToLogin={() => setCurrentScreen('login')}
          />
        );
      case 'home':
        return (
          <MainDashboard
            onNavigate={(view) => setCurrentScreen(view)}
            onLogout={() => {
              setIsPremium(false);
              setCurrentScreen('login');
            }}
            setActiveTab={(tab) => {
              if (tab === 'friends') {
                setCurrentScreen('friends-library');
              } else if (tab === 'mylibrary') {
                setCurrentScreen('my-library');
              }
            }}
            isPremium={isPremium}
            freeTrialRemaining={freeTrialRemaining}
            setFreeTrialRemaining={setFreeTrialRemaining}
            freeTrialTextTokens={freeTrialTextTokens}
            setFreeTrialTextTokens={setFreeTrialTextTokens}
            freeTrialImageCount={freeTrialImageCount}
            setFreeTrialImageCount={setFreeTrialImageCount}
            extraCreditsRemaining={extraCreditsRemaining}
            setExtraCreditsRemaining={setExtraCreditsRemaining}
            dailyScore={dailyScore}
            setDailyScore={setDailyScore}
            dailyTextTokens={dailyTextTokens}
            setDailyTextTokens={setDailyTextTokens}
            dailyImageCount={dailyImageCount}
            setDailyImageCount={setDailyImageCount}
            isSubscriptionCanceled={isSubscriptionCanceled}
          />
        );
      case 'friends-library':
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
                onStartReading={() => { setSelectedBook(viewingBook); document.body.style.overflow = "hidden"; }}
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
                  {/* 검색창 */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b9b0dc]" />
                    <input
                      className="w-full bg-[#f8f7ff] border border-[#e6e2fc] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#2f2d59] placeholder:text-[#b9b0dc] focus:outline-none focus:border-[#6b54e7] focus:bg-white transition-all"
                      placeholder="제목, 작가, 장르 검색"
                      type="text"
                      value={actualQuery}
                      onChange={e => { setActualQuery(e.target.value); setCurrentPage(1); }}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                    />
                    {actualQuery && (
                      <button onClick={() => setActualQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b9b0dc] hover:text-[#7c769d]">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {/* 자동완성 */}
                    <AnimatePresence>
                      {searchFocused && !actualQuery && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          className="absolute left-0 top-full mt-1.5 w-full bg-white border border-[#e6e2fc] rounded-xl shadow-lg z-30 overflow-hidden text-left"
                        >
                          <p className="px-4 py-2 text-[11px] text-[#b9b0dc] font-medium border-b border-[#f3f0ff]">추천 검색어</p>
                          {autocompleteSuggestions.map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => { setActualQuery(item.title); setSearchFocused(false); }}
                              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#f8f7ff] text-sm text-[#2f2d59] transition-colors cursor-pointer text-left"
                            >
                              <div className="flex items-center gap-2.5">
                                <History className="w-3.5 h-3.5 text-[#b9b0dc]" />
                                {item.title}
                              </div>
                              <span className="text-[10px] bg-[#e6e2fc] text-[#7c769d] px-1.5 py-0.5 rounded font-medium">{item.tag}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 정렬 */}
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
                        <div
                          key={book.id}
                          onClick={() => setViewingBook(book)}
                          className="group cursor-pointer"
                        >
                          {/* 표지 */}
                          <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-sm border border-[#f0eeff] group-hover:shadow-md group-hover:border-[#d4cdf2] transition-all duration-300 group-hover:-translate-y-1 bg-[#f8f7ff]">
                            <img
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              src={book.coverImage}
                              alt={book.title}
                              referrerPolicy="no-referrer"
                            />
                            {/* 오버레이 그라디언트 */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                            {/* 장르 뱃지 */}
                            <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold border backdrop-blur-sm ${badge.cls}`}>
                              {badge.label}
                            </div>

                            {/* 하단 정보 */}
                            <div className="absolute bottom-0 inset-x-0 p-3 text-left">
                              <h4 className="text-white text-[13px] font-semibold leading-tight line-clamp-2 mb-1.5">
                                {book.title}
                              </h4>
                              <div className="flex items-center gap-2.5 text-white/80 text-[10px]">
                                <button
                                  onClick={e => handleToggleLike(e, book.id)}
                                  className="flex items-center gap-1 hover:text-white transition cursor-pointer"
                                >
                                  <Heart className={`w-3.5 h-3.5 ${book.isLikedByMe ? "fill-red-400 stroke-red-400" : ""}`} />
                                  {book.likes >= 1000 ? `${(book.likes / 1000).toFixed(1)}k` : book.likes}
                                </button>
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  {book.commentsCount}
                                </span>
                                <div className="ml-auto flex items-center gap-1">
                                  {book.isUserCreated && (
                                    <button onClick={e => handleDeleteBook(e, book.id)} className="hover:text-red-400 transition cursor-pointer">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button onClick={e => handleToggleBookmark(e, book.id)} className="hover:text-yellow-300 transition cursor-pointer">
                                    <Bookmark className={`w-3.5 h-3.5 ${book.isBookmarked ? "fill-yellow-400 stroke-yellow-400" : ""}`} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 작가 이름 */}
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
              />
            ) : (
              <SearchAuthorView allBooks={books} onSelectAuthor={name => setSelectedAuthor(name)} />
            )}
          </motion.div>
        );
      case 'pricing':
        return (
          <PricingView
            onSelectPlan={(planType) => {
              // planType에 따라 다르게 설정 (yearly = 7900, monthly = 9900)
              const selectedPrice = planType === 'yearly' ? 7900 : 9900;
              setPaymentParams({
                type: 'subscription',
                subType: planType === 'yearly' ? 'yearly' : 'monthly',
                price: selectedPrice,
                creditsCount: 0
              });
              setCurrentScreen('payment');
            }}
            onNavigateHome={() => setCurrentScreen('home')}
          />
        );
      case 'payment':
        return (
          <PaymentView
            paymentParams={paymentParams}
            onPaymentSuccess={() => {
              if (paymentParams.type === 'subscription') {
                setIsPremium(true);
                setIsSubscriptionCanceled(false); // 재가입 시 취소상태 해제
              } else {
                // 추가 생성권 구매 완료 처리
                setExtraCreditsRemaining(prev => prev + paymentParams.creditsCount);
              }
              setCurrentScreen('subscription');
            }}
            onNavigateBack={() => {
              if (paymentParams.type === 'subscription') {
                setCurrentScreen('pricing');
              } else {
                setCurrentScreen('subscription');
              }
            }}
          />
        );
      case 'subscription':
        return (
          <SubscriptionView
            onSelectPlan={(planType) => {
              const selectedPrice = planType === 'yearly' ? 7900 : 9900;
              setPaymentParams({
                type: 'subscription',
                subType: planType === 'yearly' ? 'yearly' : 'monthly',
                price: selectedPrice,
                creditsCount: 0
              });
              setCurrentScreen('payment');
            }}
            onNavigateHome={() => setCurrentScreen('home')}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onCancelSubscription={() => {
              // 구독 정지 시 예약 해지 처리 (혜택은 결제 주기 대기 말까지 보존)
              setIsSubscriptionCanceled(true);
              setBenefitEndDate('2026.07.15'); // 혜택 유지 종료 예정일 지정
            }}
            isPremium={isPremium}
            freeTrialRemaining={freeTrialRemaining}
            freeTrialTextTokens={freeTrialTextTokens}
            freeTrialImageCount={freeTrialImageCount}
            extraCreditsRemaining={extraCreditsRemaining}
            setExtraCreditsRemaining={setExtraCreditsRemaining}
            dailyScore={dailyScore}
            dailyTextTokens={dailyTextTokens}
            dailyImageCount={dailyImageCount}
            isSubscriptionCanceled={isSubscriptionCanceled}
            benefitEndDate={benefitEndDate}
            onInitiateCreditsPayment={(credits, cost) => {
              setPaymentParams({
                type: 'credits',
                subType: '',
                price: cost,
                creditsCount: credits
              });
              setCurrentScreen('payment');
            }}
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
      case 'notifications':
        return (
          <div className="max-w-4xl mx-auto py-12">
            <NotificationsView
              notifications={notifications}
              onMarkAllAsRead={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
            />
          </div>
        );
      case 'profile-edit':
        return (
          <ProfileEditView
            currentUser={{ ...currentUser, isSubscribed: isPremium }}
            onNavigateHome={() => setCurrentScreen('home')}
            onUpdateProfile={(updates) => setCurrentUser(prev => ({ ...prev, ...updates }))}
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
    <NavigationContext.Provider value={{
      currentScreen,
      currentUser: { ...currentUser, isSubscribed: isPremium },
      freeTrialRemaining,
      freeTrialTextTokens,
      freeTrialImageCount,
      dailyScore,
      dailyTextTokens,
      dailyImageCount,
      onNavigate: (screen) => setCurrentScreen(screen),
      onLogout: () => {
        setIsPremium(false);
        setCurrentUser({
          email: 'writer@sangsang.com',
          role: 'USER',
          nickname: '상상의작가'
        });
        setCurrentScreen('login');
      }
    }}>
      <div className="relative min-h-screen selection:bg-black selection:text-white">

        {/* 1. Global Common Header standard */}
        <Header
          key={currentScreen}
          currentScreen={currentScreen}
          currentUser={{ ...currentUser, isSubscribed: isPremium }}
          freeTrialRemaining={freeTrialRemaining}
          freeTrialTextTokens={freeTrialTextTokens}
          freeTrialImageCount={freeTrialImageCount}
          dailyScore={dailyScore}
          dailyTextTokens={dailyTextTokens}
          dailyImageCount={dailyImageCount}
          onNavigate={(screen) => {
            if (screen === 'my-library') {
              setMyLibraryKey(prev => prev + 1);
            }
            setCurrentScreen(screen)
          }
          }
          onLogout={() => {
            setIsPremium(false);
            setCurrentUser({
              email: 'writer@sangsang.com',
              role: 'USER',
              nickname: '상상의작가'
            });
            setCurrentScreen('login');
          }}
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
                onToggleBookmark={e => handleToggleBookmark(e, selectedBook.id)}
                onToggleLike={e => handleToggleLike(e, selectedBook.id)}
                onSelectRecommended={b => { setSelectedBook(null); document.body.style.overflow = "unset"; setViewingBook(b); }}
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
  const bookContents = myLibraryBookContents;
  const [activeTab, setActiveTab] = useState('bookshelf');
  const [books, setBooks] = useState(initialBooks.map(b => ({
    ...b,
    isFavorite: (b.progress === 0 && b.author !== '지우와 상상 AI'),
    totalViews: Math.floor(Math.random() * 500),
    totalLikes: Math.floor(Math.random() * 100),
    reviews: []
  })));
  const [searchQuery, setSearchQuery] = useState('');

  // Active Viewer state
  const [selectedBookContent, setSelectedBookContent] = useState(null);
  const [viewerInitialPage, setViewerInitialPage] = useState(null);
  const [selectedDetailBookId, setSelectedDetailBookId] = useState(null);
  const selectedDetailBook = books.find(b => b.id === selectedDetailBookId);

  // Creative manual creator/add books dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookCategory, setNewBookCategory] = useState('동화');
  const [newBookDesc, setNewBookDesc] = useState('');
  const [wishlistCategory, setWishlistCategory] = useState('all');

  // Floating notifications box
  const [appBookmarks, setAppBookmarks] = useState([
    { title: '우주 탐험대의 모험', page: 12, id: 1 },
    { title: '시간을 걷는 아이', page: 4, id: 2 }
  ]);

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

    // 2. 책 본문 데이터베이스에 동적 바인딩
    bookContents[customId] = {
      id: customId,
      title: newTale.title,
      chapters: [
        {
          title: '1. 모험가 상상이의 출발',
          page: 1,
          content: newTale.content,
          illustration: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPVBWqLsCBgg8PJuoJJomJC3f8OSvgE89YHcxnMWKBy4wvRvL1cZQN6QDSbPrmqpA04kfaFL2WLamfw2T7ahBXAP-9D0-TGdKVb_uoubDPsJezesu4X-K9HiU_oKXf_tB7Hy4Bok0W0ay0YbQVSQ9fXyrxDGxFAOPnnFbdoS6IibG-20KBf-1LDX2uNBWVRt8IaSkxGr-5Ju6m1k8HKa6v72K1NKdKOODyRlIvMbFo9t1A9QzUF49YmARdMrheFQYF97bn-chMLXQr'
        }
      ]
    };

    setBooks((prev) => [newBookObj, ...prev]);
  };

  // 직접 책 뷰 보관함 추가
  const handleCreateBookSubmit = ({ title, category, desc }) => {
    if (!title.trim()) return;

    const customId = `manual_${Date.now()}`;
    const newB = {
      id: customId,
      title: title,
      author: '김지우 님',
      illustrator: '상상서가',
      coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI6_9o3ivagt0U0ZJhyWk8kCy6y8zQGge0rR_epJsHnAoDaUJTRODbMbk3INGzHpSouisJV6Y4L_DG1Nvajif5PIfDVzzLzXtyalNpAlPNJ9n3jvkCr3mS2LVMy3oJqWPTtXYBWOPJXZavJsN5Tm0Ozy_5MIV0hMt6fFyADARfXlazAqdfWuNHDodoUJ-Zp7uw5Gj2QIQ9iDrUKv_-BXF3iNJhxyUmZXpjWJ5YTxHeKpwoIumUKLx090wOlIdRY1rslqNke_9guV17',
      category: category,
      rating: 4.5,
      description: desc || '내가 직접 제목을 짓고 독서 위시리스트에 소중히 등재한 창작 모험서입니다.',
      readingTime: '15분',
      magicLevel: 'Lv. 1',
      pages: 30,
      progress: 0,
      isPublic: true
    };

    // 실시간 본문 챕터 바인딩
    bookContents[customId] = {
      id: customId,
      title: title,
      chapters: [
        {
          title: '1. 비밀 장벽의 개방',
          page: 1,
          content: `${title}의 찬란한 여정이 막 시작되었습니다! 주인공은 깊고 푸른 상상의 숲에 둘러싸인 자신의 작은 서재 오두막에서 나와, 소문으로만 전해지던 고장 난 시계 열쇠를 복원하기 시작했습니다...`,
          illustration: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI6_9o3ivagt0U0ZJhyWk8kCy6y8zQGge0rR_epJsHnAoDaUJTRODbMbk3INGzHpSouisJV6Y4L_DG1Nvajif5PIfDVzzLzXtyalNpAlPNJ9n3jvkCr3mS2LVMy3oJqWPTtXYBWOPJXZavJsN5Tm0Ozy_5MIV0hMt6fFyADARfXlazAqdfWuNHDodoUJ-Zp7uw5Gj2QIQ9iDrUKv_-BXF3iNJhxyUmZXpjWJ5YTxHeKpwoIumUKLx090wOlIdRY1rslqNke_9guV17'
        }
      ]
    };

    setBooks((prev) => [newB, ...prev]);
    setIsCreateOpen(false);
    setActiveTab('wishlist');
  };

  const handleOpenViewer = (bookId) => {
    if (bookId === 'stats_magic_book') {
      setActiveTab('stats');
      return;
    }
    const content = bookContents[bookId];
    if (content) {
      setSelectedBookContent(content);

      setBooks((prev) => prev.map((b) => {
        if (b.id === bookId && b.progress === 0) {
          return { ...b, progress: 12 };
        }
        return b;
      }));
    } else {
      const foundBook = books.find(b => b.id === bookId);
      if (foundBook) {
        const dummyContent = {
          id: bookId,
          title: foundBook.title,
          chapters: [
            {
              title: '1. 신비한 여정의 첫걸음',
              page: 1,
              content: `"${foundBook.title}"의 세계관에 오신 것을 환영합니다! \n\n이곳에는 대단한 상상력을 발휘하는 독자님들을 수호하는 마법 은하 철도 신호등이 서있습니다. 숲속 대사서 거북이 할머니는 마법 지팡이 끝을 노랗게 콕 짚어서 마른 땅에서 아름다운 민들레 꽃잎 줄기가 무럭무럭 자라나도록 마법을 휘둘렀답니다. \n\n너만을 위한 신비한 모험 스토리가 시작되고 있는 순간이에요! 뷰어 하단에서 글씨 크기나 손글씨 글씨체, 줄 간격을 실시간으로 편안하게 조절하면서 귀로 생생히 들려오는 음성 리딩과 함께 오감으로 독서를 즐겨보세요.`,
              illustration: foundBook.coverUrl
            },
            {
              title: '2. 빛을 되찾은 꼬마 영웅들',
              page: 15,
              content: `결국 주인공 김지우 님이 상상력을 총동원하여 고장 난 오르골의 태엽 배를 수리하는 데 성공했습니다! \n\n기쁨에 들뜬 인근 오렌지 숲 유니콘과 요정들이 다람쥐 오두막에 옹기종기 둥글게 모여 아름다운 달빛 우정 연주회를 활짝 개최했습니다. 지우도 머리 위에 멋진 은빛 왕관을 받아 얹으며 오늘의 독서 여행을 보람차게 완료했답니다. 짝짝짝!`,
              illustration: foundBook.coverUrl
            }
          ]
        };
        setSelectedBookContent(dummyContent);
        setBooks((prev) => prev.map((b) => {
          if (b.id === bookId && b.progress === 0) {
            return { ...b, progress: 12 };
          }
          return b;
        }));
      }
    }
  };

  const handleStartWishReading = (bookId) => {
    setBooks(prev => prev.map(b => {
      if (b.id === bookId) {
        return { ...b, progress: 8 };
      }
      return b;
    }));
    handleOpenViewer(bookId);
  };

  const handleAddBookmark = (title, page) => {
    const newId = Date.now();
    setAppBookmarks(prev => [{ title, page, id: newId }, ...prev]);
  };

  const handleRemoveBookmark = (id) => {
    setAppBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const handleBookmarkClick = (bm) => {
    const foundBook = books.find(b => b.title === bm.title);
    if (foundBook) {
      setViewerInitialPage(bm.page);
      handleOpenViewer(foundBook.id);
    } else {
      const foundId = Object.keys(bookContents).find(key => bookContents[key].title === bm.title);
      if (foundId) {
        setViewerInitialPage(bm.page);
        handleOpenViewer(foundId);
      }
    }
  };

  const handleUpdateBook = (updatedBook) => {
    setBooks((prev) => prev.map((b) => (b.id === updatedBook.id ? { ...b, ...updatedBook } : b)));
    // 본문 컨텐츠의 제목도 동기화
    if (bookContents[updatedBook.id]) {
      bookContents[updatedBook.id].title = updatedBook.title;
    }
  };

  const handleToggleFavorite = (bookId) => {
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, isFavorite: !b.isFavorite } : b));
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
    <div className="min-h-screen pb-24 relative overflow-x-hidden md:overflow-visible bg-white text-navy-purple">
      {/* Floating sliding Sidebar Navigation Bookmarks */}
      <SideMenu activeTab={activeTab} setActiveTab={setActiveTab} disabled={selectedBookContent !== null} />

      {/* Outer wrapper container */}
      <main className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-12 pt-24 bg-transparent text-navy-purple">

        {/* Dynamic Reader Book Viewer - Absolute Priority Overlay */}
        {selectedBookContent ? (
          <BookViewer
            bookContent={selectedBookContent}
            onClose={() => {
              setSelectedBookContent(null);
              setViewerInitialPage(null);
            }}
            appBookmarks={appBookmarks}
            onAddBookmark={handleAddBookmark}
            onRemoveBookmark={handleRemoveBookmark}
            initialPage={viewerInitialPage}
          />
        ) : selectedDetailBook ? (
          <BookDetailView
            book={{
              ...selectedDetailBook,
              genre: selectedDetailBook.category,
              summary: selectedDetailBook.description,
              coverImage: selectedDetailBook.coverUrl,
              likes: selectedDetailBook.totalLikes || 0,
              isLikedByMe: selectedDetailBook.isLikedByMe || false,
              comments: selectedDetailBook.reviews || [],
              mode: "owner"
            }}
            onBack={() => setSelectedDetailBookId(null)}
            onStartReading={() => handleStartWishReading(selectedDetailBook.id)}
            onToggleLike={() => handleLikeBook(selectedDetailBook.id)}
            onToggleBookmark={() => handleToggleFavorite(selectedDetailBook.id)}
            allBooks={books.map(b => ({
              ...b,
              genre: b.category,
              summary: b.description,
              coverImage: b.coverUrl,
              likes: b.totalLikes || 0,
              isLikedByMe: b.isLikedByMe || false,
              comments: b.reviews || []
            }))}
            onSelectRecommended={(book) => setSelectedDetailBookId(book.id)}
            onSaveComment={(user, text) =>
              handleAddReview(selectedDetailBook.id, {
                user,
                comment: text,
                date: new Date().toLocaleDateString('ko-KR')
              })
            }
            onSaveReply={() => { }}
            onSelectAuthor={(name) => {
              setSelectedAuthor(name);
              setAuthorProfileMode("owner");
              setCurrentScreen("author-search");
              setViewingBook(null);
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
                  onOpenCreateModal={() => setIsCreateOpen(true)}
                />
              )}

              {activeTab === 'wishlist' && (
                <WishlistTab
                  filteredBooks={filteredBooks}
                  onOpenCreateModal={() => setIsCreateOpen(true)}
                  onStartReading={handleStartWishReading}
                  onOpenDetail={(book) => {
                    const convertedBook = {
                      ...book,
                      genre: book.category,
                      summary: book.description,
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
                      genre: book.category,
                      summary: book.description,
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
                  setActiveTab={setActiveTab}
                  onOpenDetail={(book) => {
                    const convertedBook = {
                      ...book,
                      genre: book.category,
                      summary: book.description,
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
                <BookCalendar onSelectBook={handleOpenViewer} />
              )}

              {activeTab === 'ai-chat' && (
                <ReviewWithAI onFairyTaleCreated={handleFairyTaleCreated} />
              )}

              {activeTab === 'create' && (
                <BookCreationTab onCreateBook={handleCreateBookSubmit} />
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
                      genre: book.category,
                      summary: book.description,
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
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}

      </main>
    </div>
  );
}
