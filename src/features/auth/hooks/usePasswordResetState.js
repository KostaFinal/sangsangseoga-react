import { useState } from 'react';
import { authService } from '../services/authService';

/**
 * Custom Hook: usePasswordResetState
 *
 * 비밀번호 재설정 요청(이메일 입력 → 발송) 단계만 담당한다. 실제 토큰 검증/새 비밀번호
 * 설정은 이메일로 받은 링크(/reset-password?token=...)에서 useResetPasswordState가 처리한다.
 */
export const usePasswordResetState = () => {
  const [email, setEmail] = useState('');
  const [stage, setStage] = useState('request');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleRequestLink = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setServerError('');
    try {
      await authService.requestPasswordResetEmail(email);
      setStage('sent_success');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    email, setEmail,
    stage, setStage,
    isSubmitting,
    serverError,
    handleRequestLink,
  };
};
