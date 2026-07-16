# 관리자 페이지 실 API 연동 + UI 정리 (커밋 `973eb8b`)

> `git show 973eb8b`로 전체 diff 확인 가능. 현재 origin/main에 반영됨.

## 요약

1. axios 에러 인터셉터가 백엔드 에러 메시지를 그대로 노출하도록 수정
2. 회원 관리: Mock → 실 API 연동 + 서버 사이드 페이지네이션
3. 신고 관리: 도서/댓글/작가 Mock 3개 목록 → 통합 신고 API 1개
4. 관리자 로그인 페이지를 일반 로그인과 같은 톤으로 통일
5. 403 페이지를 Spring Security 에러 로그 톤 → 일반 에러 페이지 톤으로 재설계
6. 회원/신고 관리 필터·탭 UI를 둥근 pill 버튼으로 통일
7. 구독/프로필 페이지 상단 헤더 텍스트·레이아웃 정리 (텍스트/여백 위주, 스니펫 생략)

---

## 1. axios 에러 메시지 노출 (`src/api/axios.js`)

axios 기본 에러(`err.message`)는 `"Request failed with status code 400"` 같은 무의미한 문자열이라 백엔드가 내려준 실제 사유가 화면에 안 보였다. 응답 인터셉터에서 백엔드 응답 바디의 `message`가 있으면 `error.message`를 그걸로 덮어써서, 호출부는 항상 `err.message`만 보면 되게 통일.

```js
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    if (response?.data?.message) {
      error.message = response.data.message;
    }
    // ... 401 재발급 로직은 그대로
  }
);
```

## 2. 회원 관리 실 API 연동 + 서버 사이드 페이지네이션

기존엔 `adminService.getUsers()`가 로컬스토리지 Mock 배열을 통째로 반환해서 필터링/검색/페이지네이션을 프론트에서 처리했다. `GET/PATCH /api/admin/members` 연동 후:

- 상태 필터(`active`/`pending`/`suspended`/`deleted`)와 검색어(`keyword`)를 쿼리 파라미터로 서버에 전달
- 서버가 필터링/페이지네이션된 결과(`items`, `totalCount`, `hasNext`, `page`)를 반환
- 백엔드 DTO(`AdminMemberListItemDto`, 대문자 enum)를 화면 형태로 바꾸는 adapter(`mapMember`)를 서비스 레이어에 둬서 UI 컴포넌트는 백엔드 스펙을 몰라도 되게 함

```js
// src/features/admin/services/adminService.js
const MEMBER_STATUS_TO_UI = { ACTIVE: 'active', PENDING: 'pending', SUSPENDED: 'suspended', DELETED: 'deleted' };
const SUBSCRIPTION_PLAN_LABEL = { FREE: '일반', PREMIUM_MONTHLY: '프리미엄(월간)', PREMIUM_YEARLY: '프리미엄(연간)' };

const mapMember = (m) => ({
  id: m.memberId,
  nickname: m.nickname,
  email: m.email,
  joinDate: m.createdAt ? new Date(m.createdAt).toLocaleDateString('ko-KR') : '-',
  status: MEMBER_STATUS_TO_UI[m.status] || 'active',
  role: m.role,
  plan: m.subscriptionPlan && m.subscriptionPlan !== 'FREE' ? 'PREMIUM' : 'FREE',
  planLabel: SUBSCRIPTION_PLAN_LABEL[m.subscriptionPlan] || '일반',
  withdrawnAt: m.withdrawnAt ? new Date(m.withdrawnAt).toLocaleDateString('ko-KR') : null,
});
```

```js
// src/features/admin/hooks/useAdminState.js
const MEMBER_PAGE_SIZE = 20;

const loadMembers = async (page = 0, statusFilter = memberStatusFilter, keyword = memberSearchQuery) => {
  try {
    const res = await adminService.getUsers({
      status: statusFilter === 'all' ? undefined : statusFilter,
      keyword: keyword || undefined,
      page,
      size: MEMBER_PAGE_SIZE,
    });
    setUsers(res.items);
    setMemberTotalCount(res.totalCount);
    setMemberHasNext(res.hasNext);
    setMemberPage(res.page);
  } catch (err) {
    setUsers([]);
  }
};

// 상태별 전체 인원 수 — 현재 페이지/필터와 무관하게 각 상태를 size=1로 조회해 totalCount만 가져옴
const loadMemberStatusCounts = async () => {
  const [all, active, pending, suspended, deleted] = await Promise.all([
    adminService.getUsers({ page: 0, size: 1 }),
    adminService.getUsers({ status: 'active', page: 0, size: 1 }),
    adminService.getUsers({ status: 'pending', page: 0, size: 1 }),
    adminService.getUsers({ status: 'suspended', page: 0, size: 1 }),
    adminService.getUsers({ status: 'deleted', page: 0, size: 1 }),
  ]);
  setMemberStatusCounts({
    all: all.totalCount, active: active.totalCount, pending: pending.totalCount,
    suspended: suspended.totalCount, deleted: deleted.totalCount,
  });
};
```

