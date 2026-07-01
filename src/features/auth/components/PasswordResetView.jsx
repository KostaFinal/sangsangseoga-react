import React, { useState } from 'react';

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const PasswordResetView = ({ onNavigateToLogin }) => {
  const [email, setEmail] = useState('writer@sangsang.com');
  const [stage, setStage] = useState('request'); 
  
  const [redisTokens, setRedisTokens] = useState({});
  const [activeToken, setActiveToken] = useState(null);
  const [simulatedInbox, setSimulatedInbox] = useState([]);
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [serverError, setServerError] = useState('');
  
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const isMinLength = newPassword.length >= 8;

  const PREVIOUS_BUILTIN_PASSWORD = 'password123';

  const handleRequestLink = (e) => {
    e.preventDefault();
    if (!email) return;

    const tokenUuid = generateUUID();
    const expiryTime = new Date(Date.now() + 30 * 60 * 1000); 
    
    const tokenRecord = {
      email: email,
      token: tokenUuid,
      expiresAt: expiryTime,
      used: false
    };

    setRedisTokens(prev => ({
      ...prev,
      [tokenUuid]: tokenRecord
    }));

    const mailItem = {
      id: Date.now(),
      sender: '상상서가 보안센터 (security@sangsang.com)',
      title: '[상상서가] 회원님의 비밀번호 재설정을 위한 임시 토큰 메일입니다.',
      sentAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      token: tokenUuid,
      link: `https://sangsang.com/reset-password?token=${tokenUuid}`
    };

    setSimulatedInbox([mailItem, ...simulatedInbox]);
    setStage('sent_success');
  };

  const handleLinkClick = (tokenUuid) => {
    const record = redisTokens[tokenUuid];
    
    if (!record) {
      setServerError('유효하지 않은 보안 토큰입니다. 다시 링크를 발급해 주세요.');
      return;
    }

    if (new Date() > record.expiresAt) {
      setServerError('유효성 기준 시간(30분)이 지나 토큰이 자동 만료되었습니다.');
      return;
    }

    if (record.used) {
      setServerError('❌ 보안 규정 위반: 이 인증 토큰 링크는 이미 1회 사용되어 즉시 파기(만료)되었습니다.');
      return;
    }

    setActiveToken(tokenUuid);
    setServerError('');
    setStage('new_password');
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    setValidationErrors([]);
    const errors = [];

    if (!hasLetter || !hasNumber || !hasSpecial || !isMinLength) {
      errors.push('비밀번호 복잡도 규칙(영문+숫자+특수문자 최소 8자 이상)을 충족해야 합니다.');
    }

    if (newPassword !== confirmPassword) {
      errors.push('새 비밀번호와 비밀번호 확인 입력값이 일치하지 않습니다.');
    }

    if (newPassword === PREVIOUS_BUILTIN_PASSWORD) {
      errors.push('🔒 보안 규칙 위반: 직전에 사용하셨던 비밀번호("password123")와 완전히 동일한 비밀번호로는 변경할 수 없습니다.');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (activeToken) {
      setRedisTokens(prev => ({
        ...prev,
        [activeToken]: {
          ...prev[activeToken],
          used: true
        }
      }));
    }

    setStage('finished_success');
  };

  return (
    <div id="password-reset-container" className="min-h-screen bg-neutral-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative font-sans text-neutral-900">
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] bg-neutral-900 watercolor-blob opacity-[0.03]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-neutral-400 watercolor-blob opacity-[0.05]"></div>

      <div className="w-full max-w-lg space-y-6 z-10">
        <div id="reset-card" className="bg-white rounded-3xl p-8 sm:p-10 border border-neutral-300/60 shadow-2xl space-y-6 text-left relative overflow-hidden">
          
          <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
            <h2 className="text-xl font-literata font-bold flex items-center space-x-2">
              <span className="material-symbols-outlined text-black font-semibold text-2xl">lock_reset</span>
              <span>비밀번호 안전 찾기</span>
            </h2>
            <div className="flex items-center space-x-1.5 text-[10px] font-mono tracking-widest text-neutral-400 font-bold uppercase">
              <span className={stage === 'request' || stage === 'sent_success' ? 'text-black' : ''}>STEP 01</span>
              <span>•</span>
              <span className={stage === 'new_password' ? 'text-black' : ''}>STEP 02</span>
              <span>•</span>
              <span className={stage === 'finished_success' ? 'text-black' : ''}>FINISHED</span>
            </div>
          </div>

          {stage === 'request' && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-500 leading-relaxed font-sans">
                가입하신 이메일 주소를 입력해 주시면, 본인 소유 계정임을 확인할 수 있는 안전한 비밀번호 설정용 주소 메일을 발송해 드립니다.
              </p>

              <form onSubmit={handleRequestLink} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider font-sans">
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
                    className="w-full flex justify-center py-3.5 px-4 font-sans font-bold text-white bg-black hover:bg-neutral-800 rounded-2xl text-xs uppercase tracking-wide cursor-pointer shadow-sm transition-all active:scale-98"
                  >
                    비밀번호 재설정 인증 메일 발송
                  </button>
                </div>
              </form>

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
                  <p className="font-bold text-neutral-900">비밀번호 재설정 메일이 안전하게 전송되었습니다</p>
                  <p className="text-neutral-500 leading-normal">
                    입력하신 <strong className="text-neutral-800 font-semibold">{email}</strong> 수신함으로 비밀번호 인증 링크가 전달되었습니다. 아래 메일 보관함 시뮬레이션을 통해 발송된 메일을 확인하실 수 있습니다.
                  </p>
                </div>
              </div>

              <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-neutral-900 text-white px-4 py-2 flex justify-between items-center text-[10px] uppercase font-bold font-sans tracking-wide">
                  <span className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                    <span>상상서가 임시 메일 수신함 (체험 도우미)</span>
                  </span>
                  <span>메일 수신 확인</span>
                </div>

                <div className="p-4 bg-neutral-50 space-y-3 max-h-72 overflow-y-auto">
                  {simulatedInbox.length === 0 ? (
                    <p className="text-center py-6 text-xs text-neutral-400">수신된 메일이 없습니다.</p>
                  ) : (
                    simulatedInbox.map(mail => (
                      <div key={mail.id} className="bg-white p-4 rounded-xl border border-neutral-200 space-y-3 shadow-xs">
                        <div className="flex justify-between items-start text-[11px] text-neutral-400 border-b border-neutral-100 pb-2">
                          <div className="space-y-0.5 text-left">
                            <p><span className="font-bold text-neutral-700">보낸이:</span> {mail.sender}</p>
                            <p><span className="font-bold text-neutral-700">제목:</span> {mail.title}</p>
                          </div>
                          <span>{mail.sentAt}</span>
                        </div>
                        <div className="text-xs text-neutral-600 leading-relaxed font-sans py-1">
                          안녕하세요. 상상서가 고객지원팀입니다.<br />
                          귀하의 계정 비밀번호 변경 요청에 따라 안전하게 아래와 같이 비밀번호 재설정 확인 링크를 제공해 드립니다.<br />
                          이 링크는 <span className="font-bold text-neutral-800 underline decoration-rose-300">발송시각으로부터 30분간 유효</span>하며, 회원 정보 보호를 위해 <span className="font-bold text-rose-600">단 1회만 클릭하여 사용</span>이 가능합니다.
                        </div>

                        <div className="bg-neutral-50 p-2.5 rounded-lg border border-neutral-200 font-sans text-xs space-y-1 text-neutral-500">
                          <p><strong className="text-neutral-700">보안 통질:</strong> 개인 비밀번호 찾기 안전 본인 확인 필터링 동의</p>
                          <p><strong className="text-neutral-700">유효 시간:</strong> 30분 후 링크 소거</p>
                        </div>

                        <div className="pt-2 text-center">
                          <button
                            onClick={() => handleLinkClick(mail.token)}
                            className="inline-flex items-center space-x-1 px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs active:scale-98"
                          >
                            <span className="material-symbols-outlined text-[14px]">verified_user</span>
                            <span>인증 링크 클릭하기</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {serverError && (
                <div className="p-3 bg-neutral-50 text-neutral-900 border border-neutral-300/80 rounded-xl text-xs leading-relaxed text-left font-sans">
                  {serverError}
                </div>
              )}

              <div className="flex items-center justify-between pt-1 font-sans">
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
              <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-xl border border-emerald-200/50 flex items-start space-x-2.5 text-xs font-sans">
                <span className="material-symbols-outlined text-emerald-600 text-lg">verified</span>
                <div>
                  <p className="font-bold">비밀번호 찾기 인증 링크 확인 완료</p>
                  <p className="text-emerald-700 mt-0.5">
                    본인 확인 인증이 성공적으로 완료되었습니다. 회원님의 계정을 보호할 수 있는 새로운 비밀번호를 설정해 주세요.
                  </p>
                </div>
              </div>

              {validationErrors.length > 0 && (
                <div className="p-3 bg-neutral-50 text-neutral-950 border border-rose-300 rounded-xl text-xs leading-relaxed font-sans space-y-1">
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
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-sans">
                    검증 통과 사용자
                  </label>
                  <p className="text-sm font-sans font-bold text-slate-800 mt-0.5">
                    {email} <span className="text-xs font-normal text-slate-400">(상상서가 대표작가 계정)</span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider font-sans">
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
                  <label className="block text-xs font-bold text-neutral-600 mb-1.5 uppercase tracking-wider font-sans">
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
                  <p className="font-bold text-[10px] text-neutral-500 uppercase tracking-widest font-sans">비밀번호 안전도 등급 요건 검사</p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-sans">
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

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full flex justify-center py-3.5 px-4 font-sans font-bold text-white bg-black hover:bg-neutral-800 rounded-2xl text-xs uppercase tracking-wide cursor-pointer shadow-sm transition-all"
                  >
                    🔒 안전하게 비밀번호 변경 적용하기
                  </button>
                </div>
              </form>
            </div>
          )}

          {stage === 'finished_success' && (
            <div className="text-center space-y-6 py-4 font-sans">
              <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <span className="material-symbols-outlined text-3xl font-bold text-white">done_all</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-neutral-900 font-literata">비밀번호 변경 완료</h3>
                <p className="text-xs text-neutral-500 leading-relaxed max-w-sm mx-auto">
                  회원님의 암호 변경 요청이 안전하게 반영되었습니다. 안전을 위해 변경된 새로운 비밀번호로 다시 로그인해 주세요.
                </p>
              </div>

              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 text-left text-xs space-y-1.5 text-neutral-600 max-w-sm mx-auto font-sans shadow-xs">
                <p className="text-center font-bold border-b border-neutral-100 pb-1 text-black font-literata mb-1">인증 처리 상태 정보</p>
                <p>🔒 <strong>비밀번호 암호화 강도:</strong> 안전 등급 기준 만족 (정상 설정됨)</p>
                <p>🎫 <strong>인증 메일 전송 링크:</strong> 승인 완료 / 재사용 방지 만료 처리됨</p>
                <p>⚙️ <strong>기존 자동로그인 상태:</strong> 전부 정상 로그아웃 처리 완료</p>
              </div>

              <div className="pt-2">
                <button
                  onClick={onNavigateToLogin}
                  className="w-full flex justify-center py-3.5 px-4 font-sans font-bold text-white bg-black hover:bg-neutral-800 rounded-2xl text-xs uppercase tracking-wide cursor-pointer shadow-sm transition-all"
                >
                  로그인 화면으로 이동
                </button>
              </div>
            </div>
          )}

        </div>

        <div className="text-center text-[10px] text-neutral-400 font-sans space-y-1">
          <p>상상서가 계정 및 개인정보 관리 통합 보증 센터</p>
          <p>© 2026 상상서가. All rights reserved. 본 서비스는 안전한 개인정보 인큐이팅 및 암호보안 절차를 수행합니다.</p>
        </div>

      </div>
    </div>
  );
};
