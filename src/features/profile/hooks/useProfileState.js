import { useState } from 'react';
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

  // Nickname input change also invalidates the previous duplicate-check result
  const handleNicknameChange = (value) => {
    setNickname(value);
    setIsNicknameChecked(false);
    setNicknameCheckMsg({ text: '필명이 바뀌었습니다. 우측 중복 확인을 다시 이행해 주세요.', isError: true });
  };

  // Real-time Nickname Duplicate Check
  const handleCheckNicknameDuplicate = async () => {
    const { available, message } = await profileService.checkNicknameAvailability(nickname);
    setNicknameCheckMsg({ text: message, isError: !available });
    setIsNicknameChecked(available);
    if (!available) {
      triggerToast('이미 등록된 필명입니다. 다른 닉네임을 설정하십시오.');
    } else {
      triggerToast('필명 중복 확인이 완료되었습니다!');
    }
  };

  // Handles updating basic profile details
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!isNicknameChecked) {
      triggerToast('닉네임 중복 체크를 먼저 진행해 주세요.');
      return;
    }

    const passwordError = profileService.validatePasswordChange({ currentPassword, newPassword, confirmNewPassword });
    if (passwordError) {
      triggerToast(passwordError);
      return;
    }

    await profileService.updateProfile({ nickname, profileImage });

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

  const handleProfileImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setProfileImage(event.target.result);
    };
    reader.readAsDataURL(file);
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

  // Handle Parent Consent Withdrawal for Child
  const handleWithdrawConsentSubmit = async (e) => {
    e.preventDefault();
    setWithdrawError('');

    if (!profileService.verifyAccountPassword(withdrawPasswordConfirm)) {
      setWithdrawError('비밀번호 검증에 실패했습니다. 올바른 학부모 계정 암호를 입력해 주세요.');
      return;
    }

    if (selectedMinorToWithdraw) {
      await profileService.withdrawGuardianConsent(selectedMinorToWithdraw.id);
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
  const handleWithdrawMembershipSubmit = async (e) => {
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

    if (!profileService.verifyAccountPassword(withdrawConfirmPw)) {
      setWithdrawErrorMsg('입력하신 본인 확인 패스워드가 장부 기록과 일치하지 않습니다.');
      return;
    }

    await profileService.withdrawMembership();
    triggerToast('상상서가 회원 탈퇴가 최종 접수되었습니다. 30일 보관 유예 절차가 진행되며, 즉각 세션을 로그아웃 처리합니다.');

    setTimeout(() => {
      setShowWithdrawModal(false);
      onLogout(); // Safe session destroy
    }, 2500);
  };

  const handleRejectGuardianRequest = () => {
    triggerToast('자녀의 가입 동의를 반려 처리하여, 이채민 어린이의 가입 요청은 중단 처리되었습니다.');
  };

  const handleApproveGuardianRequest = () => {
    const childApproved = profileService.createApprovedGuardianDemoChild();
    setConnectedMinors(prev => [childApproved, ...prev]);
    triggerToast('🎉 동의 확인 성공! 이채민 어린이의 가입이 체결되어 책방 창작 활동이 승인되었습니다.');
  };

  return {
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
    openWithdrawModal,
    handleWithdrawMembershipSubmit,

    handleRejectGuardianRequest,
    handleApproveGuardianRequest,

    toastMessage,
    handleSaveProfile,

    avatarPresets: AVATAR_PRESETS,
  };
};
