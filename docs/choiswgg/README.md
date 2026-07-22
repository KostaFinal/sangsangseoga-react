# docs/choiswgg — 작업 도메인 정리 (개인 참고용)

## 도메인별 파일

| 파일 | 도메인 | 대표 커밋 |
|---|---|---|
| [domain-auth.md](domain-auth.md) | 인증 — 로그인/회원가입/토큰 재발급/로그아웃/보호자 동의/개발용 로그인 | `7ba5579`, `86eba96`, `c6febb2`, `3df276f` |
| [domain-subscription.md](domain-subscription.md) | 구독/결제 — 상태 조회·시작·해지, 요금제 변경, 실사용량, 단발 생성권 제거 | `2759e70`, `6cb753d`, `86eba96`, `a02f20a` |
| [domain-routing-migration.md](domain-routing-migration.md) | 라우팅 — currentScreen switch → react-router-dom 전면 전환, 장르 전환 404 수정 | `7a3cd3f`, `fd31c6f`, `4fc2888` |
| [domain-structure-and-cleanup.md](domain-structure-and-cleanup.md) | 구조/정리 — components·hooks·services 3계층 통일, 알림 기능 제거(이후 복구) | `24d7d03`, `11abb93` |
| [admin-cleanup-and-member-api-integration.md](admin-cleanup-and-member-api-integration.md) | 관리자 — 회원/신고 실 API 연동, 서버 페이지네이션, 403·로그인 페이지·필터 UI 정리 | `973eb8b` |
| [guest-browsing-and-auth-gate.md](guest-browsing-and-auth-gate.md) | 인증×라우팅 후속 — 비로그인 둘러보기 허용 + 액션 시점 로그인 유도 | `12637c9`, `8ec41a7`, `609bb47` |
| [domain-admin-ai-usage-and-reports.md](domain-admin-ai-usage-and-reports.md) | 관리자 — 신고 상태 필터/처리이력(action-logs) 신설, AI 사용량 관리 실 연동, 승인 대기 회원 UI 되돌림 | `a9377fa`, `52e5614`, `701606b`, `0f1f91a`, `897c4f1`, `ee46b2f`, `6de75c6`(미push) |
| [domain-profile.md](domain-profile.md) | 내 정보 수정 — 실 API 연동, 프로필 사진 업로드, 자기소개, 저장 버튼 분리, 탈퇴(소프트 삭제) | `e0b8d68`, `054caec`(미push) |
| [domain-notifications-sse.md](domain-notifications-sse.md) | 알림 — 기능 복구/실 API 연동 + 실시간 푸시(SSE) | `9383c5b`, SSE 부분은 미커밋 |
| [infra-cloudfront-api-error-masking.md](infra-cloudfront-api-error-masking.md) | 인프라 — CloudFront SPA 폴백이 `/api/*` 에러 응답을 index.html로 가로채는 문제 (미해결, AWS 콘솔 조치 필요) | 없음(코드 수정 아님) |

문서 사이 `[[이름]]` 링크는 관련 도메인끼리 서로 참조하는 용도입니다 (같은 폴더 내 파일명 기준).

## 현재 반영 상태 요약 (작성 시점 2026-07-15 기준)

| 작업 | 커밋 여부 | GitHub(origin/main) 반영 여부 |
|---|---|---|
| 인증/구독/라우팅/구조 정리 (위 4개 도메인) | 커밋됨 | **반영됨** |
| 관리자 실 API 연동 + UI 정리 (`973eb8b`) | 커밋됨 | **반영됨** |
| 비로그인 둘러보기 + 액션 가드 (`12637c9`/`8ec41a7`/`609bb47`) | 커밋됨 | **반영됨** |
| 관리자 신고 필터/처리이력/AI 사용량 개선 (`a9377fa`~`897c4f1`, `ee46b2f`) | 커밋됨 | **반영됨** |
| AI 사용량 추이 차트 개선 + 신고 사유 표시 (`6de75c6`) | 커밋됨 | 미반영 (push 안 함) |
| 알림 복구 + 실 연동, 헤더/프로필 정리 (`9383c5b`) | 커밋됨 | 미반영 (push 안 함) |
| 내 정보 수정 — 프로필 사진/자기소개/탈퇴 정정 (`054caec`) | 커밋됨 | 미반영 (push 안 함) |
| 알림 실시간 푸시(SSE) | 미커밋 (작업트리에 수정 상태로만 존재) | 미반영 |

가장 최근 세 커밋(`6de75c6`, `9383c5b`, `054caec`)과 아직 커밋하지 않은 SSE 작업만 로컬에 남아있고, 그 이전 작업은 전부 origin/main에 반영되어 있습니다.
