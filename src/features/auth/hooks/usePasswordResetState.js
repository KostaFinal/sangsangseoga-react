import { useState } from 'react';
import { authService } from '../services/authService';

/**
 * Custom Hook: usePasswordResetState
 *
 * 비밀번호 재설정(요청 → 토큰 입력 → 새 비밀번호 설정) 상태 및 비즈니스 로직 관리 훅.
 * 실제 이메일 발송/토큰 검증은 백엔드가 수행하며(POST /api/auth/password/reset_request,
 * PATCH /api/auth/password/reset), 앱에 실제 라우팅이 없어 토큰은 사용자가 이메일에서
 * 직접 복사해 입력한다.
 */
export const usePasswordResetState = () => {
  const [email, setEmail] = useState('');
  const [stage, setStage] = useState('request');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [serverError, setServerError] = useState('');

  const passwordStrength = authService.getPasswordStrength(newPassword);

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

  const handleTokenSubmit = (e) => {
    e.preventDefault();
    if (!resetToken.trim()) {
      setServerError('이메일로 받은 인증 토큰을 입력해 주세요.');
      return;
    }
    setServerError('');
    setStage('new_password');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setValidationErrors([]);
    const errors = authService.validateNewPassword(newPassword, confirmPassword, passwordStrength);

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setServerError('');
    try {
      await authService.confirmPasswordReset(resetToken.trim(), newPassword);
      setStage('finished_success');
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
    resetToken, setResetToken,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    validationErrors,
    serverError,
    passwordStrength,
    handleRequestLink,
    handleTokenSubmit,
    handlePasswordSubmit,
  };
};
