# 상상서가 (SangSangSeoga)

AI가 사용자의 아이디어를 소설·동화·시·에세이 등 완성된 한 권의 책으로 만들어주는 창작 플랫폼입니다. 이 저장소는 그 프론트엔드로, 5인 팀이 기능 영역을 나누어 진행한 팀 프로젝트입니다.

> "상상을 이야기로, 이야기를 책으로." 글쓰기에 익숙하지 않은 사람도 AI의 도움을 받아 자신만의 책을 완성하고, 다른 사람의 작품을 읽고 응원할 수 있는 공간을 만드는 것을 목표로 했습니다.

## 팀원

<table>
  <tr>
    <td align="center" width="20%">
      <a href="https://github.com/ChoiSWgg">
        <img src="https://github.com/ChoiSWgg.png" width="90" height="90" style="border-radius:50%" /><br />
        <sub><b>ChoiSWgg</b></sub>
      </a><br />
      인증 · 구독 · 관리자
    </td>
    <td align="center" width="20%">
      <a href="https://github.com/kimgyuhyun0309">
        <img src="https://github.com/kimgyuhyun0309.png" width="90" height="90" style="border-radius:50%" /><br />
        <sub><b>kimgyuhyun0309</b></sub>
      </a><br />
      내 서재 · 독서 통계
    </td>
    <td align="center" width="20%">
      <a href="https://github.com/KJY0618">
        <img src="https://github.com/KJY0618.png" width="90" height="90" style="border-radius:50%" /><br />
        <sub><b>KJY0618</b></sub>
      </a><br />
      친구의 서재 · 작가 프로필 · 시 · 에세이 책 생성
    </td>
    <td align="center" width="20%">
      <a href="https://github.com/Kimsuperstar">
        <img src="https://github.com/Kimsuperstar.png" width="90" height="90" style="border-radius:50%" /><br />
        <sub><b>Kimsuperstar</b></sub>
      </a><br />
      동화 · 소설 생성
    </td>
    <td align="center" width="20%">
      <a href="https://github.com/NZ-e">
        <img src="https://github.com/NZ-e.png" width="90" height="90" style="border-radius:50%" /><br />
        <sub><b>NZ-e</b></sub>
      </a><br />
      시 · 에세이 생성
    </td>
  </tr>
</table>

## 핵심 기능

- **AI 도서 창작**: 동화/소설/시/에세이/논픽션 5개 장르별로 설정 → 생성 → 편집까지 이어지는 단계형 생성 흐름 (`src/features/bookCreation`)
- **작가 홈**: 장르별 바로 시작하기, 이어 읽던 작품, 이번 주 인기 랭킹, 팔로우한 작가의 신작
- **내 서재**: 읽는 중/완독/위시리스트/내가 쓴 책 관리, 독서 통계, 캘린더, AI 리뷰 챗
- **친구의 서재**: 전체 도서 열람(검색/정렬/필터), 좋아요·북마크·댓글·답글, 도서/댓글/작가 신고
- **작가 프로필**: 작가 검색, 팔로우, 작품 목록
- **구독/결제**: 요금제 비교, 구독 시작/변경(월간→연간)/해지, 실시간 AI 사용량 확인, 결제 영수 내역
- **회원**: 로그인/회원가입/비밀번호 재설정/회원탈퇴, 미성년자 보호자 동의(이메일 링크 승인/거절)
- **관리자 페이지**: 회원 상태 관리(서버 사이드 페이지네이션), 신고 심사, AI 사용량 통계
- **비로그인 둘러보기**: 작가 홈/친구의 서재/작가 프로필/구독 안내는 로그인 없이도 열람 가능하고, 좋아요·댓글·팔로우·구독 시작처럼 실제 로그인이 필요한 액션만 클릭 시점에 로그인 화면으로 유도

## 기술 스택

- **React 19 + Vite 6 + Tailwind CSS 4**
- **react-router-dom 7**
- **axios** — 요청에 JWT를 자동 첨부하고, 401 응답 시 refresh token으로 자동 재발급 후 원요청을 재시도하는 인터셉터
- **Tiptap** — 도서 본문 편집기
- **motion** — 화면 전환/인터랙션 애니메이션
- **recharts** — 독서/사용량 통계 차트
- **react-pageflip** — 완성된 책 넘겨보기 뷰어

## 실행 방법

