import { useState, useEffect, useCallback } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import { useRequireAuth } from '../../../shared/hooks/useRequireAuth';

/**
 * Custom Hook: useSubscriptionState
 *
 * 구독/결제 관리 대시보드(SubscriptionView) 상태 및 비즈니스 로직 관리 훅.
 */
const PLAN_TYPE_TO_SUB_PERIOD = {
  PREMIUM_MONTHLY: 'monthly',
  PREMIUM_YEARLY: 'yearly',
};

// 요금제 변경 실패 시 서버 에러 코드별 안내 문구 (BE: PATCH /api/subscriptions)
const CHANGE_PLAN_ERROR_MESSAGES = {
  DOWNGRADE_NOT_SUPPORTED: '연간 → 월간 전환은 지원되지 않습니다. 구독을 해지하고 이용 기간이 끝난 뒤 월간 요금제로 다시 가입해 주세요.',
  NOT_PREMIUM_MEMBER: '무료 회원은 요금제 전환을 이용할 수 없습니다. 먼저 프리미엄을 구독해 주세요.',
  ALREADY_YEARLY_PLAN: '이미 연간 요금제를 이용 중입니다.',
};

export const useSubscriptionState = ({
  currentPlanType,
  onCancelSubscription,
  onResumeSubscription,
  onPlanChanged,
  onSelectPlan,
  isAuthenticated,
}) => {
  const requireAuth = useRequireAuth();
  const [records, setRecords] = useState([]);
  const [isRecordsLoading, setIsRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCancelSuccess, setShowCancelSuccess] = useState(false);
  const [printSuccess, setPrintSuccess] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState('monthly');
  const [openFaqId, setOpenFaqId] = useState(1);
  const [isResuming, setIsResuming] = useState(false);
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [changePlanError, setChangePlanError] = useState('');

  // 현재 실제 구독 중인 결제 주기로 토글 기본값을 맞춤 (프리미엄 사용자에 한해)
  useEffect(() => {
    if (currentPlanType && PLAN_TYPE_TO_SUB_PERIOD[currentPlanType]) {
      setSelectedPlanType(PLAN_TYPE_TO_SUB_PERIOD[currentPlanType]);
    }
  }, [currentPlanType]);

  const [plans, setPlans] = useState({});
  const [isPlansLoading, setIsPlansLoading] = useState(false);

  const faqs = subscriptionService.getFaqs();

  const loadPayments = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsRecordsLoading(true);
    setRecordsError('');
    try {
      const list = await subscriptionService.getPayments();
      setRecords(list);
    } catch (err) {
      setRecordsError(err.message);
    } finally {
      setIsRecordsLoading(false);
    }
  }, [isAuthenticated]);

  const loadPlans = useCallback(async () => {
    setIsPlansLoading(true);
    try {
      const data = await subscriptionService.getSubscriptionPlans();
      setPlans(data);
    } catch (err) {
      console.error("요금제 목록 조회 실패", err);
    } finally {
      setIsPlansLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
    loadPlans();
  }, [loadPayments, loadPlans]);

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const openCancelConfirm = () => setShowCancelConfirm(true);
  const closeCancelConfirm = () => setShowCancelConfirm(false);

  // 화면 이동(remount) 없이 같은 페이지에서 상태가 바뀌는 해지/재개/요금제변경은
  // 결제내역도 함께 갱신해야 새로 생긴 영수 기록이 새로고침 없이 바로 보임.
  const confirmCancelSubscription = async () => {
    setShowCancelConfirm(false);
    try {
      await subscriptionService.cancelSubscription();
      onCancelSubscription();
      loadPayments();
      setShowCancelSuccess(true);
    } catch (err) {
      console.error("구독 해지 처리 실패", err);
    }
  };

  const handleResumeSubscription = async () => {
    setIsResuming(true);
    try {
      await subscriptionService.resumeSubscription();
      if (onResumeSubscription) {
        onResumeSubscription();
      }
      loadPayments();
    } catch (err) {
      console.error("구독 재개 처리 실패", err);
    } finally {
      setIsResuming(false);
    }
  };

  const handleSelectPremium = () => {
    if (!requireAuth()) return;
    if (onSelectPlan) {
      onSelectPlan(selectedPlanType, plans[selectedPlanType]?.price);
    }
  };

  const handleChangePlan = async () => {
    setChangePlanError('');
    setIsChangingPlan(true);
    try {
      await subscriptionService.changeSubscriptionPlan(selectedPlanType, plans[selectedPlanType]?.price);
      if (onPlanChanged) {
        onPlanChanged();
      }
      loadPayments();
    } catch (err) {
      const code = err.response?.data?.code;
      setChangePlanError(
        (code && CHANGE_PLAN_ERROR_MESSAGES[code]) || err.response?.data?.message || err.message
      );
    } finally {
      setIsChangingPlan(false);
    }
  };

  const viewInvoice = (record) => setSelectedInvoice(record);
  const closeInvoiceModal = () => setSelectedInvoice(null);

  const printInvoice = () => {
    setPrintSuccess(true);
    setSelectedInvoice(null);
  };

  return {
    records,
    isRecordsLoading,
    recordsError,
    selectedInvoice,
    showCancelConfirm,
    showCancelSuccess, setShowCancelSuccess,
    printSuccess, setPrintSuccess,
    selectedPlanType, setSelectedPlanType,
    openFaqId,
    faqs,
    plans,
    isPlansLoading,
    isResuming,
    isChangingPlan,
    changePlanError,
    toggleFaq,
    openCancelConfirm,
    closeCancelConfirm,
    confirmCancelSubscription,
    handleResumeSubscription,
    handleChangePlan,
    handleSelectPremium,
    viewInvoice,
    closeInvoiceModal,
    printInvoice,
  };
};
