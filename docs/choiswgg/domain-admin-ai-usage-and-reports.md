# 관리자 — 신고/처리이력/AI 사용량 관리 도메인

관련 커밋: `a9377fa`, `52e5614`, `701606b`, `0f1f91a`, `897c4f1`, `ee46b2f`, `6de75c6`(미push)

[[admin-cleanup-and-member-api-integration]]에서 회원/신고 관리를 처음 실 API로 연동한 이후, 신고 관리 고도화 + 처리 이력(action-logs) 신설 + AI 사용량 관리 실 API 전환을 진행한 작업.

## 0. 관리자 액션 실패 피드백 추가 (`a9377fa`)
회원 상태 변경/신고 처리/초기 로드 실패 시 화면에 반응이 없던 것을, 만들어져 있었지만 안 쓰이던 공용 `Toast` 컴포넌트로 성공/실패 모두 표시하도록 수정.

## 1. 신고 상태 필터 + 처리 이력(action-logs) 탭 신설 (`52e5614`)

`GET /api/admin/reports`에 `status` 쿼리(`PENDING`/`RESOLVED`/`REJECTED`) 추가, `GET /api/admin/action-logs`(처리 이력) 신규:
- `ReportsTab`에 상태 필터 탭 + 서버 사이드 페이지네이션
- `ActionLogsTab.jsx` 신규 — 처리 시각/처리자/대상/조치/사유
- 신고 대상(도서/댓글/작가)으로 바로 이동하는 "신고 대상 확인" 버튼

### 필터는 단일 축으로
처음엔 `targetType`(대상 종류)과 `actionType`(조치 종류)을 독립된 두 축으로 필터링했는데, `actionType`이 사실상 `targetType`을 함축한다(`BOOK_HIDE`↔도서, `COMMENT_DELETE`↔댓글, `AUTHOR_SUSPEND`↔작가, `REPORT_REJECT`만 대상 무관). 두 축을 독립시키면 "댓글 신고인데 작가 정지" 같은 불가능한 조합도 선택 가능해져서, `ReportsTab`과 같은 단일 축 구조로 되돌림.

```js
// src/features/admin/hooks/useAdminState.js
// actionType이 targetType을 함축하므로(REPORT_REJECT 제외) 필터는 actionType 단일 축만 둔다
```

### 신고 대상 이동 — targetNickname/targetParentBookId
작가 프로필/댓글 원본 도서로 이동하려면 작가 닉네임, 댓글의 원본 도서 ID가 필요했다. 처음엔 `getMemberDetail`/`getComment`로 채우려 했으나 둘 다 존재하지 않는 엔드포인트였다(Swagger 확인 후 404/405 실측). BE에 요청해서 `GET /api/admin/reports`, `GET /api/admin/action-logs` 응답 자체에 `targetNickname`(작가), `targetParentBookId`(댓글)를 필드로 추가받는 것으로 정리 — 목록 API가 이동에 필요한 정보를 전부 갖게 함.

```js
const mapReport = (r) => ({
  id: r.reportId,
  targetId: r.targetId,
  targetNickname: r.targetNickname,       // AUTHOR일 때만
  targetParentBookId: r.targetParentBookId, // COMMENT일 때만
  ...
});
```

댓글 대상 확인 시 해당 댓글까지 자동 스크롤+하이라이트되는 부분은 3번(`0f1f91a`)에서 마저 처리.

## 2. AI 사용량 관리 실 API 연동 (`701606b`)
`getTokenTrends`/`getTokenUsages`/`getMemberTokenTimeline` mock을 실 API(`GET /api/admin/token/trends|usages|usages/:userId/timeline`)로 교체. mock에 있던 `totalCredits`/`credits`(포인트) 필드가 실 응답엔 없어서 관련 UI 제거.

## 3. 신고된 댓글로 스크롤 이동 (`0f1f91a`)
"신고 대상 확인"으로 댓글 신고를 열면 도서 상세로만 가고 어느 댓글인지 못 찾던 것을, `targetParentBookId`로 이동 후 커서 기반 댓글 목록을 필요한 만큼 더 불러와(`loadMoreComments` 반복 호출) 대상 댓글을 찾아 스크롤+하이라이트하도록 `BookDetailView.jsx`/`FriendsLibraryView.jsx` 수정. StrictMode 이중 렌더링으로 자동 더보기가 중복 호출되던 버그는 `isAutoLoadingMoreRef` 가드로 해결.

