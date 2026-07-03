import api from "./axios";

// targetType: "BOOK" | "COMMENT" | "AUTHOR"
// reason: "SPAM" | "ABUSE" | "SEXUAL" | "OTHER"
export const submitReport = ({ targetType, targetId, reason, reasonDetail }) =>
  api.post("/api/reports", { targetType, targetId, reason, reasonDetail });
