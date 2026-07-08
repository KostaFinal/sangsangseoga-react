import React from 'react';
import {
  User,
  Shield,
  Trash2,
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
  Key,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { useProfileState } from '../hooks/useProfileState';

export const ProfileEditView = ({ currentUser, onNavigateHome, onUpdateProfile, onLogout }) => {
  const {
    activeTab, setActiveTab,

    nickname,
    isNicknameChecked,
    nicknameCheckMsg,
    profileImage, setProfileImage,
    handleNicknameChange,
    handleCheckNicknameDuplicate,
    handleProfileImageFileChange,

    currentPassword, setCurrentPassword,
    newPassword, setNewPassword,
    confirmNewPassword, setConfirmNewPassword,
    showPwText, setShowPwText,

    isMinor,
    guardianEmail, setGuardianEmail,
    guardianEmailEditMode, setGuardianEmailEditMode,

    connectedMinors,

    pendingConsents,
    isPendingConsentsLoading,
    pendingConsentsError,

    showWithdrawConsentModal, setShowWithdrawConsentModal,
    selectedMinorToWithdraw,
    withdrawPasswordConfirm, setWithdrawPasswordConfirm,
    withdrawError,
    openWithdrawConsentModal,
    handleWithdrawConsentSubmit,

    showWithdrawModal, setShowWithdrawModal,
    withdrawConfirmPw, setWithdrawConfirmPw,
    bookDisposalMethod, setBookDisposalMethod,
    agreeWithdrawTerms, setAgreeWithdrawTerms,
    withdrawErrorMsg,
    isWithdrawing,
    openWithdrawModal,
    handleWithdrawMembershipSubmit,

    handleRejectGuardianRequest,
    handleApproveGuardianRequest,

    toastMessage,
    handleSaveProfile,

    avatarPresets,
  } = useProfileState({ currentUser, onUpdateProfile, onLogout });

  return (
    <div id="profile-edit-container" className="bg-[#FAF9FF] min-h-screen font-sans text-[#2F2D59] w-full leading-relaxed">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#110F24] border border-[#6B54E7]/40 text-white px-6 py-4.5 rounded-2xl text-xs font-bold shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <span className="text-white/95">{toastMessage}</span>
        </div>
      )}

      {/* 2. Unified Grid Layout Container */}
      <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 md:px-8">

        <button
          onClick={onNavigateHome}
          className="group mb-6 flex items-center gap-1.5 text-sm font-black text-[#514c73] hover:text-[#5139d6] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>홈으로</span>
        </button>

        <h2 className="text-2xl font-black text-[#110F24] tracking-tight mb-6">내 정보 수정</h2>

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
            <span>기본 정보</span>
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
            <span>보호자 동의</span>
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
                      <span>필명 설정</span>
                    </h3>
                    <p className="text-xs text-[#7C769D] mt-1 text-left">책 표지에 표시될 작가 이름입니다.</p>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <label className="block text-xs font-extrabold text-[#7C769D] uppercase tracking-wider">
                      필명 <span className="text-rose-500">*</span>
                    </label>

                    <div className="flex gap-2.5">
                      <div className="relative flex-grow">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7C769D]">
                          <User className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          value={nickname}
                          onChange={(e) => handleNicknameChange(e.target.value)}
                          className="w-full pl-11 pr-4 py-3 bg-[#FAF9FF] hover:bg-neutral-100/50 focus:bg-white text-xs font-semibold border border-[#E6E2FC] focus:border-[#6B54E7] rounded-xl focus:outline-none transition-all placeholder-[#B9B0DC]"
                          placeholder="사용할 필명을 입력하세요"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleCheckNicknameDuplicate}
                        className="px-5 py-3 bg-[#6B54E7] hover:bg-[#5b45d6] text-white rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer shadow-md shadow-[#6B54E7]/10 shrink-0"
                      >
                        중복 확인
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
                        <span>비밀번호 변경</span>
                      </h3>
                      <p className="text-xs text-[#7C769D] mt-1 text-left">정기적으로 비밀번호를 변경해 계정을 안전하게 보호하세요.</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowPwText(!showPwText)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FAF9FF] hover:bg-[#E6E2FC]/20 border border-[#E6E2FC] rounded-lg text-[11px] font-bold text-[#7C769D] hover:text-[#2F2D59] transition-all cursor-pointer"
                    >
                      {showPwText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showPwText ? '숨기기' : '보기'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-[#7C769D]">
                        현재 비밀번호 <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C769D]"><Lock className="w-3.5 h-3.5" /></span>
                        <input
                          type={showPwText ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full pl-10 pr-3 py-3 bg-[#FAF9FF] text-xs font-semibold border border-[#E6E2FC] focus:border-[#6B54E7] rounded-xl focus:outline-none transition-all placeholder-[#B9B0DC]"
                          placeholder="현재 비밀번호"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-[#7C769D]">새 비밀번호</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C769D]"><Key className="w-3.5 h-3.5" /></span>
                        <input
                          type={showPwText ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full pl-10 pr-3 py-3 bg-[#FAF9FF] text-xs font-semibold border border-[#E6E2FC] focus:border-[#6B54E7] rounded-xl focus:outline-none transition-all placeholder-[#B9B0DC]"
                          placeholder="새 비밀번호"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-extrabold text-[#7C769D]">새 비밀번호 확인</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7C769D]"><Key className="w-3.5 h-3.5" /></span>
                        <input
                          type={showPwText ? 'text' : 'password'}
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="w-full pl-10 pr-3 py-3 bg-[#FAF9FF] text-xs font-semibold border border-[#E6E2FC] focus:border-[#6B54E7] rounded-xl focus:outline-none transition-all placeholder-[#B9B0DC]"
                          placeholder="새 비밀번호 확인"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#FAF9FF] rounded-xl p-3.5 border border-[#E6E2FC]/60 text-[11px] text-[#7C769D] flex items-start gap-2 mt-3 text-left">
                    <ShieldAlert className="w-4 h-4 text-[#6B54E7] shrink-0 mt-0.5" />
                    <p>
                      이전 비밀번호나 <strong>"password123"</strong>은 사용할 수 없습니다. 영문 대소문자와 특수문자를 포함해 설정해 주세요.
                    </p>
                  </div>
                </div>

                {/* 3. Minor-specific Parent Email setup section */}
                {isMinor && (
                  <div className="border-t border-[#E6E2FC]/40 pt-8 space-y-4 text-left">
                    <div className="border-b border-[#E6E2FC]/40 pb-4 flex justify-between items-center flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-black tracking-tight rounded-md border border-rose-200">
                          만 14세 미만
                        </span>
                        <h3 className="text-base font-black text-[#2F2D59]">보호자 이메일</h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => setGuardianEmailEditMode(!guardianEmailEditMode)}
                        className="text-xs font-bold text-[#6B54E7] hover:text-[#5b45d6] hover:underline cursor-pointer"
                      >
                        {guardianEmailEditMode ? '취소' : '이메일 변경'}
                      </button>
                    </div>

                    <div className="bg-rose-50/40 p-5 rounded-2xl border border-rose-100 text-xs text-left space-y-4">
                      <div className="flex items-start gap-2.5">
                        <Shield className="text-rose-500 w-5 h-5 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="font-bold text-rose-950">보호자 동의 필요</p>
                          <p className="text-[11px] text-rose-800 leading-normal">
                            만 14세 미만 회원은 보호자 이메일 등록이 필요합니다.
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
                          <p>이메일을 변경하면 새 주소로 동의 메일이 재발송됩니다. 7일 내 승인하지 않으면 계정이 일시 제한됩니다.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Saved changes & navigation buttons in base card */}
                <div className="pt-8 border-t border-[#E6E2FC]/40 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <button
                    type="button"
                    onClick={openWithdrawModal}
                    className="inline-flex items-center gap-1.5 text-xs text-[#7C769D] hover:text-rose-600 font-extrabold transition-colors cursor-pointer hover:underline"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>회원 탈퇴</span>
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
                      저장
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
                      <span>프로필 사진</span>
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
                          onChange={handleProfileImageFileChange}
                        />
                        <Camera className="w-3.5 h-3.5" />
                      </label>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] text-[#7C769D] leading-normal px-2">
                        기본 이미지를 선택하거나 직접 사진을 업로드하세요.
                      </p>
                    </div>

                    {/* Predefined Beautiful Presets */}
                    <div className="flex justify-center gap-2 pt-1 border-t border-[#E6E2FC]/40 w-full pt-3">
                      {avatarPresets.map((imgUrl, i) => (
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
                      <span>연결된 자녀 목록</span>
                    </h3>
                    <p className="text-xs text-[#7C769D] mt-1 text-left">동의가 완료된 자녀 계정 목록입니다.</p>
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
                            onClick={() => openWithdrawConsentModal(minor)}
                            className="px-3.5 py-2 bg-neutral-900 hover:bg-black text-white text-[10px] font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            <span>동의 철회</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Guardian Consent Requests (실시간 대기 목록) */}
              <div className="border-t border-[#E6E2FC]/40 pt-8 space-y-4 text-left">
                <div className="border-b border-[#E6E2FC]/40 pb-4">
                  <h3 className="text-base font-black text-[#2F2D59] flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    <span>보호자 동의 대기 목록</span>
                  </h3>
                  <p className="text-xs text-[#7C769D] mt-1 text-left">
                    승인을 기다리는 자녀 가입 신청입니다.
                  </p>
                </div>

                {isPendingConsentsLoading && (
                  <div className="text-xs text-[#7C769D] font-semibold p-4">불러오는 중...</div>
                )}

                {!isPendingConsentsLoading && pendingConsentsError && (
                  <div className="text-xs text-rose-600 font-bold p-4 bg-rose-50 border border-rose-200 rounded-xl">
                    {pendingConsentsError}
                  </div>
                )}

                {!isPendingConsentsLoading && !pendingConsentsError && pendingConsents.length === 0 && (
                  <div className="text-xs text-[#7C769D] font-semibold p-4 bg-[#FAF9FF] border border-dashed border-[#E6E2FC] rounded-xl text-center">
                    현재 대기 중인 동의 요청이 없습니다.
                  </div>
                )}

                {pendingConsents.map((consent) => (
                  <div
                    key={consent.consentId}
                    className="bg-[#FAF9FF] p-5 border border-[#E6E2FC] rounded-2xl space-y-4 font-sans text-left relative overflow-hidden shadow-xs"
                  >
                    <div className="absolute top-0 right-0 bg-[#6B54E7] text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">
                      승인 대기 중
                    </div>

                    <div className="flex flex-wrap justify-between items-center text-xs border-b border-[#E6E2FC] pb-3 bg-white/50 p-3 rounded-xl gap-2">
                      <span className="font-extrabold text-[#2F2D59]">{consent.nickname} ({consent.email})</span>
                      <span className="text-[#7C769D] font-mono">만료: {consent.expiresAt}</span>
                    </div>

                    <div className="text-xs text-[#2F2D59] space-y-1.5 pl-1 leading-relaxed">
                      <p>· <strong>요청 시각:</strong> {consent.requestedAt}</p>
                      <p>· <strong>자녀 생년월일:</strong> {consent.birthDate}</p>
                    </div>

                    <div className="pt-4 border-t border-[#E6E2FC] flex justify-end gap-3.5 text-xs font-sans">
                      <button
                        type="button"
                        onClick={() => handleRejectGuardianRequest(consent)}
                        className="px-4 py-2 bg-neutral-150 hover:bg-neutral-200 text-[#7C769D] font-bold rounded-xl cursor-pointer transition-all active:scale-95"
                      >
                        동의 반려
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproveGuardianRequest(consent)}
                        className="px-5 py-2 bg-[#6B54E7] text-white hover:bg-[#5b45d6] font-black rounded-xl cursor-pointer shadow-md shadow-[#6B54E7]/15 transition-all hover:scale-[1.02] active:scale-95"
                      >
                        동의 승인
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Right Column: Portal Rules Guidelines Memo Card (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-[#110F24] text-white space-y-4 text-left shadow-lg rounded-3xl p-6 sm:p-8 border border-[#2F2D59]/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(107,84,231,0.15),transparent)] pointer-events-none"></div>
                
                <div className="flex items-center gap-2 font-black text-amber-400 text-xs uppercase tracking-wider relative z-10">
                  <Shield className="w-5 h-5 text-amber-400 fill-amber-400/10 shrink-0" />
                  <span>보호자 동의 안내</span>
                </div>

                <div className="space-y-4 text-xs font-sans leading-relaxed text-[#B9B0DC] relative z-10">
                  <p className="text-left">
                    정보통신망법 제31조에 따라 만 14세 미만 회원의 가입에는 보호자 동의가 필요합니다.
                  </p>

                  <div className="space-y-3.5 border-t border-[#2F2D59] pt-4 text-left">
                    <div className="flex gap-2.5 items-start">
                      <Check className="text-amber-400 w-4.5 h-4.5 shrink-0 mt-0.5" />
                      <p className="text-left text-white/90">청소년 회원에게는 안전한 콘텐츠 필터가 자동으로 적용됩니다.</p>
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
              <span>동의 철회 확인</span>
            </div>

            <h3 className="text-lg font-black text-[#2F2D59]">
              {selectedMinorToWithdraw.name}의 계정 동의를 철회하시겠습니까?
            </h3>

            <div className="text-xs text-[#7C769D] leading-relaxed font-sans bg-[#FAF9FF] p-4.5 rounded-2xl border border-[#E6E2FC] space-y-2.5">
              <p className="font-black text-rose-600">철회 시 다음과 같이 처리됩니다:</p>
              <p>1. 자녀 계정은 즉시 로그아웃되고 <strong className="text-[#2F2D59]">정지</strong> 상태로 전환됩니다.</p>
              <p>2. 작성 중이던 작품은 잠금 처리되어 접근할 수 없습니다.</p>
              <p>3. 진행 중이던 유료 구독도 일시 중지됩니다.</p>
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
                취소
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl transition-all shadow-md shadow-rose-600/10 cursor-pointer text-center"
              >
                철회하기
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
              <span>회원 탈퇴 확인</span>
            </div>

            <h3 className="text-lg font-black text-[#2F2D59]">
              정말 회원 탈퇴를 진행하시겠습니까?
            </h3>

            <div className="text-xs text-[#7C769D] leading-relaxed font-sans bg-[#FAF9FF] p-5 rounded-2xl border border-[#E6E2FC] space-y-3.5">
              <h4 className="font-black text-rose-600">탈퇴 시 다음 사항이 적용됩니다:</h4>

              <div className="space-y-2 pl-1 leading-relaxed text-left">
                <p><strong>1. 구독 종료:</strong> 프리미엄 구독은 즉시 종료되며 잔여 기간에 대한 환불은 없습니다.</p>
                <p><strong>2. 댓글/독후감:</strong> 작성한 댓글과 독후감은 삭제되지 않고 <strong>'알 수 없는 작가'</strong>로 표시됩니다.</p>
                <p><strong>3. 서재 초기화:</strong> 위시리스트와 서재 목록은 모두 삭제됩니다.</p>
                <p><strong>4. 재가입 제한:</strong> 탈퇴 후 30일간은 동일 이메일로 재가입할 수 없으며, 이후 모든 데이터가 영구 삭제됩니다.</p>
              </div>
            </div>

            {/* Radio options for public book disposal method */}
            <div className="space-y-3 border-t border-b border-[#E6E2FC] py-4">
              <span className="block text-xs font-extrabold text-[#2F2D59] uppercase tracking-wider">
                출간한 작품 처리 방법 선택 <span className="text-rose-500">*</span>
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
                    <p className="font-black text-[#2F2D59]">비공개 보관</p>
                    <p className="text-[10px] text-[#7C769D] font-sans leading-normal">공개 목록에서 내리고 30일간 비공개로 보관합니다.</p>
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
                    <p className="font-black text-rose-950">즉시 영구 삭제</p>
                    <p className="text-[10px] text-rose-800 font-sans leading-normal">작성한 모든 작품을 복구할 수 없게 즉시 삭제합니다.</p>
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
                  위 안내 사항을 모두 확인했으며 이에 동의합니다.
                </span>
              </label>
            </div>

            {/* Password input for withdrawal safety verification */}
            <div className="space-y-1.5 pt-2 text-left">
              <label className="block text-xs font-extrabold text-[#7C769D]">비밀번호 확인 <span className="text-rose-500">*</span></label>
              <input
                type="password"
                required
                value={withdrawConfirmPw}
                onChange={(e) => setWithdrawConfirmPw(e.target.value)}
                placeholder="현재 비밀번호를 입력하세요"
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
                취소
              </button>
              <button
                type="submit"
                disabled={isWithdrawing}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl transition-all shadow-md shadow-rose-600/15 text-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isWithdrawing ? '처리 중...' : '탈퇴하기'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
