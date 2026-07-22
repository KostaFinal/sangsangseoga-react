import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../../features/auth/services/authService';
import { subscriptionService } from '../../features/subscription/services/subscriptionService';
import { notificationService } from '../services/notificationService';
import { profileService } from '../../features/profile/services/profileService';
import { getAccessToken, subscribeAccessToken } from '../../api/tokenStorage';
import { subscribeQuotaExceeded, subscribeUsageChanged } from '../../features/bookCreation/services/quotaErrorBus';
import { API_BASE_URL } from '../../api/axios';
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
  // AI 생성 429(쿼터 초과) 응답 코드 — 값이 있으면 AppShell이 구독 유도 모달을 띄운다.
  const [quotaExceededCode, setQuotaExceededCode] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeQuotaExceeded((code) => {
      setQuotaExceededCode(code);
      refreshUsage(); // 남은 횟수 배지를 0으로 즉시 갱신
    });
    return unsubscribe;
  }, []);

  // AI 텍스트/이미지 생성이 성공할 때마다(quotaErrorBus.notifyUsageChanged) 호출돼
  // 헤더 배지/구독 페이지의 잔여 횟수를 새로고침 없이 바로 갱신한다.
  useEffect(() => {
    const unsubscribe = subscribeUsageChanged(() => {
      refreshUsage();
    });
    return unsubscribe;
  }, []);

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

  // 실시간 알림(SSE) — 토큰이 있을 때 연결하고, 토큰이 바뀔 때마다(로그인/조용한 재발급/로그아웃)
  // 다시 맺는다. 연결 자체는 1회용 티켓(POST /api/notifications/stream-ticket)으로 열며,
  // 브라우저 EventSource는 URL을 못 바꾸는 자동 재연결만 하므로 그 재연결은 꺼두고
  // 에러 시 직접 새 티켓을 받아 새 연결을 여는 방식으로 대체한다.
  // 자세한 설계는 docs/choiswgg/domain-notifications-sse.md 참고.
  useEffect(() => {
    let es = null;
    let reconnectTimer = null;
    let generation = 0; // 이 값이 바뀌면 이전 연결 시도의 재연결 예약은 전부 무효
    let retryCount = 0; // 연속 실패 횟수 — 백오프 지연 계산에 사용, 연결 성공 시 0으로 리셋

    // 인프라(CloudFront 등)가 SSE 스트리밍을 일시적으로 막고 있는 동안 3초 고정 간격으로
    // 재연결을 계속 시도하면 티켓 발급 요청(POST)이 폭주해 백엔드에 부담을 줄 수 있다.
    // 실패가 이어질수록 최대 1분까지 지연을 늘려 부담을 줄이고, 복구되면 자동으로 다시 붙는다.
    const nextRetryDelay = () => {
      const delay = Math.min(3000 * 2 ** retryCount, 60000);
      retryCount += 1;
      return delay;
    };

    const clearReconnectTimer = () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    const scheduleReconnect = (myGeneration) => {
      if (myGeneration !== generation) return;
      clearReconnectTimer();
      reconnectTimer = setTimeout(() => connect(getAccessToken()), nextRetryDelay());
    };

    const connect = async (token) => {
      const myGeneration = ++generation;
      clearReconnectTimer();
      if (es) {
        es.close();
        es = null;
      }
      if (!token) return;

      let ticket;
      try {
        ticket = await notificationService.getStreamTicket();
      } catch (err) {
        console.error("알림 SSE 티켓 발급 실패", err);
        scheduleReconnect(myGeneration);
        return;
      }
      if (myGeneration !== generation) return; // 그 사이 로그아웃/토큰변경 등으로 무효화됨

      es = new EventSource(`${API_BASE_URL}/api/notifications/stream?ticket=${encodeURIComponent(ticket)}`);
      es.onopen = () => {
        retryCount = 0;
      };
      es.addEventListener('notification', (event) => {
        try {
          const incoming = JSON.parse(event.data);
          setNotifications(prev => (
            prev.some(n => n.id === incoming.id) ? prev : [incoming, ...prev]
          ));
        } catch (err) {
          console.error("실시간 알림 파싱 실패", err);
        }
      });
      es.onerror = (err) => {
        console.error("알림 SSE 연결 오류, 새 티켓으로 재연결 예약", err);
        if (es) {
          es.close();
          es = null;
        }
        scheduleReconnect(myGeneration);
      };
    };

    connect(getAccessToken());
    const unsubscribe = subscribeAccessToken(connect);

    return () => {
      unsubscribe();
      clearReconnectTimer();
      generation++; // 진행 중이던 티켓 발급 응답이 와도 무시되도록
      if (es) es.close();
    };
  }, []);

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

  // 토큰이 사라지는 모든 경로(명시적 로그아웃, refresh 실패로 인한 자동 폐기 등)를 한 곳에서 감지해
  // 로그인 관련 상태를 초기화한다 — 401을 받고도 화면은 로그인 상태로 남는 문제를 막기 위함.
  useEffect(() => {
    const unsubscribe = subscribeAccessToken((token) => {
      if (token) return;
      setIsAuthenticated(false);
      setCurrentUser(DEFAULT_USER);
      setIsPremium(false);
      setIsSubscriptionCanceled(false);
      setCurrentPlanType(null);
      setUsage(null);
      setNotifications([]);
    });
    return unsubscribe;
  }, []);

  // 로그아웃: 백엔드 세션 종료(POST /api/auth/logout) 및 토큰 폐기 — 상태 초기화는 위 구독에서 처리
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("로그아웃 처리 실패", err);
    }
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
      quotaExceededCode, setQuotaExceededCode,
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
