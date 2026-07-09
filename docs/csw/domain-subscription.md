# 구독/결제(Subscription) 도메인

관련 커밋: `2759e70`, `6cb753d`, `86eba96`(단발 생성권 제거 부분), `a02f20a`

## 1. 구독 상태 조회/시작/해지/결제내역 실 API 연동 (`2759e70`)

### 개념
구독 관련 상태(`isPremium`, `isSubscriptionCanceled`, `benefitEndDate` 등)를 프론트 로컬 state로만 들고 있다가, 앱 마운트 시(토큰이 있을 때)와 로그인/회원가입 직후 `GET /api/subscriptions/me`를 호출해 서버 값으로 항상 다시 맞추도록 바꿨습니다. 결제(PG 위젯 없음)는 프론트에서 `paymentKey`/`orderId`를 placeholder로 만들어 서버에 전달하는 Mock 결제 방식을 씁니다.

- `POST /api/subscriptions` — 결제 승인 통과 후 구독 등록
- `POST /api/subscriptions/cancel` — 해지 처리 후 서버 값 재조회
- `GET /api/payments` — 결제내역 목록(하드코딩 mock 대체, 응답 형태가 BE 미확정이라 순배열로 가정하고 매핑)

## 2. 요금제 변경/실사용량 최종 연동 + PricingView 통합 (`6cb753d`)

### 개념 1 — 요금제 변경은 한 방향만 허용
`PATCH /api/subscriptions`로 요금제를 바꿀 수 있게 됐는데, **월간 → 연간만 허용**하고 **연간 → 월간은 UI 단에서부터 버튼을 막습니다** — 서버가 이 경우 `400 DOWNGRADE_NOT_SUPPORTED`를 내려주는 것과 대칭되게, 애초에 그 버튼을 못 누르게 해서 쓸데없는 에러 왕복을 줄였습니다.

```js
// src/features/subscription/components/SubscriptionView.jsx
const isUnsupportedDowngrade = currentPlanType === 'PREMIUM_YEARLY' && selectedPlanType === 'monthly';
```

### 개념 2 — 별도 페이지였던 PricingView 제거
원래 요금제 안내(`PricingView`)와 구독 관리(`SubscriptionView`)가 별개 화면이었는데, 요금제 선택을 구독 관리 페이지 하나로 합쳤습니다. `usePricingState.js`/`PricingView.jsx`는 이때 삭제됐습니다.

### 개념 3 — 실제 API 응답 형태에 맞춘 매핑
`GET /api/subscription-plans`, `/api/usage/me`, `/api/payments`가 실제로 붙으면서, 이전에 상상으로 짜둔 mock 응답 형태(필드명, 페이지네이션 래퍼 유무, `COMPLETED`/`SUCCESS` 같은 enum 값 차이)와 실제 서버 응답이 어긋난 부분들을 실측에 맞게 다시 매핑했습니다.

```js
// src/features/subscription/services/subscriptionService.js
const PAYMENT_STATUS_LABEL = {
  SUCCESS: '완료',   // 원래는 COMPLETED로 가정하고 있었음 — 실제 서버 값은 SUCCESS
  FAILED: '실패',
};

// 결제(POST)/요금제 변경(PATCH)이 서버에서 같은 로직을 공유하므로,
// 프론트도 동일하게 두 흐름이 같은 형태의 바디(paymentKey/orderId/amount)를 쓰도록 공용 처리
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
```

### 개념 4 — Header와 구독 페이지의 사용량 상태를 하나로 통합
이전엔 Header와 SubscriptionView가 각자 따로 사용량(`/api/usage/me`)을 불러오고 있어서, 한쪽에서 액션을 해도 다른 쪽이 갱신 안 되는 문제가 있었습니다. 이후 이 세션([[../guest-browsing-and-auth-gate|guest-browsing-and-auth-gate]] 작업의 `AuthContext`)에서 이 사용량 상태가 최종적으로 `AuthContext`(`usage`, `refreshUsage`)로 전역화됩니다 — 이 커밋은 그 전 단계로, 우선 상태를 하나로 합쳐서 액션 직후 항상 동기화되도록 만든 것입니다.

### 개념 5 — 대시보드 AI 한도, 실데이터화
대시보드에서 "오늘 AI 생성 몇 번 남음" 체크를 로컬 mock 카운터로 흉내 내던 걸, 실제 사용량 API(`GET /api/usage/me`) 기반으로 교체했습니다.

## 3. 단발 생성권 기능 전체 제거 (`86eba96`)

### 개념
추가 생성권을 건별로 구매하는 "단발 생성권" 기능이 있었는데, 서비스 방향이 바뀌면서 관련 코드를 전부 걷어냈습니다 — services/hooks/화면/mock 데이터는 물론, AI 생성 로직에 있던 "생성권 소진 시 분기 처리" 코드까지 포함해서 삭제했습니다. 죽은 기능을 반쯤 남겨두지 않고 완전히 제거한 사례입니다.

## 4. 테스트용 문구를 실사용자 안내문으로 정리 (`a02f20a`)

- `PaymentView`: 결제 결과를 임의로 선택할 수 있던 QA용 UI 제거, 안내문을 정식 보안 문구로 교체
- `SubscriptionView`: "테스트 결제" 같은 QA 전용 문구 정리
- `MainDashboard`: 미구현 기능에 대한 `alert()` 문구를 서비스 톤에 맞게 통일

## 관련 문서
- [[guest-browsing-and-auth-gate]] — `/subscription`을 비로그인에게도 열어주면서, 이 문서에서 다룬 사용량/결제내역 조회를 비로그인 시 스킵하고 로그인 유도 문구로 대체한 후속 작업
