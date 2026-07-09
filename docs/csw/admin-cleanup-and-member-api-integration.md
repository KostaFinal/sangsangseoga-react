# 관리자 페이지 실 API 연동 + UI 정리 (커밋 `973eb8b`)

> 로컬에만 있고 아직 GitHub에는 push 안 된 커밋입니다. `git show 973eb8b`로 전체 diff를 볼 수 있습니다.

## 이 커밋에서 한 일 (요약)

1. axios 에러 인터셉터가 백엔드 에러 메시지를 그대로 노출하도록 수정
2. 회원 관리를 Mock 데이터에서 **실제 백엔드 API 연동 + 서버 사이드 페이지네이션**으로 전환
3. 신고 관리를 도서/댓글/작가로 나뉘어 있던 Mock 3개 목록에서 **통합 신고 API 1개**로 전환
4. 관리자 로그인 페이지 디자인을 일반 로그인 페이지와 같은 톤으로 통일
5. 403(권한 없음) 페이지를 무서운 "Spring Security 에러 로그" 톤에서 일반 에러 페이지와 같은 안내 톤으로 재설계
6. 회원/신고 관리 페이지의 필터·탭 UI를 하나의 디자인(둥근 pill 버튼)으로 통일
7. 구독/프로필 페이지 상단 헤더 영역 텍스트·레이아웃 정리 (텍스트/여백 위주라 별도 코드 스니펫은 생략)

---

## 1. axios 에러 메시지 노출 (`src/api/axios.js`)

**문제**: axios 기본 에러(`err.message`)는 `"Request failed with status code 400"` 같은 의미 없는 문자열이라, 백엔드가 내려준 실제 사유("이미 탈퇴한 계정입니다" 등)가 화면에 안 보이고 있었음.

**해결**: 응답 인터셉터에서 백엔드 응답 바디의 `message`가 있으면 `error.message`를 그걸로 덮어써서, 호출부는 항상 `err.message`만 보면 되게 통일.

```js
// src/api/axios.js
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

### 개념

기존엔 `adminService.getUsers()`가 로컬스토리지 Mock 배열을 통째로 반환해서, 필터링/검색/페이지네이션을 전부 프론트에서 처리했습니다. 이번에 백엔드 `GET/PATCH /api/admin/members`가 붙으면서:

- 상태 필터(`active`/`pending`/`suspended`/`deleted`)와 검색어(`keyword`)를 **쿼리 파라미터로 서버에 전달**
- 서버가 이미 필터링/페이지네이션된 결과(`items`, `totalCount`, `hasNext`, `page`)를 내려줌
- 백엔드 DTO(`AdminMemberListItemDto`, 대문자 enum, 필드명 다름)를 화면이 기대하는 형태로 바꾸는 **adapter 함수**(`mapMember`)를 서비스 레이어에 둬서, `MemberTab.jsx` 같은 UI 컴포넌트는 백엔드 스펙을 몰라도 되게 함

### 어댑터 (`src/features/admin/services/adminService.js`)

```js
const MEMBER_STATUS_TO_UI = { ACTIVE: 'active', PENDING: 'pending', SUSPENDED: 'suspended', DELETED: 'deleted' };
const SUBSCRIPTION_PLAN_LABEL = { FREE: '일반', PREMIUM_MONTHLY: '프리미엄(월간)', PREMIUM_YEARLY: '프리미엄(연간)' };

// 백엔드 AdminMemberListItemDto -> 화면(MemberTab)이 기대하는 필드 형태로 변환
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

### 서버 사이드 페이지네이션 훅 (`src/features/admin/hooks/useAdminState.js`)

```js
const MEMBER_PAGE_SIZE = 20;

// 회원 목록 조회 (상태 필터/검색어/페이지 지정 — 서버 사이드 페이지네이션)
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

// 상태별 전체 인원 수 (각 상태를 size=1로 조회해 totalCount만 가져옴 — 현재 페이지/필터와 무관)
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

`memberStatusCounts`(상태별 전체 인원 수)는 **현재 페이지/필터와 무관하게 항상 전체 기준**이어야 필터 버튼에 "정지 12명" 같은 뱃지를 정확히 보여줄 수 있어서, 메인 목록 조회와 별도로 상태마다 `size=1`짜리 조회를 병렬로 날려 `totalCount`만 뽑아옵니다.

상태 필터를 바꾸거나 검색어를 입력하면 1페이지부터 다시 조회하도록 `useEffect`로 연결되어 있고, 검색어 입력은 타이핑마다 요청을 보내지 않도록 debounce가 걸려 있습니다.

## 3. 신고 관리 통합 API 전환

기존엔 `getReports('books')`, `getReports('comments')`, `getReports('authors')`를 각각 호출해서 `reportedBooks`/`reportedComments`/`reportedAuthors` 세 개의 state로 관리했는데, 백엔드가 `targetType` 필드로 구분되는 **통합 신고 목록 API 1개**를 내려주는 구조로 바뀌면서 `reports` 배열 하나 + `targetType`으로 화면에서 필터링하는 방식으로 정리했습니다.

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

도서 신고는 `targetId`가 책 ID라서 제목/저자가 없는데, 화면엔 책 제목이 필요하므로 `bookTitleCache`(targetId → { title, author })를 따로 두고 `getBook(targetId)`로 필요할 때 채워 넣는 방식으로 처리했습니다.

## 4. 관리자 로그인 페이지 디자인 통일

이전엔 관리자 로그인 카드가 보라색 테마(`#6B54E7`)에 "⚠️ 관리자 계정 안내" 경고 박스가 있는 별도 스타일이었는데, 일반 로그인 페이지와 같은 뉴트럴(neutral) 톤 + `material-symbols-outlined` 아이콘 체계로 맞췄습니다. 기능은 그대로, 톤만 통일한 변경입니다.

## 5. 403 (관리자 권한 없음) 페이지 재설계

**이전**: `console.log`처럼 보이는 어두운 코드 블록에 "Spring Security 권한 부족 오류 (ACCESS_DENIED)", `ROLE_ADMIN` 같은 개발자용 문구를 그대로 사용자에게 노출.

**이후**: 일반 에러 페이지(404/500)와 같은 톤의 안내 화면으로 교체.

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

이 부분은 [[guest-browsing-and-auth-gate]] 작성 직전에 진행한 세션 내 작업으로, 자세한 내용은 이 폴더의 다른 파일이 아니라 아래 요약만 남깁니다.

- 회원 관리의 "상태별 한눈에 보기" 카드 5개(중복 정보)를 제거하고, 상태 필터 버튼 자체에 카운트를 통합
- 신고 관리의 서브탭(도서/댓글/작가 신고)을 밑줄 스타일에서 회원 관리와 같은 둥근 pill 버튼 스타일로 통일
- 회원 관리의 검색창/필터 버튼 좌우 위치 교환
- 회원 상세 모달의 "상태 변경 시 참고사항" 안내문을 한 줄로 축약

두 탭 모두 최종적으로 아래와 같은 공통 스타일 패턴을 씁니다:

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

- [[guest-browsing-and-auth-gate]] — 이 커밋 이후, 같은 세션에서 이어서 진행한 "비로그인 둘러보기 + 액션 시점 로그인 유도" 작업
