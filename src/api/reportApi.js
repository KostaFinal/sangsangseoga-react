import api from "./axios";

// targetType: "BOOK" | "COMMENT" | "AUTHOR"
// reason: "SPAM" | "ABUSE" | "SEXUAL" | "OTHER"
export const submitReport = ({ targetType, targetId, reason, reasonDetail }) =>
  api.post("/api/reports", { targetType, targetId, reason, reasonDetail });

// 내가 신고한 대상 ID 목록 조회 (targetType: "BOOK" | "COMMENT" | "AUTHOR")
export const getMyReportedTargetIds = (targetType) =>
  api.get("/api/reports/mine", { params: { targetType } });
