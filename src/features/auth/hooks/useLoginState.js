import { useState } from 'react';
import { authService } from '../services/authService';

/**
 * Custom Hook: useLoginState
 *
 * 로그인 화면(일반/관리자) 상태 및 비즈니스 로직 관리 훅.
 */
export const useLoginState = ({ onSuccess }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState('writer@sangsang.com');
  const [password, setPassword] = useState('password123');
  const [adminEmail, setAdminEmail] = useState('admin@sangsang.com');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isPendingMinor, setIsPendingMinor] = useState(false);
  const [showResendToast, setShowResendToast] = useState(false);

  const enterAdminMode = () => {
    setIsAdminMode(true);
    setError('');
  };

  const exitAdminMode = () => {
    setIsAdminMode(false);
    setError('');
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await authService.loginUser(email, password);
      setError('');
      if (result.pendingMinor) {
        setIsPendingMinor(true);
        return;
      }
      onSuccess(result.user);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      const adminUser = await authService.loginAdmin(adminEmail, adminPassword);
      setError('');
      onSuccess(adminUser);
    } catch (err) {
      setError(err.message);
    }
  };

  const resendGuardianMail = () => {
    setShowResendToast(true);
    setTimeout(() => setShowResendToast(false), 3000);
  };

  const acceptGuardianConsentDemo = () => {
    setIsPendingMinor(false);
    onSuccess({
      email,
      role: 'USER',
      nickname: '새싹작가_이채민',
      ageGroup: 'MINOR_U14',
      guardianEmail: 'parent.guardian@sangsang.com'
    });
  };

  const cancelPendingMinor = () => {
    setIsPendingMinor(false);
    setError('');
  };

  return {
    isAdminMode,
    enterAdminMode,
    exitAdminMode,
    email,
    setEmail,
    password,
    setPassword,
    adminEmail,
    setAdminEmail,
    adminPassword,
    setAdminPassword,
    rememberMe,
    setRememberMe,
    error,
    isPendingMinor,
    showResendToast,
    handleUserSubmit,
    handleAdminSubmit,
    resendGuardianMail,
    acceptGuardianConsentDemo,
    cancelPendingMinor,
  };
};
