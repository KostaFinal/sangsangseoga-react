import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HERO_BG_IMAGE,
  CURRENT_USER_PROFILE,
  ILLUSTRATION_BOOKS
} from '../../../shared/data';
import heroIllustrationUrl from '../../../assets/images/sangsangseoga_hero_illustration_1782314686916.jpg';
import homeBooksUrl from '../../../assets/images/home_books.png';
import genreFairyTaleUrl from '../../../features/bookCreation/assets/fairy-bg.png';
import genreNovelUrl from '../../../features/bookCreation/assets/novelstudiobg.png';
import genrePoemUrl from '../../../features/bookCreation/styles/images/poem-kids-bg.png';
import genreEssayUrl from '../../../features/bookCreation/styles/images/essay-illustration-bg.png';
import logoUrl from '../../../assets/images/sangsangseoga_official_logo_1782313504336.jpg';
import {
  Sparkles, 
  BookOpen, 
  Heart, 
  Eye, 
  Search, 
  SlidersHorizontal, 
  Plus, 
  Award, 
  UserPlus, 
  Share2, 
  FileText, 
  BookMarked, 
  UserCheck, 
  Check, 
  Lock, 
  TrendingUp, 
  Clock,
  ArrowRight,
  ChevronRight,
  MessageSquare,
  Smile,
  Feather,
  Coffee,
  Lightbulb
} from 'lucide-react';
import { useDashboardState } from '../hooks/useDashboardState';
import { useAuth } from '../../../shared/context/AuthContext';

