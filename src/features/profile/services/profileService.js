/**
 * Profile Service Layer (계정/프로필 API 연동 서비스)
 *
 * TODO: API 연동 필요 (실제 백엔드 API 엔드포인트가 연동되어야 하는 영역입니다.)
 * 현재는 협업 및 페이지 병합을 고려하여 Mock 로직과 인터페이스가 먼저 설계되어 있으며,
 * 실 배포 시 axios 또는 fetch를 이용한 비동기 통신 코드로 간편하게 대체할 수 있도록 설계되었습니다.
 */
import { withdrawMember } from '../../../api/memberApi';
import { clearTokens } from '../../../api/tokenStorage';
import { getPendingGuardianConsents, decideGuardianConsent } from '../../../api/authApi';

const RESERVED_NICKNAMES = ['관리자', '상상서가', '어린왕자'];
const PREVIOUS_BUILTIN_PASSWORD = 'password123';
const VALID_ACCOUNT_PASSWORDS = ['password123', 'admin123'];

const unwrap = (res) => {
  const body = res.data;
  if (!body?.success) {
    throw new Error(body?.message || '요청 처리 중 문제가 발생했습니다.');
  }
  return body.data;
};

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
   * 회원 탈퇴 처리 (DELETE /api/members/me)
   * bookDisposalMethod: 'PRIVATE'(비공개 보관) | 'DELETE'(즉시 영구 삭제) → 서버의 bookPolicy 'HIDE'|'DELETE'로 매핑
   */
  withdrawMembership: async (password, bookDisposalMethod) => {
    const bookPolicy = bookDisposalMethod === 'DELETE' ? 'DELETE' : 'HIDE';
    unwrap(await withdrawMember(password, bookPolicy));
    clearTokens();
    return true;
  },

  /** 로그인한 보호자 기준 대기 중인 동의 요청 목록 조회 (GET /api/guardian-consents/pending) */
  getPendingGuardianConsents: async () => {
    const data = unwrap(await getPendingGuardianConsents());
    return data.map((item) => ({
      consentId: item.consentId,
      memberId: item.memberId,
      nickname: item.memberNickname,
      email: item.memberEmail,
      birthDate: item.memberBirthDate,
      requestedAt: item.requestedAt,
      expiresAt: item.expiresAt,
    }));
  },

  /** 로그인 기반 보호자 동의 승인/거절 (PATCH /api/guardian-consents/{consentId}/decision) */
  decideGuardianConsent: async (consentId, status) => {
    unwrap(await decideGuardianConsent(consentId, status));
    return true;
  },
};
