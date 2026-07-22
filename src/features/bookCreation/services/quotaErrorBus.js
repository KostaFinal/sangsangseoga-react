// AI 생성 계열 서비스(aiGenerateService/imageGenerateService)가 429(쿼터 초과) 응답을 받았을 때
// 호출한다. 호출부(수십 개의 생성 훅)마다 따로 처리하지 않고, 여기 한 곳에서 감지해
// 전역 구독 유도 모달(AuthContext + AppShell)을 띄우는 데 쓴다.
export const QUOTA_ERROR_CODES = new Set([
  "DAILY_QUOTA_EXCEEDED",
  "FREE_TRIAL_CALL_LIMIT_EXCEEDED",
]);

const listeners = new Set();

export const subscribeQuotaExceeded = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const reportAiErrorResponse = (status, data) => {
  if (status !== 429) return;
  const code = data?.code;
  if (!QUOTA_ERROR_CODES.has(code)) return;
  listeners.forEach((listener) => listener(code));
};

// AI 생성이 성공(횟수 차감)할 때마다 호출한다. 헤더/구독 페이지의 잔여 횟수가
// 새로고침 없이도 즉시 반영되도록 AuthContext가 이 이벤트를 구독해 refreshUsage()를 다시 부른다.
const usageChangedListeners = new Set();

export const subscribeUsageChanged = (listener) => {
  usageChangedListeners.add(listener);
  return () => usageChangedListeners.delete(listener);
};

export const notifyUsageChanged = () => {
  usageChangedListeners.forEach((listener) => listener());
};
