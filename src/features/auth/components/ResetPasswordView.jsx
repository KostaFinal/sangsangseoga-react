import React from 'react';
import { useResetPasswordState } from '../hooks/useResetPasswordState';

/**
 * 비밀번호 재설정 이메일 링크(/reset-password?token=...)의 목적지 화면.
 * 진입 시 토큰 유효성만 먼저 확인(소비 안 함) → 유효하면 새 비밀번호 입력폼 표시.
 */
export const ResetPasswordView = ({ onNavigateToLogin, onNavigateToRequestReset }) => {
  const {
    stage,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    validationErrors,
    serverError,
    passwordStrength,
    isSubmitting,
    handlePasswordSubmit,
  } = useResetPasswordState();

  const { hasLetter, hasNumber, hasSpecial, isMinLength } = passwordStrength;

  return (
    <div id="reset-password-container" className="min-h-screen bg-neutral-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative font-gowun text-neutral-900">
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] bg-neutral-900 watercolor-blob opacity-[0.03]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-neutral-400 watercolor-blob opacity-[0.05]"></div>

      <div className="w-full max-w-lg space-y-6 z-10">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-300/60 shadow-2xl space-y-6 text-left relative overflow-hidden">
          <div className="flex items-center border-b border-neutral-200 pb-4">
            <h2 className="text-xl font-literata font-bold flex items-center space-x-2">
              <span className="material-symbols-outlined text-black font-semibold text-2xl">lock_reset</span>
              <span>비밀번호 재설정</span>
            </h2>
          </div>

          {stage === 'verifying' && (
            <div className="py-8 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-neutral-300 border-t-black rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-neutral-500">링크를 확인하는 중...</p>
            </div>
          )}

          {stage === 'invalid' && (
            <div className="space-y-5 text-center py-4">
              <div className="mx-auto w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">error</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">{serverError}</p>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={onNavigateToRequestReset}
                  className="w-full py-3 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-2xl transition-all cursor-pointer"
                >
                  재설정 다시 요청하기
                </button>
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="text-xs font-semibold text-neutral-500 hover:text-black cursor-pointer"
                >
                  로그인 화면으로
                </button>
              </div>
            </div>
          )}

          {stage === 'ready' && (
            <div className="space-y-4">
              {validationErrors.length > 0 && (
                <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs leading-relaxed font-gowun space-y-1">
                  {validationErrors.map((err, idx) => (
                    <p key={idx} className="flex items-start">
                      <span className="material-symbols-outlined text-rose-500 text-sm mr-1.5 mt-0.5">error_outline</span>
                      <span>{err}</span>
                    </p>
                  ))}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider font-gowun">
                    새 비밀번호 입력
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-lg">
                      lock_open
                    </span>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white text-sm text-neutral-900 placeholder-neutral-400 rounded-2xl border border-neutral-200 focus:border-black focus:outline-none transition-all duration-200"
                      placeholder="영문+숫자+특수문자 조합 8자 이상"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider font-gowun">
                    새 비밀번호 확인
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-lg">
                      lock
                    </span>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white text-sm text-neutral-900 placeholder-neutral-400 rounded-2xl border border-neutral-200 focus:border-black focus:outline-none transition-all duration-200"
                      placeholder="동일하게 한 번 더 입력"
                    />
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl space-y-2 border border-neutral-200 text-xs">
                  <p className="font-bold text-[12px] text-neutral-500 uppercase tracking-widest font-gowun">비밀번호 요건</p>
                  <div className="grid grid-cols-2 gap-2 text-[13px] font-gowun">
                    <span className={`flex items-center ${hasLetter ? 'text-emerald-700 font-bold' : 'text-neutral-400'}`}>
                      <span className="material-symbols-outlined text-[15px] mr-1">
                        {hasLetter ? 'check_circle' : 'pending'}
                      </span>
                      영문 알파벳 포함
                    </span>
                    <span className={`flex items-center ${hasNumber ? 'text-emerald-700 font-bold' : 'text-neutral-400'}`}>
                      <span className="material-symbols-outlined text-[15px] mr-1">
                        {hasNumber ? 'check_circle' : 'pending'}
                      </span>
                      숫자(0-9) 포함
                    </span>
                    <span className={`flex items-center ${hasSpecial ? 'text-emerald-700 font-bold' : 'text-neutral-400'}`}>
                      <span className="material-symbols-outlined text-[15px] mr-1">
                        {hasSpecial ? 'check_circle' : 'pending'}
                      </span>
                      특수문자 포함
                    </span>
                    <span className={`flex items-center ${isMinLength ? 'text-emerald-700 font-bold' : 'text-neutral-400'}`}>
                      <span className="material-symbols-outlined text-[15px] mr-1">
                        {isMinLength ? 'check_circle' : 'pending'}
                      </span>
                      최소 8자 이상
                    </span>
                  </div>
                </div>

                {serverError && (
                  <div className="p-3 bg-neutral-50 text-neutral-900 border border-neutral-300/80 rounded-xl text-xs leading-relaxed text-left font-gowun">
                    {serverError}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-3.5 px-4 font-gowun font-bold text-white bg-black hover:bg-neutral-800 rounded-2xl text-xs uppercase tracking-wide cursor-pointer shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? '변경 중...' : '비밀번호 변경하기'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {stage === 'finished_success' && (
            <div className="text-center space-y-6 py-4 font-gowun">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <span className="material-symbols-outlined text-3xl font-bold text-white">done_all</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-neutral-900 font-literata">비밀번호 변경 완료</h3>
                <p className="text-xs text-neutral-500 leading-relaxed max-w-sm mx-auto">
                  새로운 비밀번호로 다시 로그인해 주세요.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={onNavigateToLogin}
                  className="w-full flex justify-center py-3.5 px-4 font-gowun font-bold text-white bg-black hover:bg-neutral-800 rounded-2xl text-xs uppercase tracking-wide cursor-pointer shadow-sm transition-all"
                >
                  로그인 화면으로 이동
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
