# 라우팅(Routing) 도메인 — currentScreen switch → react-router-dom 전면 전환

관련 커밋: `7a3cd3f`(본작업, 1355줄 추가/1437줄 삭제, 22개 파일), `fd31c6f`(후속 버그 수정), `4fc2888`

## 배경

원래 앱은 `App.jsx`의 `currentScreen`이라는 문자열 state + 거대한 `switch`문(`renderScreen()`)으로 화면을 전환하고 있었습니다. 이 방식의 문제:

- 어떤 화면을 보고 있든 브라우저 주소창은 항상 `/` 하나 — 새로고침하면 첫 화면으로 리셋, 뒤로가기 동작 안 함, 링크 공유/북마크 불가능
- 보호자 동의 이메일 링크가 가리켜야 할 페이지 자체가 앱에 없음(URL이라는 개념이 없었으므로) — 실제 버그로 이어짐
- `MemberCreationRoutes.jsx`(동화/소설 생성 단계)는 이미 `react-router-dom`을 쓰고 있었지만, 앱 전체와 무관하게 자기 혼자 `<MemoryRouter>`를 내부에 띄워서 **브라우저 주소창엔 전혀 반영 안 되는 고립된 라우팅**으로 동작 중이었음

이번 작업은 `react-router-dom`(이미 의존성에는 설치돼 있었음, v7)을 앱 최상단에 붙여서 모든 화면이 진짜 브라우저 URL을 갖게 만드는 것이었습니다.

## 핵심 설계 결정

### 1. `<Routes>` 트리 + `<Outlet>`으로 전환
`App.jsx`의 switch문과 `NavigationContext`를 걷어내고, 아래와 같은 라우트 트리로 교체했습니다.

```jsx
function AppInner() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route element={<GuestOnlyRoute />}>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/signup" element={<SignupRoute />} />
          ...
        </Route>

        <Route path="/guardian-consent/:consentId" element={<GuardianConsentView />} />

        <Route element={<ProtectedRoute />}>
          <Route index element={<MainDashboard />} />
          <Route path="friends" element={<FriendsLibraryView />} />
          <Route path="friends/:bookId" element={<FriendsLibraryView />} />
          <Route path="authors" element={<SearchAuthorView />} />
          <Route path="authors/:authorName" element={<AuthorProfileView />} />
          <Route path="books/:bookId/read" element={<BookReaderPage />} />
          <Route path="library" element={<MyLibraryLayout />}>...</Route>
          <Route path="create/poem" element={<BookCreationRouter initialGenre="poem" />} />
          ...
          <Route element={<AdminRoute forbidden={<ForbiddenPanel />} />}>...</Route>
        </Route>

        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}
```

### 2. `AuthContext` 신규 — 인증/구독/사용량 상태 전역화
[[domain-auth|인증]]과 [[domain-subscription|구독]] 상태가 여러 화면에 흩어져 있던 걸, `src/shared/context/AuthContext.jsx` 하나로 모았습니다. `currentUser`, `isAuthenticated`(신규 플래그 — 이전엔 로그인 전에도 `currentUser`가 항상 기본값을 가져서 "로그인 여부"를 진짜 boolean으로 판별할 수가 없었음), `isPremium`, `usage`, `refreshSubscriptionStatus`, `refreshUsage`, `handleLogout`을 여기서 관리합니다.

### 3. 라우트 가드 3종 신규 (`src/shared/routes/guards.jsx`)

```jsx
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet context={outletContext} />;
}

export function GuestOnlyRoute() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function AdminRoute({ forbidden }) {
  const { currentUser } = useAuth();
  if (currentUser?.role !== 'ADMIN') return forbidden;
  return <Outlet context={outletContext} />;
}
```

### 4. 동화/소설 생성 라우터 — 고립된 `MemoryRouter` 제거
`MemberCreationRoutes.jsx`가 쓰던 `<MemoryRouter>` 래퍼를 제거하고 최상단 `<Routes>` 트리에 `/create/fairy-tale/*`, `/create/novel/*`로 중첩 마운트했습니다. 내부 훅들(`useNovelStudio.js`, `useFairyTaleSetup.js` 등)이 이미 절대경로로 `navigate()`하고 있어서 코드 변경 없이 라우터만 교체하면 됐습니다. 이제 `/create/novel/studio` 같은 URL이 실제 브라우저 주소창에 뜨고 새로고침해도 유지됩니다.

