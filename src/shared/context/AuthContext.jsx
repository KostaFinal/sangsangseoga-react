import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../../features/auth/services/authService';
import { subscriptionService } from '../../features/subscription/services/subscriptionService';
import { notificationService } from '../services/notificationService';
import { profileService } from '../../features/profile/services/profileService';
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
  const [notifications, setNotifications] = useState([]);

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

  // 내 프로필(닉네임/프로필사진) 조회 (GET /api/members/me) — 새로고침해도 헤더에 실제 DB 프로필 사진이 보이도록
  const refreshProfile = async () => {
    if (!getAccessToken()) return;
    try {
      const profile = await profileService.getMyProfile();
      setCurrentUser(prev => ({
        ...prev,
        nickname: profile.nickname || prev.nickname,
        profileImage: profile.profileImageUrl || CURRENT_USER_PROFILE,
      }));
    } catch (err) {
      console.error("프로필 조회 실패", err);
    }
  };

  // 내 알림 목록 조회 (GET /api/notifications) — 헤더 알림 벨/전체 알림 페이지가 공유해서 사용
  const refreshNotifications = async () => {
    if (!getAccessToken()) return;
    try {
      const { items } = await notificationService.getNotifications();
      setNotifications(items);
    } catch (err) {
      console.error("알림 조회 실패", err);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("알림 읽음 처리 실패", err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("전체 알림 읽음 처리 실패", err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await notificationService.clearAll();
      setNotifications([]);
    } catch (err) {
      console.error("전체 알림 삭제 실패", err);
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
    refreshNotifications();
    refreshProfile();
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
    setNotifications([]);
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
      notifications,
      refreshNotifications, markNotificationRead, markAllNotificationsRead, clearAllNotifications,
      refreshSubscriptionStatus, refreshUsage, refreshProfile,
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
