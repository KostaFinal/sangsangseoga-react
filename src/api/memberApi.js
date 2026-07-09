import api from "./axios";

export const withdrawMember = (password, bookPolicy) =>
  api.delete("/api/members/me", { data: { password, bookPolicy } });

export const getViewerPreference = () => api.get("/api/members/me/viewer-preference");
export const updateViewerPreference = (viewerFontSize, viewerViewType) =>
  api.patch("/api/members/me/viewer-preference", { viewerFontSize, viewerViewType });

export const getMyInfo = () => api.get("/api/members/me");
