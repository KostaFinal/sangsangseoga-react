# 폴더 구조 표준화 + 죽은 기능 정리

관련 커밋: `24d7d03`, `11abb93`

## 1. `components/hooks/services` 구조로 통일 (`24d7d03`)

### 개념
`admin` 모듈은 처음부터 `components/`(화면)/`hooks/`(상태·로직)/`services/`(API·mock)로 나뉘어 있었지만, `auth`/`dashboard`/`profile`/`subscription`은 상태 관리와 API 호출이 컴포넌트에 그대로 섞여 있었다. 4개 기능 모두 admin과 같은 3계층 구조로 통일(1878줄 추가, 1044줄 삭제, 26개 파일).

- **컴포넌트**: 화면(JSX)만 남기고 `useXState()` 훅의 값/핸들러를 그대로 씀
- **훅**(`useLoginState`, `useSignupState`, `usePasswordResetState`, `useSocialAuthState`, `useDashboardState`, `useProfileState`, `useSubscriptionState`, `usePaymentState`, `usePricingState`): 컴포넌트에서 상태/핸들러 분리
- **서비스**(`authService`, `dashboardService`, `profileService`, `subscriptionService`): API 호출/Mock 데이터 분리

```js
// src/features/auth/hooks/useLoginState.js — 컴포넌트에서 분리된 예시
export const useLoginState = ({ onSuccess }) => {
  const [email, setEmail] = useState('writer@sangsang.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  ...

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await authService.loginUser(email, password);
      setError('');
      if (result.pendingMinor) { setIsPendingMinor(true); return; }
      onSuccess(result.user);
    } catch (err) {
      setError(err.message);
    }
  };
  ...
};
```

이 구조 통일 덕분에 이후 [[domain-auth|인증]]/[[domain-subscription|구독]] API 연동이 "컴포넌트는 그대로 두고 훅/서비스만 Mock → 실 API로 교체"하는 식으로 깔끔하게 이어졌다.

## 2. 알림(Notification) 기능 전체 제거 (`11abb93`)

### 개념
당시 안 쓰이던 알림 기능(Header 벨 아이콘, 드롭다운, `NotificationsView`, `NotificationPanel`)을 반쯤 남기지 않고 관련 코드를 전부 걷어냄.

- `NotificationsView.jsx`, `NotificationPanel.jsx` 삭제
- `App.jsx`의 `notifications` state 및 라우트 케이스 삭제
- `CommonShowcaseView`의 알림 패널 데모 섹션 삭제, 섹션 번호 재정렬
- `docs/routing-url-mapping.md`(react-router 도입 URL 매핑 설계 문서) 이 커밋에서 최초 추가 — 이후 [[domain-routing-migration|라우팅 마이그레이션]]의 설계 근거가 됨

이후 서비스에 알림 기능이 다시 필요해져 `9383c5b`에서 실 API 기반으로 복구됨 — [[domain-notifications-sse]] 참고.

## 관련 문서
- [[domain-auth]], [[domain-subscription]] — 이 구조 위에서 진행된 실 API 연동 작업
- [[domain-routing-migration]] — `docs/routing-url-mapping.md` 설계안을 구현한 작업
- [[domain-notifications-sse]] — 2번에서 제거된 알림 기능이 이후 복구된 작업
