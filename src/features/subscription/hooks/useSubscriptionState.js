import { useState, useEffect, useCallback } from 'react';
import { subscriptionService } from '../services/subscriptionService';

/**
 * Custom Hook: useSubscriptionState
 *
 * 구독/결제 관리 대시보드(SubscriptionView) 상태 및 비즈니스 로직 관리 훅.
 */
export const useSubscriptionState = ({
  onCancelSubscription,
  onSelectPlan,
}) => {
  const [records, setRecords] = useState([]);
  const [isRecordsLoading, setIsRecordsLoading] = useState(false);
  const [recordsError, setRecordsError] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCancelSuccess, setShowCancelSuccess] = useState(false);
  const [printSuccess, setPrintSuccess] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState('monthly');
  const [openFaqId, setOpenFaqId] = useState(1);

  const faqs = subscriptionService.getFaqs();

  const loadPayments = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const openCancelConfirm = () => setShowCancelConfirm(true);
  const closeCancelConfirm = () => setShowCancelConfirm(false);

  const confirmCancelSubscription = async () => {
    setShowCancelConfirm(false);
    try {
      await subscriptionService.cancelSubscription();
      onCancelSubscription();
      setShowCancelSuccess(true);
    } catch (err) {
      console.error("구독 해지 처리 실패", err);
    }
  };

  const handleSelectPremium = () => {
    if (onSelectPlan) {
      onSelectPlan(selectedPlanType);
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
    toggleFaq,
    openCancelConfirm,
    closeCancelConfirm,
    confirmCancelSubscription,
    handleSelectPremium,
    viewInvoice,
    closeInvoiceModal,
    printInvoice,
  };
};
