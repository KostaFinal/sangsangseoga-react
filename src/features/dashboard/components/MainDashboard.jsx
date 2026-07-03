import React, { useState, useMemo, useEffect } from 'react';
import { 
  rankingBooksList, 
  newBooksList, 
  aiReviewList, 
  HERO_BG_IMAGE,
  CURRENT_USER_PROFILE,
  ILLUSTRATION_BOOKS
} from '../../../shared/data';
import heroIllustrationUrl from '../../../assets/images/sangsangseoga_hero_illustration_1782314686916.jpg';
import homeBooksUrl from '../../../assets/images/home_books.png';
import genreFairyTaleUrl from '../../../assets/images/genre_fairy_tale.jpg';
import genreNovelUrl from '../../../assets/images/genre_novel.jpg';
import genrePoemUrl from '../../../assets/images/genre_poem.jpg';
import genreEssayUrl from '../../../assets/images/genre_essay.jpg';
import genreInfoUrl from '../../../assets/images/genre_info.jpg';
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
  MoreHorizontal,
  ChevronRight,
  MessageSquare,
  Smile,
  Feather,
  Coffee,
  Lightbulb
} from 'lucide-react';

export const MainDashboard = ({ 
  onNavigate, 
  onLogout, 
  setActiveTab,
  isPremium,
  freeTrialRemaining,
  setFreeTrialRemaining,
  freeTrialTextTokens,
  setFreeTrialTextTokens,
  freeTrialImageCount,
  setFreeTrialImageCount,
  extraCreditsRemaining,
  setExtraCreditsRemaining,
  dailyScore,
  setDailyScore,
  dailyTextTokens,
  setDailyTextTokens,
  dailyImageCount,
  setDailyImageCount,
  isSubscriptionCanceled
}) => {
  // Local state for genre filter in "내 서재"
  const [libraryGenreFilter, setLibraryGenreFilter] = useState('전체');
  
  // Local state for searching & sorting in "내 서재"
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');
  const [librarySort, setLibrarySort] = useState('최신 수정순');

  // Local state for following "별하나" in "친구의 서재"
  const [isFollowing, setIsFollowing] = useState(false);

  // Filter lists for admin blocks
  const filteredRankingBooks = useMemo(() => {
    const blockedBooks = JSON.parse(localStorage.getItem('blocked_books') || '[]');
    const blockedAuthors = JSON.parse(localStorage.getItem('blocked_authors') || '[]');
    return rankingBooksList.filter(book => 
      !blockedBooks.includes(book.id) && 
      !blockedAuthors.includes(book.authorEmail) &&
      !blockedAuthors.some(authorId => book.author === authorId || book.authorEmail === authorId)
    );
  }, []);

  const filteredNewBooks = useMemo(() => {
    const blockedBooks = JSON.parse(localStorage.getItem('blocked_books') || '[]');
    const blockedAuthors = JSON.parse(localStorage.getItem('blocked_authors') || '[]');
    return newBooksList.filter(book => 
      !blockedBooks.includes(book.id) && 
      !blockedAuthors.includes(book.authorEmail) &&
      !blockedAuthors.some(authorId => book.author === authorId || book.authorEmail === authorId)
    );
  }, []);

  const filteredReviews = useMemo(() => {
    const blockedBooks = JSON.parse(localStorage.getItem('blocked_books') || '[]');
    const blockedAuthors = JSON.parse(localStorage.getItem('blocked_authors') || '[]');
    
    const blockedBookTitles = rankingBooksList
      .concat(newBooksList)
      .filter(b => blockedBooks.includes(b.id) || blockedAuthors.includes(b.authorEmail))
      .map(b => b.title);

    return aiReviewList.filter(rev => 
      !blockedBookTitles.includes(rev.bookTitle)
    );
  }, []);
  
  // Composer simulation state
  const [genre, setGenre] = useState('fantasy');
  const [prompt, setPrompt] = useState('시간 수집가가 가득 들어있는 고장 난 무라카미 시계점');
  const [generateImage, setGenerateImage] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [showAtelierSection, setShowAtelierSection] = useState(false);
  
  // Modals for token limits
  const [showFreeTrialCapModal, setShowFreeTrialCapModal] = useState(false);
  const [showPremiumSoftCapModal, setShowPremiumSoftCapModal] = useState(false);
  const [showExhaustedCreditsModal, setShowExhaustedCreditsModal] = useState(false);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    if (isPremium) {
      const estimatedPrice = 250;
      const imagePrice = generateImage ? 1200 : 0;
      const nextScore = dailyScore + estimatedPrice + imagePrice;

      if (dailyScore >= 5000 || nextScore > 5000) {
        setIsGenerating(false);
        setShowPremiumSoftCapModal(true);
        return;
      }

      setIsGenerating(true);
      setGeneratedResult(null);

      setTimeout(() => {
        setIsGenerating(false);
        setDailyScore(prev => prev + estimatedPrice + imagePrice);
        setDailyTextTokens(prev => prev + estimatedPrice);
        if (generateImage) {
          setDailyImageCount(prev => prev + 1);
        }

        setGeneratedResult({
          title: genre === 'fantasy' ? '시간을 녹이는 시계방 (Premium)' : genre === 'mystery' ? '어스름 저녁의 거짓말 (Premium)' : '유성우 내리는 밤의 기억 (Premium)',
          content: `천천히 흔들리며 돌아가는 톱니바퀴 너머로, 수집가는 먼지 낀 렌즈를 만지작거렸다. "${prompt}" 이라니, 상상했던 것보다 훨씬 더 따뜻한 발상이었다.\n\n"모든 흘러간 순간들은 결국 어딘가에 머무는 법이지. 당신이 문을 연 순간, 소중한 이야기가 새로이 피어나기 시작했다네..."`
        });
      }, 2000);

    } else {
      if (freeTrialRemaining > 0) {
        const nextTrialText = freeTrialTextTokens + 250;
        const nextTrialImage = freeTrialImageCount + (generateImage ? 1 : 0);

        if (freeTrialTextTokens >= 1000 || freeTrialImageCount >= 3 || nextTrialText > 1000 || nextTrialImage > 3) {
          setShowFreeTrialCapModal(true);
          return;
        }

        setIsGenerating(true);
        setGeneratedResult(null);

        setTimeout(() => {
          setIsGenerating(false);
          const textAdd = 250;
          const imgAdd = generateImage ? 1 : 0;

          setFreeTrialTextTokens(t => {
            const finalT = t + textAdd;
            if (finalT >= 1000) setFreeTrialRemaining(0);
            return finalT;
          });

          setFreeTrialImageCount(c => {
            const finalC = c + imgAdd;
            if (finalC >= 3) setFreeTrialRemaining(0);
            return finalC;
          });

          setGeneratedResult({
            title: genre === 'fantasy' ? '시간을 녹이는 시계방 (체험판)' : genre === 'mystery' ? '어스름 저녁의 거짓말 (체험판)' : '유성우 내리는 밤의 기억 (체험판)',
            content: `수집가는 먼지 낀 렌즈를 흔들며 엷은 미소를 지었다. "${prompt}" 의 이야기가 알록달록한 글귀가 되어 피어난다. \n\n"상상했던 그림책 속 이야기가 아주 아름답게 쓰였네. 책방에 하나씩 차곡차곡 채우다 보면 아주 훌륭한 작가가 될 거야."`
          });
        }, 2000);

      } else {
        if (extraCreditsRemaining > 0) {
          setIsGenerating(true);
          setGeneratedResult(null);

          setTimeout(() => {
            setIsGenerating(false);
            setExtraCreditsRemaining(c => c - 1);

            setGeneratedResult({
              title: genre === 'fantasy' ? '시간을 녹이는 시계방 (생성권 사용)' : genre === 'mystery' ? '어스름 저녁의 거짓말 (생성권 사용)' : '유성우 내리는 밤의 기억 (생성권 사용)',
              content: `금빛 생성권이 반짝이며 이야기 장치에 따뜻한 빛을 불어넣는다. "${prompt}" 에 담긴 멋진 이야기들이 가득 채워져 내린다.\n\n"새로운 원고가 책방에 추가되어 언제든 꺼내볼 수 있게 되었습니다."`
            });
          }, 2000);

        } else {
          setShowExhaustedCreditsModal(true);
          return;
        }
      }
    }
  };

  // Static items for "내 서재" view
  const myCabinetBooks = [
    { id: 301, title: '별빛이 된 고래', category: '동화', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4qbLMXrDeSvtACQrqxaabRXhUcLWI6ISEPbVCL4zP57a5y85IerCnkSy5pgzsSQmnNvDc1q2s-ibxVkN7ZqJ31_b8pC4F9l3lfBrQYbyPWPxUbP86iX2oTav5lZ0ev4-koEU62F0a8awUxxeRhuKpbx11aiJCLL1Ac5DNjJFB_E6OqjY7OCfsrzj9vnGnBx1ksipJacKjVdyp8736LnR-kx6bUc_klYIKrF7BlzGIXFzpeSpGXPTsZHSfJlVMQOc3tUYU5ecEPPc', date: '2024.05.28 14:30' },
    { id: 302, title: '초록의 계절', category: '소설', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQHaZbTIh-qZz2zWXqdVpVBhMMmTyM82fnx_hh17ZiHkj27S_HTNBgEow5mw54n8enyKHv0aPXoZbHoIIXHQmmXPYyRAtWlG3basGWcjJDb2OGTNsSjQRphauo8WObivk8sXjpu1J1CjKEOqGmfZ3pHaollH6-uGl4Z_VNgSwPD_VrGTnOK5yRUg1QsaQIefQG1oXxyMmfjWGkX2FLRL5jfOanTv7SGBdqwgeB-adv_ra9SHzaImv3uqDJp5GDI4pKZeRAApklAaA', date: '2024.05.27 09:15' },
    { id: 303, title: '너에게 가는 가장 느린 길', category: '시', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGreyv2VCoj1SJwbqdcjhrdvT4ozFoylrIcpjpy1mnc9dUMrk8t640Dx27FQffZMJWaK8o3IlvcqUizLvPBZHI9sbXmvrjwfCe3xg-3-a04c1kSYuQmO-_202kNkpSd0ISkWhbB6C0zZ-FzbO6aSER03Dt29sbdp73dOr1OzyQgsGUuZK1ov1P5THT8VHZ2SQQvRnIEdekIqTY0rrFecEtEv71DSQV8Qgbt0n79jVeDPUakxCXSB9I-aheu67K5DvPSMUiCZUaRV8', date: '2024.05.26 21:40' },
    { id: 304, title: '작은 하루의 기록', category: '에세이', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBL9C026912DWIR1LG1aQKUHDO0L5tB1PxdJVonj8bxfKQ75IV6uR99DoLyUg5iNVqKW4ev8bK2aL2BlTbVxn229HmaAO9sRDdAPkLWiWlcE1gawXlfOmeRX8WJCPiDsttSWRVJOOhgVWLBXWfS6LVxJ9kjDI9wPvEkD851Ok7e_hSpVr0cTBTFVYvIJLm8XNQzQx_ESFnx3tM27mBrOsK16EdHSGfyOc0zpOhyvCEZWSpb7Y7A8kZ3Gl2NKGhuOZgXcTEJ_E7Pgf0', date: '2024.05.25 16:10' },
    { id: 305, title: '등대가 건네는 말', category: '교육/지식', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaDaaVKQXJiSQ-D3L1F02zwhZ2prTvtAzSMhZjbbYH_cK2GWQhB7AQsuEZeUbdEi8l5QoglpYbdXwhGKJaQiOdO76asNfdM1c0o4uqu_5NmypZk44uuOzQj3JQJtMqHZMcNTKB1keJ3Tv5r3AP1EINS9skP6DzsFzORmTdSA67hSZHoo-RUlel0KgvAof3zq2I4BfTwIv-6BUEj7qGsnb6L9Z5awI2d6ImWdfF2GMx4ET2zXRLJLFo7qeehBzKVTfs5gpDrXWAxwM', date: '2024.05.24 10:05' },
    { id: 306, title: '겨울, 그리고 우리', category: '소설', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6zPpuADYLE4UddvrL9_GPFaghMkihFhNSA5Q0uEmPX03CLHNK55MvdOPdKqz6C6Tw-KY7ZjA4YHpLOqiKayz5rdxk9MKC-S6L_iTf9VFgvtriHMKWrW-Bx028hoUurbMFFwpCtp2JHXPkngAFI_h-0Niar3MYpfvUWfeQk2dfAlRU57abyGrYzPxWkYXY-EhQE1gmx2voruHMq_4jXGHWVo6KyfbBFgwIZbR_EmjG5mPH0036MoFnzchL12D6YIHAN5mTEAK-G6w', date: '2024.05.23 22:18' }
  ];

  const filteredCabinetBooks = useMemo(() => {
    return myCabinetBooks.filter(b => {
      const matchGenre = libraryGenreFilter === '전체' || b.category === libraryGenreFilter;
      const matchSearch = b.title.toLowerCase().includes(librarySearchQuery.toLowerCase());
      return matchGenre && matchSearch;
    });
  }, [libraryGenreFilter, librarySearchQuery]);

  // Friend's books list (8 items)
  const friendBooks = [
    { id: 401, title: '여름의 조각들', category: '에세이', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAlgov4Ndwbkqsdj-Wy320A6sm5eIrOAh0fJ9iql5uxYkUWODJzuvxDJGOarbrHyWZpKki_6W--5-y1C2PHZRmzdsgBb7BLEc8IxTCMXTW9R0hfy7uqjy5U1X7Aihqk1llWQjtgmHQkRnbckz8nBMYbpe4r_WXrVQNutTxX7SutNuluLR0MbYoKoVS6SETBbzSXShKPS2VAUTzYyUUYyHFcm5k7kpBLau2Lk4MiFNQyio7tD96chDlTfKp3NSSvNmq4rM8O8j0oGM', date: '2024.05.28', likes: '321', views: '1.1k' },
    { id: 402, title: '밤하늘 산책', category: '시', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4qbLMXrDeSvtACQrqxaabRXhUcLWI6ISEPbVCL4zP57a5y85IerCnkSy5pgzsSQmnNvDc1q2s-ibxVkN7ZqJ31_b8pC4F9l3lfBrQYbyPWPxUbP86iX2oTav5lZ0ev4-koEU62F0a8awUxxeRhuKpbx11aiJCLL1Ac5DNjJFB_E6OqjY7OCfsrzj9vnGnBx1ksipJacKjVdyp8736LnR-kx6bUc_klYIKrF7BlzGIXFzpeSpGXPTsZHSfJlVMQOc3tUYU5ecEPPc', date: '2024.05.27', likes: '289', views: '972' },
    { id: 403, title: '고양이 탐정 나비의 비밀', category: '동화', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCznlvT7W-W0NUxinTfAkyigdk2z3I-k-uZK5biSPoGv-2D69bAp-MLEgeUx5_bmFFebrWpllo42X0LF3ihgtEq_p51DrgtnqEOxsjsT2H7Q-4z9A8CHXtLdWGVPongYJImv13zsDsLze4Y5uqVGkpuCACb2TG-2iz1K-vbt4oS_rN6GRYPOtDCaDeTYNF5cOuMY590pmj3N-GlXuNg4x60NRJiF503Y7d0x4f_0J72onLQeH8GK5y5bHOU6vlUE5fnCZo9xc1SEig', date: '2024.05.26', likes: '445', views: '1.6k' },
    { id: 404, title: '커피 한 잔의 인문학', category: '교육/지식', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2O_PD7xdQCc_iGfXoKwNrVIurVlo0ugo_weeYOYZOG-Wh7f6vj3_DVFNiSln1HzMbFHhwypEYn9qPXQRQ2x8rytzojL6ot4tX_9mXRZB-OO0IANHl_DZM9OrB17ajZemU93sWq3W66bOlFJdjmkeDtvqCmbG_BQln7wrzg4vFRQrmn0Mqlbt4NOhAIZX_FDgxT1X3R9q6wVpNMIjLbN0ioReZ88c5QTD0GfjDeChjMbk1UZw-N3JIAVoL1fzcD4ansUKeIZxSdXk', date: '2024.05.24', likes: '233', views: '801' },
    { id: 405, title: '기억의 온도', category: '소설', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaDaaVKQXJiSQ-D3L1F02zwhZ2prTvtAzSMhZjbbYH_cK2GWQhB7AQsuEZeUbdEi8l5QoglpYbdXwhGKJaQiOdO76asNfdM1c0o4uqu_5NmypZk44uuOzQj3JQJtMqHZMcNTKB1keJ3Tv5r3AP1EINS9skP6DzsFzORmTdSA67hSZHoo-RUlel0KgvAof3zq2I4BfTwIv-6BUEj7qGsnb6L9Z5awI2d6ImWdfF2GMx4ET2zXRLJLFo7qeehBzKVTfs5gpDrXWAxwM', date: '2024.05.23', likes: '512', views: '1.7k' },
    { id: 406, title: '단단한 마음 연습', category: '에세이', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDra40jzJO5MIslf39NjFPm_5AXP_36tnCR4qTZi0w_TzI4IyrIrsf7PJqxFo0B0eB0-tQ3e20wCkpgRDwIKgdDijHMYDkSLqnh26rOPVh0axoRcKGTkG2Y7h7ZCi6FKxfXfkU6mCrxG8tdffOx6ED-ivJN-UfC9wj686_sFEB3BWH-2TpoZSR6qtNOLl0oKp7MhNEI04ejrg5VpxxyWioZ_ez-099qQu-7U_eeV4CdJfnv3w8LJ5ozVnexb14fO80dJFduGSbOZ6E', date: '2024.05.22', likes: '276', views: '934' },
    { id: 407, title: '봄을 기다리는 사람에게', category: '시', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGreyv2VCoj1SJwbqdcjhrdvT4ozFoylrIcpjpy1mnc9dUMrk8t640Dx27FQffZMJWaK8o3IlvcqUizLvPBZHI9sbXmvrjwfCe3xg-3-a04c1kSYuQmO-_202kNkpSd0ISkWhbB6C0zZ-FzbO6aSER03Dt29sbdp73dOr1OzyQgsGUuZK1ov1P5THT8VHZ2SQQvRnIEdekIqTY0rrFecEtEv71DSQV8Qgbt0n79jVeDPUakxCXSB9I-aheu67K5DvPSMUiCZUaRV8', date: '2024.05.21', likes: '198', views: '668' },
    { id: 408, title: '바다를 건너는 법', category: '교육/지식', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQHaZbTIh-qZz2zWXqdVpVBhMMmTyM82fnx_hh17ZiHkj27S_HTNBgEow5mw54n8enyKHv0aPXoZbHoIIXHQmmXPYyRAtWlG3basGWcjJDb2OGTNsSjQRphauo8WObivk8sXjpu1J1CjKEOqGmfZ3pHaollH6-uGl4Z_VNgSwPD_VrGTnOK5yRUg1QsaQIefQG1oXxyMmfjWGkX2FLRL5jfOanTv7SGBdqwgeB-adv_ra9SHzaImv3uqDJp5GDI4pKZeRAApklAaA', date: '2024.05.20', likes: '221', views: '723' }
  ];

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
              <div className="flex justify-between items-baseline">
                <h2 className="text-lg sm:text-xl font-extrabold text-[#2F2D59]">
                  장르별로 시작하기
                </h2>
                <button
                  onClick={() => {
                    setGenre('fantasy');
                    setShowAtelierSection(true);
                  }}
                  className="text-xs sm:text-sm font-semibold text-[#6B54E7] hover:text-[#5b45d6] hover:underline flex items-center gap-1 cursor-pointer transition-all"
                >
                  <span>전체 장르 보기</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-5">
                {[
                  { 
                    name: '동화', 
                    genreKey: 'fantasy', 
                    imageUrl: genreFairyTaleUrl, 
                    desc: '아이와 어른 모두의 마음에 남는 이야기',
                    preset: '하늘을 유유히 여행하며 무지개빛 단비와 모험을 꾸리는 아기 은하수 고래 고고' 
                  },
                  { 
                    name: '소설', 
                    genreKey: 'mystery', 
                    imageUrl: genreNovelUrl, 
                    desc: '상상력으로 빚어낸 긴 이야기',
                    preset: '오래된 시골 기차역 대합실에서 우연히 발견된 오래된 금박 회중시계' 
                  },
                  { 
                    name: '시', 
                    genreKey: 'historical', 
                    imageUrl: genrePoemUrl, 
                    desc: '마음을 울리는 짧고 아름다운 문장',
                    preset: '가을 밤하늘에 흩어지는 은은한 별빛과 그리움에 대한 서정시' 
                  },
                  { 
                    name: '에세이', 
                    genreKey: 'historical', 
                    imageUrl: genreEssayUrl, 
                    desc: '일상과 생각을 나만의 시선으로',
                    preset: '오늘 하루 따뜻한 한 잔의 에스프레소가 건네는 조용하고 포근한 위로' 
                  },
                  { 
                    name: '교육/지식', 
                    genreKey: 'historical', 
                    imageUrl: genreInfoUrl, 
                    desc: '지식과 경험을 정리하고 공유해요',
                    preset: '조선 시대 규장각 학자들이 밤하늘을 관측하며 기록해 둔 비밀 별자리 정보' 
                  }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => {
                      if (item.name === '시') {
                        onNavigate('create-poem');
                      } else if (item.name === '에세이') {
                        onNavigate('create-essay');
                      } else if (item.name === '교육/지식') {
                        onNavigate('create-nonfiction');
                      } else {
                        setGenre(item.genreKey);
                        setPrompt(item.preset);
                        setShowAtelierSection(true);
                      }
                    }}
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

            <div className="space-y-4 pt-4 z-10 relative">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 cursor-pointer group" onClick={() => setActiveTab('mylibrary')}>
                  <h2 className="text-base sm:text-lg font-extrabold text-[#2F2D59] hover:text-[#6B54E7] transition-colors flex items-center gap-1">
                    <span>최근 읽은 작품</span>
                    <ChevronRight className="w-4 h-4 text-[#2F2D59] group-hover:translate-x-0.5 transition-transform" />
                  </h2>
                </div>
                <button className="text-[#7C769D] hover:text-[#2F2D59] p-1 rounded-lg hover:bg-[#FAF9FF] transition-all">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
              
              <div className="bg-white rounded-3xl p-6 shadow-xs border border-transparent flex flex-col md:flex-row gap-8">
                <div className="flex-1 flex flex-col sm:flex-row gap-6 text-left">
                  <div className="w-full sm:w-44 aspect-[3/4] rounded-2xl overflow-hidden shadow-md flex-shrink-0 relative group cursor-pointer" onClick={() => alert('이어서 읽기 기능은 준비 중입니다.')}>
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4qbLMXrDeSvtACQrqxaabRXhUcLWI6ISEPbVCL4zP57a5y85IerCnkSy5pgzsSQmnNvDc1q2s-ibxVkN7ZqJ31_b8pC4F9l3lfBrQYbyPWPxUbP86iX2oTav5lZ0ev4-koEU62F0a8awUxxeRhuKpbx11aiJCLL1Ac5DNjJFB_E6OqjY7OCfsrzj9vnGnBx1ksipJacKjVdyp8736LnR-kx6bUc_klYIKrF7BlzGIXFzpeSpGXPTsZHSfJlVMQOc3tUYU5ecEPPc" 
                      alt="별이 잠든 밤" 
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1.5 text-left">
                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-extrabold text-[#2F2D59] hover:text-[#6B54E7] cursor-pointer transition-colors" onClick={() => alert('이어서 읽기 기능은 준비 중입니다.')}>
                        별이 잠든 밤
                      </h3>
                      <p className="text-xs text-[#7C769D] font-bold">판타지 · 12화까지 읽음</p>
                      
                      <div className="flex items-center gap-3 pt-3.5 max-w-xs">
                        <div className="flex-1 h-1.5 bg-[#F3F0FF] rounded-full overflow-hidden">
                          <div className="h-full bg-[#6B54E7] rounded-full" style={{ width: '63%' }}></div>
                        </div>
                        <span className="text-[11px] font-bold text-[#7C769D]">63%</span>
                      </div>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-[#7C769D] leading-relaxed pr-4">
                      도시의 불빛이 모두 꺼진 밤, 소녀는 별빛이 이끄는 길을 따라 언덕을 올랐다.
                    </p>
                    
                    <div className="pt-2">
                      <button 
                        onClick={() => alert('이어서 읽기 기능은 준비 중입니다.')}
                        className="px-5 py-2 bg-[#F3F0FF] hover:bg-[#E6E2FC] text-[#6B54E7] text-xs font-bold rounded-xl inline-flex items-center gap-1 cursor-pointer transition-all hover:shadow-xs active:scale-98"
                      >
                        <span>이어보기</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="hidden md:block w-px bg-neutral-100"></div>
                
                <div className="w-full md:w-[320px] grid grid-cols-2 gap-6 text-left">
                  {[
                    { title: '바람이 분다, 여름', desc: '소설 · 8화까지', cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQHaZbTIh-qZz2zWXqdVpVBhMMmTyM82fnx_hh17ZiHkj27S_HTNBgEow5mw54n8enyKHv0aPXoZbHoIIXHQmmXPYyRAtWlG3basGWcjJDb2OGTNsSjQRphauo8WObivk8sXjpu1J1CjKEOqGmfZ3pHaollH6-uGl4Z_VNgSwPD_VrGTnOK5yRUg1QsaQIefQG1oXxyMmfjWGkX2FLRL5jfOanTv7SGBdqwgeB-adv_ra9SHzaImv3uqDJp5GDI4pKZeRAApklAaA' },
                    { title: '그날의 우리', desc: '로맨스 · 5화까지', cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2O_PD7xdQCc_iGfXoKwNrVIurVlo0ugo_weeYOYZOG-Wh7f6vj3_DVFNiSln1HzMbFHhwypEYn9qPXQRQ2x8rytzojL6ot4tX_9mXRZB-OO0IANHl_DZM9OrB17ajZemU93sWq3W66bOlFJdjmkeDtvqCmbG_BQln7wrzg4vFRQrmn0Mqlbt4NOhAIZX_FDgxT1X3R9q6wVpNMIjLbN0ioReZ88c5QTD0GfjDeChjMbk1UZw-N3JIAVoL1fzcD4ansUKeIZxSdXk' }
                  ].map((b, idx) => (
                    <div key={idx} className="space-y-2.5 group cursor-pointer" onClick={() => alert('이어서 읽기 기능은 준비 중입니다.')}>
                      <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-50 shadow-xs relative">
                        <img 
                          src={b.cover} 
                          alt={b.title} 
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="px-1 text-left">
                        <h4 className="text-xs font-extrabold text-[#2F2D59] line-clamp-1 group-hover:text-[#6B54E7] transition-colors">{b.title}</h4>
                        <p className="text-[10px] text-[#7C769D] font-bold mt-0.5">{b.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 z-10 relative">
              <div className="flex justify-between items-center">
                <h2 className="text-base sm:text-lg font-extrabold text-[#2F2D59]">이번 주 인기 (랭킹)</h2>
                <button 
                  onClick={() => alert('인기 도서 랭킹관이 준비 중입니다.')}
                  className="text-xs text-[#7C769D] hover:text-[#2F2D59] font-bold flex items-center gap-0.5"
                >
                  <span>전체 보기</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              
              <div className="relative">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
                  {[
                    { rank: 1, title: '여름밤의 고래', category: '판타지', likes: '12.4K', cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAlgov4Ndwbkqsdj-Wy320A6sm5eIrOAh0fJ9iql5uxYkUWODJzuvxDJGOarbrHyWZpKki_6W--5-y1C2PHZRmzdsgBb7BLEc8IxTCMXTW9R0hfy7uqjy5U1X7Aihqk1llWQjtgmHQkRnbckz8nBMYbpe4r_WXrVQNutTxX7SutNuluLR0MbYoKoVS6SETBbzSXShKPS2VAUTzYyUUYyHFcm5k7kpBLau2Lk4MiFNQyio7tD96chDlTfKp3NSSvNmq4rM8O8j0oGM' },
                    { rank: 2, title: '벚꽃이 지는 계절', category: '로맨스', likes: '9.7K', cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBunwmp9gNYdr5DprurqI-56fQqtRXoNlM91FNSmsHjHsLhHzItDBdIf290fXFgrHtz_Wf4JndCfQwlgQBp0iq1dxmfJujPYJoUj233w2XqQHmvo3mJYKWwKDMVw1aQPZbx_aotYrk615BxBUOn3fZdJ1N5H3VQmQTAB_MNJsYQtEsN4orO-G4D6P--xTblP1eapL8dKYZ7UUHzn50Xj7gTK3CSAEGwzl2hH51X4yjPPkr3mdtqYwX0dg1ao_g8ZALzaz3yoTpGwWM' },
                    { rank: 3, title: '마법사 학원의 비밀', category: '판타지', likes: '8.3K', cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCznlvT7W-W0NUxinTfAkyigdk2z3I-k-uZK5biSPoGv-2D69bAp-MLEgeUx5_bmFFebrWpllo42X0LF3ihgtEq_p51DrgtnqEOxsjsT2H7Q-4z9A8CHXtLdWGVPongYJImv13zsDsLze4Y5uqVGkpuCACb2TG-2iz1K-vbt4oS_rN6GRYPOtDCaDeTYNF5cOuMY590pmj3N-GlXuNg4x60NRJiF503Y7d0x4f_0J72onLQeH8GK5y5bHOU6vlUE5fnCZo9xc1SEig' },
                    { rank: 4, title: '카페, 오후 3시', category: '힐링', likes: '7.1K', cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBL9C026912DWIR1LG1aQKUHDO0L5tB1PxdJVonj8bxfKQ75IV6uR99DoLyUg5iNVqKW4ev8bK2aL2BlTbVxn229HmaAO9sRDdAPkLWiWlcE1gawXlfOmeRX8WJCPiDsttSWRVJOOhgVWLBXWfS6LVxJ9kjDI9wPvEkD851Ok7e_hSpVr0cTBTFVYvIJLm8XNQzQx_ESFnx3tM27mBrOsK16EdHSGfyOc0zpOhyvCEZWSpb7Y7A8kZ3Gl2NKGhuOZgXcTEJ_E7Pgf0' },
                    { rank: 5, title: '끝나지 않은 항해', category: '모험', likes: '6.2K', cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2O_PD7xdQCc_iGfXoKwNrVIurVlo0ugo_weeYOYZOG-Wh7f6vj3_DVFNiSln1HzMbFHhwypEYn9qPXQRQ2x8rytzojL6ot4tX_9mXRZB-OO0IANHl_DZM9OrB17ajZemU93sWq3W66bOlFJdjmkeDtvqCmbG_BQln7wrzg4vFRQrmn0Mqlbt4NOhAIZX_FDgxT1X3R9q6wVpNMIjLbN0ioReZ88c5QTD0GfjDeChjMbk1UZw-N3JIAVoL1fzcD4ansUKeIZxSdXk' }
                  ].map((book) => (
                    <div key={book.rank} className="space-y-3 group cursor-pointer text-left" onClick={() => alert(`${book.title} 작품 상세 조회 페이지가 준비 중입니다.`)}>
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xs">
                        <img 
                          src={book.cover} 
                          alt={book.title} 
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2.5 left-2.5 w-6.5 h-6.5 rounded-full bg-[#6B54E7] text-white font-black text-xs flex items-center justify-center shadow-md">
                          {book.rank}
                        </div>
                      </div>
                      
                      <div className="px-1 text-left">
                        <h4 className="text-xs font-extrabold text-[#2F2D59] line-clamp-1 group-hover:text-[#6B54E7] transition-colors">{book.title}</h4>
                        <p className="text-[10px] text-[#7C769D] font-bold mt-0.5">{book.category}</p>
                        <div className="flex items-center gap-0.5 text-red-500 font-extrabold mt-1">
                          <span className="text-[11px]">🔥</span>
                          <span className="text-[10px] text-[#7C769D] font-extrabold">{book.likes}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => alert('더보기 기능은 준비 중입니다.')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4.5 w-9 h-9 rounded-full bg-white shadow-lg border border-neutral-100 flex items-center justify-center text-[#2F2D59] hover:bg-[#F3F0FF] hover:scale-105 active:scale-95 transition-all z-10"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

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
                  onClick={() => setActiveTab('friends')}
                  className="text-xs sm:text-sm text-[#7C769D] hover:text-[#6B54E7] font-bold flex items-center gap-1 transition-colors"
                >
                  <span>모두 보기</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-white via-[#FAF9FF] to-white rounded-3xl -mx-4 sm:-mx-6 px-4 sm:px-6 py-6 -my-6 border-y border-[#E6E2FC]/40 pointer-events-none"></div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10 pt-2">
                  {[
                    {
                      author: '은우 작가',
                      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBunwmp9gNYdr5DprurqI-56fQqtRXoNlM91FNSmsHjHsLhHzItDBdIf290fXFgrHtz_Wf4JndCfQwlgQBp0iq1dxmfJujPYJoUj233w2XqQHmvo3mJYKWwKDMVw1aQPZbx_aotYrk615BxBUOn3fZdJ1N5H3VQmQTAB_MNJsYQtEsN4orO-G4D6P--xTblP1eapL8dKYZ7UUHzn50Xj7gTK3CSAEGwzl2hH51X4yjPPkr3mdtqYwX0dg1ao_g8ZALzaz3yoTpGwWM',
                      title: '달빛 아래, 우리',
                      category: '로맨스',
                      desc: '우연한 만남이 운명이 되기까지, 두 사람의 따뜻한 이야기',
                      likes: '1.2K',
                      replies: '312',
                      cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4qbLMXrDeSvtACQrqxaabRXhUcLWI6ISEPbVCL4zP57a5y85IerCnkSy5pgzsSQmnNvDc1q2s-ibxVkN7ZqJ31_b8pC4F9l3lfBrQYbyPWPxUbP86iX2oTav5lZ0ev4-koEU62F0a8awUxxeRhuKpbx11aiJCLL1Ac5DNjJFB_E6OqjY7OCfsrzj9vnGnBx1ksipJacKjVdyp8736LnR-kx6bUc_klYIKrF7BlzGIXFzpeSpGXPTsZHSfJlVMQOc3tUYU5ecEPPc'
                    },
                    {
                      author: '서린 작가',
                      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBunwmp9gNYdr5DprurqI-56fQqtRXoNlM91FNSmsHjHsLhHzItDBdIf290fXFgrHtz_Wf4JndCfQwlgQBp0iq1dxmfJujPYJoUj233w2XqQHmvo3mJYKWwKDMVw1aQPZbx_aotYrk615BxBUOn3fZdJ1N5H3VQmQTAB_MNJsYQtEsN4orO-G4D6P--xTblP1eapL8dKYZ7UUHzn50Xj7gTK3CSAEGwzl2hH51X4yjPPkr3mdtqYwX0dg1ao_g8ZALzaz3yoTpGwWM',
                      title: '햇살이 스며든 날들',
                      category: '에세이',
                      desc: '작은 일상 속에서 발견한 소중한 순간들',
                      likes: '864',
                      replies: '198',
                      cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBL9C026912DWIR1LG1aQKUHDO0L5tB1PxdJVonj8bxfKQ75IV6uR99DoLyUg5iNVqKW4ev8bK2aL2BlTbVxn229HmaAO9sRDdAPkLWiWlcE1gawXlfOmeRX8WJCPiDsttSWRVJOOhgVWLBXWfS6LVxJ9kjDI9wPvEkD851Ok7e_hSpVr0cTBTFVYvIJLm8XNQzQx_ESFnx3tM27mBrOsK16EdHSGfyOc0zpOhyvCEZWSpb7Y7A8kZ3Gl2NKGhuOZgXcTEJ_E7Pgf0'
                    },
                    {
                      author: '하루 작가',
                      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBunwmp9gNYdr5DprurqI-56fQqtRXoNlM91FNSmsHjHsLhHzItDBdIf290fXFgrHtz_Wf4JndCfQwlgQBp0iq1dxmfJujPYJoUj233w2XqQHmvo3mJYKWwKDMVw1aQPZbx_aotYrk615BxBUOn3fZdJ1N5H3VQmQTAB_MNJsYQtEsN4orO-G4D6P--xTblP1eapL8dKYZ7UUHzn50Xj7gTK3CSAEGwzl2hH51X4yjPPkr3mdtqYwX0dg1ao_g8ZALzaz3yoTpGwWM',
                      title: '별을 향한 약속',
                      category: '판타지',
                      desc: '언젠가 다시 만날 그날을 기다리며',
                      likes: '1.6K',
                      replies: '245',
                      cover: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQHaZbTIh-qZz2zWXqdVpVBhMMmTyM82fnx_hh17ZiHkj27S_HTNBgEow5mw54n8enyKHv0aPXoZbHoIIXHQmmXPYyRAtWlG3basGWcjJDb2OGTNsSjQRphauo8WObivk8sXjpu1J1CjKEOqGmfZ3pHaollH6-uGl4Z_VNgSwPD_VrGTnOK5yRUg1QsaQIefQG1oXxyMmfjWGkX2FLRL5jfOanTv7SGBdqwgeB-adv_ra9SHzaImv3uqDJp5GDI4pKZeRAApklAaA'
                    }
                  ].map((card, idx) => (
                    <div key={idx} className="bg-white border border-[#E6E2FC] hover:border-[#6B54E7]/50 rounded-3xl p-5 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] cursor-pointer group" onClick={() => alert('작품 상세 페이지는 준비 중입니다.')}>
                      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#E6E2FC]/50">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                            <img 
                              src={card.avatar} 
                              alt={card.author} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <span className="text-sm font-extrabold text-[#2F2D59]">{card.author}</span>
                          <div className="w-4 h-4 rounded-full bg-[#6B54E7] flex items-center justify-center text-white text-[10px] font-black">
                            ✓
                          </div>
                        </div>
                        <span className="bg-[#E6E2FC]/50 text-[#6B54E7] text-[10px] font-black px-2 py-1 rounded-lg">신작알림</span>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="w-24 aspect-[3/4] rounded-2xl overflow-hidden shadow-sm flex-shrink-0 relative group-hover:shadow-md transition-shadow">
                          <img 
                            src={card.cover} 
                            alt={card.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-between py-1 text-left">
                          <div className="space-y-1.5">
                            <h4 className="text-sm font-black text-[#2F2D59] line-clamp-2 group-hover:text-[#6B54E7] transition-colors leading-snug">{card.title}</h4>
                            <span className="inline-block text-[10px] font-bold text-[#6B54E7] bg-[#F3F0FF] px-2 py-0.5 rounded-md">{card.category}</span>
                            <p className="text-xs text-[#7C769D] leading-relaxed line-clamp-2 pt-1">{card.desc}</p>
                          </div>
                          
                          <div className="flex items-center gap-4 text-[#7C769D] text-[11px] font-bold pt-2 mt-auto">
                            <span className="flex items-center gap-1 hover:text-red-500 transition-colors">
                              <Heart className="w-3.5 h-3.5" />
                              {card.likes}
                            </span>
                            <span className="flex items-center gap-1 hover:text-[#6B54E7] transition-colors">
                              <MessageSquare className="w-3.5 h-3.5" />
                              {card.replies}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => alert('더보기 기능은 준비 중입니다.')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4.5 w-10 h-10 rounded-full bg-white shadow-lg border border-[#E6E2FC] flex items-center justify-center text-[#2F2D59] hover:bg-[#F3F0FF] hover:scale-105 active:scale-95 transition-all z-20"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

          </div>

              </div>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-8 border-t border-[#D4CDF2] text-xs text-left text-[#7C769D] space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 bg-[#6B54E7] text-white text-xs font-black rounded flex items-center justify-center">상</span>
            <strong className="text-sm font-bold text-[#2F2D59]">상상서가</strong>
            <span className="text-[10px] text-[#7C769D]">| AI가 당신의 상상을 멋진 책으로</span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[#7C769D]">
            <button onClick={() => alert('이용약관 페이지는 준비 중입니다.')} className="hover:text-[#2F2D59]">이용약관</button>
            <span>•</span>
            <button onClick={() => alert('개인정보처리방침 페이지는 준비 중입니다.')} className="hover:text-[#2F2D59] font-bold">개인정보처리방침</button>
            <span>•</span>
            <button onClick={() => alert('고객센터 페이지는 준비 중입니다.')} className="hover:text-[#2F2D59]">고객센터</button>
            <span>•</span>
            <button onClick={() => alert('공지사항 페이지는 준비 중입니다.')} className="hover:text-[#2F2D59]">공지사항</button>
          </div>
        </div>
        <p className="text-[10px] text-[#B9B0DC] pt-2">
          © 2026 SangSangSeoga. All rights reserved. Powered by Google Gemini-3.5 Models.
        </p>
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
              <strong className="text-[#2F2D59] font-bold">· 누적 사용량: 글 {freeTrialTextTokens}/1,000자 | 그림 {freeTrialImageCount}/3장</strong><br /><br />
              계속해서 예쁜 소설과 동화책을 집필하고 삽화를 완성하려면 <strong>프리미엄 요금제</strong>를 구독하시거나 <strong>추가 생성권</strong>을 단건 구매해 보세요.
            </p>
            <div className="flex flex-col gap-2 pt-2 text-xs">
              <button
                onClick={() => {
                  setShowFreeTrialCapModal(false);
                  onNavigate('pricing');
                }}
                className="w-full py-3 bg-[#6B54E7] hover:bg-[#6148E1] text-white font-extrabold rounded-xl transition-all shadow-md text-center cursor-pointer"
              >
                프리미엄 이용권 구독하기
              </button>
              <button
                onClick={() => {
                  setShowFreeTrialCapModal(false);
                  onNavigate('subscription');
                }}
                className="w-full py-3 bg-slate-100 hover:bg-slate-150 text-slate-700 font-bold rounded-xl transition-all text-center border border-slate-200 cursor-pointer"
              >
                추가 생성권 구매하기
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
              프리미엄 작가님용 일일 자동 할당 이야기 점수가 일시 완성되었습니다. 작성 중이던 원고는 내 서재에 안전하게 보관되어 있습니다.<br /><br />
              매일 자정(00:00)이 지나면 새로운 글 한도가 무료로 자동 리셋 및 재충전됩니다.
            </p>
            <div className="flex flex-col gap-2 pt-2 text-xs">
              <button
                onClick={() => {
                  setShowPremiumSoftCapModal(false);
                  onNavigate('subscription');
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

      {showExhaustedCreditsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-250">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 sm:p-8 text-left shadow-2xl space-y-4 border border-[#D4CDF2]">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase">
              <span className="w-2 h-2 bg-slate-850 rounded-full"></span>
              🎫 도서 생성권 부족
            </div>
            <h3 className="text-lg font-bold text-[#2F2D59]">
              사용 가능한 이야기 생성권이 부족합니다
            </h3>
            <p className="text-xs text-[#7C769D] leading-relaxed">
              가입 축하 무료 체험을 모두 완료하셨으며, 보유하셨던 충전형 단건 생성권도 현재 잔여 수량이 0매입니다.<br /><br />
              계속해서 예쁜 그림책을 무제한 쓰시려면 <strong>프리미엄 요금제</strong>를 가입하시거나 <strong>추가 생성권</strong> 패키지를 구매해 보시기 바랍니다.
            </p>
            <div className="flex flex-col gap-2 pt-2 text-xs">
              <button
                onClick={() => {
                  setShowExhaustedCreditsModal(false);
                  onNavigate('pricing');
                }}
                className="w-full py-3 bg-[#6B54E7] hover:bg-[#6148E1] text-white font-extrabold rounded-xl transition-all shadow-md text-center cursor-pointer"
              >
                프리미엄 구독권 가입하기
              </button>
              <button
                onClick={() => {
                  setShowExhaustedCreditsModal(false);
                  onNavigate('subscription');
                }}
                className="w-full py-3 bg-slate-100 hover:bg-slate-150 text-slate-700 font-bold text-center rounded-xl border border-slate-200 cursor-pointer"
              >
                추가 생성권 충전하기
              </button>
              <button
                onClick={() => setShowExhaustedCreditsModal(false)}
                className="w-full py-2 bg-white text-slate-400 hover:text-slate-650 font-bold text-center cursor-pointer"
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
                  <span className="font-bold text-[#6B54E7]">PRO 무제한 창작방 인가 완료</span>
                  <span className="text-[#B9B0DC]">|</span>
                  <span className="text-[#7C769D]">오늘 사용량: <strong className="text-[#2F2D59]">{dailyScore?.toLocaleString()}자 / 5,000자</strong></span>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B9B0DC]"></span>
                  <span className="font-bold text-[#2F2D59]">무료 가입자 체험 패키지</span>
                  <span className="text-[#D4CDF2]">|</span>
                  {freeTrialRemaining > 0 ? (
                    <span className="text-[#6B54E7] font-semibold">
                      무료 체험 1회 생성 가능 (텍스트 {freeTrialTextTokens}/1,000자 | 그림 {freeTrialImageCount}/3장)
                    </span>
                  ) : (
                    <span className="text-[#7C769D] font-bold">
                      무료 체험 완료 • 보유 생성권: <strong className="text-[#6B54E7]">{extraCreditsRemaining}장</strong>
                    </span>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => { setShowAtelierSection(false); onNavigate('subscription'); }}
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
                        onClick={() => { setShowAtelierSection(false); onNavigate('pricing'); }}
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
