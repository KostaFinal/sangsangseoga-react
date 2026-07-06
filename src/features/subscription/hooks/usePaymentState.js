import { useState } from 'react';
import { subscriptionService } from '../services/subscriptionService';

/**
 * Custom Hook: usePaymentState
 *
 * 결제(PaymentView) 상태 및 비즈니스 로직 관리 훅.
 */
export const usePaymentState = ({ paymentParams, onPaymentSuccess }) => {
  const [cardNumber, setCardNumber] = useState('4571 8820 4400 9715');
  const [expiry, setExpiry] = useState('11/29');
  const [cvc, setCvc] = useState('389');
  const [passwordPrefix, setPasswordPrefix] = useState('12');
  const [birth, setBirth] = useState('951215');

  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // 2026-06-19 추가: 토스페이먼츠 승인 결과 모의 시뮬레이터 옵션
  const [simulatedStatus, setSimulatedStatus] = useState('SUCCESS'); // 'SUCCESS' | 'EXCEEDED_LIMIT' | 'INSUFFICIENT_BALANCE' | 'LOST_CARD'
  const [paymentPhase, setPaymentPhase] = useState('FORM'); // 'FORM' | 'PROCESSING' | 'FAILURE_SCREEN'
  const [failureReason, setFailureReason] = useState('');

  // Fallback defaults if paymentParams is empty
  const displayPrice = paymentParams?.price || 9900;
  const subPeriod = paymentParams?.subType === 'yearly' ? '연간' : '월간';

  const handleCardNumberChange = (e) => {
    setCardNumber(subscriptionService.formatCardNumber(e.target.value));
  };

  const handleExpiryChange = (e) => {
    setExpiry(subscriptionService.formatExpiry(e.target.value));
  };

  const handleCvcChange = (e) => {
    setCvc(e.target.value.replace(/[^0-9]/g, ''));
  };

  const handlePasswordPrefixChange = (e) => {
    setPasswordPrefix(e.target.value.replace(/[^0-9]/g, ''));
  };

  const handleBirthChange = (e) => {
    setBirth(e.target.value.replace(/[^0-9]/g, ''));
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    const validationError = subscriptionService.validatePaymentForm({ cardNumber, expiry, cvc });
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');

    setIsProcessing(true);
    setPaymentPhase('PROCESSING');

    const result = await subscriptionService.simulatePaymentApproval(simulatedStatus);
    setIsProcessing(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        onPaymentSuccess();
      }, 1200);
    } else {
      setFailureReason(result.failureReason);
      setPaymentPhase('FAILURE_SCREEN');
    }
  };

  const retryPayment = () => {
    setPaymentPhase('FORM');
    setError('');
  };

  return {
    cardNumber,
    expiry,
    cvc,
    passwordPrefix,
    birth,
    isProcessing,
    success,
    error,
    simulatedStatus, setSimulatedStatus,
    paymentPhase,
    failureReason,
    displayPrice,
    subPeriod,
    handleCardNumberChange,
    handleExpiryChange,
    handleCvcChange,
    handlePasswordPrefixChange,
    handleBirthChange,
    handlePayment,
    retryPayment,
  };
};
