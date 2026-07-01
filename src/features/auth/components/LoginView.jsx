import React, { useState } from 'react';
import { ShieldAlert, User, Key, ArrowRight, CornerDownRight } from 'lucide-react';

export const LoginView = ({ 
  onSuccess, 
  onNavigateToSignup,
  onQuickNavigate,
  onNavigateToPasswordReset,
  onNavigateToSocial
}) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState('writer@sangsang.com');
  const [password, setPassword] = useState('password123');
  const [adminEmail, setAdminEmail] = useState('admin@sangsang.com');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isPendingMinor, setIsPendingMinor] = useState(false);
  const [showResendToast, setShowResendToast] = useState(false);

  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('이메일 주소와 비밀번호를 모두 입력해 주세요.');
      return;
    }
    setError('');
    
    if (email.includes('child') || email.includes('pending') || email === 'minor@sangsang.com') {
      setIsPendingMinor(true);
      return;
    }

    onSuccess({
      email,
      role: 'USER',
      nickname: '상상의작가'
    });
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (adminEmail !== 'admin@sangsang.com') {
      setError('이메일 또는 비밀번호가 잘못되었거나, 관리자 권한이 없는 계정입니다.');
      return;
    }

    if (adminPassword !== 'admin123') {
      setError('어드민 패스위드가 알맞지 않습니다. 다시 입력해 주세요.');
      return;
    }

    onSuccess({
      email: adminEmail,
      role: 'ADMIN',
      nickname: '상상관리팀장'
    });
  };

  return (
    <div id="login-container" className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-neutral-50 overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>

      {isAdminMode ? (
        <div id="admin-login-card" className="max-w-md w-full space-y-8 bg-white border border-[#E6E2FC]/80 rounded-3xl p-8 sm:p-10 z-10 relative shadow-2xl shadow-[#6B54E7]/5">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#110F24] text-white rounded-2xl mb-4 shadow-md font-bold text-base">
              관리
            </div>
            <h2 className="text-2xl font-bold text-[#110F24] tracking-tight flex items-center justify-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#6B54E7]" /> 상상서가 관리자 로그인
            </h2>
            <p className="mt-2 text-xs text-[#7C769D] font-medium tracking-wide">
              상상서가 서비스 관리 포털
            </p>
          </div>

          <div className="bg-[#FAF9FF] border border-[#E6E2FC]/60 text-[#2F2D59] p-4 rounded-2xl text-xs leading-relaxed text-left space-y-1">
            <p className="font-bold text-[#6B54E7] flex items-center gap-1">
              <span>⚠️ 관리자 계정 안내</span>
            </p>
            <p className="text-[#7C769D] text-[11px] font-medium leading-normal">
              사전에 승인된 관리 계정만 로그인이 가능합니다. 일반 사용자는 이전 화면으로 돌아가 주세요.
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-700 border border-rose-200 p-3.5 rounded-xl text-xs leading-relaxed text-left font-semibold">
              {error}
            </div>
          )}

          <form className="space-y-4 text-left" onSubmit={handleAdminSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#7C769D] mb-1.5 uppercase tracking-wider font-sans">
                  관리자 이메일 주소
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C769D]">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF9FF] hover:bg-neutral-150 focus:bg-white text-xs text-[#110F24] rounded-2xl border border-[#E6E2FC] focus:border-[#6B54E7] focus:outline-none transition-all"
                    placeholder="admin@sangsang.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7C769D] mb-1.5 uppercase tracking-wider font-sans">
                  비밀번호
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C769D]">
                    <Key className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF9FF] hover:bg-neutral-150 focus:bg-white text-xs text-[#110F24] rounded-2xl border border-[#E6E2FC] focus:border-[#6B54E7] focus:outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#110F24] hover:bg-black text-white font-bold text-xs tracking-wider uppercase rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              로그인하기 <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsAdminMode(false);
                setError('');
              }}
              className="font-bold text-xs text-[#7C769D] hover:text-[#6B54E7] hover:underline tracking-tight flex items-center justify-center gap-1.5 mx-auto transition-colors"
            >
              <CornerDownRight className="w-3.5 h-3.5" /> 일반 작가 로그인으로 돌아가기
            </button>
          </div>
        </div>
      ) : (
        <div id="login-card" className="max-w-md w-full space-y-8 bg-white rounded-3xl p-8 sm:p-10 z-10 relative border border-neutral-200/80 shadow-2xl shadow-neutral-950/[0.03]">
          {isPendingMinor ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="text-center font-sans">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-100 text-neutral-800 mb-3 font-bold border border-neutral-200">
                  <span className="material-symbols-outlined text-3xl text-neutral-900">family_restroom</span>
                </div>
                <h3 className="text-xl font-bold font-literata text-neutral-900">보호자 동의가 필요해요</h3>
                <p className="text-xs text-neutral-500 mt-2 font-sans font-medium">
                  만 14세 미만의 어린이 작가는 부모님(보호자)의 승인 후에 서비스를 이용할 수 있습니다.
                </p>
              </div>

              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-xs text-left space-y-2 font-sans font-medium">
                <p className="font-bold text-neutral-900 border-b border-neutral-200 pb-1.5 flex items-center justify-between">
                  <span>신청 정보</span>
                  <span className="px-1.5 py-0.5 bg-neutral-200 text-neutral-700 text-[9px] font-bold rounded">확인 중</span>
                </p>
                <p>· <strong>신청 이메일:</strong> {email}</p>
                <p>· <strong>보호자 이메일:</strong> <span className="underline text-black font-bold">parent.guardian@sangsang.com</span></p>
                <p className="text-[10px] text-neutral-400 mt-2 leading-relaxed">
                  * 보호자님의 이메일로 승인 확인 메일이 전송되었습니다.
                </p>
              </div>

              {showResendToast && (
                <div className="p-3 bg-neutral-900 text-white text-[11px] rounded-xl text-center leading-normal font-sans animate-in fade-in transition-all">
                  📨 보호자님의 이메일로 확인 메일을 다시 보내드렸습니다!
                </div>
              )}

              <div className="space-y-2 font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setShowResendToast(true);
                    setTimeout(() => setShowResendToast(false), 3000);
                  }}
                  className="w-full py-3 bg-black hover:bg-neutral-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  보호자 메일로 확인 요청 다시 보내기
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPendingMinor(false);
                    onSuccess({
                      email,
                      role: 'USER',
                      nickname: '새싹작가_이채민',
                      ageGroup: 'MINOR_U14',
                      guardianEmail: 'parent.guardian@sangsang.com'
                    });
                  }}
                  className="w-full py-3 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 text-xs font-bold rounded-xl transition-all"
                >
                  보호자 수락 완료 처리하고 즉시 입장하기 (체험용)
                </button>

                <p className="text-[9.5px] text-neutral-400 text-center leading-normal">
                  * 보호자가 동의하면 가입이 최종 완료됩니다.
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-200 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsPendingMinor(false);
                    setError('');
                  }}
                  className="text-xs text-neutral-600 font-extrabold hover:text-black hover:underline"
                >
                  로그인 폼 화면으로 돌아가기
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-right">
                <button
                  onClick={() => {
                    setIsAdminMode(true);
                    setError('');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-black hover:text-white text-neutral-600 text-[10px] font-sans font-bold transition-all border border-neutral-200"
                >
                  <ShieldAlert className="w-3 h-3" /> 관리자 로그인
                </button>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black text-white font-literata text-2xl mb-4 shadow-md font-extrabold">
                  상
                </div>
                <h2 id="login-title" className="text-3xl font-literata font-bold text-neutral-900 tracking-tight">
                  상상서가
                </h2>
                <p id="login-subtitle" className="mt-2 text-sm text-neutral-500 font-sans leading-relaxed">
                  아이들을 위한 따뜻하고 창의적인 AI 그림책 창작방
                </p>
              </div>

              {error && (
                <div className="bg-neutral-50 text-neutral-800 border border-neutral-200 p-3 rounded-xl text-xs leading-relaxed text-left font-sans">
                  {error}
                </div>
              )}

              <form className="mt-6 space-y-4" onSubmit={handleUserSubmit}>
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
            </>
          )}


        </div>
      )}
    </div>
  );
};
