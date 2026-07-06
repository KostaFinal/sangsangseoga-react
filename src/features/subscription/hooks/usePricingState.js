import { useState } from 'react';
import { subscriptionService } from '../services/subscriptionService';

/**
 * Custom Hook: usePricingState
 *
 * 요금제 안내(PricingView) 상태 및 비즈니스 로직 관리 훅.
 */
export const usePricingState = ({ onSelectPlan }) => {
  const [selectedPlanType, setSelectedPlanType] = useState('monthly');
  const [openFaqId, setOpenFaqId] = useState(1);

  const faqs = subscriptionService.getFaqs();

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const handleSelectPremium = () => {
    onSelectPlan(selectedPlanType);
  };

  return {
    selectedPlanType, setSelectedPlanType,
    openFaqId,
    faqs,
    toggleFaq,
    handleSelectPremium,
  };
};
