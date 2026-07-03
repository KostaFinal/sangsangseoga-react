import { submitReport as apiSubmitReport } from "@/src/api/reportApi";

// targetType: "BOOK" | "COMMENT" | "AUTHOR" (백엔드 enum 대문자)
export async function submitReport({ targetType, targetId, reason, detail }) {
  await apiSubmitReport({
    targetType: targetType.toUpperCase(),
    targetId,
    reason: reason.toUpperCase(),
    reasonDetail: detail,
  });
}

// 신고 여부 확인 - 백엔드 연동 전 임시로 false 반환 (나중에 API 추가)
export function isReported(targetType, targetId) {
  return false;
}
