// AI 응답 중첩 구조 공용 파서.
//
// 실제 응답 중첩 구조:
//   Spring ApiResponse 래핑: { success, data: { bookId, stage, result: <PythonEnvelope> }, code, message }
//   원본(Postman 등)       : <PythonEnvelope>
//   PythonEnvelope         : { status, taskType, message, result: { ...작업별 payload }, ... }
//
// fairy-tale/utils/aiSettingOptions.js의 getEnvelope/getTaskResult와 동일한 패턴이다.

export const getEnvelope = (data) => data?.data?.result ?? data?.result ?? data;

export const getTaskResult = (data) => {
  const envelope = getEnvelope(data);
  return envelope?.result && typeof envelope.result === "object" ? envelope.result : envelope;
};

export const getStatus = (data) => getEnvelope(data)?.status || "";

export const isSuccessResponse = (data) => getStatus(data) === "SUCCESS";
