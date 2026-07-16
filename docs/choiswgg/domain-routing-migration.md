# 라우팅(Routing) 도메인 — currentScreen switch → react-router-dom 전면 전환

관련 커밋: `7a3cd3f`(본작업, 1355줄 추가/1437줄 삭제, 22개 파일), `fd31c6f`(후속 버그 수정), `4fc2888`

## 배경

원래 앱은 `App.jsx`의 `currentScreen` 문자열 state + 거대한 `switch`문(`renderScreen()`)으로 화면을 전환했다. 문제:

- 어떤 화면이든 주소창은 항상 `/` — 새로고침 시 첫 화면으로 리셋, 뒤로가기 안 됨, 링크 공유/북마크 불가능
- 보호자 동의 이메일 링크가 가리켜야 할 페이지 자체가 앱에 없음(URL 개념이 없었음)
- `MemberCreationRoutes.jsx`(동화/소설 생성 단계)는 `react-router-dom`을 쓰고 있었지만 자기 혼자 `<MemoryRouter>`를 띄워서 주소창엔 반영 안 되는 고립된 라우팅이었음

`react-router-dom`(이미 v7로 설치돼 있었음)을 앱 최상단에 붙여 모든 화면이 진짜 브라우저 URL을 갖게 전환.

## 핵심 설계 결정

### 1. `<Routes>` 트리 + `<Outlet>`으로 전환
`App.jsx`의 switch문과 `NavigationContext`를 걷어내고 아래 라우트 트리로 교체.

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
[[domain-auth|인증]]/[[domain-subscription|구독]] 상태가 여러 화면에 흩어져 있던 걸 `src/shared/context/AuthContext.jsx` 하나로 통합. `currentUser`, `isAuthenticated`(신규 플래그 — 이전엔 로그인 전에도 `currentUser`가 기본값을 가져서 진짜 boolean으로 판별 불가능했음), `isPremium`, `usage`, `refreshSubscriptionStatus`, `refreshUsage`, `handleLogout` 관리.

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
`MemberCreationRoutes.jsx`의 `<MemoryRouter>` 래퍼를 제거하고 최상단 `<Routes>`에 `/create/fairy-tale/*`, `/create/novel/*`로 중첩 마운트. 내부 훅(`useNovelStudio.js`, `useFairyTaleSetup.js` 등)이 이미 절대경로로 `navigate()`하고 있어서 라우터만 교체하면 됐다. `/create/novel/studio` 같은 URL이 이제 실제 주소창에 뜨고 새로고침해도 유지됨.

**함정**: 이 중첩 라우터 안에서 `<Route path="/create/novel/studio">`처럼 절대경로를 쓰면 매칭이 안 된다 — 마지막 세그먼트만 남긴 상대경로(`"studio"`)여야 함. `useLocation()`은 정확한 pathname을 보여줬지만 `<Route>` 매칭 자체가 실패해서 디버깅이 까다로웠다.

### 5. 책 상세/리더/작가 프로필 → 실라우트 전환
`viewingBook`/`selectedAuthor` 로컬 state 오버레이를 `/friends/:bookId`, `/books/:bookId/read`, `/authors/:authorName` 실라우트로 전환. `previousScreen` 수동 추적 코드도 `navigate(-1)`(진짜 브라우저 히스토리)로 대체.

### 6. 보호자 동의 이메일 링크 페이지 신규
`GuardianConsentView.jsx` + `/guardian-consent/:consentId` 라우트 신규. 로그인 여부와 무관하게 접근 가능해야 해서(이메일 링크 토큰이 자격증명) `ProtectedRoute` 바깥에 배치. [[domain-auth|인증 도메인]]의 "마이페이지에서 보호자가 직접 확인" 흐름과는 별개 진입점.

### 7. 레거시 리다이렉트 유지
`/fairy-tale/*`, `/novel/*`, `/bookmaker/novel/*` 등 예전 경로는 외부 저장 링크 대비 `Navigate to=... replace`로만 유지.

## 후속 버그 수정

### 장르 전환 시 404 (`fd31c6f`)
`/create/poem`, `/create/essay` 등이 전부 같은 `BookCreationRouter` 컴포넌트를 가리켜서, 장르만 바꿔 이동하면(시 → 에세이) React Router가 "같은 컴포넌트 타입이니 리마운트 불필요"로 판단해 재사용해버렸다. 내부 `activeGenre` 상태가 새 URL과 어긋나 404로 이어짐.

```jsx
// 수정 전: 5개 라우트가 같은 컴포넌트 타입 → 전환 시 리마운트 안 됨
<Route path="create/poem" element={<BookCreationRouter initialGenre="poem" />} />

// 수정 후: key를 다르게 줘서 장르 전환 시 강제 리마운트
<Route path="create/poem" element={<BookCreationRouter key="poem" initialGenre="poem" />} />
```

React/React Router 원칙: 같은 위치에서 같은 컴포넌트 타입을 다른 상태로 다시 렌더링하면 리마운트가 아니라 업데이트로 처리된다. `AdminView` 탭 전환도 같은 패턴(`key="member"`, `key="reports"`, `key="tokens"`).

### 헤더 드롭다운 열리는 방식 (`4fc2888`)
"친구의 서재" 드롭다운이 클릭으로만 열리던 걸 hover로도 열리게 `onMouseEnter`/`onMouseLeave` 추가.

## 관련 문서
- [[guest-browsing-and-auth-gate]] — `ProtectedRoute` 구조를 활용해 일부 라우트를 비로그인에게도 연 후속 작업
- [[admin-cleanup-and-member-api-integration]] — 이 라우팅 구조 위에서 진행된 관리자 페이지 UI 정리
