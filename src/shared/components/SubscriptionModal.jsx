import { useState } from 'react';
import { X } from 'lucide-react';
import { SubscriptionView } from '../../features/subscription/components/SubscriptionView';
import { PaymentView } from '../../features/subscription/components/PaymentView';
import { useAuth } from '../context/AuthContext';

// 책 만들기 화면 위에 구독/결제를 모달로 띄운다 — AI 사용량 소진 모달에서 "구독하러 가기"를
// 눌러도 라우트 이동 없이 여기서 바로 이어가므로, 뒤에 있는 만들기 화면이 언마운트되지 않고
// 입력 중이던 내용이 그대로 보존된다.
export function SubscriptionModal({ isOpen, onClose }) {
  const [step, setStep] = useState('plans'); // 'plans' | 'payment'
  const [paymentParams, setPaymentParams] = useState(null);
  const {
    isAuthenticated,
    isPremium,
    isSubscriptionCanceled,
    benefitEndDate,
    currentPlanType,
    usage,
    refreshSubscriptionStatus,
    refreshUsage,
  } = useAuth();

  if (!isOpen) return null;

  const handleClose = () => {
    setStep('plans');
    setPaymentParams(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-[#110F24]/60 backdrop-blur-md overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-6xl my-4">
          <button
            type="button"
            onClick={handleClose}
            className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-white shadow-md border border-[#E6E2FC] flex items-center justify-center text-[#7C769D] hover:text-[#2F2D59] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="rounded-3xl overflow-hidden shadow-2xl">
            {step === 'plans' ? (
              <SubscriptionView
                isAuthenticated={isAuthenticated}
                isPremium={isPremium}
                isSubscriptionCanceled={isSubscriptionCanceled}
                benefitEndDate={benefitEndDate}
                currentPlanType={currentPlanType}
                usage={usage}
                closeLabel="닫기"
                onNavigateHome={handleClose}
                onSelectPlan={(planType, price) => {
                  setPaymentParams({ subType: planType, price });
                  setStep('payment');
                }}
                onCancelSubscription={() => {
                  refreshSubscriptionStatus();
                  refreshUsage();
                }}
                onResumeSubscription={() => {
                  refreshSubscriptionStatus();
                  refreshUsage();
                }}
                onPlanChanged={() => {
                  refreshSubscriptionStatus();
                  refreshUsage();
                }}
              />
            ) : (
              <PaymentView
                paymentParams={paymentParams}
                onPaymentSuccess={() => {
                  refreshSubscriptionStatus();
                  refreshUsage();
                  handleClose();
                }}
                onNavigateBack={() => setStep('plans')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
