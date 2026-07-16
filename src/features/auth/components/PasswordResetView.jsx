import React from 'react';
import { usePasswordResetState } from '../hooks/usePasswordResetState';

export const PasswordResetView = ({ onNavigateToLogin }) => {
  const {
    email, setEmail,
    stage, setStage,
    isSubmitting,
    resetToken, setResetToken,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    validationErrors,
    serverError,
    passwordStrength,
    handleRequestLink,
    handleTokenSubmit,
    handlePasswordSubmit,
  } = usePasswordResetState();

  const { hasLetter, hasNumber, hasSpecial, isMinLength } = passwordStrength;

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
            <div className="flex items-center space-x-1.5 text-[12px] font-mono tracking-widest text-neutral-400 font-bold uppercase">
              <span className={stage === 'request' || stage === 'sent_success' ? 'text-black' : ''}>STEP 01</span>
              <span>•</span>
              <span className={stage === 'new_password' ? 'text-black' : ''}>STEP 02</span>
              <span>•</span>
              <span className={stage === 'finished_success' ? 'text-black' : ''}>FINISHED</span>
            </div>
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
                    <strong className="text-neutral-800 font-semibold">{email}</strong> 메일함에서 인증 토큰을 확인해 아래에 입력해 주세요.
                  </p>
                </div>
              </div>

              <form onSubmit={handleTokenSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider font-gowun">
                    인증 토큰 입력
                  </label>
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white text-sm text-neutral-900 placeholder-neutral-400 rounded-2xl border border-neutral-200 focus:border-black focus:outline-none transition-all duration-200"
                    placeholder="메일로 받은 토큰을 붙여넣어 주세요"
                  />
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
                    {isSubmitting ? '확인 중...' : '다음 단계로'}
                  </button>
                </div>
              </form>

              <div className="flex items-center justify-between pt-1 font-gowun">
                <button
                  onClick={() => setStage('request')}
                  className="text-xs font-semibold text-[#356572] hover:underline cursor-pointer"
                >
                  ← 처음으로 돌아가 이메일 다시 적기
                </button>
                <button
                  onClick={onNavigateToLogin}
                  className="text-xs font-semibold text-neutral-500 hover:text-black cursor-pointer"
                >
                  로그인 화면으로
                </button>
              </div>
            </div>
          )}

          {stage === 'new_password' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-xl border border-emerald-200/50 flex items-start space-x-2.5 text-xs font-gowun">
                <span className="material-symbols-outlined text-emerald-600 text-lg">verified</span>
                <div>
                  <p className="font-bold">인증 토큰 확인 완료</p>
                  <p className="text-emerald-700 mt-0.5">
                    새로운 비밀번호를 설정해 주세요. 토큰이 만료되었거나 이미 사용된 경우 제출 시 오류가 표시됩니다.
                  </p>
                </div>
              </div>

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
