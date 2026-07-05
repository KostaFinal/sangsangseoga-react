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
  setExtraCreditsRemaining,
  onInitiateCreditsPayment,
}) => {
  const [records, setRecords] = useState(initialPaymentRecords);
  const [extraCreditsCount, setExtraCreditsCount] = useState(50);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCancelSuccess, setShowCancelSuccess] = useState(false);
  const [printSuccess, setPrintSuccess] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState('monthly');
  const [openFaqId, setOpenFaqId] = useState(1);

  const faqs = subscriptionService.getFaqs();
  const creditPackages = subscriptionService.getCreditPackages();
  const pricePerCredit = subscriptionService.creditPricePerUnit;
  const calculatedCost = subscriptionService.calculateCreditsCost(extraCreditsCount);

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const handleBuyCredits = async () => {
    if (onInitiateCreditsPayment) {
      onInitiateCreditsPayment(extraCreditsCount, calculatedCost);
      return;
    }

    const newRecord = await subscriptionService.purchaseCredits(extraCreditsCount, calculatedCost);
    setPurchaseSuccess(true);
    if (setExtraCreditsRemaining) {
      setExtraCreditsRemaining(prev => prev + extraCreditsCount);
    }
    setRecords([newRecord, ...records]);
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
    extraCreditsCount, setExtraCreditsCount,
    selectedInvoice,
    purchaseSuccess, setPurchaseSuccess,
    showCancelConfirm,
    showCancelSuccess, setShowCancelSuccess,
    printSuccess, setPrintSuccess,
    selectedPlanType, setSelectedPlanType,
    openFaqId,
    faqs,
    creditPackages,
    pricePerCredit,
    calculatedCost,
    toggleFaq,
    handleBuyCredits,
    openCancelConfirm,
    closeCancelConfirm,
    confirmCancelSubscription,
    handleSelectPremium,
    viewInvoice,
    closeInvoiceModal,
    printInvoice,
  };
};
