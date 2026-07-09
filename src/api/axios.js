import axios from "axios";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./tokenStorage";

const instance = axios.create({
  baseURL: "http://localhost:8080",
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

    if (!response || response.status !== 401 || config._retry || config.url === "/api/auth/token-refresh") {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
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
