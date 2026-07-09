import React from 'react';
import { ShieldAlert, CornerDownRight } from 'lucide-react';
import { useLoginState } from '../hooks/useLoginState';

export const LoginView = ({
  onSuccess,
  onNavigateToSignup,
  onQuickNavigate,
  onNavigateToPasswordReset,
  onNavigateToSocial
}) => {
  const {
    isAdminMode,
    enterAdminMode,
    exitAdminMode,
    email,
    setEmail,
    password,
    setPassword,
    adminEmail,
    setAdminEmail,
    adminPassword,
    setAdminPassword,
    rememberMe,
    setRememberMe,
    error,
    handleUserSubmit,
    handleAdminSubmit,
  } = useLoginState({ onSuccess });

  return (
    <div id="login-container" className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-neutral-50 overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>

      {isAdminMode ? (
        <div id="admin-login-card" className="max-w-md w-full space-y-8 bg-white rounded-3xl p-8 sm:p-10 z-10 relative border border-neutral-200/80 shadow-2xl shadow-neutral-950/[0.03]">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black text-white font-literata text-2xl mb-4 shadow-md font-extrabold">
              관리
            </div>
            <h2 className="text-3xl font-literata font-bold text-neutral-900 tracking-tight">
              상상서가 관리자
            </h2>
            <p className="mt-2 text-sm text-neutral-500 font-sans leading-relaxed">
              사전에 승인된 관리 계정만 로그인할 수 있습니다.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-1.5 bg-rose-50 text-rose-800 border border-rose-200 p-3 rounded-xl text-xs leading-relaxed text-left font-sans">
              <span className="material-symbols-outlined text-rose-500 text-sm mt-0.5">error_outline</span>
              <span>{error}</span>
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleAdminSubmit} noValidate>
            <div className="space-y-4 rounded-md text-left">
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider font-sans">
                  관리자 이메일 주소
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-lg">
                    mail
                  </span>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white text-sm text-neutral-900 placeholder-neutral-400 rounded-2xl border border-neutral-200 focus:border-black focus:outline-none transition-all duration-200"
                    placeholder="admin@sangsang.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider font-sans">
                  비밀번호
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-lg">
                    lock
                  </span>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white text-sm text-neutral-900 placeholder-neutral-400 rounded-2xl border border-neutral-200 focus:border-black focus:outline-none transition-all duration-200"
                    placeholder="비밀번호 입력"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                id="admin-login-submit-btn"
                type="submit"
                className="group relative w-full flex justify-center py-3.5 px-4 font-sans font-bold text-white bg-black hover:bg-neutral-900 rounded-2xl text-sm shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
              >
                <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                  <span className="material-symbols-outlined text-white text-lg group-hover:translate-x-0.5 transition-transform">
                    arrow_forward
                  </span>
                </span>
                로그인하기
              </button>
            </div>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={exitAdminMode}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-black transition-colors mx-auto"
            >
              <CornerDownRight className="w-3.5 h-3.5" /> 일반 작가 로그인으로 돌아가기
            </button>
          </div>
        </div>
      ) : (
        <div id="login-card" className="max-w-md w-full space-y-8 bg-white rounded-3xl p-8 sm:p-10 z-10 relative border border-neutral-200/80 shadow-2xl shadow-neutral-950/[0.03]">
              <div className="text-right">
                <button
                  onClick={enterAdminMode}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-black hover:text-white text-neutral-600 text-[10px] font-sans font-bold transition-all border border-neutral-200"
                >
                  <ShieldAlert className="w-3 h-3" /> 관리자 로그인
                </button>
              </div>

              <div className="text-center">
                <h2 id="login-title" className="text-3xl font-literata font-bold text-neutral-900 tracking-tight">
                  상상서가
                </h2>
                <p id="login-subtitle" className="mt-2 text-sm text-neutral-500 font-sans leading-relaxed">
                  아이들을 위한 따뜻하고 창의적인 AI 그림책 창작방
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-1.5 bg-rose-50 text-rose-800 border border-rose-200 p-3 rounded-xl text-xs leading-relaxed text-left font-sans">
                  <span className="material-symbols-outlined text-rose-500 text-sm mt-0.5">error_outline</span>
                  <span>{error}</span>
                </div>
              )}

              <form className="mt-6 space-y-4" onSubmit={handleUserSubmit} noValidate>
                <div className="space-y-4 rounded-md text-left">
                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider font-sans">
                      이메일 주소
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-lg">
                        mail
                      </span>
                      <input
                        id="login-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white text-sm text-neutral-900 placeholder-neutral-400 rounded-2xl border border-neutral-200 focus:border-black focus:outline-none transition-all duration-200"
                        placeholder="name@sangsang.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider font-sans">
                      비밀번호
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-lg">
                        lock
                      </span>
                      <input
                        id="login-password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white text-sm text-neutral-900 placeholder-neutral-400 rounded-2xl border border-neutral-200 focus:border-black focus:outline-none transition-all duration-200"
                        placeholder="비밀번호 입력"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                  <label className="flex items-center space-x-2 text-neutral-500 cursor-pointer">
                    <input
                      id="login-remember"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className="w-4 h-4 rounded text-neutral-900 border-neutral-300 focus:ring-black accent-black"
                    />
                    <span className="font-sans text-xs text-neutral-600">로그인 유지</span>
                  </label>

                  <button
                    type="button"
                    className="text-xs font-semibold text-neutral-700 hover:text-black transition-colors"
                    onClick={onNavigateToPasswordReset}
                  >
                    비밀번호 재설정
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    id="login-submit-btn"
                    type="submit"
                    className="group relative w-full flex justify-center py-3.5 px-4 font-sans font-bold text-white bg-black hover:bg-neutral-900 rounded-2xl text-sm shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
                  >
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                      <span className="material-symbols-outlined text-white text-lg group-hover:translate-x-0.5 transition-transform">
                        arrow_forward
                      </span>
                    </span>
                    로그인하기
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-neutral-200"></div>
                  <span className="flex-shrink mx-4 text-xs font-sans text-neutral-400 text-center">
                    소셜 간편 로그인
                  </span>
                  <div className="flex-grow border-t border-neutral-200"></div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
                  <button
                    type="button"
                    onClick={() => onNavigateToSocial('kakao')}
                    className="flex flex-col items-center justify-center py-2 px-1 rounded-xl border border-neutral-200/80 bg-[#FEE500] hover:bg-[#ECD300] text-[#191919] font-sans font-semibold cursor-pointer transition-all shadow-xs"
                  >
                    <span className="w-2 h-2 bg-amber-950 rounded-full mb-1"></span>
                    카카오
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateToSocial('naver')}
                    className="flex flex-col items-center justify-center py-2 px-1 rounded-xl border border-[#03C75A]/20 bg-[#03C75A] hover:bg-[#02A64B] text-white font-sans font-semibold cursor-pointer transition-all shadow-xs"
                  >
                    <span className="w-2 h-2 bg-white rounded-full mb-1"></span>
                    네이버
                  </button>
                </div>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-neutral-500 font-sans">
                  처음 방문하셨나요? {' '}
                  <button
                    id="login-to-signup"
                    onClick={onNavigateToSignup}
                    className="font-bold text-black hover:underline"
                  >
                    회원가입 하기
                  </button>
                </p>
              </div>
        </div>
      )}
    </div>
  );
};
