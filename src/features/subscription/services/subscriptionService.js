/**
 * Subscription Service Layer (구독/결제 API 연동 서비스)
 *
 * TODO: API 연동 필요 (실제 백엔드 API 엔드포인트가 연동되어야 하는 영역입니다.)
 * 현재는 협업 및 페이지 병합을 고려하여 Mock 로직과 인터페이스가 먼저 설계되어 있으며,
 * 실 배포 시 axios 또는 fetch를 이용한 비동기 통신 코드로 간편하게 대체할 수 있도록 설계되었습니다.
 */
import { getMySubscription, startSubscription, changeSubscriptionPlan, cancelSubscription, resumeSubscription, getSubscriptionPlans, getPayments, getMyUsage } from '../../../api/subscriptionApi';

const PLAN_TYPE_BY_SUB_PERIOD = {
  monthly: 'PREMIUM_MONTHLY',
  yearly: 'PREMIUM_YEARLY',
};

const PLAN_TYPE_LABEL = {
  PREMIUM_MONTHLY: '정기 결제 (월간)',
  PREMIUM_YEARLY: '정기 결제 (연간)',
};

const PAYMENT_STATUS_LABEL = {
  SUCCESS: '완료',
  FAILED: '실패',
};

/** ISO 날짜 문자열을 "YYYY.MM.DD" 형식으로 변환 */
const formatPaidDate = (isoString) => {
  if (!isoString) return '';
  return isoString.slice(0, 10).replace(/-/g, '.');
};

const unwrap = (res) => {
  const body = res.data;
  if (!body?.success) {
    throw new Error(body?.message || '요청 처리 중 문제가 발생했습니다.');
  }
  return body.data;
};

/**
 * 결제+구독시작(POST) / 요금제 변경(PATCH)이 서버에서 같은 subscribe() 로직을 공유하도록
 * 리팩터링됨 — 프론트도 동일하게 두 흐름이 같은 형태의 바디(paymentKey/orderId/amount)를 쓰도록 공용 처리.
 * 실제 PG 위젯이 없어서 paymentKey/orderId는 프론트에서 placeholder로 생성.
 */
const buildMockPaymentIds = () => ({
  paymentKey: `mock_pay_${Date.now()}`,
  orderId: `mock_order_${Date.now()}`,
});

const mapSubscriptionResponse = (data) => ({
  planType: data.planType,
  isPremium: data.isPremium,
  isSubscriptionCanceled: data.isCanceled,
  benefitEndDate: data.benefitEndDate,
  nextBillingDate: data.nextBillingDate,
});

