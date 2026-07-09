# 인증(Auth) 도메인 — 로그인/회원가입/토큰/보호자 동의

관련 커밋: `7ba5579`, `86eba96`(로그아웃 부분), `c6febb2`, `3df276f`, `973eb8b`(에러 메시지 노출 부분 — [[admin-cleanup-and-member-api-integration]] 참고)

## 1. JWT 저장 + 자동 첨부 + 401 자동 재발급 (`7ba5579`)

### 개념

로그인/회원가입/토큰 저장 로직이 전부 Mock이었다가, 실제 백엔드 `/api/auth/*`로 교체되면서 axios 레벨에서 아래 3가지를 공용으로 처리하도록 만들었습니다.

1. **토큰 저장소 분리** (`src/api/tokenStorage.js`) — `localStorage` 접근을 한 곳에 모아서, 나중에 저장 방식이 바뀌어도(예: httpOnly 쿠키) 이 파일만 고치면 되게 함
2. **요청 인터셉터** — 모든 요청에 access token을 자동으로 `Authorization` 헤더에 실어 보냄 (호출부에서 매번 토큰을 안 챙겨도 됨)
3. **응답 인터셉터** — 401이 뜨면 refresh token으로 자동 재발급을 시도하고, 성공하면 원래 요청을 재시도. 동시에 여러 요청이 401을 맞으면 재발급 요청은 1번만 보내고 나머지는 대기열에 쌓아뒀다가 같은 새 토큰으로 재시도(`isRefreshing` + `pendingRequests` 락 패턴)

```js
// src/api/tokenStorage.js
const ACCESS_TOKEN_KEY = "sangsang_access_token";
const REFRESH_TOKEN_KEY = "sangsang_refresh_token";

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
export const setTokens = ({ accessToken, refreshToken } = {}) => {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};
export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};
```

```js
// src/api/axios.js — 요청 인터셉터
instance.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// 응답 인터셉터: 401이면 refresh token으로 재발급 시도 후 원요청 재시도
let isRefreshing = false;
let pendingRequests = [];

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    if (!response || response.status !== 401 || config._retry || config.url === "/api/auth/token-refresh") {
      return Promise.reject(error);
    }
    const refreshToken = getRefreshToken();
    if (!refreshToken) return Promise.reject(error);

    if (isRefreshing) {
      // 이미 재발급 중이면 큐에 대기했다가 같은 새 토큰으로 재시도
      return new Promise((resolve, reject) => {
        pendingRequests.push({ resolve, reject });
      }).then((accessToken) => {
        config.headers.Authorization = `Bearer ${accessToken}`;
        return instance(config);
      });
    }

    config._retry = true;
    isRefreshing = true;
    try {
      const { data } = await instance.post("/api/auth/token-refresh", { refreshToken });
      const newAccessToken = data?.data?.accessToken;
      setTokens({ accessToken: newAccessToken });
      resolvePendingRequests(null, newAccessToken);
      config.headers.Authorization = `Bearer ${newAccessToken}`;
      return instance(config);
    } catch (refreshError) {
      resolvePendingRequests(refreshError, null);
      clearTokens();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
```

이후 [[admin-cleanup-and-member-api-integration]]에서 응답 인터셉터에 "백엔드 에러 메시지를 `error.message`로 덮어쓰는" 처리가 하나 더 추가됩니다.

### 같이 정리한 것
- 회원가입 시 백엔드가 요구하는 닉네임 필드 누락 추가
- 회원탈퇴를 `DELETE /api/members/me`에 연동

## 2. 로그아웃 API 배선 (`86eba96`)

Header/프로필/대시보드 3곳에서 각자 로그아웃을 처리하던 걸 `POST /api/auth/logout` 호출 하나로 통일 배선했고, `ProfileEditView`에 `onLogout` prop이 실제로는 연결이 안 돼 있어서 회원 탈퇴 후 콜백이 동작하지 않던 버그도 같이 고쳤습니다.

## 3. 보호자 동의 대기 목록 조회/승인/거절 (`c6febb2`)

### 개념
미성년자 회원가입 시 보호자 이메일로 동의 요청이 가는데, 기존엔 "샌드박스 시뮬레이터" 카드로 승인/거절을 흉내만 내고 있었습니다. 실제로 `GET /api/guardian-consents/pending`으로 로그인한 보호자 기준 대기 목록을 조회하고, 승인/거절 시 `PATCH`로 실제 상태를 반영하도록 바꿨습니다.

```js
// src/features/profile/hooks/useProfileState.js
const loadPendingConsents = useCallback(async () => {
  setIsPendingConsentsLoading(true);
  setPendingConsentsError('');
  try {
    const list = await profileService.getPendingGuardianConsents();
    setPendingConsents(list);
  } catch (err) {
    setPendingConsentsError(err.message);
  } finally {
    setIsPendingConsentsLoading(false);
  }
}, []);

useEffect(() => {
  if (activeTab === 'guardian') loadPendingConsents();
}, [activeTab, loadPendingConsents]);

const handleApproveGuardianRequest = async (consent) => {
  try {
    await profileService.decideGuardianConsent(consent.consentId, 'APPROVED');
    setPendingConsents(prev => prev.filter(c => c.consentId !== consent.consentId));
    setConnectedMinors(prev => [{ /* 승인된 자녀 카드 구성 */ }, ...prev]);
  } catch (err) {
    triggerToast(err.message);
  }
};
```

이 목록/승인·거절 API는 이후 [[../routing-url-mapping|라우터 마이그레이션]]에서 만든 이메일 링크 전용 페이지 `/guardian-consent/:consentId`(`GuardianConsentView.jsx`)와는 다른 진입점입니다 — 이쪽은 **로그인한 보호자가 마이페이지에서 직접 확인**하는 경로고, `GuardianConsentView`는 **이메일로 온 링크를 눌러 로그인 없이 바로 처리**하는 경로입니다.

## 4. 개발 환경 전용 원클릭 로그인 (`3df276f`)

로그인 화면을 건너뛰고 아무 화면이나 바로 보게 해두면 access token이 없어서 API 연동 기능이 다 깨지는 문제가 있었습니다. 그래서 "테스트 계정으로 실제 로그인 API를 호출해서 진짜 토큰을 받아오는" 버튼을 개발 환경에서만 노출하도록 추가했습니다 (`import.meta.env.DEV` 가드, 프로덕션 빌드 미포함).

## 관련 문서
- [[guest-browsing-and-auth-gate]] — 이 인증 상태(`isAuthenticated`)를 기준으로 라우트/액션을 여닫는 후속 작업
- [[admin-cleanup-and-member-api-integration]] — axios 에러 메시지 노출 개선, 관리자 로그인 페이지 디자인 통일
