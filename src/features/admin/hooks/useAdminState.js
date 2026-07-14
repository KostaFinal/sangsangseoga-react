import { useState, useEffect, useMemo, useRef } from 'react';
import { adminService } from '../services/adminService';
import { getBook } from '../../../api/bookApi';

const REASON_LABEL = { SPAM: '스팸', ABUSE: '욕설', SEXUAL: '음란', OTHER: '기타' };
const STATUS_LABEL_MAP = { PENDING: 'pending', RESOLVED: 'hidden', REJECTED: 'rejected' };
const ACTION_TYPE_BY_SUBTAB = { books: 'BOOK_HIDE', comments: 'COMMENT_DELETE', authors: 'AUTHOR_SUSPEND' };

const mapReport = (r) => ({
  id: r.reportId,
  targetId: r.targetId,
  targetNickname: r.targetNickname,
  targetParentBookId: r.targetParentBookId,
  category: REASON_LABEL[r.reason] || '기타',
  reason: r.reasonDetail || '-',
  date: r.createdAt ? new Date(r.createdAt).toLocaleString('ko-KR') : '-',
  createdAt: r.createdAt,
  reporterNickname: r.reporterNickname,
  status: STATUS_LABEL_MAP[r.status] || 'pending',
});

const TARGET_TYPE_LABEL = { BOOK: '도서', COMMENT: '댓글', AUTHOR: '작가' };
const ACTION_TYPE_LABEL = {
  BOOK_HIDE: '책 숨김',
  COMMENT_DELETE: '댓글 삭제',
  AUTHOR_SUSPEND: '작가 정지',
  REPORT_REJECT: '신고 반려',
};

const mapActionLog = (log) => ({
  id: log.actionLogId,
  reportId: log.reportId,
  targetType: log.targetType,
  targetTypeLabel: TARGET_TYPE_LABEL[log.targetType] || log.targetType,
  targetId: log.targetId,
  targetNickname: log.targetNickname,
  targetParentBookId: log.targetParentBookId,
  adminNickname: log.adminNickname,
  actionType: log.actionType,
  actionTypeLabel: ACTION_TYPE_LABEL[log.actionType] || log.actionType,
  actionReason: log.actionReason || '-',
  date: log.createdAt ? new Date(log.createdAt).toLocaleString('ko-KR') : '-',
  createdAt: log.createdAt,
});

/**
 * Custom Hook: useAdminState
 * 
 * 어드민 전용 종합 상태 관리 커스텀 훅입니다.
 * UI 관심사와 비즈니스 로직(데이터 패칭, 필터링, 상태 업데이트 등)을 완전히 분리하여 설계하였습니다.
 * 타 부서 및 팀원이 쉽게 페이지를 연동하고 상태를 주입할 수 있도록 인터페이스가 추상화되어 있습니다.
 */
