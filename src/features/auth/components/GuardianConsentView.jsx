import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';

/**
 * 보호자가 이메일로 받은 동의 링크(/guardian-consent/:consentId?token=...)로 진입하는 화면.
 * 로그인 여부와 무관하게 접근 가능 — 토큰 자체가 자격증명 역할을 함.
 */
export function GuardianConsentView() {
  const { consentId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState('pending'); // 'pending' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('유효하지 않은 링크입니다. 이메일로 받은 링크를 다시 확인해 주세요.');
    }
  }, [token]);

  const handleDecision = async (decision) => {
    setIsSubmitting(true);
    try {
      await authService.processGuardianConsent(consentId, token, decision);
      setStatus('success');
      setMessage(decision === 'APPROVED' ? '동의가 정상적으로 처리되었습니다.' : '동의를 거절 처리했습니다.');
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || err.message || '처리 중 문제가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9FF] flex items-center justify-center px-4 font-gowun">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-[#E6E2FC] text-center space-y-5">
        {status === 'pending' && (
          <>
            <div className="mx-auto w-14 h-14 bg-[#F3F0FF] text-[#6B54E7] rounded-full flex items-center justify-center">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-[#2F2D59]">보호자 동의 확인</h3>
            <p className="text-xs text-[#7C769D] leading-relaxed">
              자녀 계정의 상상서가 이용에 동의하시겠습니까?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDecision('APPROVED')}
                className="flex-1 py-3 bg-[#6B54E7] hover:bg-[#5b45d6] text-white text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                동의합니다
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDecision('REJECTED')}
                className="flex-1 py-3 bg-white hover:bg-neutral-50 text-[#7C769D] text-xs font-bold rounded-xl border border-neutral-200 transition-all cursor-pointer disabled:opacity-50"
              >
                거절합니다
              </button>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#2F2D59]">처리 완료</h3>
            <p className="text-xs text-[#7C769D] leading-relaxed">{message}</p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-[#6B54E7] hover:bg-[#5b45d6] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              로그인 화면으로
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center">
              <XCircle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-[#2F2D59]">처리 실패</h3>
            <p className="text-xs text-[#7C769D] leading-relaxed">{message}</p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-white hover:bg-neutral-50 text-[#7C769D] text-xs font-bold rounded-xl border border-neutral-200 transition-all cursor-pointer"
            >
              로그인 화면으로
            </button>
          </>
        )}
      </div>
    </div>
  );
}
