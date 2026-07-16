const ACCESS_TOKEN_KEY = "sangsang_access_token";
const REFRESH_TOKEN_KEY = "sangsang_refresh_token";

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

// 액세스 토큰이 바뀔 때마다(로그인/조용한 토큰 재발급/로그아웃) 구독자에게 알림 —
// SSE처럼 토큰이 바뀌면 연결을 다시 맺어야 하는 소비자를 위한 최소 pub/sub
const tokenChangeListeners = new Set();
export const subscribeAccessToken = (listener) => {
  tokenChangeListeners.add(listener);
  return () => tokenChangeListeners.delete(listener);
};
const notifyAccessTokenChanged = () => {
  const token = getAccessToken();
  tokenChangeListeners.forEach((listener) => listener(token));
};

export const setTokens = ({ accessToken, refreshToken } = {}) => {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (accessToken) notifyAccessTokenChanged();
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  notifyAccessTokenChanged();
};
