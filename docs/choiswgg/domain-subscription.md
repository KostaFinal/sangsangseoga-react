# 구독/결제(Subscription) 도메인

관련 커밋: `2759e70`, `6cb753d`, `86eba96`(단발 생성권 제거 부분), `a02f20a`

## 1. 구독 상태 조회/시작/해지/결제내역 실 API 연동 (`2759e70`)

### 개념
구독 상태(`isPremium`, `isSubscriptionCanceled`, `benefitEndDate` 등)를 프론트 로컬 state로만 들고 있다가, 앱 마운트 시(토큰 있을 때)와 로그인/회원가입 직후 `GET /api/subscriptions/me`로 서버 값과 항상 맞추도록 변경. 결제(PG 위젯 없음)는 프론트가 `paymentKey`/`orderId`를 placeholder로 만들어 전달하는 Mock 결제 방식.

- `POST /api/subscriptions` — 결제 승인 후 구독 등록
- `POST /api/subscriptions/cancel` — 해지 후 서버 값 재조회
- `GET /api/payments` — 결제내역 목록(응답 형태가 BE 미확정이라 순배열로 가정하고 매핑)

## 2. 요금제 변경/실사용량 최종 연동 + PricingView 통합 (`6cb753d`)

### 개념 1 — 요금제 변경은 한 방향만 허용
`PATCH /api/subscriptions`로 요금제 변경 가능하지만 **월간 → 연간만 허용**, **연간 → 월간은 UI에서부터 버튼을 막음** — 서버가 `400 DOWNGRADE_NOT_SUPPORTED`를 내리는 것과 대칭되게 애초에 못 누르게 해서 불필요한 에러 왕복을 줄임.

```js
// src/features/subscription/components/SubscriptionView.jsx
const isUnsupportedDowngrade = currentPlanType === 'PREMIUM_YEARLY' && selectedPlanType === 'monthly';
```

### 개념 2 — 별도 페이지였던 PricingView 제거
요금제 안내(`PricingView`)와 구독 관리(`SubscriptionView`)가 별개 화면이었는데 하나로 합침. `usePricingState.js`/`PricingView.jsx` 삭제.

### 개념 3 — 실제 API 응답 형태에 맞춘 매핑
`GET /api/subscription-plans`, `/api/usage/me`, `/api/payments` 연동 시 mock 응답(필드명, 페이지네이션 래퍼 유무, `COMPLETED`/`SUCCESS` enum 차이)과 실제 서버 응답이 어긋난 부분을 실측에 맞게 재매핑.

```js
// src/features/subscription/services/subscriptionService.js
const PAYMENT_STATUS_LABEL = {
  SUCCESS: '완료',   // 원래는 COMPLETED로 가정 — 실제 서버 값은 SUCCESS
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
이전엔 Header와 SubscriptionView가 각자 사용량(`/api/usage/me`)을 불러와서 한쪽 액션이 다른 쪽에 반영 안 됐다. 이후 [[guest-browsing-and-auth-gate]] 작업의 `AuthContext`에서 이 상태가 최종적으로 전역화(`usage`, `refreshUsage`)됨 — 이 커밋은 그 전 단계로 우선 상태를 합쳐 액션 직후 동기화되게 함.

### 개념 5 — 대시보드 AI 한도, 실데이터화
대시보드의 "오늘 AI 생성 몇 번 남음"을 로컬 mock 카운터에서 실 사용량 API(`GET /api/usage/me`) 기반으로 교체.

## 3. 단발 생성권 기능 전체 제거 (`86eba96`)

### 개념
추가 생성권을 건별 구매하는 "단발 생성권" 기능을 서비스 방향 전환에 따라 완전히 제거 — services/hooks/화면/mock 데이터는 물론 AI 생성 로직의 "생성권 소진 시 분기 처리" 코드까지 삭제.

## 4. 테스트용 문구를 실사용자 안내문으로 정리 (`a02f20a`)

- `PaymentView`: 결제 결과를 임의 선택하던 QA용 UI 제거, 정식 보안 문구로 교체
- `SubscriptionView`: "테스트 결제" 등 QA 전용 문구 정리
- `MainDashboard`: 미구현 기능 `alert()` 문구를 서비스 톤에 맞게 통일

## 5. FAQ 제거 + 요금제 배지 시인성 개선 (`054caec`, Header 배지 부분은 `9383c5b`, 둘 다 미push)

### 개념
`SubscriptionView.jsx` 하단 "자주 묻는 질문" 아코디언 제거. `useSubscriptionState.js`의 `faqs`/`openFaqId`/`toggleFaq`, `subscriptionService.js`의 `getFaqs()`도 함께 정리.

상단 "홈으로" 옆 텍스트 플랜 표시("프리미엄 (월간)"/"무료 플랜")를 아이콘 달린 배지(pill)로 교체.

Header의 "오늘 사용량" 인디케이터는 `9383c5b`에서 함께 손봄 — 관리자(role=ADMIN)는 AI 생성 한도와 무관해 배지를 숨기고, 일반 계정은 `isPremium` 여부로 배지 색상 구분(프리미엄은 브랜드 컬러, 무료는 중립 톤). 관리자에게 구독 정보를 안 보여주는 원칙은 프로필 드롭다운의 "최고 관리자" 배지 분기와 같은 맥락.

## 관련 문서
- [[guest-browsing-and-auth-gate]] — `/subscription`을 비로그인에게도 열어주면서 사용량/결제내역 조회를 스킵하고 로그인 유도 문구로 대체한 후속 작업
- [[domain-notifications-sse]] — Header "오늘 사용량" 배지 색상 구분/숨김 처리가 같은 세션의 Header/AuthContext 정리 작업 일부
