import { useState } from 'react';
import { authService } from '../services/authService';

/**
 * Custom Hook: useLoginState
 *
 * 로그인 화면(일반/관리자) 상태 및 비즈니스 로직 관리 훅.
 * 일반/관리자 로그인 모두 동일한 /api/auth/login을 사용하며, role로 구분한다.
 */
export const useLoginState = ({ onSuccess }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

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
      const user = await authService.login(email, password, rememberMe);
      setError('');
      onSuccess(user);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await authService.login(adminEmail, adminPassword, false);
      if (user.role !== 'ADMIN') {
        authService.clearLocalSession();
        setError('관리자 권한이 없는 계정입니다.');
        return;
      }
      setError('');
      onSuccess(user);
    } catch (err) {
      setError(err.message);
    }
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
    handleUserSubmit,
    handleAdminSubmit,
  };
};
