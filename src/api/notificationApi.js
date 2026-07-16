import api from "./axios";

export const getNotifications = (page = 0, size = 20) =>
  api.get("/api/notifications", { params: { page, size } });

export const markNotificationAsRead = (id) =>
  api.patch(`/api/notifications/${id}/read`);

export const markAllNotificationsAsRead = () =>
  api.patch("/api/notifications/read-all");

export const deleteAllNotifications = () =>
  api.delete("/api/notifications");

// SSE 연결용 1회용 티켓 발급 (발급 후 30초 안에 연결에 써야 하고, 한 번 쓰면 즉시 무효화됨)
export const getNotificationStreamTicket = () =>
  api.post("/api/notifications/stream-ticket");
