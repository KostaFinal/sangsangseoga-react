import React from 'react';

// 만 14세 미만 가입 시 보호자 이름/이메일을 입력받아 동의 요청 메일을 보내는 폼.
// 이메일 회원가입(SignupView)과 소셜 로그인(SocialAuthGateway) 양쪽에서 공용으로 사용.
export default function GuardianConsentRequestForm({
  guardianName,
  setGuardianName,
  guardianEmail,
  setGuardianEmail,
  onSubmit,
  onBack,
  isSubmitting,
}) {
  return (
    <form className="mt-4 space-y-4 text-left font-gowun animate-in fade-in slide-in-from-bottom-2 duration-300" onSubmit={onSubmit} noValidate>
      <div className="p-4 bg-neutral-900 text-white rounded-2xl border border-neutral-900 font-gowun">
        <span className="inline-block px-2 py-0.5 bg-neutral-800 text-neutral-100 text-[10px] font-bold rounded mb-1 font-gowun">만 14세 미만 보호자 동의</span>
        <p className="text-xs text-neutral-300 leading-relaxed font-gowun font-medium">
          만 14세 미만 어린이는 가입을 위해 보호자 동의가 필요합니다. 보호자님의 이메일로 가입 확인 메일을 보내 드립니다.
        </p>
      </div>

      <div className="space-y-3.5 font-gowun">
        <div>
          <label className="block text-xs font-bold text-neutral-600 mb-1 font-gowun">
            보호자 이름 <span className="text-neutral-900">*</span>
          </label>
          <input
            type="text"
            required
            value={guardianName}
            onChange={(e) => setGuardianName(e.target.value)}
            className="w-full px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white text-sm text-neutral-900 rounded-xl border border-neutral-200 focus:border-black focus:outline-none transition-all duration-200"
            placeholder="보호자 실명 기재"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-600 mb-1 font-gowun">
            보호자 이메일 주소 <span className="text-neutral-900">*</span>
          </label>
          <input
            type="email"
            required
            value={guardianEmail}
            onChange={(e) => setGuardianEmail(e.target.value)}
            className="w-full px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white text-sm text-neutral-900 rounded-xl border border-neutral-200 focus:border-black focus:outline-none transition-all duration-200 font-gowun"
            placeholder="guardian@email.com"
          />
          <p className="mt-1 text-[10px] text-neutral-400 font-gowun font-medium">
            * 입력하신 이메일로 가입 동의 확인 링크가 전송됩니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3 pt-2 font-gowun">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="col-span-4 py-3 px-3 font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-xs transition-colors"
          >
            이전으로
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`${onBack ? 'col-span-8' : 'col-span-12'} py-3 px-4 font-bold text-white bg-black hover:bg-neutral-900 rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {isSubmitting ? '처리 중...' : '동의 이메일 발송 & 가입요청'}
        </button>
      </div>
    </form>
  );
}
