import { useState, useEffect, useCallback } from 'react';
import { CURRENT_USER_PROFILE } from '../../../shared/data';
import { profileService } from '../services/profileService';

const AVATAR_PRESETS = [
  CURRENT_USER_PROFILE,
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150'
];

/**
 * Custom Hook: useProfileState
 *
 * 프로필 편집(기본 정보 및 계정 보안 / 보호자 동의 및 자녀 관리) 상태 및 비즈니스 로직 관리 훅.
 */
export const useProfileState = ({ currentUser, onUpdateProfile, onLogout }) => {
  // Navigation tabs: 'basic' (기본 정보 설정) | 'guardian' (학부모 안심 동의)
  const [activeTab, setActiveTab] = useState('basic');

  // Basic Profile States — 마운트 시 loadMyProfile()이 실제 값으로 채운다
  const [nickname, setNickname] = useState(currentUser?.nickname || '');
  const [isNicknameChecked, setIsNicknameChecked] = useState(true);
  const [nicknameCheckMsg, setNicknameCheckMsg] = useState({ text: '', isError: false });
  const [profileImage, setProfileImage] = useState(currentUser?.profileImageUrl || CURRENT_USER_PROFILE);
  const [introduction, setIntroduction] = useState('');

  // Password Modification States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPwText, setShowPwText] = useState(false);

  // Minor Under 14 specific Parent Email — 실제 프로필 조회 전까지는 알 수 없으므로 false로 시작
  const [isMinor, setIsMinor] = useState(false);
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianEmailEditMode, setGuardianEmailEditMode] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // Connected Minor accounts (보호자 기준 — 실제 연결된 자녀가 있을 때만 의미 있음)
  const [connectedMinors, setConnectedMinors] = useState([]);
  const [isConnectedMinorsLoading, setIsConnectedMinorsLoading] = useState(false);
  const [showWithdrawConsentModal, setShowWithdrawConsentModal] = useState(false);
  const [selectedMinorToWithdraw, setSelectedMinorToWithdraw] = useState(null);
  const [withdrawPasswordConfirm, setWithdrawPasswordConfirm] = useState('');
  const [withdrawError, setWithdrawError] = useState('');

  // 대기 중인 보호자 동의 요청 목록 (GET /api/guardian-consents/pending)
  const [pendingConsents, setPendingConsents] = useState([]);
  const [isPendingConsentsLoading, setIsPendingConsentsLoading] = useState(false);
  const [pendingConsentsError, setPendingConsentsError] = useState('');

  // "보호자 동의" 탭은 본인이 미성년자이거나 실제로 연결된/대기 중인 자녀가 있을 때만 노출
  const showGuardianTab = isMinor || connectedMinors.length > 0 || pendingConsents.length > 0;

  const loadMyProfile = useCallback(async () => {
    setIsProfileLoading(true);
    try {
      const profile = await profileService.getMyProfile();
      setNickname(profile.nickname);
      setProfileImage(profile.profileImageUrl || CURRENT_USER_PROFILE);
      setIntroduction(profile.introduction);
      setIsMinor(profile.isMinor);
      setGuardianEmail(profile.guardianEmail);
    } catch (err) {
      // 조회 실패 시 로그인 응답에 있던 값으로라도 유지
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  const loadPendingConsents = useCallback(async () => {
    setIsPendingConsentsLoading(true);
    setPendingConsentsError('');
    try {
      const list = await profileService.getPendingGuardianConsents();
      setPendingConsents(list);
    } catch (err) {
      setPendingConsentsError(err.message);
    } finally {
      setIsPendingConsentsLoading(false);
    }
  }, []);

  const loadConnectedMinors = useCallback(async () => {
    setIsConnectedMinorsLoading(true);
    try {
      const list = await profileService.getConnectedMinors();
      setConnectedMinors(list);
    } catch (err) {
      // 보호자가 아닌 계정이면 실패할 수 있음 — 조용히 빈 목록 유지
    } finally {
      setIsConnectedMinorsLoading(false);
    }
  }, []);

  // 마운트 시 내 프로필과 보호자 관련 데이터를 함께 조회해서, "보호자 동의" 탭을
  // 보여줘야 하는지(showGuardianTab) 처음부터 정확히 판단할 수 있게 한다.
  useEffect(() => {
    loadMyProfile();
    loadPendingConsents();
    loadConnectedMinors();
  }, [loadMyProfile, loadPendingConsents, loadConnectedMinors]);

  // Account Withdrawal States
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawConfirmPw, setWithdrawConfirmPw] = useState('');
  const [agreeWithdrawTerms, setAgreeWithdrawTerms] = useState(false);
  const [withdrawErrorMsg, setWithdrawErrorMsg] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // UI Toast Feedbacks
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // Nickname input change also invalidates the previous duplicate-check result
  const handleNicknameChange = (value) => {
    setNickname(value);
    setIsNicknameChecked(false);
    setNicknameCheckMsg({ text: '필명이 바뀌었습니다. 중복 확인을 다시 진행해 주세요.', isError: true });
  };

  // Real-time Nickname Duplicate Check
  const handleCheckNicknameDuplicate = async () => {
    try {
      const { available, message } = await profileService.checkNicknameAvailability(nickname);
      setNicknameCheckMsg({ text: message, isError: !available });
      setIsNicknameChecked(available);
    } catch (err) {
      setNicknameCheckMsg({ text: err.message, isError: true });
      setIsNicknameChecked(false);
    }
  };

  // 기본 정보(필명/자기소개/프로필사진/보호자 이메일) 저장 — 비밀번호와 별개로 저장
  const handleSaveBasicInfo = async (e) => {
    e.preventDefault();

    if (!isNicknameChecked) {
      triggerToast('닉네임 중복 확인을 먼저 진행해 주세요.');
      return;
    }

    try {
      await profileService.updateProfile({ nickname, profileImage, introduction });

      if (isMinor && guardianEmailEditMode) {
        await profileService.updateGuardianEmail(guardianEmail);
      }

      triggerToast('프로필이 저장되었습니다.');
      setGuardianEmailEditMode(false);
      if (onUpdateProfile) {
        onUpdateProfile({ nickname, profileImage, introduction });
      }
    } catch (err) {
      triggerToast(err.message);
    }
  };

  // 비밀번호 변경 — 기본 정보와 별개로 저장
  const handleSavePassword = async (e) => {
    e.preventDefault();

    if (!newPassword) {
      triggerToast('변경할 새 비밀번호를 입력해 주세요.');
      return;
    }

    const passwordError = profileService.validatePasswordChange({ currentPassword, newPassword, confirmNewPassword });
    if (passwordError) {
      triggerToast(passwordError);
      return;
    }

    try {
      await profileService.changePassword(currentPassword, newPassword);
      triggerToast('비밀번호가 변경되었습니다.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      triggerToast(err.message);
    }
  };

  const handleProfileImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploadedUrl = await profileService.uploadProfileImage(file);
      setProfileImage(uploadedUrl);
    } catch (err) {
      triggerToast(err.message);
    } finally {
      e.target.value = '';
    }
  };

  const openWithdrawModal = () => {
    setWithdrawErrorMsg('');
    setWithdrawConfirmPw('');
    setAgreeWithdrawTerms(false);
    setShowWithdrawModal(true);
  };

  const openWithdrawConsentModal = (minor) => {
    setSelectedMinorToWithdraw(minor);
    setWithdrawPasswordConfirm('');
    setWithdrawError('');
    setShowWithdrawConsentModal(true);
  };

  // Handle Parent Consent Withdrawal for Child — 비밀번호 검증은 서버가 수행
  const handleWithdrawConsentSubmit = async (e) => {
    e.preventDefault();
    setWithdrawError('');

    if (!selectedMinorToWithdraw) return;

    try {
      await profileService.withdrawGuardianConsent(selectedMinorToWithdraw.id, withdrawPasswordConfirm);
      setConnectedMinors(prev => prev.filter(minor => minor.id !== selectedMinorToWithdraw.id));
      setShowWithdrawConsentModal(false);
      setWithdrawPasswordConfirm('');
      triggerToast(`${selectedMinorToWithdraw.name} 계정의 보호자 동의가 철회되었습니다.`);
    } catch (err) {
      setWithdrawError(err.message);
    }
  };

  // Handle Membership Withdrawal Action (회원 탈퇴) - DELETE /api/members/me
  const handleWithdrawMembershipSubmit = async (e) => {
    e.preventDefault();
    setWithdrawErrorMsg('');

    if (!agreeWithdrawTerms) {
      setWithdrawErrorMsg('안내 사항 확인 및 동의 체크박스를 선택해 주세요.');
      return;
    }

    if (!withdrawConfirmPw) {
      setWithdrawErrorMsg('본인 계정의 비밀번호를 입력해 주세요.');
      return;
    }

    setIsWithdrawing(true);
    try {
      await profileService.withdrawMembership(withdrawConfirmPw);
      triggerToast('회원 탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다.');

      setTimeout(() => {
        setShowWithdrawModal(false);
        onLogout(); // Safe session destroy
      }, 2000);
    } catch (err) {
      setWithdrawErrorMsg(err.message);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleRejectGuardianRequest = async (consent) => {
    try {
      await profileService.decideGuardianConsent(consent.consentId, 'REJECTED');
      setPendingConsents(prev => prev.filter(c => c.consentId !== consent.consentId));
      triggerToast(`${consent.nickname} 어린이의 가입 요청을 반려했습니다.`);
    } catch (err) {
      triggerToast(err.message);
    }
  };

  const handleApproveGuardianRequest = async (consent) => {
    try {
      await profileService.decideGuardianConsent(consent.consentId, 'APPROVED');
      setPendingConsents(prev => prev.filter(c => c.consentId !== consent.consentId));
      triggerToast(`${consent.nickname} 어린이의 가입 동의가 승인되었습니다.`);
      loadConnectedMinors();
    } catch (err) {
      triggerToast(err.message);
    }
  };

  return {
    activeTab, setActiveTab,
    showGuardianTab,
    isProfileLoading,

    nickname,
    isNicknameChecked,
    nicknameCheckMsg,
    profileImage, setProfileImage,
    introduction, setIntroduction,
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
    isConnectedMinorsLoading,

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
    agreeWithdrawTerms, setAgreeWithdrawTerms,
    withdrawErrorMsg,
    isWithdrawing,
    openWithdrawModal,
    handleWithdrawMembershipSubmit,

    handleRejectGuardianRequest,
    handleApproveGuardianRequest,

    toastMessage,
    handleSaveBasicInfo,
    handleSavePassword,

    avatarPresets: AVATAR_PRESETS,
  };
};
