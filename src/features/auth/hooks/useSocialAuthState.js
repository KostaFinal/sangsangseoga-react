import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';

/**
 * Custom Hook: useSocialAuthState
 *
 * 소셜 로그인(카카오/네이버) 상태 및 비즈니스 로직 관리 훅.
 *
 * /login/social/:provider 페이지는 두 가지 상태로 진입한다:
 * 1) code 쿼리스트링이 없음 → 방금 헤더/로그인 화면에서 버튼을 눌러 들어온 시작 지점.
 *    바로 해당 provider의 인가 페이지로 리다이렉트한다(진짜 동의 화면은 provider가 보여줌).
 * 2) code 쿼리스트링이 있음 → provider가 로그인 후 돌려보낸 콜백.
 *    code를 백엔드로 넘겨 로그인/가입을 완료한다.
 */
export function useSocialAuthState({ selectedProvider, onSuccess }) {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');

  const [phase, setPhase] = useState(code ? 'processing' : 'redirecting');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 신규 회원 + provider가 생년월일을 안 줬을 때 채우는 항목
  const [oauthSignupToken, setOauthSignupToken] = useState(null);
  const [nickname, setNickname] = useState('');
  const [birthdate, setBirthdate] = useState('');

  // 신규 회원 + 만 14세 미만일 때 채우는 보호자 정보
  const [memberId, setMemberId] = useState(null);
  const [guardianName, setGuardianName] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');

  const redirectUri = `${window.location.origin}/login/social/${selectedProvider}`;
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    if (!code) {
      authService.redirectToOAuthProvider(selectedProvider, redirectUri).catch((err) => {
        setError(err.message);
        setPhase('error');
      });
      return;
    }

    (async () => {
      try {
        const result = await authService.exchangeOAuthCode(selectedProvider, code, redirectUri);
        applyResult(result);
      } catch (err) {
        setError(err.message);
        setPhase('error');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyResult = (result) => {
    if (result.status === 'LOGGED_IN') {
      onSuccess({
        pendingGuardianConsent: false,
        user: {
          memberId: result.memberId,
          email: result.email,
          nickname: result.nickname,
          profileImageUrl: result.profileImageUrl,
          role: result.role,
        },
      });
      return;
    }
    if (result.status === 'NEEDS_GUARDIAN_CONSENT') {
      setMemberId(result.memberId);
      setPhase('need-guardian-consent');
      return;
    }
    if (result.status === 'NEEDS_BIRTHDATE') {
      setOauthSignupToken(result.oauthSignupToken);
      setNickname(result.nickname || '');
      setPhase('need-birthdate');
    }
  };

  const handleBirthdateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!nickname.trim()) {
      setError('닉네임을 입력해 주세요.');
      return;
    }
    if (!birthdate) {
      setError('생년월일을 선택해 주세요.');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await authService.completeOAuthSignup(selectedProvider, oauthSignupToken, nickname, birthdate);
      applyResult(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuardianSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validationError = authService.validateGuardianConsent({ guardianName, guardianEmail });
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsSubmitting(true);
    try {
      await authService.requestGuardianConsent(memberId, guardianName, guardianEmail);
      setPhase('guardian-sent');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuardianSentDone = () => {
    onSuccess({ pendingGuardianConsent: true });
  };

  return {
    phase,
    error,
    isSubmitting,
    nickname, setNickname,
    birthdate, setBirthdate,
    guardianName, setGuardianName,
    guardianEmail, setGuardianEmail,
    handleBirthdateSubmit,
    handleGuardianSubmit,
    handleGuardianSentDone,
  };
}
