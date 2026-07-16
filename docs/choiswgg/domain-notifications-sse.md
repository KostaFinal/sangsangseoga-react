# 알림(Notifications) 도메인 — 실 API 복구 + 실시간 푸시(SSE)

관련 커밋: `9383c5b`(알림 기능 복구/실 연동), SSE 부분은 미커밋

## 0. 알림 기능 복구 + 실 API 연동 (`9383c5b`)

[[domain-structure-and-cleanup]]에서 한 차례 완전히 제거됐던 기능(`11abb93`, 당시 안 쓰인다고 판단). BE가 알림 API(`GET /api/notifications`, `PATCH .../read`, `PATCH .../read-all`, `DELETE /api/notifications`)를 만들면서 `NotificationPanel.jsx`(헤더 벨 드롭다운), `NotificationsView.jsx`(`/notifications` 전체 목록), `notificationApi.js`, `src/shared/services/notificationService.js`를 복구하고 실 API로 연동.

### 핵심 설계 — Header와 /notifications가 상태를 공유
복구 전엔 Header와 전체 알림 페이지가 각자 로컬 mock 배열을 들고 있어서 서로 갱신이 안 됐다(벨에서 읽음 처리해도 전체 목록엔 반영 안 됨). `AuthContext.jsx`에 `notifications` 상태와 `refreshNotifications`/`markNotificationRead`/`markAllNotificationsRead`/`clearAllNotifications`를 두고 두 화면이 공유하도록 통합. 로그인/회원가입 직후와 앱 마운트 시(새로고침 포함) `refreshNotifications()` 호출.

### 곁가지 — 헤더 프로필 사진도 같은 세션에서 실 연동
같은 커밋에서 `AuthContext`에 `refreshProfile()`(`GET /api/members/me`)도 추가. 기존엔 닉네임/이메일/프로필사진이 로그인 응답에만 의존해서 새로고침하면 되살릴 방법이 없었는데, 마운트 시/로그인 직후 호출하도록 붙여서 새로고침해도 헤더 아바타가 실제 DB 값을 불러오게 됨. Header "오늘 사용량" 배지를 관리자에게 숨기고 프리미엄 여부로 색상 구분한 것도 같은 커밋 — [[domain-subscription]] 5번 참고.

## 1. 실시간 푸시(SSE) — 구현 완료, 미커밋

기존 알림(0번)은 `GET /api/notifications`를 직접 호출해야만 갱신되는 pull 방식이었다(로그인 직후 1회 조회, 벨 드롭다운 열 때도 재조회 안 함). BE가 SSE 엔드포인트를 추가해 아래 설계 + 구현을 진행. BE에 아직 엔드포인트가 없어서 Playwright로 SSE 응답을 mock해 프론트 로직만 검증 — 정상 동작 확인.

## BE 스펙 (2026-07-16, 2026-07-30 티켓 방식으로 변경)

- 신규 엔드포인트: `GET /api/notifications/stream` — SSE 연결, `Content-Type: text/event-stream`
- **인증 — 1회용 티켓 방식**: 로그·리퍼러로 액세스 토큰이 새는 걸 막기 위해, 토큰을 직접 쿼리에 싣던 방식(`?token=`)은 막혔다(401). 대신 먼저 `POST /api/notifications/stream-ticket`(`Authorization: Bearer` 헤더로 인증)을 호출해 `{ ticket }`을 받고, `GET /api/notifications/stream?ticket={발급값}`으로 연결한다. 티켓은 발급 후 30초 내 미사용 시 만료, 사용 즉시 무효화(재사용 불가).
- 수신 이벤트: `event: notification`, `data`는 `GET /api/notifications`의 `items[]` 항목 하나와 동일(`id`/`text`/`createdAt`/`read`).
- keep-alive용 이름 없는 주석성 이벤트는 무시(`addEventListener('notification', ...)`엔 안 걸림).
- **재연결은 FE가 직접 처리**: 브라우저 `EventSource`의 자동 재연결은 같은 URL(이미 소모된 티켓)로만 재시도하므로 쓸모없다. `onerror` 시 기존 연결을 닫고 새 티켓을 받아 새 `EventSource`를 여는 방식으로 대체(`AuthContext.jsx`, 3초 후 재시도).
- 기존 REST API는 안 바뀜. SSE는 "접속 중일 때 즉시 알려주는" 보조 수단, 원본은 여전히 DB(목록 API). 최초 로드/새로고침은 `GET /api/notifications`, 이후 실시간 반영만 SSE.
- 연결은 로그인 성공 직후 열고 로그아웃 시 `es.close()`. 탭마다 별도 연결 생김(문제 없음, 필요하면 SharedWorker로 통합 가능).

