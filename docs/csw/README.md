# docs/csw — 내 작업 도메인 정리 (개인 참고용)

ChoiSW(계정) 작업을 도메인별로 나눠서, 개념 + 실제 코드 위주로 정리한 폴더입니다. git 커밋 메시지만으로는 "무슨 코드를 왜 그렇게 짰는지" 파악하기 어려운 부분을 보완하기 위한 자료입니다.

## 도메인별 파일

| 파일 | 도메인 | 대표 커밋 |
|---|---|---|
| [domain-auth.md](domain-auth.md) | 인증 — 로그인/회원가입/토큰 재발급/로그아웃/보호자 동의/개발용 로그인 | `7ba5579`, `86eba96`, `c6febb2`, `3df276f` |
| [domain-subscription.md](domain-subscription.md) | 구독/결제 — 상태 조회·시작·해지, 요금제 변경, 실사용량, 단발 생성권 제거 | `2759e70`, `6cb753d`, `86eba96`, `a02f20a` |
| [domain-routing-migration.md](domain-routing-migration.md) | 라우팅 — currentScreen switch → react-router-dom 전면 전환, 장르 전환 404 수정 | `7a3cd3f`, `fd31c6f`, `4fc2888` |
| [domain-structure-and-cleanup.md](domain-structure-and-cleanup.md) | 구조/정리 — components·hooks·services 3계층 통일, 알림 기능 제거 | `24d7d03`, `11abb93` |
| [admin-cleanup-and-member-api-integration.md](admin-cleanup-and-member-api-integration.md) | 관리자 — 회원/신고 실 API 연동, 서버 페이지네이션, 403·로그인 페이지·필터 UI 정리 | `973eb8b` (로컬 전용, 미push) |
| [guest-browsing-and-auth-gate.md](guest-browsing-and-auth-gate.md) | 인증×라우팅 후속 — 비로그인 둘러보기 허용 + 액션 시점 로그인 유도 | 미커밋 |

문서 사이 `[[이름]]` 링크는 관련 도메인끼리 서로 참조하는 용도입니다 (같은 폴더 내 파일명 기준).

## 현재 반영 상태 요약 (작성 시점 2026-07-09 기준)

| 작업 | 커밋 여부 | GitHub(origin/main) 반영 여부 |
|---|---|---|
| 인증/구독/라우팅/구조 정리 (위 4개 도메인) | 커밋됨 | **반영됨** (origin/main에 이미 push된 과거 작업) |
| 관리자 실 API 연동 + UI 정리 (`973eb8b`) | 커밋됨 | 미반영 (push 안 함) |
| 비로그인 둘러보기 + 액션 가드 | 미커밋 | 미반영 |

마지막 두 작업은 **아직 push하지 말라는 요청**이 있어서 로컬에만 있는 상태입니다.
