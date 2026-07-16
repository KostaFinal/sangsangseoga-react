import * as authApi from '../../../api/authApi';
import { setTokens, clearTokens } from '../../../api/tokenStorage';

const NICKNAME_PATTERN = /^[0-9A-Za-z가-힣]{2,10}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const unwrap = (res) => {
  const body = res.data;
  if (!body?.success) {
    throw new Error(body?.message || '요청 처리 중 문제가 발생했습니다.');
  }
  return body.data;
};

export const authService = {
  /** 생년월일 기준 만 14세 미만 여부 판별 */
  checkIsMinorUnder14: (dateString) => {
    if (!dateString) return false;
    const birthDate = new Date(dateString);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }
    return age < 14;
  },

  /** 로그인 (POST /api/auth/login) — 일반/관리자 계정 공통, role은 응답으로 구분 */
  login: async (email, password, rememberMe = true) => {
    if (!email || !password) {
      throw new Error('이메일 주소와 비밀번호를 모두 입력해 주세요.');
    }
    const data = unwrap(await authApi.login(email, password, rememberMe));
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return {
      memberId: data.memberId,
      email,
      nickname: data.nickname,
      profileImageUrl: data.profileImageUrl,
      role: data.role,
    };
  },

  /** 로그인 세션을 서버 호출 없이 로컬에서만 폐기 (예: 관리자 전용 폼에 일반 계정으로 로그인된 경우) */
  clearLocalSession: () => {
    clearTokens();
  },

  /** 로그아웃 (POST /api/auth/logout) */
  logout: async () => {
    try {
      await authApi.logout();
    } finally {
      clearTokens();
    }
  },

  /** 회원가입 1단계(기본 정보) 유효성 검증 — 백엔드 SignupRequestDto 제약과 동일하게 검증 */
  validateSignupInfo: ({ email, password, confirmPassword, nickname, birthdate, agreeTerms }) => {
    if (!email) return '이메일을 입력해 주세요.';
    if (!EMAIL_PATTERN.test(email)) return '올바른 이메일 형식으로 입력해 주세요.';
    if (!nickname || !NICKNAME_PATTERN.test(nickname)) {
      return '닉네임은 한글/영문/숫자 2~10자로 입력해 주세요.';
    }
    const strength = authService.getPasswordStrength(password);
    if (!strength.hasLetter || !strength.hasNumber || !strength.hasSpecial || !strength.isMinLength) {
      return '비밀번호는 영문+숫자+특수문자를 포함하여 8자 이상이어야 합니다.';
    }
    if (password !== confirmPassword) return '입력하신 두 비밀번호가 서로 일치하지 않습니다.';
    if (!birthdate) return '생년월일을 선택해 주세요.';
    if (!agreeTerms) return '이용약관 및 개인정보 수집 이용 동의는 필수 사항입니다.';
    return null;
  },

  /** 회원가입 - 보호자(법정대리인) 동의 요청 정보 검증 */
  validateGuardianConsent: ({ guardianName, guardianEmail }) => {
    if (!guardianName.trim()) return '법정대리인의 실명을 정확하게 입력해 주세요.';
    if (!guardianEmail.includes('@')) return '올바른 법정대리인 이메일 형식으로 기재해 주세요.';
    return null;
  },

  /** 회원가입 (POST /api/auth/signup) */
  signup: async ({ email, password, nickname, birthDate, profileImageUrl }) => {
    const data = unwrap(await authApi.signup({ email, password, nickname, birthDate, profileImageUrl }));
    // 만 14세 미만은 보호자 동의가 완료되기 전까지 로그인 상태가 되면 안 되므로,
    // 서버가 토큰을 함께 내려주더라도 여기서는 저장하지 않는다.
    if (!authService.checkIsMinorUnder14(birthDate)) {
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    }
    return {
      memberId: data.memberId,
      email: data.email,
      nickname: data.nickname,
      role: data.role,
    };
  },

  /** 소셜 로그인 인가 URL 조회 후 해당 URL로 리다이렉트 */
  redirectToOAuthProvider: async (provider, redirectUri) => {
    const data = unwrap(await authApi.getOAuthAuthorizeUrl(provider, redirectUri));
    window.location.href = data.authorizeUrl;
  },

  /**
   * 소셜 로그인 콜백 처리 (POST /api/auth/oauth/:provider/callback)
   * - 기존 회원: 로그인과 동일하게 토큰 저장 후 { status: 'LOGGED_IN', ... } 반환
   * - 신규 회원 + 생년월일 미확보: 토큰 미저장, { status: 'NEEDS_BIRTHDATE', oauthSignupToken, ... } 반환
   * - 신규 회원 + 미성년자: 토큰 미저장, { status: 'NEEDS_GUARDIAN_CONSENT', memberId } 반환
   * - 신규 회원 + 성인: 로그인과 동일하게 토큰 저장 후 { status: 'LOGGED_IN', ... } 반환
   */
  exchangeOAuthCode: async (provider, code, redirectUri) => {
    const data = unwrap(await authApi.exchangeOAuthCode(provider, code, redirectUri));
    if (data.pendingGuardianConsent) {
      return { status: 'NEEDS_GUARDIAN_CONSENT', memberId: data.memberId };
    }
    if (data.isNewMember && !data.oauthSignupToken) {
      // 이 조합은 나오면 안 되지만, 방어적으로 회원가입 완료 단계로 유도
      return { status: 'NEEDS_BIRTHDATE', oauthSignupToken: null, email: data.email, nickname: data.nickname };
    }
    if (data.isNewMember) {
      return {
        status: 'NEEDS_BIRTHDATE',
        oauthSignupToken: data.oauthSignupToken,
        email: data.email,
        nickname: data.nickname,
        profileImageUrl: data.profileImageUrl,
      };
    }
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return {
      status: 'LOGGED_IN',
      memberId: data.memberId,
      email: data.email,
      nickname: data.nickname,
      profileImageUrl: data.profileImageUrl,
      role: data.role,
    };
  },

  /** 소셜 신규가입 완료 (POST /api/auth/oauth/:provider/complete-signup) — provider가 생년월일을 안 줬을 때만 호출 */
  completeOAuthSignup: async (provider, oauthSignupToken, nickname, birthDate) => {
    const data = unwrap(await authApi.completeOAuthSignup(provider, oauthSignupToken, nickname, birthDate));
    if (data.pendingGuardianConsent) {
      return { status: 'NEEDS_GUARDIAN_CONSENT', memberId: data.memberId };
    }
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return {
      status: 'LOGGED_IN',
      memberId: data.memberId,
      email: data.email,
      nickname: data.nickname,
      profileImageUrl: data.profileImageUrl,
      role: data.role,
    };
  },

  /** 만 14세 미만 회원가입 시 보호자 동의 요청 (POST /api/guardian-consents) */
  requestGuardianConsent: async (memberId, guardianName, guardianEmail) => {
    const data = unwrap(await authApi.requestGuardianConsent(memberId, guardianName, guardianEmail));
    return { consentId: data.consentId, status: data.status, expiresAt: data.expiresAt };
  },

  /** 이메일로 받은 동의 링크(토큰 기반, 비로그인) 승인/거절 처리 (PATCH /api/guardian-consents/:consentId) */
  processGuardianConsent: async (consentId, token, status) => {
    const data = unwrap(await authApi.processGuardianConsent(consentId, token, status));
    return { consentId: data.consentId, status: data.status };
  },

  /** 새 비밀번호 강도(규칙 충족 여부) 계산 */
  getPasswordStrength: (newPassword) => ({
    hasLetter: /[a-zA-Z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSpecial: /[^A-Za-z0-9]/.test(newPassword),
    isMinLength: newPassword.length >= 8,
  }),

  /** 새 비밀번호 최종 제출 유효성 검증 (제출 직전 클라이언트 측 사전 검사) */
  validateNewPassword: (newPassword, confirmPassword, strength) => {
    const errors = [];
    if (!strength.hasLetter || !strength.hasNumber || !strength.hasSpecial || !strength.isMinLength) {
      errors.push('비밀번호 복잡도 규칙(영문+숫자+특수문자 최소 8자 이상)을 충족해야 합니다.');
    }
    if (newPassword !== confirmPassword) {
      errors.push('새 비밀번호와 비밀번호 확인 입력값이 일치하지 않습니다.');
    }
    return errors;
  },

  /** 비밀번호 재설정 - 인증 메일 발송 요청 (POST /api/auth/password/reset_request) */
  requestPasswordResetEmail: async (email) => {
    unwrap(await authApi.requestPasswordReset(email));
    return true;
  },

  /** 비밀번호 재설정 토큰 사전 검증 (GET /api/auth/password/reset/verify) — 토큰을 소비하지 않음 */
  verifyPasswordResetToken: async (token) => {
    unwrap(await authApi.verifyPasswordResetToken(token));
    return true;
  },

  /** 비밀번호 재설정 완료 (PATCH /api/auth/password/reset) — 토큰 유효성은 서버가 검증 */
  confirmPasswordReset: async (token, newPassword) => {
    unwrap(await authApi.completePasswordReset(token, newPassword));
    return true;
  },
};
