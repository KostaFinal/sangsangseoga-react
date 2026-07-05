/**
 * Auth Service Layer (인증 API 연동 서비스)
 *
 * TODO: API 연동 필요 (실제 백엔드 API 엔드포인트가 연동되어야 하는 영역입니다.)
 * 현재는 협업 및 페이지 병합을 고려하여 Mock 로직과 인터페이스가 먼저 설계되어 있으며,
 * 실 배포 시 axios 또는 fetch를 이용한 비동기 통신 코드로 간편하게 대체할 수 있도록 설계되었습니다.
 */

const PREVIOUS_BUILTIN_PASSWORD = 'password123';

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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

  /**
   * 일반 작가 계정 로그인
   * TODO: API 연동 필요 (POST /api/auth/login)
   */
  loginUser: async (email, password) => {
    if (!email || !password) {
      throw new Error('이메일 주소와 비밀번호를 모두 입력해 주세요.');
    }

    if (email.includes('child') || email.includes('pending') || email === 'minor@sangsang.com') {
      return { pendingMinor: true, user: null };
    }

    return {
      pendingMinor: false,
      user: { email, role: 'USER', nickname: '상상의작가' }
    };
  },

  /**
   * 관리자 계정 로그인
   * TODO: API 연동 필요 (POST /api/auth/admin/login)
   */
  loginAdmin: async (adminEmail, adminPassword) => {
    if (adminEmail !== 'admin@sangsang.com') {
      throw new Error('이메일 또는 비밀번호가 잘못되었거나, 관리자 권한이 없는 계정입니다.');
    }
    if (adminPassword !== 'admin123') {
      throw new Error('어드민 패스위드가 알맞지 않습니다. 다시 입력해 주세요.');
    }

    return { email: adminEmail, role: 'ADMIN', nickname: '상상관리팀장' };
  },

  /** 회원가입 1단계(기본 정보) 유효성 검증 */
  validateSignupInfo: ({ email, password, confirmPassword, agreeTerms }) => {
    if (!email) return '이메일을 입력해 주세요.';
    if (password.length < 6) return '보안을 위해 비밀번호는 6자리 이상으로 등록해 주세요.';
    if (password !== confirmPassword) return '입력하신 두 비밀번호가 서로 일치하지 않습니다.';
    if (!agreeTerms) return '이용약관 및 개인정보 수집 이용 동의는 필수 사항입니다.';
    return null;
  },

  /** 회원가입 - 보호자(법정대리인) 동의 정보 검증 */
  validateGuardianConsent: ({ guardianName, guardianEmail }) => {
    if (!guardianName.trim()) return '법정대리인의 실명을 정확하게 입력해 주세요.';
    if (!guardianEmail.includes('@')) return '올바른 법정대리인 이메일 형식으로 기재해 주세요.';
    return null;
  },

  /**
   * 회원가입 처리
   * TODO: API 연동 필요 (POST /api/auth/signup)
   */
  signupUser: async (payload) => {
    return { success: true, ...payload };
  },

  /**
   * 비밀번호 재설정 - 인증 메일 발송
   * TODO: API 연동 필요 (POST /api/auth/password-reset/request)
   */
  requestPasswordResetEmail: async (email) => {
    const tokenUuid = generateUUID();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    const tokenRecord = { email, token: tokenUuid, expiresAt, used: false };
    const mailItem = {
      id: Date.now(),
      sender: '상상서가 보안센터 (security@sangsang.com)',
      title: '[상상서가] 회원님의 비밀번호 재설정을 위한 임시 토큰 메일입니다.',
      sentAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      token: tokenUuid,
      link: `https://sangsang.com/reset-password?token=${tokenUuid}`
    };
    return { tokenRecord, mailItem };
  },

  /** 비밀번호 재설정 토큰 유효성 검증 */
  verifyResetToken: (record) => {
    if (!record) return '유효하지 않은 보안 토큰입니다. 다시 링크를 발급해 주세요.';
    if (new Date() > record.expiresAt) return '유효성 기준 시간(30분)이 지나 토큰이 자동 만료되었습니다.';
    if (record.used) return '❌ 보안 규정 위반: 이 인증 토큰 링크는 이미 1회 사용되어 즉시 파기(만료)되었습니다.';
    return null;
  },

  /** 새 비밀번호 강도(규칙 충족 여부) 계산 */
  getPasswordStrength: (newPassword) => ({
    hasLetter: /[a-zA-Z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
    hasSpecial: /[^A-Za-z0-9]/.test(newPassword),
    isMinLength: newPassword.length >= 8,
  }),

  /** 새 비밀번호 최종 제출 유효성 검증 */
  validateNewPassword: (newPassword, confirmPassword, strength) => {
    const errors = [];
    if (!strength.hasLetter || !strength.hasNumber || !strength.hasSpecial || !strength.isMinLength) {
      errors.push('비밀번호 복잡도 규칙(영문+숫자+특수문자 최소 8자 이상)을 충족해야 합니다.');
    }
    if (newPassword !== confirmPassword) {
      errors.push('새 비밀번호와 비밀번호 확인 입력값이 일치하지 않습니다.');
    }
    if (newPassword === PREVIOUS_BUILTIN_PASSWORD) {
      errors.push('🔒 보안 규칙 위반: 직전에 사용하셨던 비밀번호("password123")와 완전히 동일한 비밀번호로는 변경할 수 없습니다.');
    }
    return errors;
  },

  /**
   * 비밀번호 재설정 완료 반영
   * TODO: API 연동 필요 (POST /api/auth/password-reset/confirm)
   */
  confirmPasswordReset: async (newPassword) => {
    return { success: true };
  },
};
