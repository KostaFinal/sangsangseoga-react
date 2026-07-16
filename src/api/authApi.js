import api from "./axios";

export const login = (email, password, rememberMe = true) =>
  api.post("/api/auth/login", { email, password, rememberMe });

export const signup = ({ email, password, nickname, birthDate, profileImageUrl }) =>
  api.post("/api/auth/signup", { email, password, nickname, birthDate, profileImageUrl });

export const logout = () => api.post("/api/auth/logout");

/** 소셜 로그인 인가 URL 발급 (provider: kakao | naver) */
export const getOAuthAuthorizeUrl = (provider, redirectUri) =>
  api.get(`/api/auth/oauth/${provider}/authorize-url`, { params: { redirectUri } });

/** 소셜 로그인 콜백 처리 — 기존 회원이면 로그인, 신규 회원이면 가입(추가 정보 필요할 수 있음) */
export const exchangeOAuthCode = (provider, code, redirectUri) =>
  api.post(`/api/auth/oauth/${provider}/callback`, { code, redirectUri });

/** 소셜 신규 가입 완료 — provider가 생년월일을 안 줘서 콜백에서 바로 가입이 안 끝난 경우에만 호출 */
export const completeOAuthSignup = (provider, oauthSignupToken, nickname, birthDate) =>
  api.post(`/api/auth/oauth/${provider}/complete-signup`, { oauthSignupToken, nickname, birthDate });

export const refreshToken = (refreshToken) =>
  api.post("/api/auth/token-refresh", { refreshToken });

export const requestPasswordReset = (email) =>
  api.post("/api/auth/password/reset_request", { email });

// 새 비밀번호 입력 전 토큰 자체 유효성만 사전 확인 (토큰을 소비하지 않음 — 실제 반영은 completePasswordReset에서)
export const verifyPasswordResetToken = (token) =>
  api.get("/api/auth/password/reset/verify", { params: { token } });

export const completePasswordReset = (token, newPassword) =>
  api.patch("/api/auth/password/reset", { token, newPassword });

export const requestGuardianConsent = (memberId, guardianName, guardianEmail) =>
  api.post("/api/guardian-consents", { memberId, guardianName, guardianEmail });

export const processGuardianConsent = (consentId, token, status) =>
  api.patch(`/api/guardian-consents/${consentId}`, { token, status });

/** 로그인한 보호자 기준 대기 중(REQUESTED) 동의 요청 목록 */
export const getPendingGuardianConsents = () =>
  api.get("/api/guardian-consents/pending");

/** 로그인 기반 보호자 동의 승인/거절 (토큰 불필요, Authentication으로 본인 확인) */
export const decideGuardianConsent = (consentId, status) =>
  api.patch(`/api/guardian-consents/${consentId}/decision`, { status });
