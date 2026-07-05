import { useState } from 'react';
import { authService } from '../services/authService';

/**
 * Custom Hook: usePasswordResetState
 *
 * 비밀번호 재설정(요청 → 메일 확인 → 새 비밀번호 설정) 상태 및 비즈니스 로직 관리 훅.
 */
export const usePasswordResetState = () => {
  const [email, setEmail] = useState('writer@sangsang.com');
  const [stage, setStage] = useState('request');

  const [redisTokens, setRedisTokens] = useState({});
  const [activeToken, setActiveToken] = useState(null);
  const [simulatedInbox, setSimulatedInbox] = useState([]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [serverError, setServerError] = useState('');

  const passwordStrength = authService.getPasswordStrength(newPassword);

  const handleRequestLink = async (e) => {
    e.preventDefault();
    if (!email) return;

    const { tokenRecord, mailItem } = await authService.requestPasswordResetEmail(email);

    setRedisTokens(prev => ({
      ...prev,
      [tokenRecord.token]: tokenRecord
    }));
    setSimulatedInbox([mailItem, ...simulatedInbox]);
    setStage('sent_success');
  };

  const handleLinkClick = (tokenUuid) => {
    const record = redisTokens[tokenUuid];
    const validationError = authService.verifyResetToken(record);

    if (validationError) {
      setServerError(validationError);
      return;
    }

    setActiveToken(tokenUuid);
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

    if (activeToken) {
      setRedisTokens(prev => ({
        ...prev,
        [activeToken]: {
          ...prev[activeToken],
          used: true
        }
      }));
    }

    await authService.confirmPasswordReset(newPassword);
    setStage('finished_success');
  };

  return {
    email, setEmail,
    stage, setStage,
    simulatedInbox,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    validationErrors,
    serverError,
    passwordStrength,
    handleRequestLink,
    handleLinkClick,
    handlePasswordSubmit,
  };
};
