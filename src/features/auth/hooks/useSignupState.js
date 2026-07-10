import { useState } from 'react';
import { authService } from '../services/authService';

/**
 * Custom Hook: useSignupState
 *
 * 회원가입(기본정보 → 보호자 동의) 상태 및 비즈니스 로직 관리 훅.
 * 1) POST /api/auth/signup 으로 계정을 생성하고,
 * 2) 만 14세 미만이면 발급된 memberId로 POST /api/guardian-consents 를 호출한다.
 */
export const useSignupState = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [birthdate, setBirthdate] = useState('2015-05-15');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [step, setStep] = useState('info');
  const [memberId, setMemberId] = useState(null);
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianName, setGuardianName] = useState('');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isMinorUnder14, setIsMinorUnder14] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(null);

  // 입력 중인 생년월일 기준으로 실시간으로 계산 — 보호자 동의 안내 문구 표시 여부에 사용
  const willNeedGuardianConsent = authService.checkIsMinorUnder14(birthdate);

  const handleNextOrSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = authService.validateSignupInfo({ email, password, confirmPassword, nickname, birthdate, agreeTerms });
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const signedUpMember = await authService.signup({ email, password, nickname, birthDate: birthdate });
      setMemberId(signedUpMember.memberId);

      const under14 = authService.checkIsMinorUnder14(birthdate);
      setIsMinorUnder14(under14);

      if (under14) {
        setStep('guardian_consent');
      } else {
        setShowSuccessModal(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuardianSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = authService.validateGuardianConsent({ guardianName, guardianEmail });
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.requestGuardianConsent(memberId, guardianName, guardianEmail);
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    // 만 14세 미만은 보호자 동의가 완료되기 전이므로 로그인 상태로 넘어가면 안 됨 —
    // 이 경우엔 로그인 화면으로 돌려보내도록 호출부에 알려준다.
    onSuccess({ pendingGuardianConsent: isMinorUnder14 });
  };

  return {
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    nickname, setNickname,
    birthdate, setBirthdate,
    agreeTerms, setAgreeTerms,
    step, setStep,
    guardianEmail, setGuardianEmail,
    guardianName, setGuardianName,
    error,
    isSubmitting,
    showSuccessModal,
    isMinorUnder14,
    willNeedGuardianConsent,
    showTermsModal, setShowTermsModal,
    handleNextOrSubmit,
    handleGuardianSubmit,
    handleModalClose,
  };
};
