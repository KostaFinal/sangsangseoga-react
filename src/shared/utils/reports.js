import { submitReport as apiSubmitReport, getMyReportedTargetIds as apiGetMyReportedTargetIds } from "@/src/api/reportApi";

// targetType: "book" | "comment" | "author" (호출부는 소문자로 넘기고 여기서 대문자로 변환)
// reason: 이미 백엔드 enum 값(SPAM/ABUSE/SEXUAL/OTHER)으로 넘어옴 (ReportModal 참고)
export async function submitReport({ targetType, targetId, reason, detail }) {
  await apiSubmitReport({
    targetType: targetType.toUpperCase(),
    targetId,
    reason,
    reasonDetail: detail,
  });
}

// 내가 신고한 대상 ID 목록 조회 (targetType: "book" | "comment" | "author")
export async function getReportedIds(targetType) {
  const res = await apiGetMyReportedTargetIds(targetType.toUpperCase());
  return res.data?.data || [];
}