**진행 중 발견한 함정**: 이 중첩 라우터 안에서는 `<Route path="/create/novel/studio">`처럼 **절대경로를 쓰면 매칭이 안 됩니다** — 마지막 세그먼트만 남긴 **상대경로**(`"studio"`)여야 매칭됩니다. `useLocation()`은 정확한 pathname을 보여줬지만 `<Route>` 매칭 자체가 실패하는 문제라 디버깅이 까다로웠습니다.

### 5. 책 상세/리더/작가 프로필 → 실라우트 전환
`viewingBook`/`selectedAuthor` 같은 로컬 state로 오버레이를 띄우던 방식을 `/friends/:bookId`, `/books/:bookId/read`, `/authors/:authorName` 같은 진짜 라우트로 바꿨습니다. `previousScreen`을 수동으로 추적하던 코드도 `navigate(-1)`(진짜 브라우저 히스토리)로 대체했습니다.

### 6. 보호자 동의 이메일 링크 페이지 신규
`GuardianConsentView.jsx` + `/guardian-consent/:consentId` 라우트를 새로 만들었습니다. 로그인 여부와 무관하게 접근 가능해야 해서(이메일 링크의 토큰 자체가 자격증명) `ProtectedRoute` 바깥에 배치했습니다. [[domain-auth|인증 도메인 문서]]에서 다룬 "마이페이지에서 보호자가 직접 확인하는" 흐름과는 별개의 진입점입니다.

### 7. 레거시 리다이렉트 유지
`/fairy-tale/*`, `/novel/*`, `/bookmaker/novel/*` 같은 예전 경로는 외부에 저장된 링크가 있을 수 있어 `Navigate to=... replace`로 리다이렉트만 유지했습니다.

## 후속 버그 수정

### 장르 전환 시 404 (`fd31c6f`)
`/create/poem`, `/create/essay` 등 라우트가 전부 같은 `BookCreationRouter` 컴포넌트를 가리키고 있어서, 장르만 바꿔 이동하면(예: 시 → 에세이) React Router가 "같은 컴포넌트 타입이니 리마운트할 필요 없다"고 판단해 **컴포넌트를 재사용**해버렸습니다. 그 결과 컴포넌트 내부의 `activeGenre` 상태가 새 URL과 어긋나서 404로 이어졌습니다.

```jsx
// 수정 전: 5개 라우트가 모두 같은 컴포넌트 타입 → 전환 시 리마운트 안 됨
<Route path="create/poem" element={<BookCreationRouter initialGenre="poem" />} />

// 수정 후: key를 다르게 줘서 장르 전환 시 강제로 리마운트되도록 함
<Route path="create/poem" element={<BookCreationRouter key="poem" initialGenre="poem" />} />
```

React Router(그리고 React 자체)의 일반 원칙: **형제 위치에서 같은 컴포넌트 타입을 다른 상태로 다시 렌더링하면 리마운트가 아니라 업데이트로 처리된다**는 걸 실전에서 확인한 사례입니다. `AdminView`의 탭 전환에서도 동일한 패턴(`key="member"`, `key="reports"`, `key="tokens"`)을 씁니다.

### 헤더 드롭다운 열리는 방식 (`4fc2888`)
"친구의 서재" 드롭다운이 클릭으로만 열리던 걸, 마우스 hover로도 열리게 `onMouseEnter`/`onMouseLeave` 핸들러를 추가했습니다.

## 관련 문서
- [[guest-browsing-and-auth-gate]] — 이 라우트 가드(`ProtectedRoute`) 구조를 그대로 활용해서, 일부 라우트를 비로그인에게도 열어준 후속 작업
- [[admin-cleanup-and-member-api-integration]] — 이 라우팅 구조 위에서 진행된 관리자 페이지 UI 정리
