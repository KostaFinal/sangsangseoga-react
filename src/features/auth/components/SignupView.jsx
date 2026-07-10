import React from 'react';
import { useSignupState } from '../hooks/useSignupState';
import BirthdatePicker from './BirthdatePicker';
import GuardianConsentRequestForm from './GuardianConsentRequestForm';

export const SignupView = ({ onSuccess, onNavigateToLogin }) => {
  const {
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    nickname, setNickname,
    birthdate, setBirthdate,
    agreeTerms, setAgreeTerms,
    step, setStep,
    guardianEmail, setGuardianEmail,
    guardianName, setGuardianName,
    error,
    isSubmitting,
    showSuccessModal,
    isMinorUnder14,
    willNeedGuardianConsent,
    showTermsModal, setShowTermsModal,
    handleNextOrSubmit,
    handleGuardianSubmit,
    handleModalClose,
  } = useSignupState({ onSuccess });

  return (
    <div id="signup-container" className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-neutral-50 overflow-hidden font-sans">
      <div className="absolute bottom-[-10%] left-[-10%] w-[420px] h-[420px] bg-neutral-800 watercolor-blob opacity-[0.05]"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[380px] h-[380px] bg-neutral-400 watercolor-blob opacity-[0.08]"></div>

      <div id="signup-card" className="max-w-md w-full space-y-7 bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-neutral-200/80 z-10 relative">
        <div className="text-center">
          <h2 id="signup-title" className="text-2xl font-literata font-bold text-neutral-900 tracking-tight">
            상상서가 회원가입
          </h2>
          <p id="signup-subtitle" className="mt-1 text-xs text-neutral-500 leading-relaxed font-sans">
            아이와 부모가 함께 만들어가는 AI 그림책방
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-1.5 bg-rose-50 text-rose-800 border border-rose-200 p-3 rounded-xl text-xs leading-relaxed text-left font-sans">
            <span className="material-symbols-outlined text-rose-500 text-sm mt-0.5">error_outline</span>
            <span>{error}</span>
          </div>
        )}

        {step === 'info' ? (
          <form className="mt-4 space-y-4 text-left font-sans" onSubmit={handleNextOrSubmit} noValidate>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1">
                  이메일 주소 <span className="text-neutral-900">*</span>
                </label>
                <input
                  id="signup-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white text-sm text-neutral-900 rounded-xl border border-neutral-200 focus:border-black focus:outline-none transition-all duration-200 placeholder:text-neutral-400"
                  placeholder="name@sangsang.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1">
                  닉네임 <span className="text-neutral-900">*</span>
                </label>
                <input
                  id="signup-nickname"
                  type="text"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white text-sm text-neutral-900 rounded-xl border border-neutral-200 focus:border-black focus:outline-none transition-all duration-200"
                  placeholder="한글/영문/숫자 2~10자"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1">
                    비밀번호 <span className="text-neutral-900">*</span>
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white text-sm text-neutral-900 rounded-xl border border-neutral-200 focus:border-black focus:outline-none transition-all duration-200"
                    placeholder="영문+숫자+특수문자 8자 이상"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1">
                    비밀번호 확인 <span className="text-neutral-900">*</span>
                  </label>
                  <input
                    id="signup-confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white text-sm text-neutral-900 rounded-xl border border-neutral-200 focus:border-black focus:outline-none transition-all duration-200"
                    placeholder="비밀번호 확인"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1">
                  생년월일 <span className="text-neutral-900">*</span>
                </label>
                <BirthdatePicker value={birthdate} onChange={setBirthdate} />
                {willNeedGuardianConsent && (
                  <div className="mt-2 text-[11px] text-neutral-700 bg-neutral-100 hover:bg-neutral-200/50 border border-neutral-200/60 px-3 py-2 rounded-xl font-sans flex items-start">
                    <span className="material-symbols-outlined text-xs mr-1.5 mt-0.5 text-neutral-600">info</span>
                    <span>만 14세 미만의 어린이는 가입 시 보호자의 동의가 필요합니다.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2.5 border-t border-neutral-200 font-sans">
              <div className="flex items-center justify-between">
                <label className="flex items-start space-x-2 text-xs text-neutral-500 cursor-pointer font-sans leading-relaxed flex-1">
                  <input
                    id="signup-agree-terms"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={() => setAgreeTerms(!agreeTerms)}
                    className="mt-0.5 w-4 h-4 text-black border-neutral-300 rounded focus:ring-black accent-black"
                  />
                  <span>
                    <span className="font-extrabold text-black mr-1">[필수]</span>
                    이용약관 및 개인정보 수집·이용에 동의합니다
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowTermsModal('service')}
                  className="text-[10px] text-neutral-400 font-bold hover:text-black underline shrink-0 whitespace-nowrap ml-1.5"
                >
                  전문 보기
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                id="signup-submit-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 font-sans font-bold text-white bg-black hover:bg-neutral-900 rounded-xl text-sm shadow-md transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '처리 중...' : '다음 단계로 진행'}
              </button>
            </div>
          </form>
        ) : (
          <GuardianConsentRequestForm
            guardianName={guardianName}
            setGuardianName={setGuardianName}
            guardianEmail={guardianEmail}
            setGuardianEmail={setGuardianEmail}
            onSubmit={handleGuardianSubmit}
            onBack={() => setStep('info')}
            isSubmitting={isSubmitting}
          />
        )}

        <div className="text-center pt-2 font-sans">
          <p className="text-xs text-neutral-500 font-sans">
            이미 가입된 계정이 있으신가요? {' '}
            <button
              id="signup-to-login"
              onClick={onNavigateToLogin}
              className="font-bold text-black hover:underline"
            >
              로그인 하기
            </button>
          </p>
        </div>
      </div>

      {/* Success Modal Alert */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative border border-neutral-200 animate-in fade-in zoom-in-95 duration-200 font-sans">
            <span className="material-symbols-outlined text-black text-5xl mb-2 font-sans">
              task_alt
            </span>
            {isMinorUnder14 ? (
              <>
                <h3 className="text-lg font-bold text-neutral-900 font-literata">보호자 동의 메일 발송 완료</h3>
                <p className="text-xs text-neutral-500 mt-2 leading-relaxed font-sans font-medium">
                  보호자님의 메일(**{guardianEmail}**)로 가입 확인 동의 안내를 보냈습니다.<br />
                  보호자님께서 메일 속 링크를 확인 및 승인하시면 가입이 완료됩니다.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-neutral-900 font-literata">가입을 환영합니다!</h3>
                <div className="text-xs text-neutral-500 mt-2.5 leading-relaxed text-left font-sans space-y-2 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                  <p className="font-bold text-center border-b border-neutral-150 pb-1 text-black font-literata">🎁 가입 기념 혜택</p>
                  <p>📁 <strong>개인 서재 제공:</strong> 소중한 작품을 자유롭게 보관할 수 있는 전용 서재가 배정되었습니다.</p>
                  <p>🎫 <strong>무료 체험 1회 지급:</strong> AI 그림책(글자 최대 1,000자, 그림 최대 3장)을 만들어볼 수 있는 체험 기회가 발급되었습니다.</p>
                </div>
              </>
            )}
            <div className="mt-5 font-sans">
              <button
                onClick={handleModalClose}
                className="w-full py-2.5 bg-black hover:bg-neutral-900 text-white text-xs font-semibold rounded-xl tracking-wide transition-colors"
              >
                {isMinorUnder14 ? '로그인 화면으로 돌아가기' : '상상서가 아틀리에 열기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Specialty Terms Overlay Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 text-left shadow-2xl space-y-4 border border-neutral-200">
            <h3 className="text-sm font-bold text-neutral-900 uppercase font-mono tracking-wider">
              이용약관 및 개인정보 수집·이용 안내
            </h3>

            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-[11px] text-neutral-500 leading-relaxed font-sans max-h-60 overflow-y-auto space-y-2.5">
              <p className="font-bold text-black">1. 서비스 이용</p>
              <p>이메일과 닉네임은 로그인 및 서비스 이용을 위한 계정 식별 정보로 사용되며, 비밀번호는 암호화되어 저장됩니다.</p>
              <p className="font-bold text-black">2. 개인정보 수집 및 보관</p>
              <p>작성한 원고와 서재 데이터를 보관하고, 구독·결제 이력을 관리하는 목적으로 사용됩니다. 회원 탈퇴 시 관련 데이터는 30일의 복구 유예 기간 이후 삭제됩니다.</p>
              <p className="font-bold text-black">3. 어린이 회원 가입</p>
              <p>만 14세 미만은 법정대리인(보호자)의 이메일 동의 절차를 완료해야 정식으로 가입됩니다.</p>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setShowTermsModal(null)}
                className="px-4 py-2 bg-black text-white hover:bg-neutral-900 text-xs font-semibold rounded-xl transition-all"
              >
                규정 확인 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
