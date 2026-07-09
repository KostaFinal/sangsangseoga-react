import React from 'react';
import { useSocialAuthState } from '../hooks/useSocialAuthState';
import BirthdatePicker from './BirthdatePicker';
import GuardianConsentRequestForm from './GuardianConsentRequestForm';

const PROVIDER_LABEL = { kakao: '카카오', naver: '네이버' };

export const SocialAuthGateway = ({ selectedProvider, onNavigateToLogin, onSuccess }) => {
  const {
    phase,
    error,
    isSubmitting,
    nickname, setNickname,
    birthdate, setBirthdate,
    guardianName, setGuardianName,
    guardianEmail, setGuardianEmail,
    handleBirthdateSubmit,
    handleGuardianSubmit,
    handleGuardianSentDone,
  } = useSocialAuthState({ selectedProvider, onSuccess });

  const providerLabel = PROVIDER_LABEL[selectedProvider] || selectedProvider;

  return (
    <div id="social-auth-container" className="min-h-screen bg-neutral-100 flex items-center justify-center py-10 px-4 sm:px-6 relative font-sans text-neutral-900 overflow-hidden">
      <div className="absolute top-10 left-10 w-80 h-80 bg-neutral-950 rounded-full blur-[120px] opacity-[0.04]"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-neutral-300 rounded-full blur-[140px] opacity-[0.08]"></div>

      <div className="w-full max-w-md z-10 space-y-6">
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl overflow-hidden p-6 sm:p-8">
          {(phase === 'redirecting' || phase === 'processing') && (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-full border-2 border-black border-t-transparent animate-spin mx-auto"></div>
              <h3 className="text-base font-bold font-literata">
                {phase === 'redirecting' ? `${providerLabel} 로그인 페이지로 이동 중입니다` : '로그인 정보를 확인하고 있습니다'}
              </h3>
              <p className="text-xs text-neutral-500">잠시만 기다려 주세요.</p>
            </div>
          )}

          {phase === 'error' && (
            <div className="text-center py-8 space-y-4">
              <div className="flex items-start gap-1.5 bg-rose-50 text-rose-800 border border-rose-200 p-3 rounded-xl text-xs leading-relaxed text-left">
                <span className="material-symbols-outlined text-rose-500 text-sm mt-0.5">error_outline</span>
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="w-full py-3 bg-black hover:bg-neutral-900 text-white text-xs font-bold rounded-2xl transition-colors cursor-pointer"
              >
                로그인 화면으로 돌아가기
              </button>
            </div>
          )}

          {phase === 'need-birthdate' && (
            <form className="space-y-4 text-left" onSubmit={handleBirthdateSubmit} noValidate>
              <div className="text-center pb-2">
                <h3 className="text-base font-bold font-literata">{providerLabel} 계정으로 가입을 완료합니다</h3>
                <p className="text-xs text-neutral-500 mt-1">닉네임과 생년월일을 확인해 주세요.</p>
              </div>

              {error && (
                <div className="flex items-start gap-1.5 bg-rose-50 text-rose-800 border border-rose-200 p-3 rounded-xl text-xs leading-relaxed">
                  <span className="material-symbols-outlined text-rose-500 text-sm mt-0.5">error_outline</span>
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1">닉네임 <span className="text-neutral-900">*</span></label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white text-sm text-neutral-900 rounded-xl border border-neutral-200 focus:border-black focus:outline-none transition-all duration-200"
                  placeholder="한글/영문/숫자 2~10자"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1">생년월일 <span className="text-neutral-900">*</span></label>
                <BirthdatePicker value={birthdate} onChange={setBirthdate} />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-black hover:bg-neutral-900 text-white text-xs font-bold rounded-2xl transition-colors cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? '처리 중...' : '가입 완료'}
              </button>
            </form>
          )}

          {phase === 'need-guardian-consent' && (
            <>
              {error && (
                <div className="flex items-start gap-1.5 bg-rose-50 text-rose-800 border border-rose-200 p-3 rounded-xl text-xs leading-relaxed mb-4">
                  <span className="material-symbols-outlined text-rose-500 text-sm mt-0.5">error_outline</span>
                  <span>{error}</span>
                </div>
              )}
              <GuardianConsentRequestForm
                guardianName={guardianName}
                setGuardianName={setGuardianName}
                guardianEmail={guardianEmail}
                setGuardianEmail={setGuardianEmail}
                onSubmit={handleGuardianSubmit}
                isSubmitting={isSubmitting}
              />
            </>
          )}

          {phase === 'guardian-sent' && (
            <div className="text-center py-6 space-y-4">
              <span className="material-symbols-outlined text-black text-4xl">mark_email_read</span>
              <h3 className="text-base font-bold font-literata">보호자 동의 메일 발송 완료</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                보호자님의 메일로 가입 확인 동의 안내를 보냈습니다.<br />
                보호자님께서 메일 속 링크를 확인 및 승인하시면 가입이 완료됩니다.
              </p>
              <button
                type="button"
                onClick={handleGuardianSentDone}
                className="w-full py-3 bg-black hover:bg-neutral-900 text-white text-xs font-bold rounded-2xl transition-colors cursor-pointer"
              >
                로그인 화면으로 돌아가기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
