import React from 'react';
import { usePasswordResetState } from '../hooks/usePasswordResetState';

export const PasswordResetView = ({ onNavigateToLogin }) => {
  const {
    email, setEmail,
    stage,
    isSubmitting,
    serverError,
    handleRequestLink,
  } = usePasswordResetState();

  return (
    <div id="password-reset-container" className="min-h-screen bg-neutral-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative font-gowun text-neutral-900">
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] bg-neutral-900 watercolor-blob opacity-[0.03]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-neutral-400 watercolor-blob opacity-[0.05]"></div>

      <div className="w-full max-w-lg space-y-6 z-10">
        <div id="reset-card" className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-300/60 shadow-2xl space-y-6 text-left relative overflow-hidden">

          <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
            <h2 className="text-xl font-literata font-bold flex items-center space-x-2">
              <span className="material-symbols-outlined text-black font-semibold text-2xl">lock_reset</span>
              <span>비밀번호 재설정</span>
            </h2>
          </div>

          {stage === 'request' && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-500 leading-relaxed font-gowun">
                가입하신 이메일 주소를 입력하시면 비밀번호 재설정 메일을 보내드립니다.
              </p>

              <form onSubmit={handleRequestLink} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider font-gowun">
                    가입된 이메일 주소
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-lg">
                      mail
                    </span>
                    <input
                      id="reset-request-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white text-sm text-neutral-900 placeholder-neutral-400 rounded-2xl border border-neutral-200 focus:border-black focus:outline-none transition-all duration-200"
                      placeholder="writer@sangsang.com"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-3.5 px-4 font-gowun font-bold text-white bg-black hover:bg-neutral-800 rounded-2xl text-xs uppercase tracking-wide cursor-pointer shadow-sm transition-all active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '발송 중...' : '인증 메일 발송'}
                  </button>
                </div>
              </form>

              {serverError && (
                <div className="p-3 bg-neutral-50 text-neutral-900 border border-neutral-300/80 rounded-xl text-xs leading-relaxed text-left font-gowun">
                  {serverError}
                </div>
              )}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="text-xs font-semibold text-neutral-500 hover:text-black hover:underline transition-colors cursor-pointer"
                >
                  기존 비밀번호로 로그인하러 가기
                </button>
              </div>
            </div>
          )}

          {stage === 'sent_success' && (
            <div className="space-y-5">
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-start space-x-3">
                <span className="material-symbols-outlined text-emerald-600 text-2xl mt-0.5">check_circle</span>
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-neutral-900">비밀번호 재설정 메일이 전송되었습니다</p>
                  <p className="text-neutral-500 leading-normal">
                    <strong className="text-neutral-800 font-semibold">{email}</strong> 메일함에서 링크를 클릭해 비밀번호를 재설정해 주세요.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 font-gowun">
                <button
                  onClick={onNavigateToLogin}
                  className="text-xs font-semibold text-neutral-500 hover:text-black cursor-pointer"
                >
                  로그인 화면으로
                </button>
              </div>
            </div>
          )}

        </div>

        <div className="text-center text-[12px] text-neutral-400 font-gowun">
          <p>© 2026 상상서가. All rights reserved.</p>
        </div>

      </div>
    </div>
  );
};