## 4. AI 사용량 관리 요약 카드 정리 (`897c4f1`)
"구독 회원 비율"/"무료 회원 비율" 카드는 AI 사용량이 아니라 회원 구성비라 주제와 안 맞고 "작가 계정 관리" 탭과 중복 — 제거. `tokenSummary`의 `premiumRatio`/`freeRatio` 계산도 정리.

## 5. 승인 대기 회원 — 관리자 승인/거절 UI 되돌림 (`ee46b2f`)

회원의 `PENDING` 상태는 관리자가 승인하는 게 아니다. `MemberTab`에 대기 회원용 "승인"/"거절" 버튼을 추가했었으나, BE 회원가입 스펙 재확인 결과 `PENDING`은 **만 14세 미만 가입자가 보호자 이메일 동의를 기다리는 상태**였다("만 14세 미만은 보호자 동의 대기(PENDING)로 가입되며 토큰이 발급되지 않는다" — `POST /api/auth/signup`). 실제 승인은 보호자가 이메일 링크(`PATCH /api/guardian-consents/:id`)로 처리하며, 관리자가 `PATCH /api/admin/members/:id/status`로 직접 활성화하면 보호자 동의 없이 미성년자 계정을 활성화시키는 셈이라 되돌림.

```jsx
// src/features/admin/components/MemberTab.jsx
) : user.status === 'pending' ? (
  <span className="text-xs font-bold text-[#7C769D]">보호자 동의 대기 중</span>
) : (
  ...
```

관리자 상세 모달도 "보호자가 이메일로 받은 링크에서 직접 승인/거절하며, 관리자가 대신 승인할 수 없습니다" 안내로 대체. [[domain-auth|인증 도메인]]의 보호자 동의 흐름과 직결.

## 6. AI 사용량 추이 차트 개선 + 신고 처리 사유 표시 (`6de75c6`, 미push)

### 6-1. 트렌드 조회 기간 이동 (year/month/months)
`GET /api/admin/token/trends`에 `year`/`month`/`months` 파라미터 추가 — 일간은 특정 월 전체(1일~말일), 월간은 특정 연도 전체(1~12월) 조회 + 이전/다음 이동 화살표.

### 6-2. y축 눈금 + 그리드라인 + 단위 자동 스케일링
막대 위 상시 숫자 라벨 제거, 좌측 y축 눈금 + 가로 그리드라인으로 대체. y축 최댓값을 고정값이 아니라 실데이터 기준으로 매번 계산(고정값이면 실사용량이 넘거나 훨씬 작을 때 그래프가 깨짐), 텍스트 사용량 단위(토큰/만 토큰/억 토큰)도 데이터 범위에 맞춰 자동 선택.

### 6-3. 커스텀 툴팁을 뷰포트 기준 고정 위치로 재구현
막대 hover 툴팁이 `position: absolute`로 막대 안에 있었는데, 일간 뷰(최대 31개 막대)용 가로 스크롤 컨테이너(`overflow-x-auto`)를 추가하자 CSS 스펙상 overflow-x 지정 시 overflow-y도 자동 제한되어 툴팁이 잘렸다. `getBoundingClientRect()`로 hover한 막대 위치를 잡아 `position: fixed`로 뷰포트 기준 렌더링해서 해결.

### 6-4. 관리자 계정 사용량 집계 제외
`GET /api/admin/members?size=100`으로 role=ADMIN memberId 목록을 조회해 AI 사용량 랭킹/요약 카드 집계에서 제외. (트렌드 차트는 BE가 이미 합산해서 내려주는 숫자라 개별 제외 불가 — 필요하면 BE 집계 시점에서 제외해야 함)

### 6-5. 신고 처리 사유 표시
`GET /api/admin/reports`에 `resolvedReason`/`resolvedByNickname`(처리 사유/처리자, `RESOLVED`/`REJECTED`일 때만) 추가되어 `ReportDetailModal.jsx`에 연결.

## 관련 문서
- [[admin-cleanup-and-member-api-integration]] — 이 도메인의 출발점
- [[domain-auth]] — 보호자 동의 흐름(5번 항목)
- [[domain-notifications-sse]] — 잘못된 설계를 되돌린 유사 사례(알림 기능 제거→복구)
