/**
 * Profile Service Layer (계정/프로필 API 연동 서비스)
 *
 * TODO: API 연동 필요 (실제 백엔드 API 엔드포인트가 연동되어야 하는 영역입니다.)
 * 현재는 협업 및 페이지 병합을 고려하여 Mock 로직과 인터페이스가 먼저 설계되어 있으며,
 * 실 배포 시 axios 또는 fetch를 이용한 비동기 통신 코드로 간편하게 대체할 수 있도록 설계되었습니다.
 */

const RESERVED_NICKNAMES = ['관리자', '상상서가', '어린왕자'];
const PREVIOUS_BUILTIN_PASSWORD = 'password123';
const VALID_ACCOUNT_PASSWORDS = ['password123', 'admin123'];

export const profileService = {
  /**
   * 필명 중복 확인
   * TODO: API 연동 필요 (GET /api/profile/nickname-check?nickname=)
   */
  checkNicknameAvailability: async (nickname) => {
    if (!nickname.trim()) {
      return { available: false, message: '필명을 정확히 입력해 주세요.' };
    }
    if (RESERVED_NICKNAMES.includes(nickname)) {
      return { available: false, message: '이미 사용 중이거나 시스템 예약어로 분류된 필명입니다.' };
    }
    return { available: true, message: '사용할 수 있는 멋진 필명입니다.' };
  },

  /** 비밀번호 변경 요청 유효성 검증 (변경을 시도하지 않으면 null) */
  validatePasswordChange: ({ currentPassword, newPassword, confirmNewPassword }) => {
    if (!newPassword) return null;
    if (!currentPassword) return '비밀번호를 변경하려면 현재 비밀번호 확인이 필수입니다.';
    if (newPassword !== confirmNewPassword) return '신규 비밀번호 확인 불일치!';
    if (newPassword === PREVIOUS_BUILTIN_PASSWORD) return '🔒 보안 정책 위반: 이전 비밀번호와 동일한 패스워드는 재사용할 수 없습니다.';
    return null;
  },

  /**
   * 기본 프로필 정보(필명/아바타 등) 저장
   * TODO: API 연동 필요 (PUT /api/profile)
   */
  updateProfile: async (payload) => {
    return { success: true, ...payload };
  },

  /** 계정 본인확인 비밀번호 검증 (Mock) */
  verifyAccountPassword: (password) => VALID_ACCOUNT_PASSWORDS.includes(password),

  /**
   * 보호 자녀 계정에 대한 보호자 동의 철회
   * TODO: API 연동 필요 (POST /api/profile/guardian/:minorId/withdraw)
   */
  withdrawGuardianConsent: async (minorId) => {
    return { success: true, minorId };
  },

  /**
   * 회원 탈퇴 처리
   * TODO: API 연동 필요 (POST /api/profile/withdraw)
   */
  withdrawMembership: async () => {
    return { success: true };
  },

  /** 학부모 안심 동의 시뮬레이터 - 신규 승인 자녀 계정 목업 생성 */
  createApprovedGuardianDemoChild: () => ({
    id: `minor_gen_${Date.now().toString().slice(-3)}`,
    name: '이채민 (자녀)',
    email: 'chaemin@sangsang.com',
    birthdate: '2015-11-20',
    booksCount: 0,
    subscription: '무료 새싹 작가 플랜 (기본 무료체험 1회 지급)',
    status: 'ACTIVE',
    joinedDate: '방금 전 동의함'
  }),
};
