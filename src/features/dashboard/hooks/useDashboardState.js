import { useState, useEffect, useMemo } from 'react';
import {
  rankingBooksList,
  newBooksList,
  aiReviewList
} from '../../../shared/data';
import { dashboardService } from '../services/dashboardService';

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

    usage,
    isPremium,
  };
};
