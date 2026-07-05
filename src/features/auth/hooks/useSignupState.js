import { useState } from 'react';
import { authService } from '../services/authService';

/**
 * Custom Hook: useSignupState
 *
 * 회원가입(기본정보 → 보호자 동의) 상태 및 비즈니스 로직 관리 훅.
 */
export const useSignupState = ({ onSuccess }) => {
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

  const handleNextOrSubmit = (e) => {
    e.preventDefault();
    setError('');

    const validationError = authService.validateSignupInfo({ email, password, confirmPassword, agreeTerms });
    if (validationError) {
      setError(validationError);
      return;
    }

    const under14 = authService.checkIsMinorUnder14(birthdate);
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

    const validationError = authService.validateGuardianConsent({ guardianName, guardianEmail });
    if (validationError) {
      setError(validationError);
      return;
    }

    setShowSuccessModal(true);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    onSuccess();
  };

  return {
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    birthdate, setBirthdate,
    agreeTerms, setAgreeTerms,
    agreeMarketing, setAgreeMarketing,
    step, setStep,
    guardianEmail, setGuardianEmail,
    guardianName, setGuardianName,
    error,
    showSuccessModal,
    isMinorUnder14,
    showTermsModal, setShowTermsModal,
    handleNextOrSubmit,
    handleGuardianSubmit,
    handleModalClose,
  };
};
