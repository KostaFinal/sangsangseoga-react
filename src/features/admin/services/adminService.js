/**
 * Admin Service Layer (어드민 API 연동 서비스)
 * 
 * TODO: API 연동 필요 (실제 백엔드 API 엔드포인트가 연동되어야 하는 영역입니다.)
 * 현재는 협업 및 페이지 병합을 고려하여 Mock 데이터와 인터페이스가 먼저 설계되어 있으며,
 * 실 배포 시 axios 또는 fetch를 이용한 비동기 통신 코드로 간편하게 대체할 수 있도록 설계되었습니다.
 */

// 임시 로컬 메모리 저장소 (Mock Database) - 프로덕션 연동 전까지 데이터 영속성 모방
const MOCK_STORAGE_KEYS = {
  USERS: 'sangsang_admin_users',
  BOOKS: 'sangsang_admin_reported_books',
  COMMENTS: 'sangsang_admin_reported_comments',
  AUTHORS: 'sangsang_admin_reported_authors',
  TOKEN_USAGES: 'sangsang_admin_token_usages',
};

// 초기 더미/테스트 데이터 로드 헬퍼 (로컬스토리지에 저장하여 실감나는 모의 작업 가능)
const initializeMockData = () => {
  if (!localStorage.getItem(MOCK_STORAGE_KEYS.USERS)) {
    localStorage.setItem(MOCK_STORAGE_KEYS.USERS, JSON.stringify([
      {
        id: 'user_001',
        nickname: '독서하는고양이',
        email: 'reading_cat@gmail.com',
        joinDate: '2024.01.12',
        status: 'active',
        bookCount: 12,
        lastLogin: '2026.06.19 10:20',
        avatarUrl: null,
        plan: 'PREMIUM',
        subscriptionStarted: '2026-02-15',
        subscriptionEnds: '2026-07-15',
        ageGroup: 'ADULT'
      },
      {
        id: 'user_002',
        nickname: '별밤지기',
        email: 'starry_night@naver.com',
        joinDate: '2023.11.28',
        status: 'suspended',
        bookCount: 8,
        lastLogin: '2026-06-18 17:42',
        avatarUrl: null,
        plan: 'FREE',
        subscriptionStarted: '-',
        subscriptionEnds: '-',
        ageGroup: 'MINOR'
      },
      {
        id: 'user_003',
        nickname: '어그로마스터',
        email: 'aggro_master@sangsang.com',
        joinDate: '2024-05-04',
        status: 'pending',
        bookCount: 2,
        lastLogin: '2026-06-11 09:12',
        avatarUrl: null,
        plan: 'FREE',
        subscriptionStarted: '-',
        subscriptionEnds: '-',
        ageGroup: 'MINOR_U14'
      }
    ]));
  }

  if (!localStorage.getItem(MOCK_STORAGE_KEYS.BOOKS)) {
    localStorage.setItem(MOCK_STORAGE_KEYS.BOOKS, JSON.stringify([
      { id: 'b_rep_01', itemType: 'book', targetId: 'book_101', title: '잔혹한 악당의 대모험', author: '별밤지기', authorEmail: 'starry_night@naver.com', reportCount: 15, reporter: 'infant_guard@naver.com', category: '음란', reason: '어린이 추천 동화 카테고리에 성인 폭력물하고 유혈 묘사가 노출되었습니다.', date: '2026.06.18 14:20', status: 'pending' },
      { id: 'b_rep_02', itemType: 'book', targetId: 'book_102', title: '비밀번호 해킹 완벽 가이드', author: '모조아티스트', authorEmail: 'mimic@art.com', reportCount: 8, reporter: 'security_audit@korea.com', category: '기타', reason: '해킹 방법 등 유해하고 부적절한 내용을 서술하고 있습니다.', date: '2026.06.17 09:30', status: 'pending' }
    ]));
  }

  if (!localStorage.getItem(MOCK_STORAGE_KEYS.COMMENTS)) {
    localStorage.setItem(MOCK_STORAGE_KEYS.COMMENTS, JSON.stringify([
      { id: 'c_rep_01', itemType: 'comment', targetId: 'comment_201', title: '“야 이 쓰레기 소설 치워라 광고 보기도 아깝다”', author: '악플마스터', authorEmail: 'aggro_master@sangsang.com', sourceBook: '푸른 달의 소나타', reportCount: 19, reporter: 'kind_reader@gmail.com', category: '욕설', reason: '성희롱 및 무차별 욕설 등 원색적인 모욕성 발언을 수회 기재하여 신고되었습니다.', date: '2026.06.18 20:11', status: 'pending' }
    ]));
  }

  if (!localStorage.getItem(MOCK_STORAGE_KEYS.AUTHORS)) {
    localStorage.setItem(MOCK_STORAGE_KEYS.AUTHORS, JSON.stringify([
      { id: 'a_rep_01', itemType: 'author', targetId: 'user_002', title: '별밤지기 (계정 위배)', author: '별밤지기', authorEmail: 'starry_night@naver.com', reportCount: 24, reporter: 'original_writer@naver.com', category: '기타', reason: '타인의 동의 없는 이미지를 작가 메인 프로필 및 소설 삽화로 무단 도용하였습니다.', date: '2026.06.19 01:45', status: 'pending' }
    ]));
  }

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
   * 전체 작가 목록 조회
   * TODO: API 연동 필요 (GET /api/admin/users)
   */
  getUsers: async () => {
    const data = localStorage.getItem(MOCK_STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  /**
   * 작가 계정 상태 변경 (정상 복원, 정지 처리, 탈퇴 등)
   * TODO: API 연동 필요 (PUT /api/admin/users/:userId/status)
   */
  updateUserStatus: async (userId, status, reason = '') => {
    const users = JSON.parse(localStorage.getItem(MOCK_STORAGE_KEYS.USERS) || '[]');
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return { ...user, status };
      }
      return user;
    });
    localStorage.setItem(MOCK_STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
    return true;
  },

  /**
   * 통합 신고 항목 리스트 가져오기
   * TODO: API 연동 필요 (GET /api/admin/reports?type=books|comments|authors)
   */
  getReports: async (type) => {
    let key = '';
    if (type === 'books') key = MOCK_STORAGE_KEYS.BOOKS;
    else if (type === 'comments') key = MOCK_STORAGE_KEYS.COMMENTS;
    else if (type === 'authors') key = MOCK_STORAGE_KEYS.AUTHORS;

    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  /**
   * 신고 처리 완료 및 제한 조치 이행
   * TODO: API 연동 필요 (POST /api/admin/reports/:reportId/resolve)
   */
  resolveReport: async (type, reportId, actionType, resolvedReason = '') => {
    let key = '';
    if (type === 'books') key = MOCK_STORAGE_KEYS.BOOKS;
    else if (type === 'comments') key = MOCK_STORAGE_KEYS.COMMENTS;
    else if (type === 'authors') key = MOCK_STORAGE_KEYS.AUTHORS;

    const list = JSON.parse(localStorage.getItem(key) || '[]');
    const updatedList = list.map(item => {
      if (item.id === reportId) {
        return { 
          ...item, 
          status: actionType === 'execute' ? 'hidden' : 'dismissed', 
          resolvedReason 
        };
      }
      return item;
    });
    localStorage.setItem(key, JSON.stringify(updatedList));
    return true;
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
