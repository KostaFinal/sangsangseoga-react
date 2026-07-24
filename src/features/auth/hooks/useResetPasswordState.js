import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';

/**
 * Custom Hook: useResetPasswordState
 *
 * 비밀번호 재설정 이메일 링크(/reset-password?token=...)로 진입했을 때의 상태/로직.
 * usePasswordResetState(이메일 입력 → 발송 요청)와는 별개 — 여기는 링크의 token을 URL에서
 * 바로 읽어 검증하고 새 비밀번호를 설정하는 두 번째 단계만 담당한다.
 */
const RESET_ERROR_MESSAGES = {
  EXPIRED_RESET_TOKEN: '링크가 만료되었습니다. 비밀번호 재설정을 다시 요청해 주세요.',
  INVALID_RESET_TOKEN: '유효하지 않은 링크입니다. 비밀번호 재설정을 다시 요청해 주세요.',
  MEMBER_NOT_FOUND: '해당 계정을 찾을 수 없습니다.',
  WEAK_PASSWORD: '비밀번호는 영문+숫자+특수문자를 포함하여 8자 이상이어야 합니다.',
};

const resolveMessage = (err) => RESET_ERROR_MESSAGES[err.code] || err.message || '처리 중 문제가 발생했습니다.';

export const useResetPasswordState = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [stage, setStage] = useState('verifying'); // 'verifying' | 'ready' | 'invalid' | 'finished_success'
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordStrength = authService.getPasswordStrength(newPassword);

  useEffect(() => {
    if (!token) {
      setStage('invalid');
      setServerError('유효하지 않은 링크입니다. 이메일로 받은 링크를 다시 확인해 주세요.');
      return;
    }

    authService.verifyPasswordResetToken(token)
      .then(() => setStage('ready'))
      .catch((err) => {
        setStage('invalid');
        setServerError(resolveMessage(err));
      });
  }, [token]);

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
      await authService.confirmPasswordReset(token, newPassword);
      setStage('finished_success');
    } catch (err) {
      setServerError(resolveMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    stage,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    validationErrors,
    serverError,
    passwordStrength,
    isSubmitting,
    handlePasswordSubmit,
  };
};
