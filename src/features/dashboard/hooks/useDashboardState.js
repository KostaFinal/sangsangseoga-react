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
  freeTrialRemaining,
  setFreeTrialRemaining,
  freeTrialTextTokens,
  setFreeTrialTextTokens,
  freeTrialImageCount,
  setFreeTrialImageCount,
  dailyScore,
  setDailyScore,
  dailyTextTokens,
  setDailyTextTokens,
  dailyImageCount,
  setDailyImageCount,
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

      const result = await dashboardService.generateStoryContent({ genre, prompt, tier: 'premium' });
      setIsGenerating(false);
      setDailyScore(prev => prev + estimatedPrice + imagePrice);
      setDailyTextTokens(prev => prev + estimatedPrice);
      if (generateImage) {
        setDailyImageCount(prev => prev + 1);
      }
      setGeneratedResult(result);

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

        const result = await dashboardService.generateStoryContent({ genre, prompt, tier: 'trial' });
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

        setGeneratedResult(result);

      } else {
        setShowFreeTrialCapModal(true);
        return;
      }
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

    dailyScore,
    freeTrialRemaining,
    freeTrialTextTokens,
    freeTrialImageCount,
    isPremium,
  };
};
