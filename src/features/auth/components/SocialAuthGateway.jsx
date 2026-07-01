import React, { useState, useEffect } from 'react';

export const SocialAuthGateway = ({ selectedProvider, onNavigateToLogin, onSuccess }) => {
  const [provider, setProvider] = useState(selectedProvider || 'google');
  const [step, setStep] = useState('consent');
  const [birthdate, setBirthdate] = useState('2002-11-20');
  const [isMinorUnder14, setIsMinorUnder14] = useState(false);
  
  const [agreeAll, setAgreeAll] = useState(true);
  const [agreeProfile, setAgreeProfile] = useState(true);
  const [agreeEmail, setAgreeEmail] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  
  const [guardianName, setGuardianName] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianTokenSent, setGuardianTokenSent] = useState(false);
  const [guardianApproved, setGuardianApproved] = useState(false);

  const [exchangeState, setExchangeState] = useState([
    { text: '소셜 로그인 인증 확인', status: 'pending' },
    { text: '보안 전송 채널 검증', status: 'idle' },
    { text: '이메일 및 프로필 연동 완료', status: 'idle' },
    { text: '작가 정보 등록', status: 'idle' },
    { text: '개인 서재 설정', status: 'idle' },
    { text: '로그인 완료', status: 'idle' }
  ]);

  useEffect(() => {
    if (selectedProvider) {
      setProvider(selectedProvider);
    }
  }, [selectedProvider]);

  useEffect(() => {
    if (!birthdate) return;
    const bday = new Date(birthdate);
    const today = new Date();
    let calculatedAge = today.getFullYear() - bday.getFullYear();
    const monthDiff = today.getMonth() - bday.getMonth();
    const dayDiff = today.getDate() - bday.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      calculatedAge--;
    }
    setIsMinorUnder14(calculatedAge < 14);
  }, [birthdate]);

  const handleConsentSubmit = (e) => {
    e.preventDefault();
    if (!agreeProfile || !agreeEmail || !agreeTerms) {
      alert('필수 동의 항목을 선택해 주세요.');
      return;
    }

    setStep('callback_exchange');
    runTokenExchangeLogs();
  };

  const runTokenExchangeLogs = () => {
    setTimeout(() => {
      setExchangeState(prev => prev.map((item, idx) => idx === 0 ? { ...item, status: 'success' } : idx === 1 ? { ...item, status: 'pending' } : item));
    }, 600);

    setTimeout(() => {
      setExchangeState(prev => prev.map((item, idx) => idx === 1 ? { ...item, status: 'success' } : idx === 2 ? { ...item, status: 'pending' } : item));
    }, 1200);

    setTimeout(() => {
      setExchangeState(prev => prev.map((item, idx) => idx === 2 ? { ...item, status: 'success' } : idx === 3 ? { ...item, status: 'pending' } : item));
    }, 1800);

    setTimeout(() => {
      setExchangeState(prev => prev.map((item, idx) => idx === 3 ? { ...item, status: 'success' } : idx === 4 ? { ...item, status: 'pending' } : item));
    }, 2400);

    setTimeout(() => {
      setExchangeState(prev => prev.map((item, idx) => idx === 4 ? { ...item, status: 'success' } : idx === 5 ? { ...item, status: 'pending' } : item));
    }, 3000);

    setTimeout(() => {
      setExchangeState(prev => prev.map((item, idx) => idx === 5 ? { ...item, status: 'success' } : item));
      
      if (isMinorUnder14) {
        setStep('guardian_gate');
      } else {
        setStep('on_success');
      }
    }, 3600);
  };

  const handleGuardianRequest = (e) => {
    e.preventDefault();
    if (!guardianName.trim() || !guardianEmail.trim()) {
      alert('법정대리인(보호자)의 성명과 이메일을 정직하게 채워주세요.');
      return;
    }
    setGuardianTokenSent(true);
  };

  const simulateGuardianApprove = () => {
    setGuardianApproved(true);
  };

  const handleFinalSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div id="social-auth-container" className="min-h-screen bg-neutral-100 flex items-center justify-center py-10 px-4 sm:px-6 relative font-sans text-neutral-900 overflow-hidden">
      <div className="absolute top-10 left-10 w-80 h-80 bg-neutral-950 rounded-full blur-[120px] opacity-[0.04]"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-neutral-300 rounded-full blur-[140px] opacity-[0.08]"></div>

      <div className="w-full max-w-xl z-10 space-y-6">
        <div className="flex justify-between items-center bg-white border border-neutral-200 p-3 rounded-2xl shadow-sm">
          <button 
            onClick={onNavigateToLogin}
            className="flex items-center text-xs text-neutral-500 hover:text-black font-semibold cursor-pointer py-1 px-3.5 hover:bg-neutral-50 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-sm mr-1">arrow_back</span>
            <span>일반 로그인으로 복귀</span>
          </button>

          <div className="flex space-x-1 bg-neutral-100 p-1 rounded-xl text-[11px] font-bold">
            <button
              onClick={() => { setProvider('google'); setStep('consent'); }}
              className={`px-3 py-1.5 rounded-lg transition-colors duration-150 cursor-pointer ${provider === 'google' ? 'bg-white text-black shadow-xs' : 'text-neutral-400 hover:text-neutral-700'}`}
            >
              Google
            </button>
            <button
              onClick={() => { setProvider('kakao'); setStep('consent'); }}
              className={`px-3 py-1.5 rounded-lg transition-colors duration-150 cursor-pointer ${provider === 'kakao' ? 'bg-[#FEE500] text-[#191919] shadow-xs' : 'text-neutral-400 hover:text-neutral-700'}`}
            >
              Kakao
            </button>
            <button
              onClick={() => { setProvider('naver'); setStep('consent'); }}
              className={`px-3 py-1.5 rounded-lg transition-colors duration-150 cursor-pointer ${provider === 'naver' ? 'bg-[#03C75A] text-white shadow-xs' : 'text-neutral-400 hover:text-neutral-700'}`}
            >
              Naver
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl overflow-hidden min-h-[460px] flex flex-col justify-between">
          {step === 'consent' && (
            <div className="flex-1 flex flex-col justify-between p-6 sm:p-8">
              <div>
                {provider === 'google' && (
                  <div className="text-center pb-6 border-b border-neutral-100">
                    <div className="flex justify-center space-x-1.5 text-xl font-bold tracking-tight font-sans">
                      <span className="text-blue-500">G</span>
                      <span className="text-red-500">o</span>
                      <span className="text-yellow-500">o</span>
                      <span className="text-blue-500">g</span>
                      <span className="text-green-500">l</span>
                      <span className="text-red-500">e</span>
                    </div>
                    <p className="text-xs text-neutral-400 font-sans mt-2">구글 계정으로 로그인</p>
                  </div>
                )}

                {provider === 'kakao' && (
                  <div className="text-center bg-[#FEE500] p-6 -mx-8 -mt-8 mb-6 border-b border-[#ECD300]">
                    <div className="inline-block bg-[#191919] text-[#FEE500] font-sans font-black px-2.5 py-1 text-sm rounded-lg mb-2">
                      TALK
                    </div>
                    <h3 className="text-base font-bold text-[#191919] font-sans">카카오 로그인</h3>
                    <p className="text-xs text-[#191919]/60 font-sans mt-0.5">상상서가 계정 연동</p>
                  </div>
                )}

                {provider === 'naver' && (
                  <div className="text-center bg-[#03C75A] p-6 -mx-8 -mt-8 mb-6 border-b border-[#02A64B] text-white">
                    <span className="font-sans font-black text-2xl tracking-tight block">NAVER</span>
                    <h3 className="text-base font-bold font-sans mt-1">네이버 로그인</h3>
                    <p className="text-xs text-white/70 font-sans">상상서가 계정 연동</p>
                  </div>
                )}

                <form onSubmit={handleConsentSubmit} className="space-y-4 pt-4 text-left font-sans">
                  <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
                    <label className="flex items-center space-x-2.5 font-bold text-sm cursor-pointer text-neutral-900">
                      <input 
                        type="checkbox" 
                        checked={agreeAll} 
                        onChange={(e) => {
                          const val = e.target.checked;
                          setAgreeAll(val);
                          setAgreeProfile(val);
                          setAgreeEmail(val);
                          setAgreeTerms(val);
                        }}
                        className="w-4 h-4 text-neutral-900 border-neutral-300 focus:ring-black accent-black rounded"
                      />
                      <span>전체 동의하기 (선택 동의 포함)</span>
                    </label>
                  </div>

                  <div className="space-y-2 px-1 text-xs">
                    <label className="flex justify-between items-center text-neutral-600 hover:text-black cursor-pointer py-1">
                      <span className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          required
                          checked={agreeProfile}
                          onChange={(e) => setAgreeProfile(e.target.checked)}
                          className="w-4 h-4 text-neutral-900 border-neutral-300 focus:ring-black accent-black rounded"
                        />
                        <span>[필수] 개인 프로필 정보 제공 (닉네임 / 사진)</span>
                      </span>
                      <span className="text-[10px] text-neutral-400">필수</span>
                    </label>

                    <label className="flex justify-between items-center text-neutral-600 hover:text-black cursor-pointer py-1">
                      <span className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          required
                          checked={agreeEmail}
                          onChange={(e) => setAgreeEmail(e.target.checked)}
                          className="w-4 h-4 text-neutral-900 border-neutral-300 focus:ring-black accent-black rounded"
                        />
                        <span>[필수] 사용자 식별 고유 이메일 연동</span>
                      </span>
                      <span className="text-[10px] text-neutral-400">필수</span>
                    </label>

                    <label className="flex justify-between items-center text-neutral-600 hover:text-black cursor-pointer py-1">
                      <span className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          required
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="w-4 h-4 text-neutral-900 border-neutral-300 focus:ring-black accent-black rounded"
                        />
                        <span>[필수] 상상서가 이용약관 및 개인 정보 수집 동의</span>
                      </span>
                      <span className="text-[10px] text-neutral-400">필수</span>
                    </label>
                  </div>

                  <div className="pt-4 border-t border-neutral-100">
                    <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider">
                      생년월일 입력
                    </label>
                    <input 
                      type="date"
                      required
                      value={birthdate}
                      onChange={(e) => setBirthdate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-neutral-50 text-neutral-900 text-xs rounded-xl border border-neutral-200 focus:border-black focus:outline-none transition-all"
                    />
                    <span className="text-[10px] text-neutral-400 block mt-1 leading-normal">
                      ℹ️ 만 14세 미만 여부를 계산하여 보호자 동의 절차가 진행됩니다.<br />
                      현재 기준: <strong className="text-neutral-800">{isMinorUnder14 ? '만 14세 미만 (보호자 동의 필요)' : '만 14세 이상'}</strong>
                    </span>
                  </div>

                  <div className="pt-4 flex space-x-3">
                    <button
                      type="button"
                      onClick={onNavigateToLogin}
                      className="flex-1 py-3 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-2xl transition-all cursor-pointer"
                    >
                      취소
                    </button>
                    
                    {provider === 'google' && (
                      <button
                        type="submit"
                        className="flex-1 py-3 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all cursor-pointer"
                      >
                        Google 계정으로 동의
                      </button>
                    )}

                    {provider === 'kakao' && (
                      <button
                        type="submit"
                        className="flex-1 py-3 text-xs bg-[#FEE500] hover:bg-[#ECD300] text-[#191919] font-bold rounded-2xl transition-all cursor-pointer"
                      >
                        동의하고 계속하기
                      </button>
                    )}

                    {provider === 'naver' && (
                      <button
                        type="submit"
                        className="flex-1 py-3 text-xs bg-[#03C75A] hover:bg-[#02A64B] text-white font-bold rounded-2xl transition-all cursor-pointer"
                      >
                        네이버로 로그인
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="text-center pt-4 border-t border-neutral-100 text-[10px] text-neutral-500 flex items-center justify-center space-x-1 font-sans">
                <span className="material-symbols-outlined text-[12px] text-zinc-950 font-bold">verified_user</span>
                <span>안전한 보안 연결이 적용되어 있습니다.</span>
              </div>
            </div>
          )}

          {step === 'callback_exchange' && (
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-full border-2 border-black border-t-transparent animate-spin mx-auto"></div>
                  <h3 className="text-base font-bold font-literata mt-3">로그인 처리 중</h3>
                  <p className="text-xs text-neutral-500 leading-normal max-w-sm mx-auto">
                    소셜 로그인 정보를 확인하고 있습니다. 잠시만 기다려 주십시오.
                  </p>
                </div>

                <div className="bg-neutral-50 rounded-2xl p-4 text-left font-sans text-xs leading-relaxed text-neutral-700 space-y-2 border border-neutral-200 shadow-inner max-h-64 overflow-y-auto">
                  <p className="text-black font-extrabold pb-1 border-b border-neutral-200">로그인 연동 상태</p>
                  {exchangeState.map((log, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                       <span>
                        {log.status === 'success' && <span className="text-emerald-600 font-bold">✓</span>}
                        {log.status === 'pending' && <span className="text-zinc-600 animate-pulse font-bold">●</span>}
                        {log.status === 'idle' && <span className="text-neutral-300">○</span>}
                      </span>
                      <p className={log.status === 'success' ? 'text-neutral-500' : log.status === 'pending' ? 'text-black font-bold' : 'text-neutral-300'}>
                        {log.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center text-[10px] text-neutral-400 font-sans pt-4">
                개인정보 및 로그인 연동 전 과정은 암호화되어 안전하게 전송·보호됩니다.
              </div>
            </div>
          )}

          {step === 'guardian_gate' && (
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between text-left">
              <div className="space-y-4">
                <div className="bg-rose-50 text-rose-900 p-4 rounded-2xl border border-rose-200/60 text-xs flex items-start space-x-3 leading-normal">
                  <span className="material-symbols-outlined text-rose-500 text-2xl mt-0.5">family_history</span>
                  <div className="space-y-0.5">
                    <p className="font-bold">보호자(법정대리인) 동의 필요</p>
                    <p className="text-rose-700">
                      가입 신청자의 연령이 만 14세 미만으로 판독되었습니다. 개인정보보호법에 따라 회원가입을 완료하려면 보호자(법정대리인)의 동의가 필요합니다.
                    </p>
                  </div>
                </div>

                <p className="text-xs text-neutral-500 leading-normal">
                  보호자의 이름과 이메일 주소를 입력하고 인증 메일을 전송해 주세요.
                </p>

                {!guardianTokenSent ? (
                  <form onSubmit={handleGuardianRequest} className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-neutral-600 mb-1">보호자 실명</label>
                        <input 
                          type="text"
                          required
                          value={guardianName}
                          onChange={(e) => setGuardianName(e.target.value)}
                          placeholder="홍길동"
                          className="w-full px-4 py-2.5 bg-neutral-50 text-neutral-900 rounded-xl border border-neutral-200 focus:border-black focus:outline-none transition-all placeholder:text-neutral-400"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-neutral-600 mb-1">보호자 이메일 주소</label>
                        <input 
                          type="email"
                          required
                          value={guardianEmail}
                          onChange={(e) => setGuardianEmail(e.target.value)}
                          placeholder="parent@sangsang.com"
                          className="w-full px-4 py-2.5 bg-neutral-50 text-neutral-900 rounded-xl border border-neutral-200 focus:border-black focus:outline-none transition-all placeholder:text-neutral-400"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-bold rounded-2xl text-xs transition-colors cursor-pointer"
                    >
                      ✉️ 법정대리인 동의 안내 알림 메일 발송
                    </button>
                  </form>
                ) : (
                  <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-4">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <p className="font-bold text-neutral-800">[발송 완료] 보호자 수신함으로 동의 안내가 전송되었습니다.</p>
                    </div>

                    <p className="text-[11px] text-neutral-500 leading-relaxed">
                      보호자 이메일({guardianEmail})로 가입 동의 안내 메일이 발송되었습니다. 아래 승인 완료 버튼을 누르시면 동의 처리를 즉시 마칠 수 있습니다.
                    </p>

                    {!guardianApproved ? (
                      <button
                        type="button"
                        onClick={simulateGuardianApprove}
                        className="w-full py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        🙋‍♂️ [상상서가 체험 도우미] 보호자 동의 즉시 승인하기
                      </button>
                    ) : (
                      <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200 text-xs font-bold flex items-center space-x-1.5">
                        <span className="material-symbols-outlined text-emerald-600 text-sm">check_circle</span>
                        <span>법정대리인 동의 완료! (가입 승인 처리가 완료되었습니다)</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-neutral-100 flex justify-between text-xs font-semibold">
                <button
                  onClick={() => setStep('consent')}
                  className="text-neutral-500 hover:text-black hover:underline cursor-pointer"
                >
                  ← 처음으로 돌아가기
                </button>
                {guardianApproved && (
                  <button
                    onClick={() => setStep('on_success')}
                    className="text-emerald-700 hover:text-emerald-800 hover:underline font-bold cursor-pointer"
                  >
                    소설 창작소로 진입하기 →
                  </button>
                )}
              </div>
            </div>
          )}

          {step === 'on_success' && (
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between text-center font-sans">
              <div className="space-y-6 my-auto">
                <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
                  <span className="material-symbols-outlined text-3xl font-bold text-white">sentiment_very_satisfied</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-neutral-900 font-literata">소셜 계정 연동 완료</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed max-w-sm mx-auto">
                    선택하신 {provider.toUpperCase()} 계정과의 연동이 성공적으로 완료되었습니다.
                  </p>
                </div>

                <div className="bg-neutral-50 rounded-2xl p-4 text-left border border-neutral-200/80 text-xs leading-normal font-sans text-neutral-600 max-w-md mx-auto space-y-1.5 shadow-xs">
                  <p className="text-center font-bold border-b border-neutral-200 pb-1 text-black font-literata">연동 세부 정보</p>
                  <p>👤 <strong>연동 계정 이메일:</strong> {provider}_writer@sangsang.com</p>
                  <p>📋 <strong>연령 등급:</strong> {isMinorUnder14 ? '만 14세 미만 (보호자 동의 완료)' : '만 14세 이상 일반 회원'}</p>
                  <p>🔐 <strong>인증 ID 번호:</strong> {provider}_user_{Math.floor(Math.random() * 900000 + 100000)}</p>
                  <p>📁 <strong>이용 가능 보드:</strong> 작가 개인 서재 및 파일 작성 기능 활성화</p>
                  <p>⚡ <strong>로그인 세션:</strong> 자동 로그인 및 세션 활성화 완료</p>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={handleFinalSuccess}
                  className="w-full py-4 bg-black hover:bg-neutral-900 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-98 animate-pulse"
                >
                  상상서가 책정원 입장하기 🌸
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-[10px] text-neutral-400 font-sans">
          상상서가 통합 간편 로그인 서비스.<br />
          본 연동 기능은 회원님의 동의에 기초하여 필요한 최소한의 프로필 정보만을 안전하게 처리합니다.
        </div>
      </div>
    </div>
  );
};