export const MainDashboard = (props) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const {
    isPremium,
    usage,

    libraryGenreFilter, setLibraryGenreFilter,
    librarySearchQuery, setLibrarySearchQuery,
    librarySort, setLibrarySort,
    isFollowing, setIsFollowing,

    filteredRankingBooks,
    filteredNewBooks,
    filteredReviews,

    genre, setGenre,
    prompt, setPrompt,
    generateImage, setGenerateImage,
    isGenerating,
    generatedResult,
    showAtelierSection, setShowAtelierSection,

    showFreeTrialCapModal, setShowFreeTrialCapModal,
    showPremiumSoftCapModal, setShowPremiumSoftCapModal,

    handleGenerate,

    myCabinetBooks,
    friendBooks,
    filteredCabinetBooks,

    weeklyRanking,
    weeklyNewReleases,
    isAggregating,
    handleTriggerWeeklyRankingAggregate,
  } = useDashboardState(props);

  return (
    <div className="min-h-screen bg-[#FAF9FF] text-[#2F2D59] font-sans pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* ==================== HOME (홈) ==================== */}
          <div className="space-y-10 relative">
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#E6E2FC] rounded-full filter blur-[100px] opacity-65 pointer-events-none"></div>
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#EDF5FF] rounded-full filter blur-[120px] opacity-70 pointer-events-none"></div>
            
            <div className="relative w-full aspect-[21/9] sm:aspect-[24/7] rounded-3xl overflow-hidden shadow-md border border-[#E6E2FC]/40 z-10 bg-[#FAF9FF] flex items-center">
              <img 
                src={homeBooksUrl} 
                alt="상상서가 책장 배너" 
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1E1B4B]/80 via-[#1E1B4B]/40 to-transparent"></div>
              
              <div className="relative z-10 px-8 sm:px-14 text-left space-y-2 sm:space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-[10px] sm:text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                  <span>내 손끝에서 탄생하는 한 권의 명작</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  상상을 이야기로,<br />
                  이야기를 책으로.
                </h1>
                <p className="text-[11px] sm:text-xs text-[#E6E2FC] leading-relaxed max-w-sm">
                  원하는 생각을 단어로 가볍게 엮어보세요. 아기자기하고 세련된 일러스트와 서정적인 구절들이 멋진 작품으로 탄생합니다.
                </p>
              </div>
            </div>

            <div className="space-y-5 z-10 relative pt-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-[#2F2D59]">
                장르별로 시작하기
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
                {[
                  {
                    name: '동화',
                    imageUrl: genreFairyTaleUrl,
                    desc: '아이와 어른 모두의 마음에 남는 이야기',
                    to: '/create/fairy-tale'
                  },
                  {
                    name: '소설',
                    imageUrl: genreNovelUrl,
                    desc: '상상력으로 빚어낸 긴 이야기',
                    to: '/create/novel'
                  },
                  {
                    name: '시',
                    imageUrl: genrePoemUrl,
                    desc: '마음을 울리는 짧고 아름다운 문장',
                    to: '/create/poem'
                  },
                  {
                    name: '에세이',
                    imageUrl: genreEssayUrl,
                    desc: '일상과 생각을 나만의 시선으로',
                    to: '/create/essay'
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate(item.to)}
                    className="bg-white rounded-2xl border border-[#E6E2FC]/40 shadow-xs hover:shadow-md overflow-hidden cursor-pointer group hover:scale-[1.02] transition-all duration-300 flex flex-col h-full"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden relative">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                    </div>

                    <div className="p-4 text-left flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h3 className="text-sm sm:text-base font-extrabold text-[#2F2D59] group-hover:text-[#6B54E7] transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-[#7C769D] leading-normal font-medium">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {isAuthenticated && (
            <div className="space-y-4 pt-4 z-10 relative">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 cursor-pointer group" onClick={() => navigate('/library')}>
                  <h2 className="text-base sm:text-lg font-extrabold text-navy-purple hover:text-brand-purple transition-colors flex items-center gap-1">
                    <span>최근 읽은 작품</span>
                    <ChevronRight className="w-4 h-4 text-navy-purple group-hover:translate-x-0.5 transition-transform" />
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: 1, title: '별이 잠든 밤', category: '판타지', author: '상상의작가', progress: 63, cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4qbLMXrDeSvtACQrqxaabRXhUcLWI6ISEPbVCL4zP57a5y85IerCnkSy5pgzsSQmnNvDc1q2s-ibxVkN7ZqJ31_b8pC4F9l3lfBrQYbyPWPxUbP86iX2oTav5lZ0ev4-koEU62F0a8awUxxeRhuKpbx11aiJCLL1Ac5DNjJFB_E6OqjY7OCfsrzj9vnGnBx1ksipJacKjVdyp8736LnR-kx6bUc_klYIKrF7BlzGIXFzpeSpGXPTsZHSfJlVMQOc3tUYU5ecEPPc' },
                  { id: 2, title: '바람이 분다, 여름', category: '소설', author: '은우 작가', progress: 40, cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQHaZbTIh-qZz2zWXqdVpVBhMMmTyM82fnx_hh17ZiHkj27S_HTNBgEow5mw54n8enyKHv0aPXoZbHoIIXHQmmXPYyRAtWlG3basGWcjJDb2OGTNsSjQRphauo8WObivk8sXjpu1J1CjKEOqGmfZ3pHaollH6-uGl4Z_VNgSwPD_VrGTnOK5yRUg1QsaQIefQG1oXxyMmfjWGkX2FLRL5jfOanTv7SGBdqwgeB-adv_ra9SHzaImv3uqDJp5GDI4pKZeRAApklAaA' },
                  { id: 3, title: '그날의 우리', category: '로맨스', author: '서린 작가', progress: 22, cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2O_PD7xdQCc_iGfXoKwNrVIurVlo0ugo_weeYOYZOG-Wh7f6vj3_DVFNiSln1HzMbFHhwypEYn9qPXQRQ2x8rytzojL6ot4tX_9mXRZB-OO0IANHl_DZM9OrB17ajZemU93sWq3W66bOlFJdjmkeDtvqCmbG_BQln7wrzg4vFRQrmn0Mqlbt4NOhAIZX_FDgxT1X3R9q6wVpNMIjLbN0ioReZ88c5QTD0GfjDeChjMbk1UZw-N3JIAVoL1fzcD4ansUKeIZxSdXk' },
                ].map((book) => (
                  <div
                    key={book.id}
                    onClick={() => alert('이어서 읽기 기능은 준비 중입니다.')}
                    className="bg-white rounded-2xl border border-lavender-border shadow-xs p-4 flex flex-col justify-between hover:shadow-md hover:border-brand-purple/50 transition-all group cursor-pointer"
                  >
                    <div className="flex gap-4">
                      <div className="w-16 h-24 rounded-lg overflow-hidden shrink-0 border border-lavender-border shadow-sm">
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-grow min-w-0 text-left">
                        <span className="text-[9px] font-bold text-navy-purple bg-white border border-lavender-border px-2 py-0.5 rounded-full">{book.category}</span>
                        <h4 className="font-bold text-sm text-navy-purple mt-1 truncate tracking-tight">{book.title}</h4>
                        <p className="text-[10px] text-purple-gray-text mt-0.5 truncate">글쓴이: {book.author}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 mt-3">
                      <div className="flex justify-between items-center text-[10px] font-bold text-purple-gray-text">
                        <span>독서 진행률</span>
                        <span className="text-navy-purple">{book.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-lavender-bg rounded-full overflow-hidden">
                        <div className="h-full bg-brand-purple rounded-full" style={{ width: `${book.progress}%` }}></div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); alert('이어서 읽기 기능은 준비 중입니다.'); }}
                      className="w-full text-center py-2 bg-brand-purple hover:bg-brand-dark text-white font-bold text-xs rounded-full cursor-pointer transition-all flex items-center justify-center gap-1 mt-3 shadow-sm"
                    >
                      이어 읽기 <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            )}

            <div className="space-y-4 pt-4 z-10 relative">
              <div className="flex justify-between items-center">
                <h2 className="text-base sm:text-lg font-extrabold text-[#2F2D59]">이번 주 인기 TOP5</h2>
              </div>

              {weeklyRanking.length === 0 ? (
                <p className="text-xs text-[#B9B0DC] font-bold py-6 text-center">이번 주 랭킹 데이터가 아직 없습니다</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
                  {weeklyRanking.map((book) => (
                    <div key={book.id} onClick={() => navigate(`/friends/${book.id}`)} className="group cursor-pointer">
                      <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-sm border border-gray-200 group-hover:shadow-md group-hover:border-[#d4cdf2] transition-all duration-300 group-hover:-translate-y-1 bg-white">
                        <img
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          src={book.cover}
                          alt={book.title}
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/75 via-transparent to-transparent" />
                        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-[#6B54E7] text-white font-black text-[11px] flex items-center justify-center shadow-md border border-white/30">
                          {book.rank}
                        </div>
                        <div className="absolute bottom-0 inset-x-0 p-3 text-left">
                          <h4 className="text-white text-[13px] font-semibold leading-tight line-clamp-2 mb-1.5">{book.title}</h4>
                          <div className="flex items-center gap-2.5 text-white/80 text-[10px]">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3.5 h-3.5" />
                              {book.likeCount >= 1000 ? `${(book.likeCount / 1000).toFixed(1)}k` : book.likeCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5" />
                              {(book.viewCount ?? 0) >= 1000 ? `${(book.viewCount / 1000).toFixed(1)}k` : (book.viewCount ?? 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-center">
                        <button
                          onClick={e => { e.stopPropagation(); navigate(`/authors/${encodeURIComponent(book.author)}`); }}
                          className="text-[12px] font-medium text-[#2f2d59] hover:text-[#6b54e7] transition-colors cursor-pointer"
                        >
                          {book.author}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4 pt-8 z-10 relative">
              <div className="flex justify-between items-center">
                <h2 className="text-base sm:text-lg font-extrabold text-[#2F2D59]">이번 주 신작 TOP5</h2>
              </div>

              {weeklyNewReleases.length > 0 && weeklyNewReleases.length < 5 && (
                <p className="text-xs text-[#7C769D] font-bold">이번 주 신작은 {weeklyNewReleases.length}권 뿐이에요</p>
              )}

              {weeklyNewReleases.length === 0 ? (
                <p className="text-xs text-[#B9B0DC] font-bold py-6 text-center">이번 주 신작이 아직 없습니다</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
                  {weeklyNewReleases.map((book) => (
                    <div key={book.id} onClick={() => navigate(`/friends/${book.id}`)} className="group cursor-pointer">
                      <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-sm border border-gray-200 group-hover:shadow-md group-hover:border-[#d4cdf2] transition-all duration-300 group-hover:-translate-y-1 bg-white">
                        <img
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          src={book.cover}
                          alt={book.title}
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/75 via-transparent to-transparent" />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold border backdrop-blur-sm bg-[#6b54e7]/90 text-white border-white/30">
                          NEW
                        </div>
                        <div className="absolute bottom-0 inset-x-0 p-3 text-left">
                          <h4 className="text-white text-[13px] font-semibold leading-tight line-clamp-2 mb-1.5">{book.title}</h4>
                          <div className="flex items-center gap-2.5 text-white/80 text-[10px]">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3.5 h-3.5" />
                              {book.likeCount >= 1000 ? `${(book.likeCount / 1000).toFixed(1)}k` : book.likeCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5" />
                              {(book.viewCount ?? 0) >= 1000 ? `${(book.viewCount / 1000).toFixed(1)}k` : (book.viewCount ?? 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-center">
                        <button
                          onClick={e => { e.stopPropagation(); navigate(`/authors/${encodeURIComponent(book.author)}`); }}
                          className="text-[12px] font-medium text-[#2f2d59] hover:text-[#6b54e7] transition-colors cursor-pointer"
                        >
                          {book.author}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {isAuthenticated && (
            <div className="space-y-5 pt-8 pb-4 z-10 relative">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#6B54E7]/10 rounded-xl">
                    <Sparkles className="w-5 h-5 text-[#6B54E7]" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-[#2F2D59]">
                    팔로우한 작가의 반가운 신작
                  </h2>
                </div>
                <button 
                  onClick={() => navigate('/friends')}
                  className="text-xs sm:text-sm text-[#7C769D] hover:text-[#6B54E7] font-bold flex items-center gap-1 transition-colors"
                >
                  <span>모두 보기</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
                {[
                  {
                    author: '은우 작가',
                    title: '달빛 아래, 우리',
                    category: '로맨스',
                    likes: '1.2K',
                    replies: '312',
                    cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4qbLMXrDeSvtACQrqxaabRXhUcLWI6ISEPbVCL4zP57a5y85IerCnkSy5pgzsSQmnNvDc1q2s-ibxVkN7ZqJ31_b8pC4F9l3lfBrQYbyPWPxUbP86iX2oTav5lZ0ev4-koEU62F0a8awUxxeRhuKpbx11aiJCLL1Ac5DNjJFB_E6OqjY7OCfsrzj9vnGnBx1ksipJacKjVdyp8736LnR-kx6bUc_klYIKrF7BlzGIXFzpeSpGXPTsZHSfJlVMQOc3tUYU5ecEPPc'
                  },
                  {
                    author: '서린 작가',
                    title: '햇살이 스며든 날들',
                    category: '에세이',
                    likes: '864',
                    replies: '198',
                    cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBL9C026912DWIR1LG1aQKUHDO0L5tB1PxdJVonj8bxfKQ75IV6uR99DoLyUg5iNVqKW4ev8bK2aL2BlTbVxn229HmaAO9sRDdAPkLWiWlcE1gawXlfOmeRX8WJCPiDsttSWRVJOOhgVWLBXWfS6LVxJ9kjDI9wPvEkD851Ok7e_hSpVr0cTBTFVYvIJLm8XNQzQx_ESFnx3tM27mBrOsK16EdHSGfyOc0zpOhyvCEZWSpb7Y7A8kZ3Gl2NKGhuOZgXcTEJ_E7Pgf0'
                  },
                  {
                    author: '하루 작가',
                    title: '별을 향한 약속',
                    category: '판타지',
                    likes: '1.6K',
                    replies: '245',
                    cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQHaZbTIh-qZz2zWXqdVpVBhMMmTyM82fnx_hh17ZiHkj27S_HTNBgEow5mw54n8enyKHv0aPXoZbHoIIXHQmmXPYyRAtWlG3basGWcjJDb2OGTNsSjQRphauo8WObivk8sXjpu1J1CjKEOqGmfZ3pHaollH6-uGl4Z_VNgSwPD_VrGTnOK5yRUg1QsaQIefQG1oXxyMmfjWGkX2FLRL5jfOanTv7SGBdqwgeB-adv_ra9SHzaImv3uqDJp5GDI4pKZeRAApklAaA'
                  }
                ].map((card, idx) => (
                  <div key={idx} onClick={() => alert('작품 상세 페이지는 준비 중입니다.')} className="group cursor-pointer">
                    <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden shadow-sm border border-gray-200 group-hover:shadow-md group-hover:border-[#d4cdf2] transition-all duration-300 group-hover:-translate-y-1 bg-white">
                      <img
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        src={card.cover}
                        alt={card.title}
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/75 via-transparent to-transparent" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold border backdrop-blur-sm bg-[#6b54e7]/90 text-white border-white/30">
                        {card.category}
                      </div>
                      <div className="absolute bottom-0 inset-x-0 p-3 text-left">
                        <h4 className="text-white text-[13px] font-semibold leading-tight line-clamp-2 mb-1.5">{card.title}</h4>
                        <div className="flex items-center gap-2.5 text-white/80 text-[10px]">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5" />
                            {card.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            {card.replies}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/authors/${encodeURIComponent(card.author)}`); }}
                        className="text-[12px] font-medium text-[#2f2d59] hover:text-[#6b54e7] transition-colors cursor-pointer"
                      >
                        {card.author}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}

          </div>

              </div>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-8 border-t border-[#D4CDF2] text-xs text-left text-[#7C769D]">
        <div className="flex items-center gap-2">
          <img
            src={logoUrl}
            alt="상상서가"
            referrerPolicy="no-referrer"
            className="h-8 w-auto object-contain mix-blend-multiply opacity-90"
          />
          <span className="text-[10px] text-[#7C769D]">| AI가 당신의 상상을 멋진 책으로</span>
        </div>
      </footer>

      {showFreeTrialCapModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-250">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 text-left shadow-2xl space-y-4 border border-[#D4CDF2]">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              🎁 무료 체험 완료
            </div>
            <h3 className="text-lg font-bold text-[#2F2D59]">
              무료 체험 기회를 모두 사용하셨습니다
            </h3>
            <p className="text-xs text-[#7C769D] leading-relaxed">
              준비된 신규 가입자 전용 무료 체험 혜택을 전부 소진하셨습니다.<br />
              <strong className="text-[#2F2D59] font-bold">· 남은 횟수: 텍스트 {usage?.text?.remaining ?? 0}/{usage?.text?.limit ?? 0}회 | 이미지 {usage?.image?.remaining ?? 0}/{usage?.image?.limit ?? 0}회</strong><br /><br />
              계속해서 예쁜 소설과 동화책을 집필하고 삽화를 완성하려면 <strong>프리미엄 요금제</strong>를 구독해 보세요.
            </p>
            <div className="flex flex-col gap-2 pt-2 text-xs">
              <button
                onClick={() => {
                  setShowFreeTrialCapModal(false);
                  navigate('/subscription');
                }}
                className="w-full py-3 bg-[#6B54E7] hover:bg-[#6148E1] text-white font-extrabold rounded-xl transition-all shadow-md text-center cursor-pointer"
              >
                프리미엄 이용권 구독하기
              </button>
              <button
                onClick={() => setShowFreeTrialCapModal(false)}
                className="w-full py-2 bg-white text-slate-400 hover:text-slate-650 font-bold transition-all text-center cursor-pointer"
              >
                나중에 하기
              </button>
            </div>
          </div>
        </div>
      )}

      {showPremiumSoftCapModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-250">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 sm:p-8 text-left shadow-2xl space-y-4 border border-[#D4CDF2]">
            <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              ⚡ 일일 한도 소진 안내
            </div>
            <h3 className="text-lg font-bold text-[#2F2D59]">
              오늘 도서 생성 권장량을 초과하였습니다
            </h3>
            <p className="text-xs text-[#7C769D] leading-relaxed">
              오늘 사용 가능한 텍스트/이미지 생성 횟수를 모두 사용하셨습니다. 작성 중이던 원고는 내 서재에 안전하게 보관되어 있습니다.<br /><br />
              매일 자정(00:00)이 지나면 생성 횟수가 초기화됩니다.
            </p>
            <div className="flex flex-col gap-2 pt-2 text-xs">
              <button
                onClick={() => {
                  setShowPremiumSoftCapModal(false);
                  navigate('/subscription');
                }}
                className="w-full py-3 bg-[#6B54E7] hover:bg-[#6148E1] text-white font-bold rounded-xl transition-all text-center cursor-pointer"
              >
                구독 상태 확인하러 가기
              </button>
              <button
                onClick={() => setShowPremiumSoftCapModal(false)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-center cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {showAtelierSection && (
        <div className="fixed inset-0 bg-[#2F2D59]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white max-w-2xl w-full rounded-3xl p-6 sm:p-8 text-left shadow-2xl space-y-6 border border-[#E6E2FC] relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowAtelierSection(false)}
              className="absolute top-4 right-4 text-[#7C769D] hover:text-[#2F2D59] p-2 text-lg font-bold cursor-pointer"
            >
              ✕
            </button>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-neutral-100">
              <div>
                <h4 className="text-base font-bold text-[#2F2D59] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#6B54E7]" />
                  상상서가 어시스턴트
                </h4>
                <p className="text-xs text-[#7C769D] mt-0.5">
                  아이디어와 생각을 넣으시면 따뜻한 구절과 표지를 즉석에서 완성해 드립니다.
                </p>
              </div>
              
              <div className="flex gap-1 bg-[#F3F0FF] p-1 rounded-xl">
                {['fantasy', 'mystery', 'historical'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGenre(g)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${genre === g ? 'bg-[#6B54E7] text-white shadow-xs' : 'text-[#7C769D] hover:text-[#2F2D59]'}`}
                  >
                    {g === 'fantasy' ? '동화 / 판타지' : g === 'mystery' ? '소설 / 미스터리' : '시 / 에세이'}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#FAF9FF] border border-neutral-100 p-3.5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 font-sans text-xs">
              {isPremium ? (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-bold text-[#6B54E7]">프리미엄 창작방</span>
                  <span className="text-[#B9B0DC]">|</span>
                  <span className="text-[#7C769D]">
                    오늘 남은 횟수: <strong className="text-[#2F2D59]">텍스트 {usage?.text?.remaining ?? '-'}/{usage?.text?.limit ?? '-'}회 · 이미지 {usage?.image?.remaining ?? '-'}/{usage?.image?.limit ?? '-'}회</strong>
                  </span>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B9B0DC]"></span>
                  <span className="font-bold text-[#2F2D59]">무료 가입자 체험 패키지</span>
                  <span className="text-[#D4CDF2]">|</span>
                  {(usage?.text?.remaining ?? 0) > 0 ? (
                    <span className="text-[#6B54E7] font-semibold">
                      남은 무료 체험 (텍스트 {usage?.text?.remaining}/{usage?.text?.limit}회 | 이미지 {usage?.image?.remaining}/{usage?.image?.limit}회)
                    </span>
                  ) : (
                    <span className="text-[#7C769D] font-bold">
                      무료 체험 완료 • 계속 집필하려면 프리미엄 구독이 필요합니다
                    </span>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => { setShowAtelierSection(false); navigate('/subscription'); }}
                className="text-[#6B54E7] hover:underline font-extrabold text-[11px] flex items-center gap-0.5 cursor-pointer"
              >
                한도 충전 및 관리하기 →
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="상상하시는 구절이나 모티프를 자유롭게 적어보세요..."
                  className="flex-1 px-4 py-3 bg-white border border-neutral-200 text-sm rounded-xl focus:ring-2 focus:ring-[#6B54E7] focus:outline-none placeholder-[#B9B0DC]"
                />
                
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-6 py-3 bg-[#6B54E7] hover:bg-[#6148E1] disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"></span>
                      <span>작성 중...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>이야기 짓기</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 px-1">
                <input
                  type="checkbox"
                  id="generate-image-checkbox"
                  checked={generateImage}
                  onChange={(e) => setGenerateImage(e.target.checked)}
                  className="w-4 h-4 rounded text-[#6B54E7] focus:ring-[#6B54E7] border-neutral-300 cursor-pointer"
                />
                <label htmlFor="generate-image-checkbox" className="text-xs text-[#7C769D] select-none cursor-pointer flex items-center gap-1">
                  <span>고해상도 AI 미술 삽화 한 장 동시 생성하기</span>
                  <span className="text-[10px] bg-[#E6E2FC] text-[#6B54E7] px-1.5 py-0.5 rounded font-bold">(체험 가중치 차감)</span>
                </label>
              </div>
            </form>

            {(isGenerating || generatedResult) && (
              <div className="p-5 rounded-2xl bg-[#FAF9FF] border border-[#E6E2FC]/40 space-y-3">
                {isGenerating ? (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-4 bg-[#D4CDF2] rounded w-1/4"></div>
                    <div className="h-3 bg-[#E6E2FC] rounded w-full"></div>
                    <div className="h-3 bg-[#E6E2FC] rounded w-5/6"></div>
                  </div>
                ) : generatedResult ? (
                  <div className="text-left space-y-3">
                    <span className="inline-block text-[10px] bg-[#6B54E7] text-white px-2 py-0.5 rounded-full font-bold">
                      AI 아틀리에 초고 완성
                    </span>
                    <h4 className="text-base font-bold text-[#2F2D59]">
                      {generatedResult.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#2F2D59]/90 leading-relaxed font-serif whitespace-pre-wrap italic">
                      {generatedResult.content}
                    </p>

                    {generateImage && (
                      <div className="mt-4 pt-3 border-t border-neutral-150 flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-24 h-32 rounded-xl bg-[#E6E2FC] overflow-hidden flex-shrink-0 shadow-sm">
                          <img 
                            src={ILLUSTRATION_BOOKS} 
                            alt="AI generated magical illustration" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <p className="text-xs text-[#7C769D] leading-relaxed">
                          <strong>[AI 동시 삽화 생성 완료]</strong> 위 책방 내용과 서사 구조에 어울리도록 연보라 은하수 톤과 따뜻한 유광 파스텔 색연필 화풍을 믹스한 아기자기한 삽화가 매칭되었습니다.
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end pt-3 space-x-2 border-t border-neutral-150 mt-3">
                      <button 
                        type="button"
                        onClick={() => { alert('내 서재에 챕터가 안전하게 보관되었습니다.'); }}
                        className="px-3 py-1.5 bg-white border border-neutral-200 hover:bg-[#FAF9FF] text-[11px] text-[#6B54E7] rounded-lg font-bold cursor-pointer"
                      >
                        내 서재에 보관
                      </button>
                      <button 
                        type="button"
                        onClick={() => { setShowAtelierSection(false); navigate('/subscription'); }}
                        className="px-3.5 py-1.5 bg-[#6B54E7] hover:bg-[#6148E1] text-white text-[11px] rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>출판 및 소장 신청</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
