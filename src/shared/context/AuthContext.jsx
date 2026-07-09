import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../../features/auth/services/authService';
import { subscriptionService } from '../../features/subscription/services/subscriptionService';
import { getAccessToken } from '../../api/tokenStorage';
import { CURRENT_USER_PROFILE } from '../data';

const AuthContext = createContext(null);

const DEFAULT_USER = {
  email: 'writer@sangsang.com',
  role: 'USER',
  nickname: '상상의작가',
  profileImage: CURRENT_USER_PROFILE,
};

// JWT는 memberId(sub)/role만 담고 있어 페이지 새로고침 시 currentUser에 그 두 값만 복원한다.
// (닉네임/이메일/프로필사진은 로그인 폼 응답으로만 채워지며, 새로고침 후에는 되살릴 방법이 없음)
const decodeAccessToken = (token) => {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(DEFAULT_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getAccessToken());
  const [isPremium, setIsPremium] = useState(false);
  const [isSubscriptionCanceled, setIsSubscriptionCanceled] = useState(false); // 구독 해지 예약 신청 완료 여부
  const [benefitEndDate, setBenefitEndDate] = useState('2026.07.15'); // 해지 시 혜택 유지 종료 예정일
  const [currentPlanType, setCurrentPlanType] = useState(null);
  const [usage, setUsage] = useState(null);

  // 내 구독 상태 조회 (GET /api/subscriptions/me) — 로그인 상태일 때만 호출
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
    const token = getAccessToken();
    const decoded = token ? decodeAccessToken(token) : null;
    if (decoded?.sub) {
      setCurrentUser(prev => ({ ...prev, memberId: Number(decoded.sub), role: decoded.role || prev.role }));
    }
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
    setIsAuthenticated(false);
    setCurrentUser(DEFAULT_USER);
  };

  return (
    <AuthContext.Provider value={{
      currentUser, setCurrentUser,
      isAuthenticated, setIsAuthenticated,
      isPremium, setIsPremium,
      isSubscriptionCanceled, setIsSubscriptionCanceled,
      benefitEndDate, setBenefitEndDate,
      currentPlanType,
      usage, setUsage,
      refreshSubscriptionStatus, refreshUsage,
      handleLogout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
