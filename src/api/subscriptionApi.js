import api from "./axios";

/**
 * TODO: 백엔드에 아직 대응 엔드포인트 없음 (docs/subscription-api-spec-draft.md 참고)
 * 스펙 확정 및 백엔드 구현 완료 후 실제 연동 예정.
 */

export const getMySubscription = () =>
  api.get("/api/subscriptions/me");

export const startSubscription = (planType, paymentKey, orderId, amount) =>
  api.post("/api/subscriptions", { planType, paymentKey, orderId, amount });

/**
 * 이미 활성 구독 중인 사용자의 요금제 변경 (월간 → 연간만 허용, 재결제 + 기간 새로 시작)
 * 연간 → 월간 요청 시 400 DOWNGRADE_NOT_SUPPORTED
 */
export const changeSubscriptionPlan = (planType, paymentKey, orderId, amount) =>
  api.patch("/api/subscriptions", { planType, paymentKey, orderId, amount });

export const cancelSubscription = () =>
  api.post("/api/subscriptions/cancel");

export const resumeSubscription = () =>
  api.post("/api/subscriptions/resume");

export const getSubscriptionPlans = () =>
  api.get("/api/subscription-plans");

export const getPayments = (page = 0, size = 20) =>
  api.get("/api/payments", { params: { page, size } });

export const getMyUsage = () =>
  api.get("/api/usage/me");
