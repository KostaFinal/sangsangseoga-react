/**
 * Admin Service Layer (어드민 API 연동 서비스)
 *
 * TODO: API 연동 필요 (실제 백엔드 API 엔드포인트가 연동되어야 하는 영역입니다.)
 * 현재는 협업 및 페이지 병합을 고려하여 Mock 데이터와 인터페이스가 먼저 설계되어 있으며,
 * 실 배포 시 axios 또는 fetch를 이용한 비동기 통신 코드로 간편하게 대체할 수 있도록 설계되었습니다.
 *
 * 신고 관리(getReports/resolveReport), 회원 관리(getUsers/updateUserStatus),
 * AI 사용량(토큰) 관리(getTokenTrends/getTokenUsages/getMemberTokenTimeline) 모두
 * 실제 백엔드 API로 연동됨.
 */
import api from '../../../api/axios';

// 회원 상태값: 프론트(소문자, MemberTab 필터 기준) <-> 백엔드(대문자 enum) 변환
const MEMBER_STATUS_TO_UI = { ACTIVE: 'active', PENDING: 'pending', SUSPENDED: 'suspended', DELETED: 'deleted' };
const MEMBER_STATUS_TO_BACKEND = { active: 'ACTIVE', pending: 'PENDING', suspended: 'SUSPENDED', deleted: 'DELETED' };

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

export const adminService = {
  /**
   * 전체 작가 목록 조회 (상태 필터/검색어/페이지네이션)
   * 실 API: GET /api/admin/members
   */
  getUsers: async ({ status, keyword, page = 0, size = 20 } = {}) => {
    const res = await api.get('/api/admin/members', {
      params: {
        status: status ? (MEMBER_STATUS_TO_BACKEND[status] || status) : undefined,
        keyword: keyword || undefined,
        page,
        size,
      },
    });
    const data = res.data?.data || {};
    return {
      items: (data.items || []).map(mapMember),
      totalCount: data.totalCount || 0,
      page: data.page ?? page,
      hasNext: !!data.hasNext,
    };
  },

  /**
   * 작가 계정 상태 변경 (정상 복원, 정지 처리, 탈퇴 등)
   * 실 API: PATCH /api/admin/members/:memberId/status
   */
  updateUserStatus: async (userId, status, reason = '') => {
    const res = await api.patch(`/api/admin/members/${userId}/status`, {
      status: MEMBER_STATUS_TO_BACKEND[status] || status,
      reason,
    });
    return res.data?.data;
  },

  /**
   * 신고 목록 조회 (상태 필터: PENDING/RESOLVED/REJECTED, 도서/댓글/작가 통합)
   * 실 API: GET /api/admin/reports?status=&page=&size=
   */
  getReports: async ({ status, page = 0, size = 20 } = {}) => {
    const res = await api.get('/api/admin/reports', { params: { status: status || undefined, page, size } });
    const data = res.data?.data || {};
    return {
      items: data.items || [],
      totalCount: data.totalCount || 0,
      page: data.page ?? page,
      hasNext: !!data.hasNext,
    };
  },

  /**
   * 신고 처리 (actionType: BOOK_HIDE | COMMENT_DELETE | AUTHOR_SUSPEND | REPORT_REJECT)
   * 실 API: PATCH /api/admin/reports/:reportId
   */
  resolveReport: async (reportId, actionType, actionReason = '') => {
    const res = await api.patch(`/api/admin/reports/${reportId}`, { actionType, actionReason });
    return res.data?.data;
  },

  /**
   * 관리자 처리 이력 조회 (최신순, 조치 종류 필터 가능)
   * 실 API: GET /api/admin/action-logs?actionType=&page=&size=
   * (actionType이 targetType을 함축하므로 targetType은 별도 필터로 받지 않음)
   */
  getActionLogs: async ({ actionType, page = 0, size = 20 } = {}) => {
    const res = await api.get('/api/admin/action-logs', {
      params: { actionType: actionType || undefined, page, size },
    });
    const data = res.data?.data || {};
    return {
      items: data.items || [],
      totalCount: data.totalCount || 0,
      page: data.page ?? page,
      hasNext: !!data.hasNext,
    };
  },

  /**
   * AI 사용량 트렌드 및 통계 정보 조회
   * 실 API: GET /api/admin/token/trends?unit=daily|monthly&year=&month=
   * - unit=daily: year+month를 주면 그 달의 1일~말일. 생략하면 최근 7일.
   * - unit=monthly: year를 주면 그 해의 1월~12월. 생략하면 최근 5개월.
   */
  getTokenTrends: async (unit, { year, month } = {}) => {
    const res = await api.get('/api/admin/token/trends', { params: { unit, year, month } });
    return res.data?.data || [];
  },

  /**
   * 회원별 누적 AI 사용량(텍스트/이미지) 랭킹 조회 (많은 순)
   * 실 API: GET /api/admin/token/usages
   * startDate/endDate 생략 시 전체 누적 기간 조회. 하나만 주면 반대쪽은 서비스 시작 이전/오늘로 채워짐.
   */
  getTokenUsages: async ({ startDate, endDate } = {}) => {
    const res = await api.get('/api/admin/token/usages', { params: { startDate, endDate } });
    return res.data?.data || [];
  },

  /**
   * 특정 회원의 상세 AI 작업 기록 타임라인 조회 (최신순)
   * 실 API: GET /api/admin/token/usages/:userId/timeline
   */
  getMemberTokenTimeline: async (userId) => {
    const res = await api.get(`/api/admin/token/usages/${userId}/timeline`);
    return res.data?.data || [];
  }
};