`memberStatusCounts`는 필터 버튼에 "정지 12명" 같은 뱃지를 정확히 보여주기 위해 항상 전체 기준으로 별도 조회. 상태 필터 변경/검색어 입력 시 1페이지부터 재조회하도록 `useEffect`로 연결, 검색어는 debounce 적용.

## 3. 신고 관리 통합 API 전환

기존엔 `getReports('books')`/`getReports('comments')`/`getReports('authors')`를 각각 호출해 세 개의 state로 관리했는데, 백엔드가 `targetType`으로 구분되는 통합 신고 목록 API 1개를 제공하면서 `reports` 배열 하나 + `targetType` 필터링 방식으로 정리.

```js
const REASON_LABEL = { SPAM: '스팸', ABUSE: '욕설', SEXUAL: '음란', OTHER: '기타' };
const STATUS_LABEL_MAP = { PENDING: 'pending', RESOLVED: 'hidden', REJECTED: 'rejected' };

const mapReport = (r) => ({
  id: r.reportId,
  targetId: r.targetId,
  category: REASON_LABEL[r.reason] || '기타',
  reason: r.reasonDetail || '-',
  date: r.createdAt ? new Date(r.createdAt).toLocaleString('ko-KR') : '-',
  createdAt: r.createdAt,
  reporterNickname: r.reporterNickname,
  status: STATUS_LABEL_MAP[r.status] || 'pending',
});
```

도서 신고는 `targetId`가 책 ID라 제목/저자가 없어서, `bookTitleCache`(targetId → { title, author })를 두고 `getBook(targetId)`로 채워 넣는다.

> 위 `mapReport`는 이 커밋 시점 스냅샷. 이후 `targetNickname`/`targetParentBookId`/`resolvedReason`/`resolvedByNickname` 필드 추가됨 — 최신 형태는 [[domain-admin-ai-usage-and-reports]] 참고.

## 4. 관리자 로그인 페이지 디자인 통일

보라색 테마(`#6B54E7`) + "⚠️ 관리자 계정 안내" 경고 박스였던 것을 일반 로그인 페이지와 같은 뉴트럴 톤 + `material-symbols-outlined` 아이콘으로 통일. 기능 변경 없음.

## 5. 403 (관리자 권한 없음) 페이지 재설계

**이전**: 어두운 코드 블록에 "Spring Security 권한 부족 오류 (ACCESS_DENIED)", `ROLE_ADMIN` 같은 개발자용 문구 그대로 노출.

**이후**: 404/500과 같은 톤의 안내 화면.

```jsx
// src/App.jsx — ForbiddenPanel()
function ForbiddenPanel() {
  const { handleLogout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
      <div className="w-16 h-16 rounded-2xl bg-[#F3F0FF] border border-[#E6E2FC] flex items-center justify-center mb-6">
        <ShieldAlert className="w-7 h-7 text-[#6B54E7]" />
      </div>
      <div className="space-y-3 max-w-md mx-auto mb-8">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#2F2D59]">관리자 권한이 필요합니다</h2>
        <p className="text-xs sm:text-sm text-[#7C769D] leading-relaxed">
          이 페이지는 관리자 계정으로 로그인해야 접근할 수 있습니다.
        </p>
      </div>
      <div className="flex gap-3">
        <button onClick={() => navigate('/')}>홈으로</button>
        <button onClick={async () => { await handleLogout(); navigate('/login'); }}>관리자로 로그인</button>
      </div>
    </div>
  );
}
```

## 6. 회원/신고 관리 필터·탭 UI 통일

[[guest-browsing-and-auth-gate]] 작업 직전 세션 내 작업. 요약만:

- 회원 관리 "상태별 한눈에 보기" 카드 5개(중복 정보) 제거, 상태 필터 버튼에 카운트 통합
- 신고 관리 서브탭(도서/댓글/작가)을 밑줄 스타일 → 회원 관리와 같은 pill 버튼으로 통일
- 회원 관리 검색창/필터 버튼 좌우 위치 교환
- 회원 상세 모달 "상태 변경 시 참고사항" 안내문 한 줄로 축약

공통 스타일 패턴:

```jsx
<button
  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-bold shrink-0 transition-all cursor-pointer ${
    isSelected
      ? 'bg-[#6B54E7] text-white shadow-sm'
      : 'bg-[#FAF9FF] text-[#7C769D] hover:bg-[#E6E2FC]/40 hover:text-[#2F2D59]'
  }`}
>
  <span>{label}</span>
  <span className={`font-mono font-black ${isSelected ? 'text-white/90' : 'text-[#6B54E7]'}`}>{count}</span>
</button>
```

## 관련 문서

- [[guest-browsing-and-auth-gate]] — 이 커밋 이후 같은 세션에서 이어서 진행한 후속 작업
- [[domain-admin-ai-usage-and-reports]] — 이 도메인의 후속작업(신고 상태 필터, 처리이력 탭, AI 사용량 관리 실 연동)
