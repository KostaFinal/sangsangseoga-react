# 상상서가 — 비로그인 둘러보기 + 액션 시점 로그인/구독 유도

## 배경

기존에는 `ProtectedRoute`가 `/`, `/friends`, `/authors`, `/subscription`을 포함한 거의 모든 화면을 감싸고 있어서, 로그인하지 않은 사용자는 서비스를 전혀 둘러볼 수 없고 곧바로 `/login`으로 튕겨나갔습니다.

이번 작업은 이 정책을 바꿔서:
- **콘텐츠 열람(둘러보기)은 비로그인도 허용**
- **로그인 없이는 할 수 없는 개별 액션(좋아요, 댓글, 팔로우, 구독 시작 등)은 그 버튼을 누르는 시점에만 로그인으로 유도**

하도록 라우트 가드 위치와 액션 핸들러를 재구성했습니다. 페이지 단위의 굵은 빗장 대신, 실제로 로그인이 필요한 지점에 얇은 빗장을 여러 개 박아두는 방식입니다.

## 라우트 재분류 (`src/App.jsx`)

| 분류 | 경로 | 비고 |
|---|---|---|
| 완전 공개 | `/`, `/friends`, `/friends/:bookId`, `/authors`, `/authors/:authorName`, `/subscription` | `ProtectedRoute` 밖으로 이동 |
| 로그인 필수 (개인 데이터) | `/library/*`, `/profile/edit`, `/admin/*` | 그대로 유지 |
| 로그인 필수 (실제 콘텐츠 제공) | `/books/:bookId/read` | 정책 결정 보류 상태라 안전하게 유지 — 필요 시 재검토 |
| 로그인 필수 (결제) | `/subscription/payment`, `/create/*` | 그대로 유지 |
| 로그인 여부 무관 | `/guardian-consent/:consentId`, `/404`, `/500` | 기존과 동일 |

`AppShell`(Header + 책 목록 로딩)이 원래도 `ProtectedRoute`보다 위에 있어서, 라우트를 여는 것 자체는 구조 변경 없이 위치만 옮기면 됐습니다.

```jsx
// src/App.jsx — AppInner()의 <Routes> 발췌
<Route path="/guardian-consent/:consentId" element={<GuardianConsentView />} />

{/* 둘러보기는 비로그인도 가능 — 로그인이 필요한 액션은 클릭 시점에 /login으로 유도 */}
<Route index element={<MainDashboard />} />
<Route path="friends" element={<FriendsLibraryView />} />
<Route path="friends/:bookId" element={<FriendsLibraryView />} />
<Route path="authors" element={<SearchAuthorView />} />
<Route path="authors/:authorName" element={<AuthorProfileView />} />
<Route path="subscription" element={<SubscriptionRoute />} />

<Route element={<ProtectedRoute />}>
  <Route path="books/:bookId/read" element={<BookReaderPage />} />
  <Route path="library" element={<MyLibraryLayout />}>...</Route>
  <Route path="subscription/payment" element={<PaymentRoute />} />
  <Route path="profile/edit" element={<ProfileEditRoute />} />
  <Route path="create/poem" element={<BookCreationRouter key="poem" initialGenre="poem" />} />
  ...
  <Route element={<AdminRoute forbidden={<ForbiddenPanel />} />}>...</Route>
</Route>
```

### 로그인 후 원래 위치로 복귀

`ProtectedRoute`는 리다이렉트할 때 `state={{ from: location }}`을 함께 넘깁니다(`src/shared/routes/guards.jsx`). 액션 가드(`useRequireAuth`)도 동일하게 동작합니다. `LoginRoute`가 로그인 성공 시 이 `from`을 읽어 원래 페이지로 돌아가도록 수정했습니다(이전에는 무조건 `/`로 이동).

```jsx
// src/App.jsx — LoginRoute()
onSuccess={(userInfo) => {
  setCurrentUser(userInfo);
  setIsAuthenticated(true);
  refreshSubscriptionStatus();
  refreshUsage();
  const from = location.state?.from;
  navigate(from ? `${from.pathname}${from.search || ''}` : '/', { replace: true });
}}
```

## 액션 시점 가드: `useRequireAuth`

