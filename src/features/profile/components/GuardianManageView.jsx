import React from 'react';
import {
  Trash2,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';
import { useProfileState } from '../hooks/useProfileState';

export const GuardianManageView = ({ currentUser, onNavigateHome, onUpdateProfile, onLogout }) => {
  const {
    connectedMinors,
    isConnectedMinorsLoading,

    pendingConsents,
    isPendingConsentsLoading,
    pendingConsentsError,

    showWithdrawConsentModal, setShowWithdrawConsentModal,
    selectedMinorToWithdraw,
    withdrawPasswordConfirm, setWithdrawPasswordConfirm,
    withdrawError,
    openWithdrawConsentModal,
    handleWithdrawConsentSubmit,

    handleRejectGuardianRequest,
    handleApproveGuardianRequest,
  } = useProfileState({ currentUser, onUpdateProfile, onLogout });

  return (
    <div id="guardian-manage-container" className="bg-[#FAF9FF] min-h-screen font-gowun text-[#2F2D59] w-full leading-relaxed">
      <div className="w-full max-w-7xl mx-auto px-4 py-5 sm:px-6 md:px-8">

        <button
          onClick={onNavigateHome}
          className="group mb-3 flex items-center gap-1.5 text-sm font-black text-[#514c73] hover:text-[#5139d6] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>홈으로</span>
        </button>

        <h2 className="text-xl font-black text-[#110F24] tracking-tight mb-5">보호자 동의 관리</h2>

        <div>

          {/* Children list & Pending list */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E6E2FC]/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">

            {/* Children Register List */}
            <div className="space-y-3 text-left">
              <div className="border-b border-[#E6E2FC]/40 pb-3 flex flex-wrap justify-between items-center gap-3 bg-white">
                <div>
                  <h3 className="text-sm font-black text-[#2F2D59] flex items-center gap-2">
                    <span className="w-1.5 h-3 bg-[#6B54E7] rounded-full"></span>
                    <span>연결된 자녀 목록</span>
                  </h3>
                  <p className="text-xs text-[#7C769D] mt-1 text-left">동의가 완료된 자녀 계정 목록입니다.</p>
                </div>

                <span className="bg-[#FAF9FF] text-[#6B54E7] text-xs font-black px-3 py-1.5 rounded-full border border-[#E6E2FC] shrink-0 font-gowun">
                  총 {connectedMinors.length}명 승인 완료
                </span>
              </div>

              {isConnectedMinorsLoading && (
                <div className="text-xs text-[#7C769D] font-semibold p-3">불러오는 중...</div>
              )}

              {!isConnectedMinorsLoading && connectedMinors.length === 0 && (
                <div className="text-xs text-[#7C769D] font-semibold p-3 bg-[#FAF9FF] border border-dashed border-[#E6E2FC] rounded-xl text-center">
                  연결된 자녀 계정이 없습니다.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {connectedMinors.map((minor) => (
                  <div
                    key={minor.id}
                    className="p-4 rounded-2xl border transition-all flex flex-col justify-between bg-white border-[#E6E2FC] hover:border-[#6B54E7]/40 shadow-xs"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#E6E2FC]/30 rounded-xl flex items-center justify-center text-[#6B54E7] shrink-0 font-extrabold text-xs">
                            👦
                          </div>
                          <div className="text-left">
                            <span className="text-xs font-black block text-[#2F2D59]">
                              {minor.name}
                            </span>
                            <span className="text-[11px] text-[#7C769D] font-medium font-mono">ID: {minor.id}</span>
                          </div>
                        </div>

                        <span className="text-[11px] font-black px-2.5 py-1 rounded-lg border uppercase bg-emerald-50 text-emerald-800 border-emerald-200">
                          이용 승인됨
                        </span>
                      </div>

                      <div className="text-xs space-y-1.5 font-gowun border-t border-[#E6E2FC]/40 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[#7C769D] font-semibold">자녀 아이디 (이메일)</span>
                          <span className="text-[#2F2D59] font-bold font-mono">{minor.email}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-[#7C769D] font-semibold">자녀 생년월일</span>
                          <span className="text-[#2F2D59] font-bold">{minor.birthdate}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-[#7C769D] font-semibold">총 생성 완료 소설책</span>
                          <span className="text-[#2F2D59] font-black font-mono bg-[#FAF9FF] px-2.5 py-0.5 rounded-md border border-[#E6E2FC]/50">{minor.booksCount} 권</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-[#7C769D] font-semibold">이용 중인 멤버십 요금</span>
                          <span className="text-[#6B54E7] font-extrabold">{minor.subscription}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#E6E2FC]/30 mt-3 flex justify-end font-gowun">
                      <button
                        type="button"
                        onClick={() => openWithdrawConsentModal(minor)}
                        className="px-3.5 py-2 bg-neutral-900 hover:bg-black text-white text-[12px] font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>동의 철회</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Guardian Consent Requests (실시간 대기 목록) */}
            <div className="border-t border-[#E6E2FC]/40 pt-5 space-y-3 text-left">
              <div className="border-b border-[#E6E2FC]/40 pb-3">
                <h3 className="text-sm font-black text-[#2F2D59] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <span>보호자 동의 대기 목록</span>
                </h3>
                <p className="text-xs text-[#7C769D] mt-1 text-left">
                  승인을 기다리는 자녀 가입 신청입니다.
                </p>
              </div>

              {isPendingConsentsLoading && (
                <div className="text-xs text-[#7C769D] font-semibold p-3">불러오는 중...</div>
              )}

              {!isPendingConsentsLoading && pendingConsentsError && (
                <div className="text-xs text-rose-600 font-bold p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  {pendingConsentsError}
                </div>
              )}

              {!isPendingConsentsLoading && !pendingConsentsError && pendingConsents.length === 0 && (
                <div className="text-xs text-[#7C769D] font-semibold p-3 bg-[#FAF9FF] border border-dashed border-[#E6E2FC] rounded-xl text-center">
                  현재 대기 중인 동의 요청이 없습니다.
                </div>
              )}

              {pendingConsents.map((consent) => (
                <div
                  key={consent.consentId}
                  className="bg-[#FAF9FF] p-4 border border-[#E6E2FC] rounded-2xl space-y-3 font-gowun text-left relative overflow-hidden shadow-xs"
                >
                  <div className="absolute top-0 right-0 bg-[#6B54E7] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">
                    승인 대기 중
                  </div>

                  <div className="flex flex-wrap justify-between items-center text-xs border-b border-[#E6E2FC] pb-2.5 bg-white/50 p-2.5 rounded-xl gap-2">
                    <span className="font-extrabold text-[#2F2D59]">{consent.nickname} ({consent.email})</span>
                    <span className="text-[#7C769D] font-gowun">만료: {consent.expiresAt}</span>
                  </div>

                  <div className="text-xs text-[#2F2D59] space-y-1 pl-1 leading-relaxed">
                    <p>· <strong>요청 시각:</strong> {consent.requestedAt}</p>
                    <p>· <strong>자녀 생년월일:</strong> {consent.birthDate}</p>
                  </div>

                  <div className="pt-3 border-t border-[#E6E2FC] flex justify-end gap-3 text-xs font-gowun">
                    <button
                      type="button"
                      onClick={() => handleRejectGuardianRequest(consent)}
                      className="px-4 py-2 bg-neutral-150 hover:bg-neutral-200 text-[#7C769D] font-bold rounded-xl cursor-pointer transition-all active:scale-95"
                    >
                      동의 반려
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveGuardianRequest(consent)}
                      className="px-4 py-2 bg-[#6B54E7] text-white hover:bg-[#5b45d6] font-black rounded-xl cursor-pointer shadow-md shadow-[#6B54E7]/15 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      동의 승인
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* 자녀 이용동의 철회 경고 팝업 */}
      {showWithdrawConsentModal && selectedMinorToWithdraw && (
        <div className="fixed inset-0 bg-[#110F24]/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <form
            onSubmit={handleWithdrawConsentSubmit}
            className="bg-white max-w-md w-full rounded-3xl p-5 sm:p-6 text-left shadow-2xl space-y-4 border border-[#E6E2FC] relative animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center gap-2 text-rose-600 font-extrabold text-xs uppercase font-gowun">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>동의 철회 확인</span>
            </div>

            <h3 className="text-base font-black text-[#2F2D59]">
              {selectedMinorToWithdraw.name}의 계정 동의를 철회하시겠습니까?
            </h3>

            <div className="text-xs text-[#7C769D] leading-relaxed font-gowun bg-[#FAF9FF] p-4 rounded-2xl border border-[#E6E2FC] space-y-2">
              <p className="font-black text-rose-600">철회 시 다음과 같이 처리됩니다:</p>
              <p>1. 자녀 계정은 즉시 로그아웃되고 <strong className="text-[#2F2D59]">정지</strong> 상태로 전환됩니다.</p>
              <p>2. 작성 중이던 작품은 잠금 처리되어 접근할 수 없습니다.</p>
              <p>3. 진행 중이던 유료 구독도 일시 중지됩니다.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-[#7C769D]">보호자 본인확인 비밀번호</label>
              <input
                type="password"
                required
                value={withdrawPasswordConfirm}
                onChange={(e) => setWithdrawPasswordConfirm(e.target.value)}
                placeholder="비밀번호를 입력하여 검증하세요"
                className="w-full px-4 py-2.5 bg-[#FAF9FF] border border-[#E6E2FC] text-xs rounded-xl focus:outline-none transition-all placeholder-[#B9B0DC]"
              />
            </div>

            {withdrawError && (
              <p className="text-xs font-bold text-rose-600">· {withdrawError}</p>
            )}

            <div className="flex gap-2.5 pt-1 text-xs font-gowun">
              <button
                type="button"
                onClick={() => setShowWithdrawConsentModal(false)}
                className="flex-1 py-2.5 bg-[#FAF9FF] hover:bg-[#E6E2FC]/30 text-[#6B54E7] border border-[#E6E2FC]/60 font-bold rounded-xl transition-all cursor-pointer text-center"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl transition-all shadow-md shadow-rose-600/10 cursor-pointer text-center"
              >
                철회하기
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
