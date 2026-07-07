import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  BookOpen, 
  ChevronDown, 
  User, 
  Library, 
  Users, 
  Compass, 
  Key, 
  CreditCard, 
  LogOut,
  Edit,
  Sparkles,
  Info
} from 'lucide-react';
import { CURRENT_USER_PROFILE } from '../data';
import logoUrl from '../../assets/images/sangsangseoga_official_logo_1782313504336.jpg';

export const NavigationContext = createContext(null);

export const Header = ({ 
  currentScreen: propCurrentScreen, 
  onNavigate: propOnNavigate, 
  onLogout: propOnLogout,
  onSelectCreateBook,
  onSelectMyLibrary,
  onSelectFriendsLibrary,
  currentUser: propCurrentUser,
  usage: propUsage,
}) => {
  const navContext = useContext(NavigationContext) || {};

  const currentScreen = propCurrentScreen || navContext.currentScreen;
  const onNavigate = propOnNavigate || navContext.onNavigate;
  const onLogout = propOnLogout || navContext.onLogout;
  const currentUser = propCurrentUser || navContext.currentUser;
  const usage = propUsage !== undefined ? propUsage : navContext.usage;

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSangsangMenu, setShowSangsangMenu] = useState(false);
  const [showFriendsMenu, setShowFriendsMenu] = useState(false);
  const [showEditInfoModal, setShowEditInfoModal] = useState(false);
  const [nickname, setNickname] = useState('상상의작가');
  const [showSaveAlert, setShowSaveAlert] = useState(false);

  // Sync state nickname with logged-in user profile
  useEffect(() => {
    if (currentUser?.nickname) {
      setNickname(currentUser.nickname);
    }
  }, [currentUser]);

  // Determine auth status automatically based on the current screen path
  const nonAuthedScreens = ['login', 'signup', 'password-reset', 'social-auth'];
  const isLoggedIn = !nonAuthedScreens.includes(currentScreen);

  // Local handler for Logo click
  const handleLogoClick = () => {
    if (isLoggedIn) {
      onNavigate('home');
    } else {
      onNavigate('login');
    }
  };

  const handleEditInfoSubmit = (e) => {
    e.preventDefault();
    setShowSaveAlert(true);
    setTimeout(() => {
      setShowSaveAlert(false);
      setShowEditInfoModal(false);
    }, 1500);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* 1 & 2. Logo & Site Name clickable to Home/Login */}
            <div
              onClick={handleLogoClick}
              className="flex items-center cursor-pointer hover:opacity-90 select-none"
              id="header-brand-logo"
            >
              <img
                src={logoUrl}
                alt="상상서가"
                className="h-16 py-1 w-auto object-contain mix-blend-multiply opacity-90"
                style={{ filter: "url(#remove-white-bg)" }}
                referrerPolicy="no-referrer"
              />
            </div>

            {/* 4. Navigation menus */}
            <nav className="hidden md:flex space-x-7 text-xs font-bold leading-none tracking-wide text-neutral-600 relative z-50">
              {/* Home link */}
              <button
                onClick={() => {
                  if (isLoggedIn) {
                    onNavigate("home");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else {
                    onNavigate("login");
                  }
                }}
                className={`transition-colors py-1 cursor-pointer hover:text-black ${currentScreen === "home" ? "text-black border-b border-black" : ""}`}
              >
                작가 홈
              </button>

              {/* 상상더하기 Dropdown Menu */}
              <div
                className="relative inline-block text-left"
                onMouseEnter={() => setShowSangsangMenu(true)}
                onMouseLeave={() => setShowSangsangMenu(false)}
              >
                <button
                  onClick={() => {
                    if (isLoggedIn) {
                      setShowSangsangMenu(!showSangsangMenu);
                    } else {
                      onNavigate("login");
                    }
                  }}
                  className={`transition-colors py-1 cursor-pointer hover:text-black flex items-center gap-1 ${["create-poem", "create-essay", "create-nonfiction", "create-fairy-tale", "create-novel"].includes(currentScreen) ? "text-black border-b border-black" : ""}`}
                >
                  <span>상상더하기</span>
                  <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />
                </button>

                {showSangsangMenu && (
                  <div className="absolute left-0 top-full pt-2 w-32 z-50">
                    <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                      <button
                        onClick={() => {
                          if (isLoggedIn) {
                            onNavigate("create-fairy-tale");
                          } else {
                            onNavigate("login");
                          }
                          setShowSangsangMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs hover:bg-[#F3F0FF] hover:text-[#6B54E7] flex items-center transition-colors font-bold ${currentScreen === "create-fairy-tale" ? "text-[#6B54E7] bg-[#F3F0FF]/50" : "text-neutral-700"}`}
                      >
                        동화
                      </button>
                      <button
                        onClick={() => {
                          if (isLoggedIn) {
                            onNavigate("create-novel");
                          } else {
                            onNavigate("login");
                          }
                          setShowSangsangMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs hover:bg-[#F3F0FF] hover:text-[#6B54E7] flex items-center transition-colors font-bold ${currentScreen === "create-novel" ? "text-[#6B54E7] bg-[#F3F0FF]/50" : "text-neutral-700"}`}
                      >
                        소설
                      </button>
                      <button
                        onClick={() => {
                          if (isLoggedIn) {
                            onNavigate("create-poem");
                          } else {
                            onNavigate("login");
                          }
                          setShowSangsangMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs hover:bg-[#F3F0FF] hover:text-[#6B54E7] flex items-center transition-colors font-bold ${currentScreen === "create-poem" ? "text-[#6B54E7] bg-[#F3F0FF]/50" : "text-neutral-700"}`}
                      >
                        시
                      </button>
                      <button
                        onClick={() => {
                          if (isLoggedIn) {
                            onNavigate("create-essay");
                          } else {
                            onNavigate("login");
                          }
                          setShowSangsangMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs hover:bg-[#F3F0FF] hover:text-[#6B54E7] flex items-center transition-colors font-bold ${currentScreen === "create-essay" ? "text-[#6B54E7] bg-[#F3F0FF]/50" : "text-neutral-700"}`}
                      >
                        에세이
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 내 서재 link */}
              <button
                onClick={() => {
                  if (isLoggedIn) {
                    onNavigate("my-library");
                  } else {
                    onNavigate("login");
                  }
                }}
                className={`transition-colors py-1 cursor-pointer hover:text-black ${currentScreen === "my-library" ? "text-black border-b border-black" : ""}`}
              >
                내 서재
              </button>

              {/* 친구의 서재 Dropdown Menu */}
              <div className="relative inline-block text-left">
                <button
                  onClick={() => {
                    if (isLoggedIn) {
                      setShowFriendsMenu(!showFriendsMenu);
                    } else {
                      onNavigate("login");
                    }
                  }}
                  className={`transition-colors py-1 cursor-pointer hover:text-black flex items-center gap-1 ${["friends-library", "author-search"].includes(currentScreen) ? "text-black border-b border-black" : ""}`}
                >
                  <span>친구의 서재</span>
                  <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />
                </button>

                {showFriendsMenu && (
                  <div className="absolute left-0 top-full pt-2 w-32 z-50">
                    <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                      <button
                        onClick={() => {
                          onNavigate("friends-library");
                          setShowFriendsMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs hover:bg-[#F3F0FF] hover:text-[#6B54E7] flex items-center transition-colors font-bold ${currentScreen === "friends-library" ? "text-[#6B54E7] bg-[#F3F0FF]/50" : "text-neutral-700"}`}
                      >
                        도서 검색
                      </button>
                      <button
                        onClick={() => {
                          onNavigate("author-search");
                          setShowFriendsMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs hover:bg-[#F3F0FF] hover:text-[#6B54E7] flex items-center transition-colors font-bold ${currentScreen === "author-search" ? "text-[#6B54E7] bg-[#F3F0FF]/50" : "text-neutral-700"}`}
                      >
                        작가 검색
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Panel Shortcut link (ONLY shown if isLoggedIn AND currentUser of Role ADMIN) */}
              {isLoggedIn && currentUser?.role === "ADMIN" && (
                <button
                  onClick={() => {
                    onNavigate("admin");
                  }}
                  className={`transition-colors py-1 cursor-pointer text-red-600 hover:text-red-700 font-extrabold flex items-center ${currentScreen === "admin" ? "text-red-700 border-b border-red-700 font-black" : ""}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse mr-1.5 inline-block"></span>
                  <span>관리자 영역</span>
                </button>
              )}
            </nav>

            {/* 3. Auth states: [Login/Join] vs [Profile Avatar + Menu] */}
            <div className="flex items-center space-x-4">
              {!isLoggedIn ? (
                // 3-A. Logged-out state: [로그인 / 회원가입]
                <div className="flex items-center space-x-3.5 font-sans">
                  <button
                    onClick={() => onNavigate("login")}
                    className="text-xs font-bold text-neutral-700 hover:text-black cursor-pointer transition-colors"
                  >
                    로그인
                  </button>
                  <span className="w-px h-3 bg-neutral-200"></span>
                  <button
                    onClick={() => onNavigate("signup")}
                    className="text-xs font-bold text-white bg-black hover:bg-neutral-900 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs active:scale-97"
                  >
                    회원가입
                  </button>
                </div>
              ) : (
                // 3-B. Logged-in state: [프로필 이미지 + 메뉴]
                <div className="relative flex items-center space-x-1.5 sm:space-x-2.5">
                  {/* 바로 소모량을 파악할 수 있는 헤더 실시간 지표 버튼 (클릭 시 구독/아틀리에 관리 이동) */}
                  <button
                    onClick={() => onNavigate("subscription")}
                    className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-neutral-50 hover:bg-neutral-100 active:scale-97 border border-neutral-200 rounded-xl cursor-pointer transition-all shrink-0 font-sans group text-left"
                    title="클릭 시 실시간 구독 지표 및 사용량 대시보드로 이동"
                  >
                    <span className="relative flex h-1.5 w-1.5 shrink-0 select-none">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-duration-1000"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <div className="font-sans">
                      <span className="text-[7.5px] text-neutral-400 font-extrabold uppercase tracking-tight hidden lg:block leading-none select-none mt-0.5">
                        오늘 사용량
                      </span>
                      <span className="text-[10px] font-bold text-neutral-800 font-mono block mt-0.5 leading-none">
                        {usage ? `텍스트 ${usage.text.remaining}/${usage.text.limit} · 이미지 ${usage.image.remaining}/${usage.image.limit}` : '-'}
                      </span>
                    </div>
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center p-0.5 sm:p-1 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
                      id="header-profile-avatar-trigger"
                    >
                      <img
                        src={
                          currentUser?.profileImage ||
                          currentUser?.profile ||
                          CURRENT_USER_PROFILE
                        }
                        alt="작가 프로필"
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-neutral-200 object-cover"
                      />
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-400 hidden sm:inline shrink-0" />
                    </button>

                    {/* 5. Dropdown menu holding [내 정보 수정, 구독 관리, 로그아웃] */}
                    {showProfileMenu && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-neutral-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        {/* User Info Section */}
                        <div className="px-4 py-3 border-b border-neutral-100 flex flex-col gap-1">
                          <span className="text-sm font-bold text-neutral-900">
                            {currentUser?.nickname || "상상의작가"}
                          </span>
                          <div className="flex items-center mt-0.5">
                            {currentUser?.role === "ADMIN" ? (
                              <span className="text-[10px] bg-red-100 text-red-700 font-extrabold px-2 py-0.5 rounded-full border border-red-200/50 shadow-6xs">
                                최고 관리자
                              </span>
                            ) : (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block shadow-6xs ${currentUser?.isSubscribed ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-neutral-100 text-neutral-600 border-neutral-200/50"}`}
                              >
                                {currentUser?.isSubscribed
                                  ? "프리미엄"
                                  : "일반"}{" "}
                                작가
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Menu Item: 구독 및 사용량 관리 */}
                        <button
                          onClick={() => {
                            onNavigate("subscription");
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center transition-colors font-bold border-b border-neutral-100"
                        >
                          <CreditCard className="w-4 h-4 mr-2.5 text-neutral-400" />
                          <span>구독 및 사용량 관리</span>
                        </button>

                        {/* Menu Item 1: 내 정보 수정 */}
                        <button
                          onClick={() => {
                            onNavigate("profile-edit");
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center transition-colors font-bold"
                        >
                          <User className="w-4 h-4 mr-2.5 text-neutral-400" />
                          <span>내 정보 수정</span>
                        </button>

                        {/* Menu Item: 로그아웃 */}
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onLogout();
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-neutral-50 flex items-center transition-colors font-extrabold border-t border-neutral-100"
                        >
                          <LogOut className="w-4 h-4 mr-2.5 text-red-500" />
                          <span>로그아웃</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <svg
        className="absolute w-0 h-0 pointer-events-none"
        aria-hidden="true"
        style={{ visibility: "hidden" }}
      >
        <defs>
          <filter id="remove-white-bg" colorInterpolationFilters="sRGB">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -1 -1 -1 3 0"
            />
          </filter>
        </defs>
      </svg>
    </>
  );
};
