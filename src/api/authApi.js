import api from "./axios";

export const login = (email, password, rememberMe = true) =>
  api.post("/api/auth/login", { email, password, rememberMe });

export const signup = ({ email, password, nickname, birthDate, profileImageUrl }) =>
  api.post("/api/auth/signup", { email, password, nickname, birthDate, profileImageUrl });

export const logout = () => api.post("/api/auth/logout");

export const refreshToken = (refreshToken) =>
  api.post("/api/auth/token-refresh", { refreshToken });

export const requestPasswordReset = (email) =>
  api.post("/api/auth/password/reset_request", { email });

export const completePasswordReset = (token, newPassword) =>
  api.patch("/api/auth/password/reset", { token, newPassword });

export const requestGuardianConsent = (memberId, guardianName, guardianEmail) =>
  api.post("/api/guardian-consents", { memberId, guardianName, guardianEmail });

export const processGuardianConsent = (consentId, token, status) =>
  api.patch(`/api/guardian-consents/${consentId}`, { token, status });