export const useAdminState = (initialTab = 'member') => {
  // 메인 탭 전환 상태: 'member' | 'reports' | 'tokens' | 'actionLogs'
  const [activeTab, setActiveTab] = useState(initialTab);

  // ==========================================
  // [1] 작가 계정 관리 (Member Tab State)
  // ==========================================
  const [users, setUsers] = useState([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState('all');
  const [memberPage, setMemberPage] = useState(0);
  const [memberTotalCount, setMemberTotalCount] = useState(0);
  const [memberHasNext, setMemberHasNext] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [suspensionReasonText, setSuspensionReasonText] = useState('운영 정책 위반 의심 (저작권 침해 또는 욕설 도배)');
  // 상태별 전체 인원 수 (현재 페이지/필터와 무관하게 항상 전체 기준) — 한눈에 보기 카드 + 사이드바 뱃지용
  const [memberStatusCounts, setMemberStatusCounts] = useState({ all: 0, active: 0, pending: 0, suspended: 0, deleted: 0 });
  const MEMBER_PAGE_SIZE = 20;

  // ==========================================
  // [2] 통합 신고 심의 (Reports Tab State)
  // ==========================================
  const [reportSubTab, setReportSubTab] = useState('books'); // 'books' | 'comments' | 'authors'
  const [reportStatusFilter, setReportStatusFilter] = useState('PENDING'); // 'PENDING' | 'RESOLVED' | 'REJECTED'
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportRejectReason, setReportRejectReason] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState([]); // 실 API 원본 목록 (targetType으로 도서/댓글/작가 구분)
  const [reportPage, setReportPage] = useState(0);
  const [reportTotalCount, setReportTotalCount] = useState(0);
  const [reportHasNext, setReportHasNext] = useState(false);
  const [bookTitleCache, setBookTitleCache] = useState({}); // targetId -> { title, author }
  const REPORT_PAGE_SIZE = 20;

  // ==========================================
  // [2-1] 관리자 처리 이력 (Action Logs Tab State)
  // ==========================================
  const [actionLogs, setActionLogs] = useState([]);
  const [actionLogPage, setActionLogPage] = useState(0);
  const [actionLogTotalCount, setActionLogTotalCount] = useState(0);
  const [actionLogHasNext, setActionLogHasNext] = useState(false);
  // actionType이 targetType을 함축하므로(REPORT_REJECT 제외) 필터는 actionType 단일 축만 둔다
  const [actionLogActionTypeFilter, setActionLogActionTypeFilter] = useState('all'); // 'all' | BOOK_HIDE | COMMENT_DELETE | AUTHOR_SUSPEND | REPORT_REJECT
  const ACTION_LOG_PAGE_SIZE = 20;

  // ==========================================
  // [3] AI 리소스 관리 (Tokens Tab State)
  // ==========================================
  const [tokenTrendUnit, setTokenTrendUnit] = useState('daily'); // 'daily' | 'monthly'
  const [tokenSortPeriod, setTokenSortPeriod] = useState('7d');
  const [tokenSearchQuery, setTokenSearchQuery] = useState('');
  const [selectedTokenUser, setSelectedTokenUser] = useState(null);
  const [currentTrends, setCurrentTrends] = useState([]);
  const [tokenUsages, setTokenUsages] = useState([]);
  const [activeTimeline, setActiveTimeline] = useState([]);

  // ==========================================
  // 공용 에러 피드백 (Toast)
  // ==========================================
  const [toast, setToast] = useState(null); // { message, type: 'error' | 'success' }
  const triggerToast = (message, type = 'error') => setToast({ message, type });
  const clearToast = () => setToast(null);

  // ------------------------------------------
  // API 데이터 로드 (Data Fetching Life Cycle)
  // ------------------------------------------
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
    try {
      const [all, active, pending, suspended, deleted] = await Promise.all([
        adminService.getUsers({ page: 0, size: 1 }),
        adminService.getUsers({ status: 'active', page: 0, size: 1 }),
        adminService.getUsers({ status: 'pending', page: 0, size: 1 }),
        adminService.getUsers({ status: 'suspended', page: 0, size: 1 }),
        adminService.getUsers({ status: 'deleted', page: 0, size: 1 }),
      ]);
      setMemberStatusCounts({
        all: all.totalCount,
        active: active.totalCount,
        pending: pending.totalCount,
        suspended: suspended.totalCount,
        deleted: deleted.totalCount,
      });
    } catch (err) {
      // ignore
    }
  };

  // 신고 목록 조회 (상태 필터/페이지 지정 — 서버 사이드 페이지네이션)
  const loadReports = async (page = 0, status = reportStatusFilter) => {
    try {
      const res = await adminService.getReports({ status, page, size: REPORT_PAGE_SIZE });
      setReports(res.items);
      setReportTotalCount(res.totalCount);
      setReportHasNext(res.hasNext);
      setReportPage(res.page);
    } catch (err) {
      setReports([]);
    }
  };

  // 관리자 처리 이력 조회 (페이지/필터 지정 — 서버 사이드 페이지네이션)
  const loadActionLogs = async (page = 0, actionType = actionLogActionTypeFilter) => {
    try {
      const res = await adminService.getActionLogs({
        actionType: actionType === 'all' ? undefined : actionType,
        page,
        size: ACTION_LOG_PAGE_SIZE,
      });
      setActionLogs(res.items.map(mapActionLog));
      setActionLogTotalCount(res.totalCount);
      setActionLogHasNext(res.hasNext);
      setActionLogPage(res.page);
    } catch (err) {
      setActionLogs([]);
    }
  };

  const loadInitialData = async () => {
    try {
      // 1. 회원 목록 조회 (첫 페이지)
      await loadMembers(0, memberStatusFilter, memberSearchQuery);
      await loadMemberStatusCounts();

      // 2. 신고 목록 조회 (기본: 미처리, 도서/댓글/작가 통합)
      await loadReports(0, reportStatusFilter);

      // 3. AI 사용량 회원별 통계 조회
      const fetchedTokenUsages = await adminService.getTokenUsages();
      setTokenUsages(fetchedTokenUsages);
    } catch (err) {
      triggerToast(err.message || '관리자 데이터를 불러오지 못했습니다.');
    }
  };

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 상태 필터/검색어 변경 시 1페이지부터 재조회 (검색어는 타이핑 debounce)
  const isFirstMemberFilterRun = useRef(true);
  useEffect(() => {
    if (isFirstMemberFilterRun.current) {
      isFirstMemberFilterRun.current = false;
      return;
    }
    const timer = setTimeout(() => {
      loadMembers(0, memberStatusFilter, memberSearchQuery);
    }, memberSearchQuery ? 400 : 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberStatusFilter, memberSearchQuery]);

  // 신고 상태 필터 변경 시 1페이지부터 재조회
  const isFirstReportFilterRun = useRef(true);
  useEffect(() => {
    if (isFirstReportFilterRun.current) {
      isFirstReportFilterRun.current = false;
      return;
    }
    setSelectedReport(null);
    loadReports(0, reportStatusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportStatusFilter]);

  // 처리 이력 탭 최초 진입 시 로드
  const hasLoadedActionLogs = useRef(false);
  useEffect(() => {
    if (activeTab === 'actionLogs' && !hasLoadedActionLogs.current) {
      hasLoadedActionLogs.current = true;
      loadActionLogs(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // 처리 이력 필터(조치 종류) 변경 시 1페이지부터 재조회
  const isFirstActionLogFilterRun = useRef(true);
  useEffect(() => {
    if (isFirstActionLogFilterRun.current) {
      isFirstActionLogFilterRun.current = false;
      return;
    }
    loadActionLogs(0, actionLogActionTypeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionLogActionTypeFilter]);

  // 도서 신고 항목의 제목/작가 보강 (신고 API는 targetId만 제공하므로 도서 상세 API로 보강 조회)
  useEffect(() => {
    const bookIds = [...new Set(reports.filter(r => r.targetType === 'BOOK').map(r => r.targetId))];
    const missingIds = bookIds.filter(id => !(id in bookTitleCache));
    if (missingIds.length === 0) return;

    let cancelled = false;
    (async () => {
      const entries = await Promise.all(missingIds.map(async (id) => {
        try {
          const res = await getBook(id);
          const data = res.data?.data;
          return [id, { title: data?.title, author: data?.author }];
        } catch (err) {
          return [id, null];
        }
      }));
      if (cancelled) return;
      setBookTitleCache(prev => {
        const next = { ...prev };
        entries.forEach(([id, val]) => { next[id] = val; });
        return next;
      });
    })();
    return () => { cancelled = true; };
  }, [reports, bookTitleCache]);

  // 신고 대상(도서/작가/댓글)으로 바로 이동하기 위한 경로 계산
  // - 도서: targetId가 곧 bookId
  // - 작가: 프로필 경로가 닉네임 기반이라 목록 응답의 targetNickname 사용
  // - 댓글: 댓글은 도서 상세 화면 내부에서만 보이므로 목록 응답의 targetParentBookId로 원본 도서 이동
  const resolveTargetPath = (targetType, targetId, targetNickname, targetParentBookId) => {
    if (targetType === 'BOOK') return `/friends/${targetId}`;
    if (targetType === 'AUTHOR') {
      return targetNickname ? `/authors/${encodeURIComponent(targetNickname)}` : null;
    }
    if (targetType === 'COMMENT') {
      return targetParentBookId ? `/friends/${targetParentBookId}?commentId=${targetId}` : null;
    }
    return null;
  };

  // 토큰 트렌드 그래프 정보 로드 (일간/월간 변경 감지 시 재호출)
  useEffect(() => {
    const fetchTrends = async () => {
      const data = await adminService.getTokenTrends(tokenTrendUnit);
      setCurrentTrends(data);
    };
    fetchTrends();
  }, [tokenTrendUnit]);

  // 특정 회원의 상세 AI 타임라인 정보 로드 (조사 대상 사용자 클릭 시 감지)
  useEffect(() => {
    const fetchTimeline = async () => {
      if (!selectedTokenUser) {
        setActiveTimeline([]);
        return;
      }
      const data = await adminService.getMemberTokenTimeline(selectedTokenUser);
      setActiveTimeline(data);
    };
    fetchTimeline();
  }, [selectedTokenUser]);

  // ------------------------------------------
  // 비즈니스 액션 처리 (Business Action Handlers)
  // ------------------------------------------

  /**
   * 작가 계정 자격 조정 (정상 복구, 정지, 탈퇴 상태 전이)
   */
  const handleUpdateUserStatus = async (userId, targetStatus) => {
    try {
      await adminService.updateUserStatus(userId, targetStatus, suspensionReasonText);

      // 상태 반영을 위해 현재 보고 있던 페이지/필터 기준으로 재조회
      await loadMembers(memberPage, memberStatusFilter, memberSearchQuery);
      await loadMemberStatusCounts();

      if (selectedUser?.id === userId) {
        setSelectedUser(prev => prev ? { ...prev, status: targetStatus } : null);
      }

      setSuspensionReasonText('운영 정책 위반 의심 (저작권 침해 또는 욕설 도배)');
      triggerToast('회원 상태가 변경되었습니다.', 'success');
    } catch (err) {
      triggerToast(err.message || '회원 상태 변경에 실패했습니다.');
    }
  };

  /**
   * 회원 목록 페이지 이동
   */
  const goToMemberPage = (page) => {
    loadMembers(page, memberStatusFilter, memberSearchQuery);
  };

  /**
   * 신고 목록 페이지 이동
   */
  const goToReportPage = (page) => {
    loadReports(page, reportStatusFilter);
  };

  /**
   * 처리 이력 페이지 이동
   */
  const goToActionLogPage = (page) => {
    loadActionLogs(page, actionLogActionTypeFilter);
  };

  /**
   * 신고 사안 이행 및 종결 심사
   * (작가 정지 등 회원 자격 전이는 백엔드가 AUTHOR_SUSPEND 처리 시 함께 수행함)
   */
  const handleResolveReport = async (reportId, actionType) => {
    try {
      const finalReason = reportRejectReason.trim() || '관리자 권한 직접 검토 통과';
      const realActionType = actionType === 'execute' ? ACTION_TYPE_BY_SUBTAB[reportSubTab] : 'REPORT_REJECT';
      await adminService.resolveReport(reportId, realActionType, finalReason);

      await loadReports(reportPage, reportStatusFilter);

      setReportRejectReason('');
      setReportModalOpen(false);
      setSelectedReport(null);
      triggerToast('신고가 처리되었습니다.', 'success');
    } catch (err) {
      triggerToast(err.message || '신고 처리에 실패했습니다.');
    }
  };

  // ------------------------------------------
  // 데이터 가공 및 필터링 (Memoized Filter Logics)
  // ------------------------------------------

  // targetType별 신고 목록 (도서는 도서 상세 API로 보강한 제목/작가 포함)
  const reportedBooks = useMemo(() => reports
    .filter(r => r.targetType === 'BOOK')
    .map(r => ({
      ...mapReport(r),
      title: bookTitleCache[r.targetId]?.title || `도서 #${r.targetId}`,
      targetPath: resolveTargetPath('BOOK', r.targetId),
    })), [reports, bookTitleCache]);

  const reportedComments = useMemo(() => reports
    .filter(r => r.targetType === 'COMMENT')
    .map(r => ({ ...mapReport(r), title: `댓글 #${r.targetId}`, targetPath: resolveTargetPath('COMMENT', r.targetId, null, r.targetParentBookId) })), [reports]);

  const reportedAuthors = useMemo(() => reports
    .filter(r => r.targetType === 'AUTHOR')
    .map(r => ({ ...mapReport(r), title: r.targetNickname || `작가 회원 #${r.targetId}`, targetPath: resolveTargetPath('AUTHOR', r.targetId, r.targetNickname) })), [reports]);

  // 처리 이력 목록에 신고 대상 이동 경로 부여
  const actionLogsWithPath = useMemo(() => actionLogs.map(log => ({
    ...log,
    targetPath: resolveTargetPath(log.targetType, log.targetId, log.targetNickname, log.targetParentBookId),
  })), [actionLogs]);

  // 검색어 필터링이 적용된 AI 토큰 사용량 목록
  const searchedTokenUsages = useMemo(() => {
    return tokenUsages.filter(usage =>
      usage.nickname.toLowerCase().includes(tokenSearchQuery.toLowerCase())
    );
  }, [tokenUsages, tokenSearchQuery]);

  // 가상 타임라인 로그 매핑 (통합 컴포넌트 바인딩용 헬퍼 객체)
  const memberTokenTimelineLogs = useMemo(() => {
    if (!selectedTokenUser) return {};
    return {
      [selectedTokenUser]: activeTimeline
    };
  }, [selectedTokenUser, activeTimeline]);

  // AI 리소스 요약 카드용 집계치 (전체 회원 기준 실데이터)
  const tokenSummary = useMemo(() => {
    const totalTextUsage = tokenUsages.reduce((sum, u) => sum + (u.textUsage || 0), 0);
    const totalImageUsage = tokenUsages.reduce((sum, u) => sum + (u.imgUsage || 0), 0);
    const premiumUserCount = users.filter(u => u.plan === 'PREMIUM').length;
    const premiumRatio = users.length ? Math.round((premiumUserCount / users.length) * 1000) / 10 : 0;
    return {
      totalTextUsage,
      totalImageUsage,
      premiumRatio,
      freeRatio: Math.round((100 - premiumRatio) * 10) / 10,
    };
  }, [tokenUsages, users]);

  return {
    activeTab,
    setActiveTab,

    // 공용 에러/성공 피드백
    toast,
    clearToast,

    // 회원 관리 인터페이스
    users,
    memberSearchQuery,
    setMemberSearchQuery,
    memberStatusFilter,
    setMemberStatusFilter,
    memberPage,
    memberTotalCount,
    memberHasNext,
    memberPageSize: MEMBER_PAGE_SIZE,
    memberStatusCounts,
    goToMemberPage,
    selectedUser,
    setSelectedUser,
    userModalOpen,
    setUserModalOpen,
    suspensionReasonText,
    setSuspensionReasonText,
    handleUpdateUserStatus,

    // 신고 관리 인터페이스
    reportSubTab,
    setReportSubTab,
    reportStatusFilter,
    setReportStatusFilter,
    reportModalOpen,
    setReportModalOpen,
    reportRejectReason,
    setReportRejectReason,
    selectedReport,
    setSelectedReport,
    reportedBooks,
    reportedComments,
    reportedAuthors,
    reportPage,
    reportTotalCount,
    reportHasNext,
    reportPageSize: REPORT_PAGE_SIZE,
    goToReportPage,
    handleResolveReport,

    // 처리 이력 인터페이스
    actionLogs: actionLogsWithPath,
    actionLogPage,
    actionLogTotalCount,
    actionLogHasNext,
    actionLogPageSize: ACTION_LOG_PAGE_SIZE,
    actionLogActionTypeFilter,
    setActionLogActionTypeFilter,
    goToActionLogPage,

    // AI 리소스 토큰 인터페이스
    tokenTrendUnit,
    setTokenTrendUnit,
    tokenSortPeriod,
    setTokenSortPeriod,
    tokenSearchQuery,
    setTokenSearchQuery,
    selectedTokenUser,
    setSelectedTokenUser,
    currentTrends,
    searchedTokenUsages,
    memberTokenTimelineLogs,
    tokenSummary,
  };
};
