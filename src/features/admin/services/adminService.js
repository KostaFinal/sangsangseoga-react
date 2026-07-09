/**
 * Admin Service Layer (어드민 API 연동 서비스)
 *
 * TODO: API 연동 필요 (실제 백엔드 API 엔드포인트가 연동되어야 하는 영역입니다.)
 * 현재는 협업 및 페이지 병합을 고려하여 Mock 데이터와 인터페이스가 먼저 설계되어 있으며,
 * 실 배포 시 axios 또는 fetch를 이용한 비동기 통신 코드로 간편하게 대체할 수 있도록 설계되었습니다.
 *
 * 신고 관리(getReports/resolveReport), 회원 관리(getUsers/updateUserStatus)는
 * 실제 백엔드 API로 연동됨. AI 사용량(토큰) 쪽만 아직 mock.
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

// 임시 로컬 메모리 저장소 (Mock Database) - AI 사용량(토큰) 쪽만 아직 여기 의존
const MOCK_STORAGE_KEYS = {
  TOKEN_USAGES: 'sangsang_admin_token_usages',
};

// 초기 더미/테스트 데이터 로드 헬퍼 (로컬스토리지에 저장하여 실감나는 모의 작업 가능)
const initializeMockData = () => {
  if (!localStorage.getItem(MOCK_STORAGE_KEYS.TOKEN_USAGES)) {
    localStorage.setItem(MOCK_STORAGE_KEYS.TOKEN_USAGES, JSON.stringify([
      { userId: 'user_001', nickname: '독서하는고양이', plan: 'PREMIUM', textUsage: 4850, imgUsage: 1248, totalCredits: 6098, status: 'NORMAL' },
      { userId: 'user_002', nickname: '별밤지기', plan: 'FREE', textUsage: 12100, imgUsage: 3100, totalCredits: 15200, status: 'ABNORMAL' }
    ]));
  }
};

initializeMockData();

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
   * 미처리 신고 목록 조회 (PENDING 상태, 도서/댓글/작가 통합)
   * 실 API: GET /api/admin/reports
   */
  getReports: async (page = 0, size = 100) => {
    const res = await api.get('/api/admin/reports', { params: { page, size } });
    return res.data?.data?.items || [];
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
   * AI 사용량 트렌드 및 통계 정보 조회
   * TODO: API 연동 필요 (GET /api/admin/token/trends?unit=daily|monthly)
   */
  getTokenTrends: async (unit) => {
    if (unit === 'daily') {
      return [
        { label: '06/13', premiumTxt: 2.1, freeTxt: 0.5, premiumImg: 420, freeImg: 110 },
        { label: '06/14', premiumTxt: 2.4, freeTxt: 0.6, premiumImg: 512, freeImg: 130 },
        { label: '06/15', premiumTxt: 3.1, freeTxt: 0.8, premiumImg: 680, freeImg: 154 },
        { label: '06/16', premiumTxt: 2.9, freeTxt: 0.7, premiumImg: 610, freeImg: 120 },
        { label: '06/17', premiumTxt: 3.5, freeTxt: 0.9, premiumImg: 720, freeImg: 180 },
        { label: '06/18', premiumTxt: 4.8, freeTxt: 1.1, premiumImg: 910, freeImg: 220 },
        { label: '06/19', premiumTxt: 5.2, freeTxt: 1.3, premiumImg: 1050, freeImg: 250 }
      ];
    }
    return [
      { label: '2월', premiumTxt: 35.2, freeTxt: 12.1, premiumImg: 5400, freeImg: 1800 },
      { label: '3월', premiumTxt: 42.8, freeTxt: 15.4, premiumImg: 6800, freeImg: 2100 },
      { label: '4월', premiumTxt: 51.5, freeTxt: 18.0, premiumImg: 8100, freeImg: 2400 },
      { label: '5월', premiumTxt: 68.2, freeTxt: 22.4, premiumImg: 11200, freeImg: 3100 },
      { label: '6월', premiumTxt: 92.5, freeTxt: 28.9, premiumImg: 15400, freeImg: 4200 }
    ];
  },

  /**
   * AI 토큰 및 크레딧 소모 상위 회원 랭킹 조회
   * TODO: API 연동 필요 (GET /api/admin/token/usages)
   */
  getTokenUsages: async () => {
    const data = localStorage.getItem(MOCK_STORAGE_KEYS.TOKEN_USAGES);
    return data ? JSON.parse(data) : [];
  },

  /**
   * 특정 회원의 상세 AI 작업 기록 타임라인 조회
   * TODO: API 연동 필요 (GET /api/admin/token/usages/:userId/timeline)
   */
  getMemberTokenTimeline: async (userId) => {
    const logs = {
      'user_001': [
        { date: '2026.06.19 10:14', action: '도서 에디터 챗봇 프롬프트 요청', usage: 'text', amount: '1,840 자', credits: 18 },
        { date: '2026.06.18 19:30', action: '표지 및 삽화 레이아웃 생성', usage: 'image', amount: '4 장', credits: 40 },
        { date: '2026.06.17 14:02', action: '도서 시놉시스 추천 기획', usage: 'text', amount: '920 자', credits: 9 }
      ],
      'user_002': [
        { date: '2026.06.18 17:40', action: '매크로성 이미지 연속 대량 요구', usage: 'image', amount: '240 장', credits: 2400 },
        { date: '2026.06.18 17:35', action: '소설 자동 생성 스크립트 실행', usage: 'text', amount: '48,000 자', credits: 480 },
        { date: '2026.06.18 17:01', action: '단시간 대폭 프롬프트 가중 요청', usage: 'text', amount: '36,500 자', credits: 365 }
      ]
    };
    return logs[userId] || [];
  }
};
