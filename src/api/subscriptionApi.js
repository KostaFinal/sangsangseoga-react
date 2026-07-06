import api from "./axios";

/**
 * TODO: 백엔드에 아직 대응 엔드포인트 없음 (docs/subscription-api-spec-draft.md 참고)
 * 스펙 확정 및 백엔드 구현 완료 후 실제 연동 예정.
 */

export const getMySubscription = () =>
  api.get("/api/subscriptions/me");

export const startSubscription = (planType, paymentKey, orderId, amount) =>
  api.post("/api/subscriptions", { planType, paymentKey, orderId, amount });

export const cancelSubscription = () =>
  api.post("/api/subscriptions/cancel");

export const getPayments = (page = 0, size = 20) =>
  api.get("/api/payments", { params: { page, size } });

export const getMyUsage = () =>
  api.get("/api/usage/me");
