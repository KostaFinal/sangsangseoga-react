# 상상서가 — react-router-dom 도입 시 URL 매핑안

지금은 `App.jsx`의 `currentScreen` state + `switch`문으로 화면을 전환하고 있어서, 화면이 바뀌어도 브라우저 URL은 항상 `/`로 고정되어 있습니다 (새로고침 시 초기화, 뒤로가기 동작 안 함, 링크 공유 불가).

`react-router-dom`을 도입한다면 아래와 같이 매핑하는 것을 제안합니다. 아직 실제 코드에는 적용하지 않은 **설계안**입니다.

---

## 1. 최상위 화면

| 현재 `currentScreen` 값 | 최종 URL | 컴포넌트 | 비고 |
|---|---|---|---|
| `login` | `/login` | LoginView | |
| `social-auth` | `/social-auth?provider=google` | SocialAuthGateway | provider는 쿼리스트링 |
| `password-reset` | `/password-reset` | PasswordResetView | |
| `signup` | `/signup` | SignupView | |
| `home` | `/` | MainDashboard | |
| `friends-library` | `/library` | 도서 그리드 | |
| `friends-library`+`viewingBook` | `/library/:bookId` | BookDetailView | |
| `my-library` | `/my-library` | MyLibraryApp (index=bookshelf) | 하위 표 참고 |
| `author-search` | `/authors` | SearchAuthorView | |
| `author-search`+`selectedAuthor` | `/authors/:authorName` | AuthorProfileView | |
| `pricing` | `/pricing` | PricingView | 워크플로우 페이지, 자원 아님 |
| `payment` | `/payment` | PaymentView | 워크플로우 페이지 |
| `subscription` | `/subscription` | SubscriptionView | 내 구독 관리 |
| `admin` | `/admin` | AdminView | `RequireAdmin` 가드 필요 |
| `notifications` | `/notifications` | NotificationsView | |
| `profile-edit` | `/profile/edit` | ProfileEditView | 명사+동작 계층 |
| `common-showcase` | `/showcase` | CommonShowcaseView | 실배포 시 라우트 제외 검토 |
| `create-poem`/`essay`/`nonfiction`/`fairy-tale`/`novel` | `/create/:genre` | BookCreationRouter | 5개 라우트 → 1개로 통합, `genre`는 `useParams()` |
| (라우터 매치 실패) | `*` catch-all | ErrorPage404 | 화면값 아님 |
| (렌더링 중 예외) | ErrorBoundary | ErrorPage500 | 화면값 아님, 라우트 X |

## 2. 오버레이 / 하위 자원

| 현재 상태 | 최종 URL | 컴포넌트 | 비고 |
|---|---|---|---|
| `selectedBook` 독서 뷰어 | `/library/:bookId/read` | BookReaderView | book의 하위 액션 |
| `my-library` 뷰어 열림 | `/my-library/books/:bookId/read` | BookViewer | `/library` 쪽과 패턴 통일 |
| `my-library` 상세 열림 | `/my-library/books/:bookId` | BookDetailView | |

## 3. `my-library` 하위 탭

| 현재 `activeTab` 값 | 최종 URL | 컴포넌트 |
|---|---|---|
| `bookshelf` | `/my-library` (index) | MainBookshelf |
| `wishlist` | `/my-library/wishlist` | WishlistTab |
| `reading` | `/my-library/reading` | ReadingTab |
| `finished` | `/my-library/finished` | FinishedTab |
| `stats` | `/my-library/stats` | BookStats |
| `calendar` | `/my-library/calendar` | BookCalendar |
| `ai-chat` | `/my-library/ai-chat` | ReviewWithAI |
| `create` | `/my-library/create` | BookCreationTab |
| `all-books` | `/my-library/all-books` | MyBookTab |
| `saved-author` | `/my-library/saved-author` | SavedAuthorTab |

## 4. `admin` 하위 탭

| 현재 `activeTab` 값 | 최종 URL | 컴포넌트 | 비고 |
|---|---|---|---|
| `member` | `/admin` (index) | 작가 계정 관리 | 계정 상태 복구/일시 정지 |
| `reports` | `/admin/reports` | 신고 사안 심의 | 하위에 `reportSubTab` 존재 |
| `reports`+`reportSubTab` | `/admin/reports/:type` | - | `type` = `books` \| `comments` \| `authors` |
| `tokens` | `/admin/tokens` | AI 리소스 관리 | 글자/이미지 생성 추이 |

