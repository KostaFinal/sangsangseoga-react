import api from "./axios";

export const getNotifications = (page = 0, size = 20) =>
  api.get("/api/notifications", { params: { page, size } });

export const markNotificationAsRead = (id) =>
  api.patch(`/api/notifications/${id}/read`);

export const markAllNotificationsAsRead = () =>
  api.patch("/api/notifications/read-all");

export const deleteAllNotifications = () =>
  api.delete("/api/notifications");