새로 만든 공용 훅입니다. 로그인 상태면 `true`를 반환하고, 아니면 현재 위치를 `state.from`에 담아 `/login`으로 보내고 `false`를 반환합니다. 액션 핸들러 맨 앞줄에 한 줄만 추가하면 되는 형태로 설계했습니다.

```js
// src/shared/hooks/useRequireAuth.js
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function useRequireAuth() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return () => {
    if (isAuthenticated) return true;
    navigate('/login', { state: { from: location } });
    return false;
  };
}
```

사용 패턴:

```js
const requireAuth = useRequireAuth();

const handleToggleLike = async (e, bookId) => {
  e.stopPropagation();
  if (!requireAuth()) return;   // 비로그인이면 여기서 /login으로 보내고 종료
  // ... 실제 좋아요 API 호출
};
```

## 가드를 적용한 지점

| 파일 | 액션 | 비고 |
|---|---|---|
| `src/shared/components/AppShell.jsx` | 좋아요 토글, 북마크 토글 | 어느 화면에서든 책 카드에 붙는 공용 핸들러 |
| `src/features/library/components/FriendsLibraryView.jsx` | 좋아요, 댓글 작성, 답글 작성 | 겸사겸사 `deleteWishlist`가 import 안 돼 있던 기존 버그도 수정(좋아요 취소 시 위시리스트 동기화가 조용히 실패하던 부분) |
| `src/features/authors/components/AuthorProfileView.jsx` | 팔로우 토글, 신고 제출 | 신고 여부 조회(`getReportedIds`)도 비로그인이면 아예 호출하지 않도록 스킵 |
| `src/features/subscription/hooks/useSubscriptionState.js` | "프리미엄 구독 시작" 버튼(`handleSelectPremium`) | 결제 페이지로 못 넘어가게 진입점에서 막음 |

`handleChangePlan`/`handleResumeSubscription`/구독 해지 등은 애초에 `isPremium === true`일 때만 버튼이 노출되는데, `isPremium`은 로그인 상태에서만 서버 조회로 세팅되므로(`AuthContext.refreshSubscriptionStatus`) 비로그인 사용자에게는 자연히 노출되지 않아 별도 가드가 필요 없었습니다.

## 구독 페이지의 비로그인 대응 (`SubscriptionView.jsx`)

`/subscription`을 열어두면서, 로그인 전용 데이터(오늘 사용량, 결제 내역)를 무한 로딩이나 401 에러 메시지로 보여주지 않도록 `isAuthenticated`를 프롭으로 받아 분기했습니다.

```jsx
{!isAuthenticated && (
  <div className="...">로그인하면 오늘 사용량을 확인할 수 있어요</div>
)}
{isAuthenticated && !usage && <div className="...">불러오는 중...</div>}
{isAuthenticated && usage && ( /* 실제 사용량 UI */ )}
```

결제 내역 조회 자체(`loadPayments`)도 비로그인이면 호출하지 않도록 `useSubscriptionState`에 `isAuthenticated`를 넘겨서 초반에 리턴하게 했습니다:

```js
const loadPayments = useCallback(async () => {
  if (!isAuthenticated) return;
  ...
}, [isAuthenticated]);
```

## 확인한 것 / 확인이 필요한 것

- `tsc --noEmit` 클린 통과
- `Header.jsx`는 이미 로그인/비로그인 분기(로그인·회원가입 버튼 vs 프로필 드롭다운)가 라우터 마이그레이션 때부터 되어 있어서 손댈 필요가 없었습니다.
- **미확인**: 백엔드가 `/api/books`, `/api/authors` 같은 조회 엔드포인트를 토큰 없이도 실제로 200을 내려주는지는 프론트만으로 확인할 수 없습니다. 비로그인 상태로 브라우저에서 직접 열어봤을 때 401이 뜬다면, 프론트가 아니라 백엔드 쪽에서 해당 조회 API의 인증 요구사항을 완화해야 합니다.
- **정책 보류**: `/books/:bookId/read`(실제 본문 읽기)는 이번에 로그인 필수로 남겨뒀습니다. 유료 챕터 페이월을 페이지 진입 자체에서 막을지, 읽다가 유료 구간에서 막을지는 별도 결정이 필요합니다.
