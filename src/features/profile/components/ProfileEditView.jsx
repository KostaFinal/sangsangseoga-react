import React, { useState } from 'react';
import { 
  User, 
  Shield, 
  Trash2, 
  CheckCircle,
  AlertTriangle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Users,
  ArrowLeft,
  Check,
  X,
  Camera,
  Save,
  Key,
  ShieldAlert,
  Sparkles,
  Activity,
  CheckCircle2,
  LockKeyhole,
  FileText
} from 'lucide-react';
import { CURRENT_USER_PROFILE } from '../../../shared/data';

export const ProfileEditView = ({ currentUser, onNavigateHome, onUpdateProfile, onLogout }) => {
  // Navigation tabs: 'basic' (기본 정보 설정) | 'guardian' (학부모 안심 동의) 
  const [activeTab, setActiveTab] = useState('basic');

  // Basic Profile States
  const [nickname, setNickname] = useState(currentUser?.nickname || '상상의작가');
  const [originalNickname, setOriginalNickname] = useState(currentUser?.nickname || '상상의작가');
  const [isNicknameChecked, setIsNicknameChecked] = useState(true);
  const [nicknameCheckMsg, setNicknameCheckMsg] = useState({ text: '현재 적용된 중복 없는 안전한 필명입니다.', isError: false });
  const [profileImage, setProfileImage] = useState(currentUser?.profileImage || currentUser?.profile || CURRENT_USER_PROFILE);

  // Password Modification States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPwText, setShowPwText] = useState(false);

  // Notifications Toggles (Removed as per requirements)

  // Minor Under 14 specific Parent Email
  const [isMinor, setIsMinor] = useState(currentUser?.ageGroup === 'MINOR_U14' || currentUser?.birthdate === '2015-05-15' || true); // Default true for simulation
  const [guardianEmail, setGuardianEmail] = useState(currentUser?.guardianEmail || 'parent@guardian.com');
  const [originalGuardianEmail, setOriginalGuardianEmail] = useState('parent@guardian.com');
  const [guardianEmailEditMode, setGuardianEmailEditMode] = useState(false);

  // Connected Minor account stats (for Guardian view)
  const [connectedMinors, setConnectedMinors] = useState([
    {
      id: 'minor_781',
      name: '김상상 (자녀)',
      email: 'child.sangsang@gmail.com',
      birthdate: '2015-05-15',
      booksCount: 5,
      subscription: '프리미엄 정기 요금제',
      status: 'ACTIVE', // ACTIVE | SUSPENDED
      joinedDate: '2026-03-12'
    },
    {
      id: 'minor_920',
      name: '박상상 (자녀)',
      email: 'kid.sangsang@daum.net',
      birthdate: '2017-08-25',
      booksCount: 1,
      subscription: '무료 새싹 작가회',
      status: 'ACTIVE',
      joinedDate: '2026-05-19'
    }
  ]);
  const [showWithdrawConsentModal, setShowWithdrawConsentModal] = useState(false);
  const [selectedMinorToWithdraw, setSelectedMinorToWithdraw] = useState(null);
  const [withdrawPasswordConfirm, setWithdrawPasswordConfirm] = useState('');
  const [withdrawError, setWithdrawError] = useState('');

  // Account Withdrawal States
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawConfirmPw, setWithdrawConfirmPw] = useState('');
  const [bookDisposalMethod, setBookDisposalMethod] = useState('PRIVATE'); // 'PRIVATE' (비공개 전환) | 'DELETE' (즉각 완전 삭제)
  const [agreeWithdrawTerms, setAgreeWithdrawTerms] = useState(false);
  const [withdrawErrorMsg, setWithdrawErrorMsg] = useState('');

  // UI Toast Feedbacks
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // Real-time Nickname Duplicate Check
  const handleCheckNicknameDuplicate = () => {
    if (!nickname.trim()) {
      setNicknameCheckMsg({ text: '필명을 정확히 입력해 주세요.', isError: true });
      setIsNicknameChecked(false);
      return;
    }
    
    // Simulate API database match check
    if (nickname === '관리자' || nickname === '상상서가' || nickname === '어린왕자') {
      setNicknameCheckMsg({ text: '이미 사용 중이거나 시스템 예약어로 분류된 필명입니다.', isError: true });
      setIsNicknameChecked(false);
      triggerToast('이미 등록된 필명입니다. 다른 닉네임을 설정하십시오.');
    } else {
      setNicknameCheckMsg({ text: '사용할 수 있는 멋진 필명입니다.', isError: false });
      setIsNicknameChecked(true);
      triggerToast('필명 중복 확인이 완료되었습니다!');
    }
  };

  // Handles updating basic profile details
  const handleSaveProfile = (e) => {
    e.preventDefault();

    if (!isNicknameChecked) {
      triggerToast('닉네임 중복 체크를 먼저 진행해 주세요.');
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        triggerToast('비밀번호를 변경하려면 현재 비밀번호 확인이 필수입니다.');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        triggerToast('신규 비밀번호 확인 불일치!');
        return;
      }
      if (newPassword === 'password123') {
        triggerToast('🔒 보안 정책 위반: 이전 비밀번호와 동일한 패스워드는 재사용할 수 없습니다.');
        return;
      }
    }

    triggerToast('내 소중한 가입 정보 및 알림 수신 상태를 성공적으로 개정하였습니다.');
    setOriginalNickname(nickname);
    setOriginalGuardianEmail(guardianEmail);
    setGuardianEmailEditMode(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    if (onUpdateProfile) {
      onUpdateProfile({ nickname, profileImage });
    }
  };

  // Handle Parent Consent Withdrawal for Child
  const handleWithdrawConsentSubmit = (e) => {
    e.preventDefault();
    setWithdrawError('');

    if (withdrawPasswordConfirm !== 'password123' && withdrawPasswordConfirm !== 'admin123') {
      setWithdrawError('비밀번호 검증에 실패했습니다. 올바른 학부모 계정 암호를 입력해 주세요.');
      return;
    }

    if (selectedMinorToWithdraw) {
      setConnectedMinors(prev => 
        prev.map(minor => 
          minor.id === selectedMinorToWithdraw.id 
            ? { ...minor, status: 'SUSPENDED', booksCount: 0, subscription: '동의 철회됨 / 계정 정지' } 
            : minor
        )
      );
      setShowWithdrawConsentModal(false);
      setWithdrawPasswordConfirm('');
      triggerToast(`${selectedMinorToWithdraw.name} 자녀 계정의 서비스 동의가 철회 및 비활성화 처리되었습니다.`);
    }
  };

  // Handle Membership Withdrawal Action (회원 탈퇴)
  const handleWithdrawMembershipSubmit = (e) => {
    e.preventDefault();
    setWithdrawErrorMsg('');

    if (!agreeWithdrawTerms) {
      setWithdrawErrorMsg('탈퇴 약관 유의사항 및 연관 유실 데이터 인지 동의란에 체크가 필요합니다.');
      return;
    }

    if (!withdrawConfirmPw) {
      setWithdrawErrorMsg('본인 계정의 비밀번호를 기재해 주십시오.');
      return;
    }

    // Verify Password Simulation
    if (withdrawConfirmPw !== 'password123' && withdrawConfirmPw !== 'admin123') {
      setWithdrawErrorMsg('입력하신 본인 확인 패스워드가 장부 기록과 일치하지 않습니다.');
      return;
    }

    triggerToast('상상서가 회원 탈퇴가 최종 접수되었습니다. 30일 보관 유예 절차가 진행되며, 즉각 세션을 로그아웃 처리합니다.');
    
    setTimeout(() => {
      setShowWithdrawModal(false);
      onLogout(); // Safe session destroy
    }, 2500);
  };

  return (
    <div id="profile-edit-container" className="bg-[#FAF9FF] min-h-screen font-sans text-[#2F2D59] w-full px-0 py-0 pb-16 relative leading-relaxed overflow-x-hidden">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#110F24] border border-[#6B54E7]/40 text-white px-6 py-4.5 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <span className="text-white/95">{toastMessage}</span>
        </div>
      )}

      {/* Top Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#E6E2FC]/30 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-[#EDF5FF]/40 rounded-full filter blur-[100px] pointer-events-none"></div>

      {/* 1. Header Hero Panel (Slate Dark theme, matching SubscriptionView) */}
      <div className="relative w-full bg-[#110F24] text-white overflow-hidden rounded-b-[2.5rem] shadow-lg border-b border-[#2F2D59]/30 z-10 px-4 py-8 sm:py-12 sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(107,84,231,0.25),transparent)] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 relative z-10">
          
          {/* Back button and Tag */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 text-xs font-bold transition-all border border-white/5 active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>작가 홈으로 가기</span>
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#6B54E7]/30 text-[#B9B0DC] rounded-full text-xs font-semibold border border-[#6B54E7]/40">
              <Shield className="w-3.5 h-3.5 text-yellow-300" />
              <span>실시간 가입 및 계정 전산 보안 센터</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="text-left space-y-2 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
                <LockKeyhole className="w-8 h-8 text-[#835AF1] shrink-0" />
                <span>나의 아틀리에 보안 관리 대시보드</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#B9B0DC] leading-relaxed">
                나만의 고유한 작가 필명을 등록하고 메일 알림 수신 상태를 조정할 수 있습니다. 자녀가 있는 보호자 회원인 경우, 법정대리인 자격 검증과 가입 안심 수락까지 투명하게 조율합니다.
              </p>
            </div>

            {/* Quick security status card with glowing effect */}
            <div className="relative w-full lg:w-auto flex items-center gap-5 bg-white/[0.04] backdrop-blur-md px-6 py-5 rounded-2xl border border-white/10 shrink-0 text-left">
              <div className="absolute -top-3 -right-3 w-12 h-12 bg-[#6B54E7]/30 rounded-full filter blur-md"></div>
              
              <div className="space-y-1">
                <span className="text-[10px] text-[#B9B0DC] block tracking-wider font-bold uppercase">나의 안전 지수</span>
                <span className="text-sm sm:text-base font-black flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />
                  <span>매우 안전함 (1급)</span>
                </span>
              </div>
              
              <div className="h-10 w-[1px] bg-white/10"></div>
              
              <div className="space-y-1">
                <span className="text-[10px] text-[#B9B0DC] block tracking-wider font-bold uppercase">보호자 동의 상태</span>
                <span className="text-sm sm:text-base font-extrabold text-white block">
                  {isMinor ? '체결 완료 (보증됨)' : '대상 아님'}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 2. Unified Grid Layout Container */}
      <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 md:px-8 relative z-10">
        
        {/* Tab Navigation Segmented Menu */}
        <div className="flex border-b border-[#E6E2FC]/60 bg-white/70 backdrop-blur-md p-1.5 rounded-2xl mb-8 gap-2 w-full sm:w-fit shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`flex-1 sm:flex-none py-2.5 px-5 rounded-xl font-sans text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'basic' 
                ? 'bg-[#6B54E7] text-white shadow-md shadow-[#6B54E7]/15' 
                : 'text-[#7C769D] hover:text-[#2F2D59] hover:bg-[#E6E2FC]/15'
            }`}
          >
            <User className="w-4 h-4" />
            <span>기본 정보 및 계정 보안</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('guardian')}
            className={`flex-1 sm:flex-none py-2.5 px-5 rounded-xl font-sans text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer relative ${
              activeTab === 'guardian' 
                ? 'bg-[#6B54E7] text-white shadow-md shadow-[#6B54E7]/15' 
                : 'text-[#7C769D] hover:text-[#2F2D59] hover:bg-[#E6E2FC]/15'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>보호자 동의 및 자녀 관리</span>
            {isMinor && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>
        </div>

        {/* TAB 1: BASIC INFO */}
        {activeTab === 'basic' && (
          <form onSubmit={handleSaveProfile} className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Input Forms (8 cols) */}
              <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#E6E2FC]/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8">
                
                {/* 1. Nickname modification with duplicate checker */}
                <div className="space-y-4 text-left">
                  <div className="border-b border-[#E6E2FC]/40 pb-4">
                    <h3 className="text-base font-black text-[#2F2D59] flex items-center gap-2">
                      <span className="w-1.5 h-3 bg-[#6B54E7] rounded-full"></span>
                      <span>작가 공식 필명 설정</span>
                    </h3>
                    <p className="text-xs text-[#7C769D] mt-1 text-left">상상서가 창작 소설과 일러스트 책 표지에 영구적으로 기재될 작가 서명 이름입니다.</p>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <label className="block text-xs font-extrabold text-[#7C769D] uppercase tracking-wider">
                      공개 작가명 (필명) <span className="text-rose-500">*</span>
                    </label>
                    
                    <div className="flex gap-2.5">
                      <div className="relative flex-grow">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7C769D]">
                          <User className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          value={nickname}
                          onChange={(e) => {
                            setNickname(e.target.value);
                            setIsNicknameChecked(false);
                            setNicknameCheckMsg({ text: '필명이 바뀌었습니다. 우측 중복 확인을 다시 이행해 주세요.', isError: true });
                          }}
                          className="w-full pl-11 pr-4 py-3 bg-[#FAF9FF] hover:bg-neutral-100/50 focus:bg-white text-xs font-semibold border border-[#E6E2FC] focus:border-[#6B54E7] rounded-xl focus:outline-none transition-all placeholder-[#B9B0DC]"
                          placeholder="활동하실 공식 작가명을 적어주세요"
                        />
                      </div>
                      
                      <button
                        type="button"
                        onClick={handleCheckNicknameDuplicate}
                        className="px-5 py-3 bg-[#6B54E7] hover:bg-[#5b45d6] text-white rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer shadow-md shadow-[#6B54E7]/10 shrink-0"
                      >
                        실시간 중복 검증
                      </button>
                    </div>

                    <div className={`mt-2 flex items-center gap-1.5 text-xs text-left ${nicknameCheckMsg.isError ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {nicknameCheckMsg.isError ? (
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                      <span className="font-bold">{nicknameCheckMsg.text}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Password change inputs with current pass requirement */}
                <div className="border-t border-[#E6E2FC]/40 pt-8 space-y-4 text-left">
                  <div className="border-b border-[#E6E2FC]/40 pb-4 flex flex-wrap justify-between items-center gap-2">
                    <div>
                      <h3 className="text-base font-black text-[#2F2D59] flex items-center gap-2">
                        <span className="w-1.5 h-3 bg-[#6B54E7] rounded-full"></span>
                        <span>비밀번호 개정 및 2중 보호</span>
                      </h3>
                      <p className="text-xs text-[#7C769D] mt-1 text-left">정기적으로 계정 비밀번호를 갱신하여 작가님의 독창적 소설 자산을 단단하게 보존해 주세요.</p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setShowPwText(!showPwText)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FAF9FF] hover:bg-[#E6E2FC]/20 border border-[#E6E2FC] rounded-lg text-[11px] font-bold text-[#7C769D] hover:text-[#2F2D59] transition-all cursor-pointer"
                    >
                      {showPwText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showPwText ? '암호 마스킹' : '암호 보기'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-[#7C769D]">
                        현재 확인용 암호 <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C769D]"><Lock className="w-3.5 h-3.5" /></span>
                        <input
                          type={showPwText ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full pl-10 pr-3 py-3 bg-[#FAF9FF] text-xs font-semibold border border-[#E6E2FC] focus:border-[#6B54E7] rounded-xl focus:outline-none transition-all placeholder-[#B9B0DC]"
                          placeholder="현재 비밀번호 확인"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-[#7C769D]">개정할 신규 암호</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C769D]"><Key className="w-3.5 h-3.5" /></span>
                        <input
                          type={showPwText ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full pl-10 pr-3 py-3 bg-[#FAF9FF] text-xs font-semibold border border-[#E6E2FC] focus:border-[#6B54E7] rounded-xl focus:outline-none transition-all placeholder-[#B9B0DC]"
                          placeholder="신규 비밀번호 입력"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-[#7C769D]">새 암호 대조 재확인</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C769D]"><Key className="w-3.5 h-3.5" /></span>
                        <input
                          type={showPwText ? 'text' : 'password'}
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="w-full pl-10 pr-3 py-3 bg-[#FAF9FF] text-xs font-semibold border border-[#E6E2FC] focus:border-[#6B54E7] rounded-xl focus:outline-none transition-all placeholder-[#B9B0DC]"
                          placeholder="한 번 더 입력해 대조"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#FAF9FF] rounded-xl p-3.5 border border-[#E6E2FC]/60 text-[11px] text-[#7C769D] flex items-start gap-2 mt-3 text-left">
                    <ShieldAlert className="w-4 h-4 text-[#6B54E7] shrink-0 mt-0.5" />
                    <p>
                      가장 최근에 사용한 임시 계정 번호 혹은 <strong>"password123"</strong>은 안전 기준 준수를 위해 보안 시스템에 의해 개정 대용으로 사용할 수 없습니다. 대소문자 및 특수 기호를 융합하여 설정해 주세요.
                    </p>
                  </div>
                </div>

                {/* 3. Minor-specific Parent Email setup section */}
                {isMinor && (
                  <div className="border-t border-[#E6E2FC]/40 pt-8 space-y-4 text-left">
                    <div className="border-b border-[#E6E2FC]/40 pb-4 flex justify-between items-center flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-black tracking-tight rounded-md border border-rose-200">
                          만 14세 미만 보호자 확인용
                        </span>
                        <h3 className="text-base font-black text-[#2F2D59]">법정대리인(학부모) 연결 메일</h3>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setGuardianEmailEditMode(!guardianEmailEditMode)}
                        className="text-xs font-bold text-[#6B54E7] hover:text-[#5b45d6] hover:underline cursor-pointer"
                      >
                        {guardianEmailEditMode ? '수정 철회' : '대리인 승인 이메일 변경'}
                      </button>
                    </div>

                    <div className="bg-rose-50/40 p-5 rounded-2xl border border-rose-100 text-xs text-left space-y-4">
                      <div className="flex items-start gap-2.5">
                        <Shield className="text-rose-500 w-5 h-5 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="font-bold text-rose-950">법정대리인 권리 의무 보증</p>
                          <p className="text-[11px] text-rose-800 leading-normal">
                            회원님은 법률에 기거한 만 14세 이하 어린이 작가 회원이므로 안전 장치 보강을 위해 학부모님의 수락용 우편 배송지가 강제 보관되어 있습니다.
                          </p>
                        </div>
                      </div>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500">
                          <Mail className="w-4 h-4" />
                        </span>
                        <input
                          type="email"
                          disabled={!guardianEmailEditMode}
                          value={guardianEmail}
                          onChange={(e) => setGuardianEmail(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-white disabled:bg-rose-100/10 text-xs font-black border border-rose-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-xl focus:outline-none transition-all text-neutral-900"
                        />
                      </div>
                      
                      {guardianEmailEditMode && (
                        <div className="bg-white/80 p-3 rounded-xl border border-rose-200/50 text-[11px] text-rose-700 space-y-1">
                          <p>⚠️ <strong>보호자 메일 주소 변경 시 필수 유의사항:</strong></p>
                          <p>보호자 주소를 임의 변경 시 바뀐 메일 계정으로 안전 동의 편지가 신속 재배달되며, 7일 내로 메일 수락 단추를 누르지 않는 경우 법률 및 규정에 기거하여 청소년 계정은 즉시 안전 승인 보류(PENDING) 상태로 임시 제한 조치됩니다.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Saved changes & navigation buttons in base card */}
                <div className="pt-8 border-t border-[#E6E2FC]/40 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setWithdrawErrorMsg('');
                      setWithdrawConfirmPw('');
                      setAgreeWithdrawTerms(false);
                      setShowWithdrawModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-[#7C769D] hover:text-rose-600 font-extrabold transition-colors cursor-pointer hover:underline"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>상상서가 회원 탈퇴 신청하기</span>
                  </button>

                  <div className="flex gap-3 w-full sm:w-auto font-sans">
                    <button
                      type="button"
                      onClick={onNavigateHome}
                      className="flex-1 sm:flex-none px-5 py-3 bg-[#FAF9FF] hover:bg-[#E6E2FC]/30 text-[#6B54E7] border border-[#E6E2FC]/60 text-xs font-black rounded-xl transition-all cursor-pointer"
                    >
                      취소
                    </button>

                    <button
                      type="submit"
                      className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-[#5179E6] to-[#6B54E7] hover:opacity-95 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-[#6B54E7]/10 cursor-pointer"
                    >
                      저장된 변경사항 반영
                    </button>
                  </div>
                </div>

              </div>
              
              {/* Right Column: Status & Toggles Card (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-[#E6E2FC]/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8">
                
                {/* 1. Portrait illustration avatar card */}
                <div className="space-y-4 text-left">
                  <div className="border-b border-[#E6E2FC]/40 pb-3">
                    <h3 className="text-xs font-black text-[#2F2D59] uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#6B54E7]" />
                      <span>작가 초상화 아바타</span>
                    </h3>
                  </div>

                  <div className="flex flex-col items-center text-center py-4 space-y-4 bg-[#FAF9FF] rounded-2xl p-4 border border-[#E6E2FC]/30">
                    <div className="relative group">
                      <img 
                        src={profileImage} 
                        alt="Current Avatar" 
                        referrerPolicy="no-referrer"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md bg-white transition-all group-hover:scale-105"
                      />
                      
                      <label className="absolute bottom-0 right-0 p-2 bg-[#6B54E7] hover:bg-[#5b45d6] border-2 border-white rounded-full text-white cursor-pointer transition-all shadow-md">
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                setProfileImage(e.target.result);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <Camera className="w-3.5 h-3.5" />
                      </label>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-[#2F2D59]">책방 고유 작가 초상</h4>
                      <p className="text-[10px] text-[#7C769D] leading-normal px-2">
                        마음에 드는 시그니처 초상을 선택하거나, 직접 집필실 전경 또는 작가님 사진을 올려보세요.
                      </p>
                    </div>

                    {/* Predefined Beautiful Presets */}
                    <div className="flex justify-center gap-2 pt-1 border-t border-[#E6E2FC]/40 w-full pt-3">
                      {[
                        CURRENT_USER_PROFILE,
                        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
                        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150'
                      ].map((imgUrl, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setProfileImage(imgUrl);
                          }}
                          className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                            profileImage === imgUrl 
                              ? 'border-[#6B54E7] scale-110 shadow-md ring-1 ring-[#6B54E7]/30' 
                              : 'border-white opacity-60 hover:opacity-100 hover:scale-105'
                          }`}
                        >
                          <img src={imgUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="preset" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>


              </div>

            </div>
          </form>
        )}

        {/* TAB 2: GUARDIAN PORTAL (학부모 안심 동의) */}
        {activeTab === 'guardian' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Children list & Sandbox Simulator */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#E6E2FC]/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-10">
              
              {/* Children Register List */}
              <div className="space-y-4 text-left">
                <div className="border-b border-[#E6E2FC]/40 pb-4 flex flex-wrap justify-between items-center gap-3 bg-white">
                  <div>
                    <h3 className="text-base font-black text-[#2F2D59] flex items-center gap-2">
                      <span className="w-1.5 h-3 bg-[#6B54E7] rounded-full"></span>
                      <span>연결된 보호 자녀 목록</span>
                    </h3>
                    <p className="text-xs text-[#7C769D] mt-1 text-left">보호자 동의 협약이 정식 접수된 만 14세 미만 소속 어린 소설가 계정 일람입니다.</p>
                  </div>
                  
                  <span className="bg-[#FAF9FF] text-[#6B54E7] text-xs font-black px-3.5 py-1.5 rounded-full border border-[#E6E2FC] shrink-0 font-mono">
                    총 {connectedMinors.filter(m => m.status === 'ACTIVE').length}명 승인 완료
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {connectedMinors.map((minor) => (
                    <div 
                      key={minor.id} 
                      className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                        minor.status === 'ACTIVE' 
                          ? 'bg-white border-[#E6E2FC] hover:border-[#6B54E7]/40 shadow-xs' 
                          : 'bg-[#FAF9FF] border-dashed border-[#E6E2FC] text-[#7C769D]'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#E6E2FC]/30 rounded-xl flex items-center justify-center text-[#6B54E7] shrink-0 font-extrabold text-xs">
                              👦
                            </div>
                            <div className="text-left">
                              <span className={`text-xs font-black block ${minor.status === 'ACTIVE' ? 'text-[#2F2D59]' : 'text-[#7C769D]'}`}>
                                {minor.name}
                              </span>
                              <span className="text-[9px] text-[#7C769D] font-medium font-mono">ID: {minor.id}</span>
                            </div>
                          </div>
                          
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase ${
                            minor.status === 'ACTIVE' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}>
                            {minor.status === 'ACTIVE' ? '이용 승인됨' : '동의 철회 / 잠금'}
                          </span>
                        </div>

                        <div className="text-xs space-y-2 font-sans border-t border-[#E6E2FC]/40 pt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-[#7C769D] font-semibold">자녀 아이디 (이메일)</span>
                            <span className="text-[#2F2D59] font-bold font-mono">{minor.email}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-[#7C769D] font-semibold">자녀 생년월일</span>
                            <span className="text-[#2F2D59] font-bold">{minor.birthdate}</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-[#7C769D] font-semibold">총 생성 완료 소설책</span>
                            <span className="text-[#2F2D59] font-black font-mono bg-[#FAF9FF] px-2.5 py-0.5 rounded-md border border-[#E6E2FC]/50">{minor.booksCount} 권</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-[#7C769D] font-semibold">이용 중인 멤버십 요금</span>
                            <span className="text-[#6B54E7] font-extrabold">{minor.subscription}</span>
                          </div>
                          
                          <p className="text-[10px] text-[#7C769D] text-left pt-1 border-t border-dashed border-[#E6E2FC]/40">
                            동의 일자: {minor.joinedDate}
                          </p>
                        </div>
                      </div>

                      {minor.status === 'ACTIVE' && (
                        <div className="pt-4 border-t border-[#E6E2FC]/30 mt-4 flex justify-end font-sans">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMinorToWithdraw(minor);
                              setWithdrawPasswordConfirm('');
                              setWithdrawError('');
                              setShowWithdrawConsentModal(true);
                            }}
                            className="px-3.5 py-2 bg-neutral-900 hover:bg-black text-white text-[10px] font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            <span>법정 안전이용 동의 철회</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sandbox Approval Portal for simulated interactive parent consent flow */}
              <div className="border-t border-[#E6E2FC]/40 pt-8 space-y-4 text-left">
                <div className="border-b border-[#E6E2FC]/40 pb-4">
                  <h3 className="text-base font-black text-[#2F2D59] flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    <span>학부모 가입 수락 시뮬레이터 (Sandbox Portal)</span>
                  </h3>
                  <p className="text-xs text-[#7C769D] mt-1 text-left">
                    상상서가 가입을 시도하여 법정 대리인의 우편 검증을 안전 대기 중인 자녀의 신청을 실시간 확인하고 모의 통과시킬 수 있습니다.
                  </p>
                </div>

                <div className="bg-[#FAF9FF] p-5 border border-[#E6E2FC] rounded-2xl space-y-4 font-sans text-left relative overflow-hidden shadow-xs">
                  <div className="absolute top-0 right-0 bg-[#6B54E7] text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">
                    가상 승인 편지 수신함
                  </div>

                  <div className="flex flex-wrap justify-between items-center text-xs border-b border-[#E6E2FC] pb-3 bg-white/50 p-3 rounded-xl gap-2">
                    <span className="font-extrabold text-[#2F2D59]">📩 신규 연동 대기자: 이채민 (자녀, 만 11세)</span>
                    <span className="text-[#7C769D] font-mono">가상 대기 기한: 7일 남음</span>
                  </div>

                  <div className="text-xs text-[#2F2D59] space-y-1.5 pl-1 leading-relaxed">
                    <p>· <strong>수신 시각:</strong> 방금 전</p>
                    <p>· <strong>가입 요청 품목:</strong> 상상서가 아틀리에 청소년 독서실 입실 및 초안 체험 도서 보장권</p>
                    <p className="text-[11px] text-[#7C769D] italic pt-1 text-left bg-white border border-[#E6E2FC]/40 p-3 rounded-xl leading-normal">
                      "엄마, 아빠! 상상서가에서 직접 소설 단락을 창조해보고 예쁜 삽화 인공지능 명화를 엮어 제 이름으로 된 나만의 단편책을 출간해 보고 싶어요! 가입 동의 확인 단추를 눌러서 수락해 주세요!"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E6E2FC] flex justify-end gap-3.5 text-xs font-sans">
                    <button
                      type="button"
                      onClick={() => {
                        triggerToast('자녀의 가입 동의를 반려 처리하여, 이채민 어린이의 가입 요청은 중단 처리되었습니다.');
                      }}
                      className="px-4 py-2 bg-neutral-150 hover:bg-neutral-200 text-[#7C769D] font-bold rounded-xl cursor-pointer transition-all active:scale-95"
                    >
                      동의 반려
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const childApproved = {
                          id: `minor_gen_${Date.now().toString().slice(-3)}`,
                          name: '이채민 (자녀)',
                          email: 'chaemin@sangsang.com',
                          birthdate: '2015-11-20',
                          booksCount: 0,
                          subscription: '무료 새싹 작가 플랜 (기본 무료체험 1회 지급)',
                          status: 'ACTIVE',
                          joinedDate: '방금 전 동의함'
                        };
                        setConnectedMinors([childApproved, ...connectedMinors]);
                        triggerToast('🎉 동의 확인 성공! 이채민 어린이의 가입이 체결되어 책방 창작 활동이 승인되었습니다.');
                      }}
                      className="px-5 py-2 bg-[#6B54E7] text-white hover:bg-[#5b45d6] font-black rounded-xl cursor-pointer shadow-md shadow-[#6B54E7]/15 transition-all hover:scale-[1.02] active:scale-95"
                    >
                      안심 동의 수락 승인
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Portal Rules Guidelines Memo Card (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-[#110F24] text-white space-y-4 text-left shadow-lg rounded-3xl p-6 sm:p-8 border border-[#2F2D59]/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(107,84,231,0.15),transparent)] pointer-events-none"></div>
                
                <div className="flex items-center gap-2 font-black text-amber-400 text-xs uppercase tracking-wider relative z-10">
                  <Shield className="w-5 h-5 text-amber-400 fill-amber-400/10 shrink-0" />
                  <span>학부모 안심 동의 가이드</span>
                </div>
                
                <div className="space-y-4 text-xs font-sans leading-relaxed text-[#B9B0DC] relative z-10">
                  <p className="text-left">
                    상상서가 어린이가입 통제실은 관계 법령에 기거한 정보통신망법 제31조 규정을 성실하게 이행합니다.
                  </p>
                  
                  <div className="space-y-3.5 border-t border-[#2F2D59] pt-4 text-left">
                    <div className="flex gap-2.5 items-start">
                      <Check className="text-amber-400 w-4.5 h-4.5 shrink-0 mt-0.5" />
                      <p className="text-left text-white/90">청소년 창작자는 유해 폭력성 AI 학습을 강제로 제외한 <strong>순수 아동 템플릿 필터</strong>가 의무 가동됩니다.</p>
                    </div>
                    <div className="flex gap-2.5 items-start">
                      <Check className="text-amber-400 w-4.5 h-4.5 shrink-0 mt-0.5" />
                      <p className="text-left text-white/90">대리인 모의 검증을 통과하기 위한 학부모 확인용 비밀번호는 가상 모형상 <strong>"password123"</strong>으로 연동 처리되어 있습니다.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* MODAL 1: 자녀 이용동의 철회 경고 팝업 */}
      {showWithdrawConsentModal && selectedMinorToWithdraw && (
        <div className="fixed inset-0 bg-[#110F24]/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <form 
            onSubmit={handleWithdrawConsentSubmit}
            className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 text-left shadow-2xl space-y-5 border border-[#E6E2FC] relative animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center gap-2 text-rose-600 font-extrabold text-xs uppercase font-sans">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>법정대리 자녀 동의 철회 경고</span>
            </div>

            <h3 className="text-lg font-black text-[#2F2D59]">
              [{selectedMinorToWithdraw.name}] 어린이 작가의 가입 승인을 해제하겠습니까?
            </h3>

            <div className="text-xs text-[#7C769D] leading-relaxed font-sans bg-[#FAF9FF] p-4.5 rounded-2xl border border-[#E6E2FC] space-y-2.5">
              <p className="font-black text-rose-600">· 철회 신청 시 자녀 계정에 미치는 변동 사항:</p>
              <p>1. 자녀는 철회 승인과 동시에 강제 세션 로그아웃되며, 계정 지위는 <strong className="text-[#2F2D59]">'안전 정지'</strong>로 즉각 마스킹 조정됩니다.</p>
              <p>2. 자녀가 아틀리에 서재에 집필하여 보관 중이던 모든 소설 초고 원본은 복구 시점까지 보호 암호화 잠금 처리되어 접근이 전면 대기됩니다.</p>
              <p>3. 자녀 계정 전용으로 정기 가동 중이던 유료 멤버십 결제도 보호 차원에서 영속 안전 일시중지 처리됩니다.</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-[#7C769D]">보호자 본인확인 비밀번호</label>
              <input
                type="password"
                required
                value={withdrawPasswordConfirm}
                onChange={(e) => setWithdrawPasswordConfirm(e.target.value)}
                placeholder="비밀번호를 입력하여 검증하세요"
                className="w-full px-4 py-3 bg-[#FAF9FF] border border-[#E6E2FC] text-xs rounded-xl focus:outline-none transition-all placeholder-[#B9B0DC]"
              />
            </div>

            {withdrawError && (
              <p className="text-xs font-bold text-rose-600">· {withdrawError}</p>
            )}

            <div className="flex gap-3 pt-2 text-xs font-sans">
              <button
                type="button"
                onClick={() => setShowWithdrawConsentModal(false)}
                className="flex-1 py-3 bg-[#FAF9FF] hover:bg-[#E6E2FC]/30 text-[#6B54E7] border border-[#E6E2FC]/60 font-bold rounded-xl transition-all cursor-pointer text-center"
              >
                돌아가기 (철회 취소)
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl transition-all shadow-md shadow-rose-600/10 cursor-pointer text-center"
              >
                예, 동의를 철회합니다
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: MEMBERSHIP WITHDRAWAL (회원 탈퇴 상세 가공 모달) */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-[#110F24]/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-250">
          <form 
            onSubmit={handleWithdrawMembershipSubmit}
            className="bg-white max-w-lg w-full rounded-3xl p-6 sm:p-8 text-left shadow-2xl space-y-5 border border-[#E6E2FC] overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center gap-2 text-rose-600 font-extrabold text-xs uppercase font-sans">
              <ShieldAlert className="w-5 h-5 text-rose-600 animate-pulse shrink-0" />
              <span>상상서가 서비스 회원 탈퇴 경고</span>
            </div>

            <h3 className="text-lg font-black text-[#2F2D59]">
              상상서가 창작 서고 of 모든 연결을 완전히 탈퇴하겠습니까?
            </h3>

            <div className="text-xs text-[#7C769D] leading-relaxed font-sans bg-[#FAF9FF] p-5 rounded-2xl border border-[#E6E2FC] space-y-3.5">
              <h4 className="font-black text-rose-600">· 탈퇴 신청 전 유효 규격과 유실 조서 확인:</h4>
              
              <div className="space-y-2 pl-1 leading-relaxed text-left">
                <p><strong>1. 멤버십 청산:</strong> 가입 보존 중이던 유료 프리미엄 혜택은 탈퇴 즉시 자동 정지 종료되며 남은 집필 일수에 따른 환급이나 잔량 크레딧 복구는 소멸 적용됩니다.</p>
                <p><strong>2. 서평 및 독서 감평 익명 보존:</strong> 타인 창고 도서에 선물하셨던 감상평 및 덧글은 소설 흐름 맥락 보호를 위해 자동 삭제되지 않고 <strong>'알 수 없는 작가'</strong>로 익명 보호 마스킹 처리되어 온전 보존됩니다.</p>
                <p><strong>3. 서재 보관함 초기화:</strong> 가슴 따뜻하게 좋아해서 즐겨찾기 북마크 해두었던 책 보관함 목록은 흔적 없이 즉시 세정 초기화됩니다.</p>
                <p><strong>4. 30일 데이터 영속 보류 유예:</strong> 조작 실수에 의한 파괴 방지를 위해 30일의 유예 전산창이 발족합니다. 유예 중에는 기존 메일 주소로의 신규 동의 가입이 금지되며, 만료 후에는 복구 불가능하게 원본 작품이 완벽히 가상 소멸합니다.</p>
              </div>
            </div>

            {/* Radio options for public book disposal method */}
            <div className="space-y-3 border-t border-b border-[#E6E2FC] py-4">
              <span className="block text-xs font-extrabold text-[#2F2D59] uppercase tracking-wider">
                내가 출간 완료한 소설책의 최종 처리 유형 선택 <span className="text-rose-500">*</span>
              </span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer select-none transition-all ${
                  bookDisposalMethod === 'PRIVATE'
                    ? 'border-[#6B54E7] bg-[#E6E2FC]/10 ring-1 ring-[#6B54E7]/30'
                    : 'border-[#E6E2FC] hover:bg-[#FAF9FF]'
                }`}>
                  <input
                    type="radio"
                    name="bookDisposal"
                    value="PRIVATE"
                    checked={bookDisposalMethod === 'PRIVATE'}
                    onChange={() => setBookDisposalMethod('PRIVATE')}
                    className="mt-0.5 accent-[#6B54E7]"
                  />
                  <div className="space-y-0.5 text-xs text-left">
                    <p className="font-black text-[#2F2D59]">개인 보존 창고 보관</p>
                    <p className="text-[10px] text-[#7C769D] font-sans leading-normal">공개 진열대에서 책을 정식 철거하는 대신, 30일 동안 비공개 안전 가상 서고에 잠금 보존합니다.</p>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer select-none transition-all ${
                  bookDisposalMethod === 'DELETE'
                    ? 'border-rose-500 bg-rose-50/20 ring-1 ring-rose-500/30'
                    : 'border-[#E6E2FC] hover:bg-[#FAF9FF]'
                }`}>
                  <input
                    type="radio"
                    name="bookDisposal"
                    value="DELETE"
                    checked={bookDisposalMethod === 'DELETE'}
                    onChange={() => setBookDisposalMethod('DELETE')}
                    className="mt-0.5 accent-rose-600"
                  />
                  <div className="space-y-0.5 text-xs text-left">
                    <p className="font-black text-rose-950">모든 창작물 즉시 영구 영속 소멸</p>
                    <p className="text-[10px] text-rose-800 font-sans leading-normal">인공지능으로 집필한 이야기 소절과 맞춤 제작 책 전량을 즉시 복구 불가능하게 삭제 처리합니다.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Checkbox confirmation */}
            <div className="pt-1 font-sans text-left">
              <label className="flex items-start gap-3 text-xs text-[#2F2D59] cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeWithdrawTerms}
                  onChange={(e) => setAgreeWithdrawTerms(e.target.checked)}
                  className="mt-1 accent-[#6B54E7] rounded border-[#E6E2FC] shrink-0"
                />
                <span className="font-bold text-[#2F2D59] leading-relaxed">
                  [의무 동의] 회원 탈퇴에 의거한 창작 동화책 영구 마모 규정, 정기 구독 일할 환불 포기 및 30일 재가입 제약 등 모든 위험 고지안을 완전히 확인하여 이에 인가 승인합니다.
                </span>
              </label>
            </div>

            {/* Password input for withdrawal safety verification */}
            <div className="space-y-1.5 pt-2 text-left">
              <label className="block text-xs font-extrabold text-[#7C769D]">작가 본인 인증 확인 비밀번호 <span className="text-rose-500">*</span></label>
              <input
                type="password"
                required
                value={withdrawConfirmPw}
                onChange={(e) => setWithdrawConfirmPw(e.target.value)}
                placeholder="현재 가입 중이신 보안 암호를 대입해 주세요"
                className="w-full px-4 py-3 bg-[#FAF9FF] border border-[#E6E2FC] text-xs font-semibold rounded-xl focus:outline-none transition-all placeholder-[#B9B0DC]"
              />
            </div>

            {withdrawErrorMsg && (
              <p className="text-xs font-bold text-rose-600 leading-normal text-left">· {withdrawErrorMsg}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2 text-xs font-sans">
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                className="w-full py-3 bg-[#FAF9FF] hover:bg-[#E6E2FC]/30 text-[#6B54E7] border border-[#E6E2FC]/60 font-black rounded-xl transition-all shadow-xs text-center cursor-pointer"
              >
                돌아가기 (탈퇴 취소)
              </button>
              <button
                type="submit"
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl transition-all shadow-md shadow-rose-600/15 text-center cursor-pointer"
              >
                회원 탈퇴 완료 승인
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
