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
  const [socialInfoMessage, setSocialInfoMessage] = useState('');

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

  /** 소셜 로그인을 팝업 창으로 열고, 팝업이 postMessage로 결과를 보내오면 처리 */
  const handleSocialLogin = (provider) => {
    setError('');
    setSocialInfoMessage('');

    const width = 480;
    const height = 800;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const popup = window.open(
      `/login/social/${provider}`,
      'sangsang-social-login',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      setError('팝업이 차단되었습니다. 브라우저의 팝업 차단을 해제한 뒤 다시 시도해 주세요.');
      return;
    }

    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== 'SOCIAL_AUTH_RESULT') return;

      window.removeEventListener('message', handleMessage);
      clearInterval(popupWatcher);

      const { pendingGuardianConsent, user } = event.data.payload || {};
      if (pendingGuardianConsent) {
        setSocialInfoMessage('보호자님 이메일로 동의 안내를 보냈습니다. 보호자님이 승인하시면 로그인할 수 있습니다.');
        return;
      }
      onSuccess(user);
    };
    window.addEventListener('message', handleMessage);

    // 사용자가 팝업을 그냥 닫아버린 경우 리스너를 정리
    const popupWatcher = setInterval(() => {
      if (popup.closed) {
        clearInterval(popupWatcher);
        window.removeEventListener('message', handleMessage);
      }
    }, 500);
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
    socialInfoMessage,
    handleUserSubmit,
    handleAdminSubmit,
    handleSocialLogin,
  };
};
