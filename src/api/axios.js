import axios from "axios";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./tokenStorage";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let pendingRequests = [];

const resolvePendingRequests = (error, accessToken) => {
  pendingRequests.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(accessToken);
  });
  pendingRequests = [];
};

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    // axios의 기본 error.message("Request failed with status code 400")는
    // 백엔드가 내려주는 실제 에러 메시지를 가리고 화면에 노출되어 버리므로,
    // 응답 바디의 message가 있으면 그걸로 덮어써서 호출부가 err.message만 봐도 되게 한다.
    if (response?.data?.message) {
      error.message = response.data.message;
    }

    // /api/auth/login 자체가 401(예: 정지 계정 SUSPENDED_MEMBER)인 경우까지 "토큰 만료"로
    // 오인해 조용히 리프레시를 시도하면 안 된다 — 로그인 전이라 애초에 액세스 토큰도 안 붙어있고,
    // 만약 이전 세션의 refreshToken이 로컬에 남아있으면 그걸로 리프레시를 시도하다 실패하면서
    // 정작 보여줘야 할 로그인 실패 메시지(위에서 세팅한 것)가 리프레시 실패 에러로 덮어써진다.
    if (
      !response ||
      response.status !== 401 ||
      config._retry ||
      config.url === "/api/auth/token-refresh" ||
      config.url === "/api/auth/login"
    ) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({ resolve, reject });
      }).then((accessToken) => {
        config.headers.Authorization = `Bearer ${accessToken}`;
        return instance(config);
      });
    }

    config._retry = true;
    isRefreshing = true;

    try {
      const { data } = await instance.post("/api/auth/token-refresh", { refreshToken });
      const newAccessToken = data?.data?.accessToken;
      setTokens({ accessToken: newAccessToken });
      resolvePendingRequests(null, newAccessToken);
      config.headers.Authorization = `Bearer ${newAccessToken}`;
      return instance(config);
    } catch (refreshError) {
      resolvePendingRequests(refreshError, null);
      clearTokens();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default instance;
