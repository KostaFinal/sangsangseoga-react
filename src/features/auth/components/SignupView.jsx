import React, { useState } from 'react';

export const SignupView = ({ onSuccess, onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthdate, setBirthdate] = useState('2015-05-15'); 
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);
  
  const [step, setStep] = useState('info');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianName, setGuardianName] = useState('');

  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isMinorUnder14, setIsMinorUnder14] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(null);

  const checkIsMinorUnder14 = (dateString) => {
    if (!dateString) return false;
    const birthDate = new Date(dateString);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }
    return age < 14;
  };

  const handleNextOrSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('이메일을 입력해 주세요.');
      return;
    }
    
    if (password.length < 6) {
      setError('보안을 위해 비밀번호는 6자리 이상으로 등록해 주세요.');
      return;
    }
    if (password !== confirmPassword) {
      setError('입력하신 두 비밀번호가 서로 일치하지 않습니다.');
      return;
    }
    if (!agreeTerms) {
      setError('이용약관 및 개인정보 수집 이용 동의는 필수 사항입니다.');
      return;
    }

    const under14 = checkIsMinorUnder14(birthdate);
    setIsMinorUnder14(under14);

    if (under14) {
      setStep('guardian_consent');
    } else {
      setShowSuccessModal(true);
    }
  };

  const handleGuardianSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!guardianName.trim()) {
      setError('법정대리인의 실명을 정확하게 입력해 주세요.');
      return;
    }
    if (!guardianEmail.includes('@')) {
      setError('올바른 법정대리인 이메일 형식으로 기재해 주세요.');
      return;
    }

    setShowSuccessModal(true);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    onSuccess();
  };

  return (
    <div id="signup-container" className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-neutral-50 overflow-hidden font-sans">
      <div className="absolute bottom-[-10%] left-[-10%] w-[420px] h-[420px] bg-neutral-800 watercolor-blob opacity-[0.05]"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[380px] h-[380px] bg-neutral-400 watercolor-blob opacity-[0.08]"></div>

      <div id="signup-card" className="max-w-md w-full space-y-7 bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-neutral-200/80 z-10 relative">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-black text-white font-literata text-xl mb-3 shadow-md font-bold">
            상
          </div>
          <h2 id="signup-title" className="text-2xl font-literata font-bold text-neutral-900 tracking-tight">
            상상서가 회원가입
          </h2>
          <p id="signup-subtitle" className="mt-1 text-xs text-neutral-500 leading-relaxed font-sans">
            아이와 부모가 함께 만들어가는 AI 그림책방
          </p>
        </div>

        {error && (
          <div className="bg-neutral-50 text-neutral-800 border border-neutral-200 p-3 rounded-xl text-xs leading-relaxed text-left font-sans">
            {error}
          </div>
        )}

        {step === 'info' ? (
          <form className="mt-4 space-y-4 text-left font-sans" onSubmit={handleNextOrSubmit}>
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
                    placeholder="6자 이상 필수"
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
                <input
                  id="signup-birthdate"
                  type="date"
                  required
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white text-sm text-neutral-900 rounded-xl border border-neutral-200 focus:border-black focus:outline-none transition-all duration-200 font-sans"
                />
                <div className="mt-2 text-[11px] text-neutral-700 bg-neutral-100 hover:bg-neutral-200/50 border border-neutral-200/60 px-3 py-2 rounded-xl font-sans flex items-start">
                  <span className="material-symbols-outlined text-xs mr-1.5 mt-0.5 text-neutral-600">info</span>
                  <span>만 14세 미만의 어린이는 가입 시 보호자의 동의가 필요합니다.</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-2.5 border-t border-neutral-200 font-sans">
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
                    이용약관 및 개인정보 수집·이용 동의
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

              <div className="flex items-center justify-between">
                <label className="flex items-start space-x-2 text-xs text-neutral-500 cursor-pointer font-sans leading-relaxed flex-1">
                  <input
                    id="signup-agree-marketing"
                    type="checkbox"
                    checked={agreeMarketing}
                    onChange={() => setAgreeMarketing(!agreeMarketing)}
                    className="mt-0.5 w-4 h-4 text-black border-neutral-300 rounded focus:ring-black accent-black"
                  />
                  <span>
                    <span className="font-bold text-neutral-700 mr-1">[선택]</span>
                    도서 추천 및 유용한 소식 알림 동의
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowTermsModal('marketing')}
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
                className="w-full py-3.5 px-4 font-sans font-bold text-white bg-black hover:bg-neutral-900 rounded-xl text-sm shadow-md transition-all duration-200 cursor-pointer"
              >
                다음 단계로 진행
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-4 space-y-4 text-left font-sans animate-in fade-in slide-in-from-bottom-2 duration-300" onSubmit={handleGuardianSubmit}>
            <div className="p-4 bg-neutral-900 text-white rounded-2xl border border-neutral-900 font-sans">
              <span className="inline-block px-2 py-0.5 bg-neutral-800 text-neutral-100 text-[10px] font-bold rounded mb-1 font-sans">만 14세 미만 보호자 동의</span>
              <p className="text-xs text-neutral-300 leading-relaxed font-sans font-medium">
                만 14세 미만 어린이는 가입을 위해 보호자 동의가 필요합니다. 보호자님의 이메일로 가입 확인 메일을 보내 드립니다.
              </p>
            </div>

            <div className="space-y-3.5 font-sans">
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1 font-sans">
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
                <label className="block text-xs font-bold text-neutral-600 mb-1 font-sans">
                  보호자 이메일 주소 <span className="text-neutral-900">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={guardianEmail}
                  onChange={(e) => setGuardianEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white text-sm text-neutral-900 rounded-xl border border-neutral-200 focus:border-black focus:outline-none transition-all duration-200 font-sans"
                  placeholder="guardian@email.com"
                />
                <p className="mt-1 text-[10px] text-neutral-400 font-sans font-medium">
                  * 입력하신 이메일로 가입 동의 확인 링크가 전송됩니다.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-3 pt-2 font-sans">
              <button
                type="button"
                onClick={() => setStep('info')}
                className="col-span-4 py-3 px-3 font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-xs transition-colors"
              >
                이전으로
              </button>
              <button
                type="submit"
                className="col-span-8 py-3 px-4 font-bold text-white bg-black hover:bg-neutral-900 rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                동의 이메일 발송 & 가입요청
              </button>
            </div>
          </form>
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
                상상서가 아틀리에 열기
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
              {showTermsModal === 'service' ? '상상서가 디지털 서비스 이용 약관 전문' : '개인정보 수집 및 소식 알림 수집 동의서'}
            </h3>
            
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-[11px] text-neutral-500 leading-relaxed font-sans max-h-60 overflow-y-auto space-y-2.5">
              {showTermsModal === 'service' ? (
                <>
                  <p className="font-bold text-black">제 1 조 (목적)</p>
                  <p>본 약관은 상상서가가 제공하는 인공지능 보조 동화 및 문학책 집필 시스템의 가입 절차, 서비스 이용 범위, 그리고 상호 신뢰 안전 규정을 명확히 안내함을 목적으로 합니다.</p>
                  <p className="font-bold text-black">제 2 조 (회원 가입식 이메일 인증)</p>
                  <p>이메일 주소는 아이디 중복 확인 및 혹시 비밀번호를 잊으셨을 때 임시 비밀번호 변경 주소를 안전하게 전달받기 위한 소통 창구로 사용되며 소중히 기밀 보호됩니다. 비밀번호는 현대 기술 표준에 대응하는 고도 암호화를 거치기 때문에 외부 유출로부터 안전하게 보호됩니다.</p>
                  <p className="font-bold text-black">제 3 조 (어린이 가입 안내)</p>
                  <p>만 14세 미만 어린이는 가입을 제한하며, 법정대리인(보호자)의 가입 수락 이메일 확인이 완료된 후 비로소 정식 작가 회원으로 활동하실 수 있습니다.</p>
                </>
              ) : (
                <>
                  <p className="font-bold text-black">1. 개인정보 수집 목적</p>
                  <p>소중한 문학 초안 원고 안심 백업 보관 제공, '기본 서재' 공간 매칭, 결제 기록 파악, 연령 확인에 따른 보호자 동의 수령.</p>
                  <p className="font-bold text-black">2. 수집 및 보존 기한</p>
                  <p>회원 탈퇴 시 보관 데이터는 즉시 삭제됩니다. 다만, 실수에 의한 탈퇴 상황을 대비하여 30일 동안 복구 유예 기간을 두며, 이 유예 장치가 종료되면 온전히 영구 완전 파기됩니다.</p>
                </>
              )}
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