## 설계 결정

### 1. 연결 관리 위치 — `AuthContext.jsx`
알림 상태를 이미 여기서 들고 있으므로 `EventSource`도 여기서 하나만 관리. `isAuthenticated`가 true일 때 열고 `handleLogout`에서 닫는다. `Header.jsx`/`NotificationsView.jsx`는 기존처럼 `useAuth()`의 `notifications`만 구독하므로 **수정 불필요** — SSE로 들어온 알림을 Context 배열에 얹으면 두 화면 다 자동 갱신.

### 2. 토큰 회전(refresh) 대응이 핵심 리스크
연결 도중 액세스 토큰이 갱신되면(axios 401 인터셉터가 조용히 재발급) 기존 SSE는 만료된 인증 상태를 가리키게 된다.

- `tokenStorage.js`에 최소한의 pub/sub(토큰 변경 구독) 추가. `setTokens()` 호출 시(로그인/조용한 재발급 전부) 구독자에게 알림.
- `AuthContext`의 SSE 로직이 이 이벤트를 구독해서 토큰이 바뀔 때마다 기존 연결을 닫고, 새 티켓을 받아 다시 연다.
- 토큰 갱신 로직은 `tokenStorage.js` 한 곳에만 모이고, SSE 쪽은 "토큰이 바뀌면 재연결(=새 티켓 발급)"만 따르면 됨.
- 티켓 발급 자체가 실패하거나(네트워크 오류 등) 응답이 오기 전에 로그아웃/재로그인이 일어나 더 이상 유효하지 않은 시도가 되는 경우를 막기 위해 연결 시도마다 세대(generation) 번호를 매겨, 응답이 왔을 때 최신 시도가 아니면 버린다.

### 3. 수신 이벤트를 상태에 반영
`es.addEventListener('notification', handler)`에서:
- 받은 JSON을 `notifications` 배열 맨 앞에 추가(목록 API가 이미 최신순)
- `id` 기준으로 이미 있으면 무시(재조회 타이밍 겹침 대비)
- 벨 배지 빨간 점은 이미 `notifications.some(n => !n.read)`로 계산 중이라 별도 카운터 불필요

토스트 표시는 1차 구현 범위에서 제외(배지+목록 갱신만). 필요해지면 후속 작업.

### 4. 에러/재연결
`onerror` 시 기존 연결을 닫고 3초 후 새 티켓을 받아 재연결한다(브라우저 자동 재연결은 소모된 티켓으로만 재시도해 무의미하므로 이 로직으로 대체).

### 5. 멀티탭
지금 규모에서는 탭마다 개별 연결이 생겨도 무방 — SharedWorker는 실제로 연결 수가 문제될 때로 미룸.

## 변경 대상 파일
- `src/api/tokenStorage.js` — 토큰 변경 pub/sub 추가
- `src/api/notificationApi.js` — `getNotificationStreamTicket()` (`POST /api/notifications/stream-ticket`) 추가
- `src/shared/services/notificationService.js` — `getStreamTicket()` 래퍼 추가
- `src/shared/context/AuthContext.jsx` — SSE 연결 open/close(티켓 발급 → EventSource), 알림 수신 시 `notifications` 병합, 에러 시 재연결
- `Header.jsx` / `NotificationsView.jsx` — 변경 없음

## 관련 문서
- [[domain-structure-and-cleanup]] — 알림 기능이 제거(`11abb93`)됐다가 복구된 이력
