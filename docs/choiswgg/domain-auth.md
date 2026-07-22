# 인증(Auth) 도메인 — 로그인/회원가입/토큰/보호자 동의

관련 커밋: `7ba5579`, `86eba96`(로그아웃 부분), `c6febb2`, `3df276f`, `973eb8b`(에러 메시지 노출 — [[admin-cleanup-and-member-api-integration]])

## 1. JWT 저장 + 자동 첨부 + 401 자동 재발급 (`7ba5579`)

로그인/회원가입/토큰 저장이 전부 Mock이었다가 실 백엔드 `/api/auth/*`로 교체되면서, axios 레벨에서 아래 3가지를 공용 처리:

1. **토큰 저장소 분리** (`src/api/tokenStorage.js`) — `localStorage` 접근을 한 곳에 모아 저장 방식이 바뀌어도(예: httpOnly 쿠키) 이 파일만 고치면 되게 함
2. **요청 인터셉터** — 모든 요청에 access token을 자동으로 `Authorization` 헤더에 첨부
3. **응답 인터셉터** — 401 시 refresh token으로 자동 재발급 후 원요청 재시도. 여러 요청이 동시에 401을 맞으면 재발급은 1번만 보내고 나머지는 대기열에 쌓았다가 같은 새 토큰으로 재시도(`isRefreshing` + `pendingRequests` 락)

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

> 최초 도입 시점 스니펫. 이후 SSE 연동을 위해 `subscribeAccessToken`(토큰 변경 pub/sub) 추가됨 — [[domain-notifications-sse]].

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

[[admin-cleanup-and-member-api-integration]]에서 응답 인터셉터에 "백엔드 에러 메시지를 `error.message`로 덮어쓰는" 처리가 추가됨.

### 같이 정리한 것
- 회원가입 시 백엔드가 요구하는 닉네임 필드 누락 추가
- 회원탈퇴를 `DELETE /api/members/me`에 연동

## 2. 로그아웃 API 배선 (`86eba96`)

Header/프로필/대시보드 3곳에서 각자 로그아웃을 처리하던 걸 `POST /api/auth/logout` 하나로 통일. `ProfileEditView`의 `onLogout` prop이 실제로는 연결이 안 돼 있어서 회원 탈퇴 후 콜백이 동작하지 않던 버그도 같이 수정.

## 3. 보호자 동의 대기 목록 조회/승인/거절 (`c6febb2`)

미성년자 회원가입 시 보호자 이메일로 동의 요청이 가는데, 기존엔 "샌드박스 시뮬레이터" 카드로 승인/거절을 흉내만 냈다. `GET /api/guardian-consents/pending`으로 로그인한 보호자 기준 대기 목록을 조회하고, 승인/거절 시 `PATCH`로 실제 상태 반영.

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

이 목록/승인·거절 API는 [[../routing-url-mapping|라우터 마이그레이션]]에서 만든 이메일 링크 전용 페이지 `/guardian-consent/:consentId`(`GuardianConsentView.jsx`)와는 다른 진입점 — 이쪽은 로그인한 보호자가 마이페이지에서 직접 확인, `GuardianConsentView`는 이메일 링크로 로그인 없이 바로 처리.

## 4. 개발 환경 전용 원클릭 로그인 (`3df276f`)

로그인 화면을 건너뛰고 바로 다른 화면을 보게 해두면 access token이 없어 API 연동 기능이 다 깨졌다. "테스트 계정으로 실제 로그인 API를 호출해 진짜 토큰을 받아오는" 버튼을 개발 환경에서만 노출(`import.meta.env.DEV` 가드, 프로덕션 빌드 미포함).

## 5. 로그인 401이 토큰 재발급 시도로 오인되던 문제 (`b6e82d4`)

정지 계정(`SUSPENDED_MEMBER`) 등으로 로그인 자체가 401을 받으면, `axios.js` 인터셉터가 이를 액세스 토큰 만료로 오인해 조용히 `/api/auth/token-refresh`를 시도했다. 로컬에 예전 세션의 refreshToken이 남아있으면 그 재발급 실패로 원래 로그인 에러 메시지가 덮어써졌다. `/api/auth/login`을 `/api/auth/token-refresh`와 마찬가지로 리프레시 재시도 예외 목록에 추가해, 로그인 자체의 401은 항상 곧바로 원래 에러 메시지로 거부되도록 수정.

다만 이 수정 이후에도 실제 배포 환경에서는 같은 증상(정지 계정 메시지 미노출)이 재현됐는데, 이건 이 버그와 무관한 **CloudFront 인프라 문제**였다 — 자세한 내용은 [[infra-cloudfront-api-error-masking]] 참고.

## 관련 문서
- [[guest-browsing-and-auth-gate]] — `isAuthenticated`를 기준으로 라우트/액션을 여닫는 후속 작업
- [[admin-cleanup-and-member-api-integration]] — axios 에러 메시지 노출 개선, 관리자 로그인 페이지 디자인 통일
- [[infra-cloudfront-api-error-masking]] — CloudFront SPA 폴백이 API 에러 응답을 index.html로 가로채는 별개 문제(미해결)
