import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {  
  ChevronDown,
  User,
  CreditCard,
  LogOut,
} from 'lucide-react';
import { CURRENT_USER_PROFILE } from '../data';
import { useAuth } from '../context/AuthContext';
import logoUrl from '../../assets/images/sangsangseoga_official_logo_1782313504336.jpg';


export const Header = () => {
  const { isAuthenticated, currentUser, usage, handleLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSangsangMenu, setShowSangsangMenu] = useState(false);
  const [showFriendsMenu, setShowFriendsMenu] = useState(false);
  const [nickname, setNickname] = useState('상상의작가');



  // Sync state nickname with logged-in user profile
  useEffect(() => {
    if (currentUser?.nickname) {
      setNickname(currentUser.nickname);
    }
  }, [currentUser]);

  // 화면 이동 시 열려 있던 드롭다운 메뉴 닫기 (예전엔 key={currentScreen}로 Header 전체를 리마운트해서 처리했음)
  useEffect(() => {
    setShowProfileMenu(false);
    setShowSangsangMenu(false);
    setShowFriendsMenu(false);
  }, [location.pathname]);

  const isLoggedIn = isAuthenticated;
  const path = location.pathname;
  const isCreatePath = path.startsWith('/create');
  const isFriendsOrAuthorsPath = path === '/friends' || path.startsWith('/authors');

  // 로그인 필요 여부는 라우트 가드(ProtectedRoute)가 판단 — 여기선 그냥 이동만 시키면
  // 비로그인 접근 가능한 경로는 열리고, 아니면 가드가 알아서 /login으로 보낸다(복귀 경로 포함).
  const goTo = (to) => {
    navigate(to);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const onLogoutClick = async () => {
    setShowProfileMenu(false);
    await handleLogout();
    navigate('/login');
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
                  navigate("/");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`transition-colors py-1 cursor-pointer hover:text-black ${path === "/" ? "text-black border-b border-black" : ""}`}
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
                  onClick={() => setShowSangsangMenu(!showSangsangMenu)}
                  className={`transition-colors py-1 cursor-pointer hover:text-black flex items-center gap-1 ${isCreatePath ? "text-black border-b border-black" : ""}`}
                >
                  <span>상상더하기</span>
                  <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />
                </button>

                {showSangsangMenu && (
                  <div className="absolute left-0 top-full pt-2 w-32 z-50">
                    <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                      <button
                        onClick={() => { goTo("/create/fairy-tale"); setShowSangsangMenu(false); }}
                        className={`w-full text-left px-4 py-2.5 text-xs hover:bg-[#F3F0FF] hover:text-[#6B54E7] flex items-center transition-colors font-bold ${path.startsWith("/create/fairy-tale") ? "text-[#6B54E7] bg-[#F3F0FF]/50" : "text-neutral-700"}`}
                      >
                        동화
                      </button>
                      <button
                        onClick={() => { goTo("/create/novel"); setShowSangsangMenu(false); }}
                        className={`w-full text-left px-4 py-2.5 text-xs hover:bg-[#F3F0FF] hover:text-[#6B54E7] flex items-center transition-colors font-bold ${path.startsWith("/create/novel") ? "text-[#6B54E7] bg-[#F3F0FF]/50" : "text-neutral-700"}`}
                      >
                        소설
                      </button>
                      <button
                        onClick={() => { goTo("/create/poem"); setShowSangsangMenu(false); }}
                        className={`w-full text-left px-4 py-2.5 text-xs hover:bg-[#F3F0FF] hover:text-[#6B54E7] flex items-center transition-colors font-bold ${path === "/create/poem" ? "text-[#6B54E7] bg-[#F3F0FF]/50" : "text-neutral-700"}`}
                      >
                        시
                      </button>
                      <button
                        onClick={() => { goTo("/create/essay"); setShowSangsangMenu(false); }}
                        className={`w-full text-left px-4 py-2.5 text-xs hover:bg-[#F3F0FF] hover:text-[#6B54E7] flex items-center transition-colors font-bold ${path === "/create/essay" ? "text-[#6B54E7] bg-[#F3F0FF]/50" : "text-neutral-700"}`}
                      >
                        에세이
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 내 서재 link */}
              <button
                onClick={() => goTo("/library")}
                className={`transition-colors py-1 cursor-pointer hover:text-black ${path.startsWith("/library") ? "text-black border-b border-black" : ""}`}
              >
                내 서재
              </button>

              {/* 친구의 서재 Dropdown Menu */}
              <div
                className="relative inline-block text-left"
                onMouseEnter={() => setShowFriendsMenu(true)}
                onMouseLeave={() => setShowFriendsMenu(false)}
              >
                <button
                  onClick={() => setShowFriendsMenu(!showFriendsMenu)}
                  className={`transition-colors py-1 cursor-pointer hover:text-black flex items-center gap-1 ${isFriendsOrAuthorsPath ? "text-black border-b border-black" : ""}`}
                >
                  <span>친구의 서재</span>
                  <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />
                </button>

                {showFriendsMenu && (
                  <div className="absolute left-0 top-full pt-2 w-32 z-50">
                    <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                      <button
                        onClick={() => { goTo("/friends"); setShowFriendsMenu(false); }}
                        className={`w-full text-left px-4 py-2.5 text-xs hover:bg-[#F3F0FF] hover:text-[#6B54E7] flex items-center transition-colors font-bold ${path === "/friends" ? "text-[#6B54E7] bg-[#F3F0FF]/50" : "text-neutral-700"}`}
                      >
                        도서 검색
                      </button>
                      <button
                        onClick={() => { goTo("/authors"); setShowFriendsMenu(false); }}
                        className={`w-full text-left px-4 py-2.5 text-xs hover:bg-[#F3F0FF] hover:text-[#6B54E7] flex items-center transition-colors font-bold ${path.startsWith("/authors") ? "text-[#6B54E7] bg-[#F3F0FF]/50" : "text-neutral-700"}`}
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
                  onClick={() => navigate("/admin")}
                  className={`transition-colors py-1 cursor-pointer text-red-600 hover:text-red-700 font-extrabold flex items-center ${path.startsWith("/admin") ? "text-red-700 border-b border-red-700 font-black" : ""}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse mr-1.5 inline-block"></span>
                  <span>관리자</span>
                </button>
              )}
            </nav>

            {/* 3. Auth states: [Login/Join] vs [Profile Avatar + Menu] */}
            <div className="flex items-center space-x-4">
              {!isLoggedIn ? (
                // 3-A. Logged-out state: [로그인 / 회원가입]
                <div className="flex items-center space-x-3.5 font-sans">
                  <button
                    onClick={() => navigate("/login")}
                    className="text-xs font-bold text-neutral-700 hover:text-black cursor-pointer transition-colors"
                  >
                    로그인
                  </button>
                  <span className="w-px h-3 bg-neutral-200"></span>
                  <button
                    onClick={() => navigate("/signup")}
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
                    onClick={() => navigate("/subscription")}
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
                            navigate("/subscription");
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
                            navigate("/profile/edit");
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs text-neutral-700 hover:bg-neutral-50 flex items-center transition-colors font-bold"
                        >
                          <User className="w-4 h-4 mr-2.5 text-neutral-400" />
                          <span>내 정보 수정</span>
                        </button>

                        {/* Menu Item: 로그아웃 */}
                        <button
                          onClick={onLogoutClick}
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
