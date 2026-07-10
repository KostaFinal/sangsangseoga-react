import api from "./axios";

export const withdrawMember = (password, bookPolicy) =>
  api.delete("/api/members/me", { data: { password, bookPolicy } });

export const getViewerPreference = () => api.get("/api/members/me/viewer-preference");
export const updateViewerPreference = (viewerFontSize, viewerViewType) =>
  api.patch("/api/members/me/viewer-preference", { viewerFontSize, viewerViewType });

/** 내 프로필 상세 조회 (닉네임/프로필사진/생년월일/보호자 이메일 등) */
export const getMyInfo = () => api.get("/api/members/me");

/** 닉네임/프로필사진 저장 */
export const updateMyProfile = ({ nickname, profileImageUrl }) =>
  api.put("/api/members/me", { nickname, profileImageUrl });

/** 닉네임 중복 확인 */
export const checkNicknameAvailability = (nickname) =>
  api.get("/api/members/nickname-check", { params: { nickname } });

/** 비밀번호 변경 */
export const changePassword = (currentPassword, newPassword) =>
  api.patch("/api/members/me/password", { currentPassword, newPassword });

/** 만 14세 미만 본인 계정의 보호자 이메일 변경 (재동의 메일 발송) */
export const updateGuardianEmail = (guardianEmail) =>
  api.patch("/api/members/me/guardian-email", { guardianEmail });

/** 로그인한 보호자 기준 동의 완료된 자녀 계정 목록 조회 */
export const getConnectedMinors = () => api.get("/api/members/me/guardian/minors");

/** 자녀 계정에 대한 보호자 동의 철회 (본인 비밀번호로 검증) */
export const withdrawGuardianConsent = (minorId, password) =>
  api.post(`/api/members/me/guardian/${minorId}/withdraw`, { password });
