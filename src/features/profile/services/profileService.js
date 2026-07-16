/**
 * Profile Service Layer (계정/프로필 API 연동 서비스)
 */
import {
  withdrawMember,
  getMyInfo,
  updateMyProfile,
  checkNicknameAvailability,
  changePassword,
  updateGuardianEmail,
  getConnectedMinors,
  withdrawGuardianConsent,
  uploadProfileImage,
} from '../../../api/memberApi';
import { clearTokens } from '../../../api/tokenStorage';
import { getPendingGuardianConsents, decideGuardianConsent } from '../../../api/authApi';

const unwrap = (res) => {
  const body = res.data;
  if (!body?.success) {
    throw new Error(body?.message || '요청 처리 중 문제가 발생했습니다.');
  }
  return body.data;
};

// 404 등 우리 응답 형태({success, data, message})가 아닌 에러(엔드포인트 미구현 등)는
// 백엔드 기본 에러 페이지 문구("No message available" 등)를 그대로 노출하지 않고 안내 문구로 대체한다.
const request = async (promise) => {
  try {
    return unwrap(await promise);
  } catch (err) {
    if (err.response?.data?.success === false) throw err;
    throw new Error('요청을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.');
  }
};

export const profileService = {
  /** 내 프로필 상세 조회 (GET /api/members/me) */
  getMyProfile: async () => {
    const data = await request(getMyInfo());
    return {
      nickname: data.nickname,
      profileImageUrl: data.profileImageUrl,
      introduction: data.introduction || '',
      isMinor: !!data.isMinor,
      guardianEmail: data.guardianEmail || '',
    };
  },

  /** 필명 중복 확인 (GET /api/members/nickname-check?nickname=) */
  checkNicknameAvailability: async (nickname) => {
    if (!nickname.trim()) {
      return { available: false, message: '필명을 정확히 입력해 주세요.' };
    }
    const data = await request(checkNicknameAvailability(nickname));
    return { available: data.available, message: data.available ? '사용할 수 있는 필명입니다.' : '이미 사용 중인 필명입니다.' };
  },

  /** 비밀번호 변경 요청 유효성 검증 (변경을 시도하지 않으면 null) */
  validatePasswordChange: ({ currentPassword, newPassword, confirmNewPassword }) => {
    if (!newPassword) return null;
    if (!currentPassword) return '비밀번호를 변경하려면 현재 비밀번호 확인이 필수입니다.';
    if (newPassword !== confirmNewPassword) return '새 비밀번호 확인이 일치하지 않습니다.';
    return null;
  },

  /** 비밀번호 변경 (PATCH /api/members/me/password) — newPassword가 없으면 호출하지 않음 */
  changePassword: async (currentPassword, newPassword) => {
    await request(changePassword(currentPassword, newPassword));
    return true;
  },

  /** 기본 프로필 정보(필명/아바타/자기소개) 저장 (PUT /api/members/me) */
  updateProfile: async ({ nickname, profileImage, introduction }) => {
    const data = await request(updateMyProfile({ nickname, profileImageUrl: profileImage, introduction }));
    return { nickname: data.nickname, profileImageUrl: data.profileImageUrl, introduction: data.introduction };
  },

  /** 프로필 사진 파일 업로드 (POST /api/members/me/profile-image) — 반환된 URL은 저장(updateProfile) 전까지는 반영되지 않음 */
  uploadProfileImage: async (file) => {
    const data = await request(uploadProfileImage(file));
    return data.profileImageUrl;
  },

  /** 만 14세 미만 본인 계정의 보호자 이메일 변경 (PATCH /api/members/me/guardian-email) */
  updateGuardianEmail: async (guardianEmail) => {
    await request(updateGuardianEmail(guardianEmail));
    return true;
  },

  /** 로그인한 보호자 기준 동의 완료된 자녀 계정 목록 조회 (GET /api/members/me/guardian/minors) */
  getConnectedMinors: async () => {
    const data = await request(getConnectedMinors());
    return data.map((minor) => ({
      id: minor.memberId,
      name: minor.nickname,
      email: minor.email,
      birthdate: minor.birthDate,
      booksCount: minor.bookCount,
      subscription: minor.subscriptionPlanLabel,
      status: minor.status,
      joinedDate: minor.consentedAt,
    }));
  },

  /**
   * 보호 자녀 계정에 대한 보호자 동의 철회 (POST /api/members/me/guardian/:minorId/withdraw)
   * 비밀번호는 서버가 검증한다 — 실패하면 서버 에러 메시지가 그대로 던져진다.
   */
  withdrawGuardianConsent: async (minorId, password) => {
    await request(withdrawGuardianConsent(minorId, password));
    return true;
  },

  /**
   * 회원 탈퇴 처리 (DELETE /api/members/me)
   * 실제로는 소프트 삭제 — 데이터는 삭제되지 않고 status만 DELETED로 전환됨
   */
  withdrawMembership: async (password) => {
    await request(withdrawMember(password));
    clearTokens();
    return true;
  },

  /** 로그인한 보호자 기준 대기 중인 동의 요청 목록 조회 (GET /api/guardian-consents/pending) */
  getPendingGuardianConsents: async () => {
    const data = await request(getPendingGuardianConsents());
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
    await request(decideGuardianConsent(consentId, status));
    return true;
  },
};
