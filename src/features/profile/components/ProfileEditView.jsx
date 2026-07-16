import React from 'react';
import {
  User,
  Shield,
  Trash2,
  AlertTriangle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Camera,
  Key,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { useProfileState } from '../hooks/useProfileState';

export const ProfileEditView = ({ currentUser, onNavigateHome, onUpdateProfile, onLogout }) => {
  const {
    nickname,
    isNicknameChecked,
    nicknameCheckMsg,
    profileImage, setProfileImage,
    introduction, setIntroduction,
    handleNicknameChange,
    handleCheckNicknameDuplicate,
    handleProfileImageFileChange,

    currentPassword, setCurrentPassword,
    newPassword, setNewPassword,
    confirmNewPassword, setConfirmNewPassword,
    showPwText, setShowPwText,

    isMinor,
    guardianEmail, setGuardianEmail,
    guardianEmailEditMode, setGuardianEmailEditMode,

    showWithdrawModal, setShowWithdrawModal,
    withdrawConfirmPw, setWithdrawConfirmPw,
    agreeWithdrawTerms, setAgreeWithdrawTerms,
    withdrawErrorMsg,
    isWithdrawing,
    openWithdrawModal,
    handleWithdrawMembershipSubmit,

    toastMessage,
    handleSaveBasicInfo,
    handleSavePassword,

    avatarPresets,
  } = useProfileState({ currentUser, onUpdateProfile, onLogout });

  return (
    <div id="profile-edit-container" className="bg-[#FAF9FF] min-h-screen font-gowun text-[#2F2D59] w-full leading-relaxed">

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#110F24] border border-[#6B54E7]/40 text-white px-5 py-3.5 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <span className="text-white/95">{toastMessage}</span>
        </div>
      )}

      {/* 2. Unified Grid Layout Container */}
      <div className="w-full max-w-7xl mx-auto px-4 py-5 sm:px-6 md:px-8">

        <button
          onClick={onNavigateHome}
          className="group mb-3 flex items-center gap-1.5 text-sm font-black text-[#514c73] hover:text-[#5139d6] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>홈으로</span>
        </button>

        <h2 className="text-xl font-black text-[#110F24] tracking-tight mb-4">내 정보 수정</h2>

        <div className="w-full space-y-5">
          <form onSubmit={handleSaveBasicInfo} className="w-full">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E6E2FC]/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-5">

                {/* 1. Profile photo (left) + Nickname (right), balanced side by side */}
                <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 pb-1">

                  {/* Profile photo */}
                  <div className="flex flex-col items-center sm:w-36 shrink-0 text-center gap-2.5">
                    <div className="relative group">
                      <img
                        src={profileImage}
                        alt="Current Avatar"
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md bg-white transition-all group-hover:scale-105"
                      />

                      <label className="absolute bottom-0 right-0 p-1.5 bg-[#6B54E7] hover:bg-[#5b45d6] border-2 border-white rounded-full text-white cursor-pointer transition-all shadow-md">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProfileImageFileChange}
                        />
                        <Camera className="w-3.5 h-3.5" />
                      </label>
                    </div>

                    <div className="flex justify-center gap-1.5">
                      {avatarPresets.map((imgUrl, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setProfileImage(imgUrl);
                          }}
                          className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                            profileImage === imgUrl
                              ? 'border-[#6B54E7] scale-110 shadow-md ring-1 ring-[#6B54E7]/30'
                              : 'border-white opacity-60 hover:opacity-100 hover:scale-105'
                          }`}
                        >
                          <img src={imgUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="preset" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Nickname modification with duplicate checker */}
                  <div className="flex-1 space-y-2 text-left min-w-0">
                    <div>
                      <h3 className="text-sm font-black text-[#2F2D59] flex items-center gap-2">
                        <span className="w-1.5 h-3 bg-[#6B54E7] rounded-full"></span>
                        <span>필명 설정</span>
                      </h3>
                      <p className="text-xs text-[#7C769D] mt-1 text-left">책 표지에 표시될 작가 이름입니다.</p>
                    </div>

                    <label className="block text-xs font-extrabold text-[#7C769D] uppercase tracking-wider pt-1">
                      필명 <span className="text-rose-500">*</span>
                    </label>

                    <div className="flex gap-2">
                      <div className="relative flex-grow">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7C769D]">
                          <User className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          value={nickname}
                          onChange={(e) => handleNicknameChange(e.target.value)}
                          className="w-full pl-11 pr-4 py-2.5 bg-[#FAF9FF] hover:bg-neutral-100/50 focus:bg-white text-xs font-semibold border border-[#E6E2FC] focus:border-[#6B54E7] rounded-xl focus:outline-none transition-all placeholder-[#B9B0DC]"
                          placeholder="사용할 필명을 입력하세요"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleCheckNicknameDuplicate}
                        className="px-4 py-2.5 bg-[#6B54E7] hover:bg-[#5b45d6] text-white rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer shadow-md shadow-[#6B54E7]/10 shrink-0"
                      >
                        중복 확인
                      </button>
                    </div>

                    <div className={`mt-1.5 flex items-center gap-1.5 text-xs text-left ${nicknameCheckMsg.isError ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {nicknameCheckMsg.isError ? (
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                      <span className="font-bold">{nicknameCheckMsg.text}</span>
                    </div>

                    {/* 자기소개 */}
                    <div className="pt-2">
                      <label className="block text-xs font-extrabold text-[#7C769D] uppercase tracking-wider">
                        자기소개
                      </label>
                      <textarea
                        value={introduction}
                        onChange={(e) => setIntroduction(e.target.value)}
                        rows={4}
                        maxLength={300}
                        placeholder="독자들에게 보여질 간단한 소개를 작성해보세요."
                        className="mt-1.5 w-full px-4 py-2.5 bg-[#FAF9FF] hover:bg-neutral-100/50 focus:bg-white text-xs font-semibold border border-[#E6E2FC] focus:border-[#6B54E7] rounded-xl focus:outline-none transition-all placeholder-[#B9B0DC] resize-none"
                      />
                      <div className="text-right text-[12px] text-[#7C769D] mt-1">{introduction.length}/300</div>
                    </div>
                  </div>
                </div>

                {/* 2. Minor-specific Parent Email setup section */}
                {isMinor && (
                  <div className="border-t border-[#E6E2FC]/40 pt-5 space-y-3 text-left">
                    <div className="border-b border-[#E6E2FC]/40 pb-3 flex justify-between items-center flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[12px] font-black tracking-tight rounded-md border border-rose-200">
                          만 14세 미만
                        </span>
                        <h3 className="text-sm font-black text-[#2F2D59]">보호자 이메일</h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => setGuardianEmailEditMode(!guardianEmailEditMode)}
                        className="text-xs font-bold text-[#6B54E7] hover:text-[#5b45d6] hover:underline cursor-pointer"
                      >
                        {guardianEmailEditMode ? '취소' : '이메일 변경'}
                      </button>
                    </div>

                    <div className="bg-rose-50/40 p-4 rounded-2xl border border-rose-100 text-xs text-left space-y-3">
                      <div className="flex items-start gap-2.5">
                        <Shield className="text-rose-500 w-5 h-5 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="font-bold text-rose-950">보호자 동의 필요</p>
                          <p className="text-[13px] text-rose-800 leading-normal">
                            만 14세 미만 회원은 보호자 이메일 등록이 필요합니다.
                          </p>
                        </div>
                      </div>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500">
                          <Mail className="w-4 h-4" />
                        </span>
                        <input
                          type="email"
                          disabled={!guardianEmailEditMode}
                          value={guardianEmail}
                          onChange={(e) => setGuardianEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-2.5 bg-white disabled:bg-rose-100/10 text-xs font-black border border-rose-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl focus:outline-none transition-all text-neutral-900"
                        />
                      </div>

                      {guardianEmailEditMode && (
                        <div className="bg-white/80 p-3 rounded-xl border border-rose-200/50 text-[13px] text-rose-700 space-y-1">
                          <p>이메일을 변경하면 새 주소로 동의 메일이 재발송됩니다. 7일 내 승인하지 않으면 계정이 일시 제한됩니다.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Save button + 회원 탈퇴 (기본 정보 폼 전용) */}
                <div className="pt-5 border-t border-[#E6E2FC]/40 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <button
                    type="button"
                    onClick={openWithdrawModal}
                    className="inline-flex items-center gap-1.5 text-xs text-[#7C769D] hover:text-rose-600 font-extrabold transition-colors cursor-pointer hover:underline"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>회원 탈퇴</span>
                  </button>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-[#5179E6] to-[#6B54E7] hover:opacity-95 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-[#6B54E7]/10 cursor-pointer"
                  >
                    기본 정보 저장
                  </button>
                </div>

            </div>
          </form>

          {/* FORM 2: 비밀번호 변경 — 기본 정보와 독립적으로 저장 */}
          <form onSubmit={handleSavePassword} className="w-full">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E6E2FC]/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-3 text-left">
              <div className="border-b border-[#E6E2FC]/40 pb-3 flex flex-wrap justify-between items-center gap-2">
                <div>
                  <h3 className="text-sm font-black text-[#2F2D59] flex items-center gap-2">
                    <span className="w-1.5 h-3 bg-[#6B54E7] rounded-full"></span>
                    <span>비밀번호 변경</span>
                  </h3>
                  <p className="text-xs text-[#7C769D] mt-1 text-left">정기적으로 비밀번호를 변경해 계정을 안전하게 보호하세요.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPwText(!showPwText)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FAF9FF] hover:bg-[#E6E2FC]/20 border border-[#E6E2FC] rounded-lg text-[13px] font-bold text-[#7C769D] hover:text-[#2F2D59] transition-all cursor-pointer"
                >
                  {showPwText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPwText ? '숨기기' : '보기'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-[#7C769D]">
                    현재 비밀번호 <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C769D]"><Lock className="w-3.5 h-3.5" /></span>
                    <input
                      type={showPwText ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-[#FAF9FF] text-xs font-semibold border border-[#E6E2FC] focus:border-[#6B54E7] rounded-xl focus:outline-none transition-all placeholder-[#B9B0DC]"
                      placeholder="현재 비밀번호"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-[#7C769D]">새 비밀번호</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C769D]"><Key className="w-3.5 h-3.5" /></span>
                    <input
                      type={showPwText ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-[#FAF9FF] text-xs font-semibold border border-[#E6E2FC] focus:border-[#6B54E7] rounded-xl focus:outline-none transition-all placeholder-[#B9B0DC]"
                      placeholder="새 비밀번호"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-extrabold text-[#7C769D]">새 비밀번호 확인</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C769D]"><Key className="w-3.5 h-3.5" /></span>
                    <input
                      type={showPwText ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-[#FAF9FF] text-xs font-semibold border border-[#E6E2FC] focus:border-[#6B54E7] rounded-xl focus:outline-none transition-all placeholder-[#B9B0DC]"
                      placeholder="새 비밀번호 확인"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#FAF9FF] rounded-xl p-3 border border-[#E6E2FC]/60 text-[13px] text-[#7C769D] flex items-start gap-2 mt-2 text-left">
                <ShieldAlert className="w-4 h-4 text-[#6B54E7] shrink-0 mt-0.5" />
                <p>
                  비밀번호를 변경하려면 현재 비밀번호를 함께 입력해 주세요.
                </p>
              </div>

              <div className="pt-4 border-t border-[#E6E2FC]/40 flex justify-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-[#5179E6] to-[#6B54E7] hover:opacity-95 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-[#6B54E7]/10 cursor-pointer"
                >
                  비밀번호 변경
                </button>
              </div>
            </div>
          </form>
          </div>
      </div>

      {/* MODAL 2: MEMBERSHIP WITHDRAWAL (회원 탈퇴 상세 가공 모달) */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-[#110F24]/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-250">
          <form
            onSubmit={handleWithdrawMembershipSubmit}
            className="bg-white max-w-lg w-full rounded-3xl p-5 sm:p-6 text-left shadow-2xl space-y-4 border border-[#E6E2FC] overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center gap-2 text-rose-600 font-extrabold text-xs uppercase font-gowun">
              <ShieldAlert className="w-5 h-5 text-rose-600 animate-pulse shrink-0" />
              <span>회원 탈퇴 확인</span>
            </div>

            <h3 className="text-base font-black text-[#2F2D59]">
              정말 회원 탈퇴를 진행하시겠습니까?
            </h3>

            <div className="text-xs text-[#7C769D] leading-relaxed font-gowun bg-[#FAF9FF] p-4 rounded-2xl border border-[#E6E2FC] space-y-3">
              <h4 className="font-black text-rose-600">탈퇴 시 다음과 같이 처리됩니다:</h4>

              <div className="space-y-1.5 pl-1 leading-relaxed text-left">
                <p><strong>1. 계정 비활성화:</strong> 즉시 로그아웃되며, 탈퇴 상태로 전환되어 재로그인이 제한됩니다.</p>
                <p><strong>2. 데이터 보존:</strong> 작성하신 책·댓글 등 데이터는 삭제되지 않고 그대로 보존됩니다. 재가입이나 계정 복구가 필요하면 고객센터로 문의해 주세요.</p>
              </div>
            </div>

            {/* Checkbox confirmation */}
            <div className="font-gowun text-left">
              <label className="flex items-start gap-3 text-xs text-[#2F2D59] cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeWithdrawTerms}
                  onChange={(e) => setAgreeWithdrawTerms(e.target.checked)}
                  className="mt-1 accent-[#6B54E7] rounded border-[#E6E2FC] shrink-0"
                />
                <span className="font-bold text-[#2F2D59] leading-relaxed">
                  위 안내 사항을 모두 확인했으며 이에 동의합니다.
                </span>
              </label>
            </div>

            {/* Password input for withdrawal safety verification */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-extrabold text-[#7C769D]">비밀번호 확인 <span className="text-rose-500">*</span></label>
              <input
                type="password"
                required
                value={withdrawConfirmPw}
                onChange={(e) => setWithdrawConfirmPw(e.target.value)}
                placeholder="현재 비밀번호를 입력하세요"
                className="w-full px-4 py-2.5 bg-[#FAF9FF] border border-[#E6E2FC] text-xs font-semibold rounded-xl focus:outline-none transition-all placeholder-[#B9B0DC]"
              />
            </div>

            {withdrawErrorMsg && (
              <p className="text-xs font-bold text-rose-600 leading-normal text-left">· {withdrawErrorMsg}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 text-xs font-gowun">
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                className="w-full py-2.5 bg-[#FAF9FF] hover:bg-[#E6E2FC]/30 text-[#6B54E7] border border-[#E6E2FC]/60 font-black rounded-xl transition-all shadow-xs text-center cursor-pointer"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isWithdrawing}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl transition-all shadow-md shadow-rose-600/15 text-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isWithdrawing ? '처리 중...' : '탈퇴하기'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