**사전 준비**: Node.js, 그리고 `http://localhost:8080`에서 떠 있는 백엔드 서버(별도 저장소)

```bash
npm install
npm run dev       # 개발 서버
npm run build     # 프로덕션 빌드
npm run preview   # 빌드 결과 미리보기
npm run lint      # tsc --noEmit (타입 체크)
```

백엔드 API 베이스 URL은 `src/api/axios.js`에 하드코딩되어 있습니다. 다른 환경에 붙이려면 이 파일을 수정하세요.

## 프로젝트 구조

이 프로젝트는 **FSD(Feature-Sliced Design)를 팀 규모에 맞게 단순화한 구조**를 적용했습니다. FSD는 `app / pages / widgets / features / entities / shared` 6개 레이어를 두고, 레이어마다 다시 `ui / model / api / lib` 같은 세그먼트로 나누는데, 5인 팀·단일 서비스 규모에서는 레이어를 그만큼 세분화할수록 오히려 "이 화면이 features인지 widgets인지" 판단하는 데 드는 비용이 커진다고 판단해서 2단계로 줄였습니다.

```
src/
  features/          # FSD의 pages+widgets+features+entities를 하나로 합친 레이어
    admin/           # 관리자 페이지
    auth/            # 로그인·회원가입·보호자 동의
    authors/         # 작가 검색·프로필
    bookCreation/    # 장르별 AI 도서 생성 흐름
    dashboard/       # 작가 홈
    library/         # 내 서재·친구의 서재·리더
    profile/         # 내 정보 수정
    subscription/    # 구독·결제
  shared/            # FSD의 shared 레이어와 동일한 역할
    components/      # Header, AppShell, MyLibraryLayout 등 공통 레이아웃
    context/         # AuthContext (인증/구독/사용량 전역 상태)
    routes/          # ProtectedRoute / GuestOnlyRoute / AdminRoute 가드
    hooks/           # useRequireAuth 등 공용 훅
  api/               # axios 인스턴스 + 도메인별 API 함수 (FSD의 shared/api에 해당)
```

- **레이어를 2개로 축소**: "화면 하나 = `features/` 아래 폴더 하나"로 취급합니다. 원본 FSD라면 `MemberTab`처럼 화면을 이루는 조각은 widgets, `Book` 같은 도메인 모델은 entities로 쪼개야 하지만, 여기서는 그 구분 없이 같은 기능 폴더 안에 함께 둡니다.
- **세그먼트는 3개로 통일**: FSD의 `ui/model/api/lib/config`를 프로젝트 전반에서 `components`(화면) / `hooks`(상태·비즈니스 로직) / `services`(API 연동·데이터 매핑) 3개로 통일했습니다. 새 기능을 추가할 때 "이건 어디 세그먼트지?"를 고민할 필요 없이 항상 같은 3개 폴더만 채우면 되게 하기 위함입니다.
- **레이어 간 참조 규칙은 FSD와 동일하게 단방향 유지**: `shared`는 `features`를 import하지 않고, `features` 폴더끼리도 서로 직접 참조하지 않는 것을 원칙으로 합니다(교차 필요 시 `shared`로 끌어올림). 예를 들어 로그인 여부 판단은 여러 feature가 공통으로 필요해서 `shared/context/AuthContext`와 `shared/routes/guards.jsx`, `shared/hooks/useRequireAuth.js`로 올려뒀습니다.

## 인증 / 접근 정책

- JWT는 `localStorage`에 저장되고(`src/api/tokenStorage.js`), axios가 모든 요청에 자동으로 첨부합니다. 401 응답 시 refresh token으로 자동 재발급을 시도합니다.
- 화면 접근 정책은 3단계입니다:
  - **완전 공개**: 작가 홈(`/`), 친구의 서재(`/friends`), 작가 프로필(`/authors/*`), 구독 안내(`/subscription`)
  - **로그인 필수**: 내 서재(`/library/*`), 도서 생성(`/create/*`), 결제(`/subscription/payment`), 내 정보 수정(`/profile/edit`)
  - **로그인 + 관리자 권한 필수**: `/admin/*`
- 공개 화면에서도 좋아요·댓글·팔로우·구독 시작처럼 실제로 로그인이 필요한 액션은 클릭 시점에 로그인 화면으로 유도합니다(`useRequireAuth` 훅).