## 5. `profile-edit` 하위 탭

| 현재 `activeTab` 값 | 최종 URL | 컴포넌트 | 비고 |
|---|---|---|---|
| `basic` | `/profile/edit` (index) | 기본 정보 및 계정 보안 | |
| `guardian` | `/profile/edit/guardian` | 보호자 동의 및 자녀 관리 | |

---

## 범위에서 제외한 부분

- **책 만들기 위저드 내부 단계** (`/create/:genre` 하위): 시나리오 빌더, 선택지 빌더, 표지 선택, 채팅형 집필, 완성본 확인 등 장르별로 5~9단계 내부 스텝(`useNovelScenarioBuilder`, `useFairyTaleCoCreationStudio` 등)이 존재하지만, 위저드 성격상 뒤로가기/새로고침 시 중간 단계로 복귀할 필요성이 낮고 스텝 수가 장르마다 달라 이번 매핑에서는 `/create/:genre` 하나로 뭉뚱그렸습니다. 실제 도입 시 필요하면 `/create/:genre/:step` 형태로 별도 설계 필요.
- **PricingView / SubscriptionView 내부 모달·토글 상태** (`showCancelConfirm`, `purchaseSuccess`, `printSuccess`, FAQ 아코디언 등): 별도 페이지가 아니라 같은 화면 위 모달/토글이라 URL 대상에서 제외.
- **`authorProfileMode`, `BookDetailView`의 `mode`(owner/viewer)**: 같은 URL에서 로그인 사용자 권한에 따라 자동으로 결정되는 값이라 URL 파라미터로 노출할 필요 없음.
- **순차 진행형 폼 내부 단계** — 아래는 모두 "같은 화면 안에서 다음 단계로 넘어가는" 순차 폼이라 뒤로가기/새로고침으로 중간 단계를 복원할 필요성이 낮아 단일 URL로 유지:
  - `signup` 내부 `step`: `info` → `guardian_consent` (뒤로가기 시 `info`로 복귀만 가능)
  - `social-auth` 내부 `step`: `consent` → `callback_exchange` → `guardian_gate`/`on_success`
  - `password-reset` 내부 `stage`: `request` → `sent_success` / `new_password` → `finished_success`
  - `payment` 내부 `paymentPhase`: `FORM` → `PROCESSING` → `FAILURE_SCREEN`(재시도 시 `FORM`으로 복귀)
  - 단, `password-reset`의 `new_password` 단계는 실제 서비스에서는 이메일로 받은 토큰 검증이 필요하므로, 도입 시 `/password-reset/:token` 형태의 별도 URL이 필요할 가능성이 높음 (지금은 프론트 목업이라 토큰 없이 state로만 전환됨).

---

## ⚠ 마이그레이션 시 주의사항

- **`PoemCreationView.jsx`가 이미 `window.history.pushState`/`popstate`를 직접 사용 중** (URL은 안 바꾸고 `history.state`만 채워서 뒤로가기 버튼을 자체적으로 가로채는 방식, `step2`~`step4` 구간 이탈 방지용). `react-router-dom`을 도입하면 라우터가 내부적으로 같은 `history` API를 관리하므로, 이 수동 구현과 충돌할 수 있어 **해당 컴포넌트는 라우터 도입 시 별도로 리팩터링 필요**. Essay/Nonfiction 등 다른 장르 컴포넌트에는 이 패턴이 없음 (실제로 `grep`으로 전수 확인함).

---

## 설계 메모

- REST(자원+HTTP 메서드)는 서버 API 설계 원칙이라 프론트 라우팅에 그대로 적용되진 않음. 브라우저 내비게이션은 사실상 항상 GET이라, `POST`/`DELETE` 같은 의미는 URL로 표현하지 않음.
- `login`/`signup`/`pricing`/`payment` 같은 워크플로우 페이지는 자원이 아니므로 억지로 `/자원/:id` 형태로 끼워맞추지 않음.
- 반대로 book, author처럼 실제로 존재하는 자원은 `/자원/:id` 계층 구조로 통일 (`/library/:bookId`, `/authors/:authorName`).
- 전체를 한 번에 옮기기보다 1단계(로그인~홈~결제)부터 단계적으로 전환하는 것을 권장.
