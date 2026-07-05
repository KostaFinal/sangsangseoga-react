import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

const INITIAL_EXCHANGE_STEPS = [
  { text: '소셜 로그인 인증 확인', status: 'pending' },
  { text: '보안 전송 채널 검증', status: 'idle' },
  { text: '이메일 및 프로필 연동 완료', status: 'idle' },
  { text: '작가 정보 등록', status: 'idle' },
  { text: '개인 서재 설정', status: 'idle' },
  { text: '로그인 완료', status: 'idle' }
];

/**
 * Custom Hook: useSocialAuthState
 *
 * 소셜 로그인(동의 → 콜백 교환 → 보호자 동의 → 완료) 상태 및 비즈니스 로직 관리 훅.
 */
export const useSocialAuthState = ({ selectedProvider, onSuccess }) => {
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

  const [exchangeState, setExchangeState] = useState(INITIAL_EXCHANGE_STEPS);

  useEffect(() => {
    if (selectedProvider) {
      setProvider(selectedProvider);
    }
  }, [selectedProvider]);

  useEffect(() => {
    setIsMinorUnder14(authService.checkIsMinorUnder14(birthdate));
  }, [birthdate]);

  const selectProvider = (nextProvider) => {
    setProvider(nextProvider);
    setStep('consent');
  };

  const toggleAgreeAll = (checked) => {
    setAgreeAll(checked);
    setAgreeProfile(checked);
    setAgreeEmail(checked);
    setAgreeTerms(checked);
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

  const handleConsentSubmit = (e) => {
    e.preventDefault();
    if (!agreeProfile || !agreeEmail || !agreeTerms) {
      alert('필수 동의 항목을 선택해 주세요.');
      return;
    }

    setStep('callback_exchange');
    runTokenExchangeLogs();
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

  const proceedToSuccess = () => {
    setStep('on_success');
  };

  const handleFinalSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
  };

  return {
    provider,
    selectProvider,
    step, setStep,
    birthdate, setBirthdate,
    isMinorUnder14,
    agreeAll,
    agreeProfile, setAgreeProfile,
    agreeEmail, setAgreeEmail,
    agreeTerms, setAgreeTerms,
    toggleAgreeAll,
    guardianName, setGuardianName,
    guardianEmail, setGuardianEmail,
    guardianTokenSent,
    guardianApproved,
    exchangeState,
    handleConsentSubmit,
    handleGuardianRequest,
    simulateGuardianApprove,
    proceedToSuccess,
    handleFinalSuccess,
  };
};
