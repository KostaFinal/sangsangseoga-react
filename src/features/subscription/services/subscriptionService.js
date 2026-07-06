/**
 * Subscription Service Layer (구독/결제 API 연동 서비스)
 *
 * TODO: API 연동 필요 (실제 백엔드 API 엔드포인트가 연동되어야 하는 영역입니다.)
 * 현재는 협업 및 페이지 병합을 고려하여 Mock 로직과 인터페이스가 먼저 설계되어 있으며,
 * 실 배포 시 axios 또는 fetch를 이용한 비동기 통신 코드로 간편하게 대체할 수 있도록 설계되었습니다.
 */

export const subscriptionService = {
  /** 요금제 안내 화면(PricingView) 및 구독 대시보드(SubscriptionView)가 공유하는 FAQ 목록 */
  getFaqs: () => [
    {
      id: 1,
      q: 'AI가 작성하는 소설 단락의 저작권은 누구에게 있나요?',
      a: '상상서가에서 가공해 드린 모든 소설 텍스트 및 완성된 책의 저작권은 온전히 작가(사용자) 본인에게 귀속됩니다. 상업적 출판 및 판매도 전적으로 자유롭게 진행이 가능합니다.'
    },
    {
      id: 2,
      q: '프리미엄 요금제의 자동 결제는 언제든 취소가 가능한가요?',
      a: '네, 마이페이지 결제 및 구독 관리 대시보드에서 단 한 번의 클릭만으로 자동 정기 구독 해지가 가능하며, 취소 시 해당 결제 주기 마지막 날까지는 모든 프리미엄 기능을 제약 없이 그대로 누리실 수 있습니다.'
    },
    {
      id: 3,
      q: '무료 요금제와 프리미엄 요금제의 구체적인 AI 퀄리티 차이가 있나요?',
      a: '프리미엄 요금제는 더욱 고도화된 고매개변수 LLM 모델인 Gemini Pro 계열을 사용하며, 다채로운 가구와 묘사, 소설 맥락 및 캐릭터 일관성 제어 가이드 템플릿(여름의 소나기 에디션 등)이 추가 제공됩니다.'
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
   * 구독 해지 예약 처리
   * TODO: API 연동 필요 (POST /api/subscription/cancel)
   */
  cancelSubscription: async () => {
    return { success: true };
  },
};
