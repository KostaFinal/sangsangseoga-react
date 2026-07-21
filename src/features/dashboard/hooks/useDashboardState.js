import { useState, useEffect, useMemo } from 'react';
import {
  rankingBooksList,
  newBooksList,
  aiReviewList
} from '../../../shared/data';
import { dashboardService } from '../services/dashboardService';
import { getWeeklyRanking, getWeeklyNewReleases, triggerWeeklyRankingAggregate } from '../../../api/bookApi';
import { getReadingList } from '../../../api/myLibraryApi';
import { useAuth } from '../../../shared/context/AuthContext';

const mapRankItem = (item) => ({
  rank: item.rankNum,
  id: item.bookId,
  title: item.title,
  author: item.authorNickname,
  cover: item.coverImageUrl,
  bookType: item.bookType,
  viewCount: item.viewCount,
  likeCount: item.likeCount,
});

const BOOK_TYPE_TO_GENRE = {
  NOVEL: '소설', POEM: '시', ESSAY: '에세이', FAIRY_TALE: '동화',
};

const mapRecentReadItem = (item) => ({
  id: item.bookId,
  title: item.title,
  category: BOOK_TYPE_TO_GENRE[item.bookType] || item.bookType,
  author: item.authorNickname,
  progress: item.progress ?? 0,
  cover: item.coverImageUrl,
});

/**
 * Custom Hook: useDashboardState
 *
 * 메인 대시보드 화면(홈 / 내 서재 / 친구의 서재 / AI 아틀리에) 상태 및 비즈니스 로직 관리 훅.
 */
export const useDashboardState = ({
  isPremium,
  usage,
  setUsage,
}) => {
  const { isAuthenticated } = useAuth();

  // 내 서재 (필터/검색/정렬)
  const [libraryGenreFilter, setLibraryGenreFilter] = useState('전체');
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');
  const [librarySort, setLibrarySort] = useState('최신 수정순');

  // 친구의 서재 팔로우 상태
  const [isFollowing, setIsFollowing] = useState(false);

  // 어드민 차단 목록을 반영한 홈 화면 노출 리스트
  const filteredRankingBooks = useMemo(
    () => dashboardService.filterVisibleBooks(rankingBooksList),
    []
  );

  const filteredNewBooks = useMemo(
    () => dashboardService.filterVisibleBooks(newBooksList),
    []
  );

  const filteredReviews = useMemo(
    () => dashboardService.filterVisibleReviews(aiReviewList, rankingBooksList.concat(newBooksList)),
    []
  );

  // AI 아틀리에(창작 시뮬레이션) 상태
  const [genre, setGenre] = useState('fantasy');
  const [prompt, setPrompt] = useState('시간 수집가가 가득 들어있는 고장 난 무라카미 시계점');
  const [generateImage, setGenerateImage] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [showAtelierSection, setShowAtelierSection] = useState(false);

  // 사용량 한도 초과 안내 모달
  const [showFreeTrialCapModal, setShowFreeTrialCapModal] = useState(false);
  const [showPremiumSoftCapModal, setShowPremiumSoftCapModal] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    if (!usage) return; // 사용량 아직 로딩 전

    const textRemaining = usage.text?.remaining ?? 0;
    const imageRemaining = usage.image?.remaining ?? 0;
    const needsImage = generateImage;

    if (textRemaining <= 0 || (needsImage && imageRemaining <= 0)) {
      if (isPremium) {
        setShowPremiumSoftCapModal(true);
      } else {
        setShowFreeTrialCapModal(true);
      }
      return;
    }

    setIsGenerating(true);
    setGeneratedResult(null);

    const result = await dashboardService.generateStoryContent({ genre, prompt, tier: isPremium ? 'premium' : 'trial' });
    setIsGenerating(false);
    setGeneratedResult(result);

    // 실제 생성 API가 없어 서버 사용량이 자동으로 줄지 않으므로, 조회해 둔 usage를 프론트에서 낙관적으로 차감
    if (setUsage) {
      setUsage(prev => (prev ? {
        ...prev,
        text: { ...prev.text, remaining: Math.max(0, prev.text.remaining - 1) },
        image: needsImage ? { ...prev.image, remaining: Math.max(0, prev.image.remaining - 1) } : prev.image,
      } : prev));
    }
  };

  // 내 서재 / 친구의 서재 목록 (데이터 패칭)
  const [myCabinetBooks, setMyCabinetBooks] = useState([]);
  const [friendBooks, setFriendBooks] = useState([]);

  useEffect(() => {
    dashboardService.getMyCabinetBooks().then(setMyCabinetBooks);
    dashboardService.getFriendBooks().then(setFriendBooks);
  }, []);

  // 홈 화면 - 최근 읽은 작품(읽는 중, 최신순 3권)
  const [recentlyReadBooks, setRecentlyReadBooks] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setRecentlyReadBooks([]);
      return;
    }
    getReadingList(1, 3)
      .then(res => setRecentlyReadBooks((res.data?.data?.content || []).map(mapRecentReadItem)))
      .catch(() => setRecentlyReadBooks([]));
  }, [isAuthenticated]);

  // 이번 주 인기 랭킹 TOP5 / 이번 주 신작 TOP5
  const [weeklyRanking, setWeeklyRanking] = useState([]);
  const [weeklyNewReleases, setWeeklyNewReleases] = useState([]);

  const refetchWeeklyRankings = () => {
    getWeeklyRanking()
      .then(res => setWeeklyRanking((res.data?.data?.items || []).map(mapRankItem)))
      .catch(() => setWeeklyRanking([]));
    getWeeklyNewReleases()
      .then(res => setWeeklyNewReleases((res.data?.data?.items || []).map(mapRankItem)))
      .catch(() => setWeeklyNewReleases([]));
  };

  useEffect(() => {
    refetchWeeklyRankings();
  }, []);

  // [테스트용] 크론과 동일한 주간 랭킹 집계를 즉시 실행하고 목록을 다시 불러옴
  const [isAggregating, setIsAggregating] = useState(false);
  const handleTriggerWeeklyRankingAggregate = async () => {
    setIsAggregating(true);
    try {
      await triggerWeeklyRankingAggregate();
      refetchWeeklyRankings();
    } catch (err) {
      console.error("주간 랭킹 수동 집계 실패", err);
    } finally {
      setIsAggregating(false);
    }
  };

  const filteredCabinetBooks = useMemo(
    () => dashboardService.filterCabinetBooks(myCabinetBooks, libraryGenreFilter, librarySearchQuery),
    [myCabinetBooks, libraryGenreFilter, librarySearchQuery]
  );

  return {
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
    recentlyReadBooks,

    weeklyRanking,
    weeklyNewReleases,
    isAggregating,
    handleTriggerWeeklyRankingAggregate,

    usage,
    isPremium,
  };
};
