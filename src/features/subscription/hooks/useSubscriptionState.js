import { useState } from 'react';
import { initialPaymentRecords } from '../../../shared/data';
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
  const [records, setRecords] = useState(initialPaymentRecords);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCancelSuccess, setShowCancelSuccess] = useState(false);
  const [printSuccess, setPrintSuccess] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState('monthly');
  const [openFaqId, setOpenFaqId] = useState(1);

  const faqs = subscriptionService.getFaqs();

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const openCancelConfirm = () => setShowCancelConfirm(true);
  const closeCancelConfirm = () => setShowCancelConfirm(false);

  const confirmCancelSubscription = async () => {
    setShowCancelConfirm(false);
    await subscriptionService.cancelSubscription();
    onCancelSubscription();
    setShowCancelSuccess(true);
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