export const subscriptionService = {
  /** 내 구독 상태 조회 (GET /api/subscriptions/me) */
  getMySubscription: async () => {
    const data = unwrap(await getMySubscription());
    return mapSubscriptionResponse(data);
  },


  /** 구독 대시보드(SubscriptionView)의 FAQ 목록 */
  getFaqs: () => [
    {
      id: 1,
      q: 'AI가 작성한 소설의 저작권은 누구에게 있나요?',
      a: '작성된 모든 텍스트와 완성된 책의 저작권은 작성자 본인에게 있습니다. 상업적 출판 및 판매도 자유롭게 가능합니다.'
    },
    {
      id: 2,
      q: '프리미엄 요금제는 언제든 해지할 수 있나요?',
      a: '네, 구독 관리 페이지에서 언제든 해지할 수 있으며, 해지 후에도 결제 기간이 끝날 때까지는 프리미엄 기능을 계속 이용할 수 있습니다.'
    },
    {
      id: 3,
      q: '무료 요금제와 프리미엄 요금제의 차이는 무엇인가요?',
      a: '무료 플랜은 가입 시 지급되는 체험 페이지를 모두 사용하면 종료되고, 프리미엄 플랜은 매일 정해진 만큼의 AI 텍스트/이미지 생성을 계속 이용할 수 있습니다.'
    }
  ],

  /** 신용카드 번호 입력 포맷팅 (4자리 단위 구분) */
  formatCardNumber: (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length > 0 ? parts.join(' ') : v;
  },

  /** 카드 유효기간(MM/YY) 입력 포맷팅 */
  formatExpiry: (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  },

  /** 결제 폼 제출 전 유효성 검증 */
  validatePaymentForm: ({ cardNumber, expiry, cvc }) => {
    if (cardNumber.length < 15) return '올바른 신용카드 번호 16자리를 기재해 주세요.';
    if (expiry.length < 4) return '유효기간 MM/YY 포맷을 확인해 주세요.';
    if (cvc.length < 3) return '올바른 CVC 번호 3자리를 입력해 주세요.';
    return null;
  },

  /**
   * PG(토스페이먼츠) 결제 승인 모의 처리
   * TODO: API 연동 필요 (POST /api/payments/approve)
   */
  simulatePaymentApproval: (simulatedStatus) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (simulatedStatus === 'SUCCESS') {
          resolve({ success: true, failureReason: '' });
          return;
        }

        let details = '';
        if (simulatedStatus === 'EXCEEDED_LIMIT') {
          details = '한도 초과 (오류 코드: EXCEEDED_LIMIT) - 등록하신 신용카드의 1회 혹은 월간 한도가 초과되어 금융사 대행 승인이 반려되었습니다.';
        } else if (simulatedStatus === 'INSUFFICIENT_BALANCE') {
          details = '잔액 부족 (오류 코드: INSUFFICIENT_BALANCE) - 계좌 또는 카드 한도 잔액이 부족하여 결제 승인을 완수하지 못하였습니다.';
        } else if (simulatedStatus === 'LOST_CARD') {
          details = '정지된 카드 (오류 코드: LOST_OR_STOLEN_CARD) - 요청하신 신용카드가 분실 또는 유효 정지된 상태로 대행 금융사에 의해 폐기 조회되었습니다.';
        }

        resolve({ success: false, failureReason: details });
      }, 1500);
    });
  },

  /**
   * 정기구독 시작 (POST /api/subscriptions)
   * 실제 PG 위젯 없이 Mock 결제(simulatePaymentApproval) 통과 후 서버 등록만 수행 —
   * paymentKey/orderId는 실제 토스페이먼츠 콜백이 없으므로 프론트에서 placeholder로 생성해 전달.
   */
  startSubscription: async ({ subPeriod, price }) => {
    const planType = PLAN_TYPE_BY_SUB_PERIOD[subPeriod] || PLAN_TYPE_BY_SUB_PERIOD.monthly;
    const { paymentKey, orderId } = buildMockPaymentIds();
    const data = unwrap(await startSubscription(planType, paymentKey, orderId, price));
    return data;
  },

  /**
   * 이미 활성 구독 중인 사용자의 요금제 변경 (PATCH /api/subscriptions)
   * 월간 → 연간만 즉시 전환 허용(재결제 + 기간 새로 시작). 연간 → 월간은 서버가
   * 400 DOWNGRADE_NOT_SUPPORTED로 거절 — 프론트는 이 경로 자체를 UI에서 막아둠(SubscriptionView 참고).
   * POST와 동일하게 paymentKey/orderId/amount 바디를 공유.
   */
  changeSubscriptionPlan: async (subPeriod, price) => {
    const planType = PLAN_TYPE_BY_SUB_PERIOD[subPeriod] || PLAN_TYPE_BY_SUB_PERIOD.monthly;
    const { paymentKey, orderId } = buildMockPaymentIds();
    const data = unwrap(await changeSubscriptionPlan(planType, paymentKey, orderId, price));
    return mapSubscriptionResponse(data);
  },

  /** 구독 해지 예약 처리 (POST /api/subscriptions/cancel) */
  cancelSubscription: async () => {
    const data = unwrap(await cancelSubscription());
    return {
      isSubscriptionCanceled: data.isCanceled,
      benefitEndDate: data.benefitEndDate,
    };
  },

  /** 구독 해지 예약 취소(재개) 처리 (POST /api/subscriptions/resume) */
  resumeSubscription: async () => {
    const data = unwrap(await resumeSubscription());
    return {
      isSubscriptionCanceled: data.isCanceled,
      benefitEndDate: data.benefitEndDate,
    };
  },

  /** 구독 요금제 목록 조회 (GET /api/subscription-plans) — FREE/PREMIUM_MONTHLY/PREMIUM_YEARLY 3종 */
  getSubscriptionPlans: async () => {
    const data = unwrap(await getSubscriptionPlans());
    const plans = {};
    data.forEach((plan) => {
      let key = 'monthly';
      if (plan.planType === 'FREE') key = 'free';
      else if (plan.planType === 'PREMIUM_YEARLY') key = 'yearly';
      plans[key] = {
        planType: plan.planType,
        price: plan.price,
        dailyTextLimit: plan.dailyTextLimit,
        dailyImageLimit: plan.dailyImageLimit,
        trialPageLimit: plan.trialPageLimit,
      };
    });
    return plans;
  },

  /** 결제/인보이스 내역 조회 (GET /api/payments) — { items, totalCount, page, hasNext } 형태 */
  getPayments: async (page = 0, size = 20) => {
    const data = unwrap(await getPayments(page, size));
    const items = data.items || [];
    return items.map((item) => ({
      id: item.paymentId,
      title: PLAN_TYPE_LABEL[item.planType] || '정기 결제',
      date: `${formatPaidDate(item.paidAt)} • 결제 ${PAYMENT_STATUS_LABEL[item.status] || item.status}`,
      amount: item.amount,
      status: PAYMENT_STATUS_LABEL[item.status] || item.status,
      icon: 'receipt_long',
      maskedCardNumber: item.maskedCardNumber,
      merchantName: item.merchantName,
      merchantBusinessNumber: item.merchantBusinessNumber,
      merchantAddress: item.merchantAddress,
    }));
  },

  /** 오늘 사용량 조회 (GET /api/usage/me) */
  getMyUsage: async () => {
    const data = unwrap(await getMyUsage());
    const isPremium = data.plan !== 'FREE';
    return {
      plan: data.plan,
      isPremium,
      // FREE/PREMIUM 응답 형태가 서로 달라서(플랜별 필드명이 다름) 화면에서 공용으로 쓸 수 있게 정규화
      text: isPremium
        ? { remaining: data.dailyTextRemaining, limit: data.dailyTextLimit }
        : { remaining: data.freeTrialTextCallsRemaining, limit: data.freeTrialTextCallLimit },
      image: isPremium
        ? { remaining: data.dailyImageRemaining, limit: data.dailyImageLimit }
        : { remaining: data.freeTrialImageCallsRemaining, limit: data.freeTrialImageCallLimit },
      freeTrialUsed: data.freeTrialUsed ?? null,
      trialPageLimit: data.trialPageLimit ?? null,
    };
  },
};
