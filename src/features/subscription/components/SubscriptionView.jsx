import React from 'react';
import { useSubscriptionState } from '../hooks/useSubscriptionState';
import {
  Award,
  Star,
  Sparkles,
  HelpCircle,
  ChevronDown,
  Check,
  X,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Receipt,
  ArrowLeft,
  RotateCcw,
  CreditCard
} from 'lucide-react';

export const SubscriptionView = ({
  onNavigateHome,
  onNavigate,
  onCancelSubscription,
  onResumeSubscription,
  onPlanChanged,
  onSelectPlan,
  isPremium,
  isSubscriptionCanceled,
  benefitEndDate,
  currentPlanType,
  usage,
}) => {
  const {
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
  } = useSubscriptionState({ currentPlanType, onCancelSubscription, onResumeSubscription, onPlanChanged, onSelectPlan });

  const isCurrentBillingPeriod = currentPlanType === (selectedPlanType === 'yearly' ? 'PREMIUM_YEARLY' : 'PREMIUM_MONTHLY');
  // 연간 → 월간 다운그레이드는 서버가 지원하지 않음 (400 DOWNGRADE_NOT_SUPPORTED) — UI에서부터 막아둠
  const isUnsupportedDowngrade = currentPlanType === 'PREMIUM_YEARLY' && selectedPlanType === 'monthly';
  const currentBillingPeriodLabel = currentPlanType === 'PREMIUM_YEARLY' ? '연간' : currentPlanType === 'PREMIUM_MONTHLY' ? '월간' : '';

  const yearlyDiscountPercent = (plans.monthly?.price != null && plans.yearly?.price != null)
    ? Math.round((1 - plans.yearly.price / (plans.monthly.price * 12)) * 100)
    : null;

  return (
    <div className="bg-[#FAF9FF] min-h-screen font-sans text-[#2F2D59] w-full pb-16">

      {/* 2. Unified Grid Layout Container */}
      <div className="w-full max-w-7xl mx-auto px-4 pt-6 pb-6 sm:px-6 md:px-8">

        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={onNavigateHome}
            className="group inline-flex items-center gap-1.5 text-sm font-black text-[#514c73] hover:text-[#5139d6] transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>홈으로</span>
          </button>

          <span className={`text-xs font-bold whitespace-nowrap ${isPremium ? 'text-[#6B54E7]' : 'text-[#7C769D]'}`}>
            {isPremium ? `프리미엄${currentBillingPeriodLabel ? ` (${currentBillingPeriodLabel})` : ''}` : '무료 플랜'}
          </span>
        </div>

        <h2 className="text-2xl font-black text-[#110F24] tracking-tight mb-6">구독 관리</h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ==================== LEFT SIDE: Current Subscription + Usage + Pricing (Colspan 8) ==================== */}
          <div className="lg:col-span-8 space-y-6">

            {/* Left Card 1: Today's usage */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E6E2FC]/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4">

              <h3 className="text-base font-black text-[#2F2D59] border-b border-[#E6E2FC]/40 pb-3">
                오늘 사용량
              </h3>

              {!usage && (
                <div className="text-xs text-[#7C769D] font-semibold py-6 text-center">불러오는 중...</div>
              )}

              {usage && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-[#7C769D] font-semibold">텍스트 생성{!usage.isPremium && ' (무료 체험)'}</span>
                      <span className="font-mono">
                        <span className="text-xl font-black text-[#6B54E7]">{usage.text.remaining}</span>
                        <span className="text-xs font-bold text-[#7C769D]"> / {usage.text.limit}회 남음</span>
                      </span>
                    </div>
                    <div className="relative w-full bg-[#E6E2FC]/50 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-[#6B54E7] rounded-full"
                        style={{ width: `${usage.text.limit ? (usage.text.remaining / usage.text.limit) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-[#7C769D] font-semibold">이미지 생성{!usage.isPremium && ' (무료 체험)'}</span>
                      <span className="font-mono">
                        <span className="text-xl font-black text-[#5179E6]">{usage.image.remaining}</span>
                        <span className="text-xs font-bold text-[#7C769D]"> / {usage.image.limit}회 남음</span>
                      </span>
                    </div>
                    <div className="relative w-full bg-[#E6E2FC]/50 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-[#5179E6] rounded-full"
                        style={{ width: `${usage.image.limit ? (usage.image.remaining / usage.image.limit) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {!usage.isPremium && usage.trialPageLimit !== null && (
                    <div className="flex justify-between items-center text-xs pt-2 border-t border-[#E6E2FC]/40">
                      <span className="text-[#7C769D] font-semibold">무료 체험 사용 여부</span>
                      <span className="font-bold text-[#2F2D59]">{usage.freeTrialUsed ? '사용 완료' : '미사용'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Left Card 2: Subscription Pricing Section */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E6E2FC]/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4">

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E2FC]/40 pb-4 text-left">
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-[#2F2D59]">
                    구독 요금제
                  </h3>
                  <p className="text-xs text-[#7C769D]">
                    무료 플랜과 프리미엄 플랜을 비교해보세요.
                  </p>
                </div>

                {/* Subscription toggle switch */}
                <div className="bg-[#FAF9FF] p-1.5 rounded-2xl border border-[#E6E2FC]/60 flex space-x-1 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedPlanType('monthly')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      selectedPlanType === 'monthly' 
                        ? 'bg-[#6B54E7] text-white shadow-md' 
                        : 'text-[#7C769D] hover:text-[#2F2D59]'
                    }`}
                  >
                    월간 결제
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPlanType('yearly')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                      selectedPlanType === 'yearly' 
                        ? 'bg-[#6B54E7] text-white shadow-md' 
                        : 'text-[#7C769D] hover:text-[#2F2D59]'
                    }`}
                  >
                    <span>연간 결제</span>
                    {yearlyDiscountPercent != null && (
                      <span className="text-[9px] bg-red-100 text-red-600 px-1 py-0.25 rounded-md font-black">{yearlyDiscountPercent}% 할인</span>
                    )}
                  </button>
                </div>
              </div>

              {/* 현재 구독 상태 안내 */}
              <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold ${
                isPremium && isSubscriptionCanceled
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : isPremium
                    ? 'bg-[#F3F0FF] text-[#6B54E7] border border-[#E6E2FC]'
                    : 'bg-[#FAF9FF] text-[#7C769D] border border-[#E6E2FC]/60'
              }`}>
                {isPremium && isSubscriptionCanceled && (
                  <>
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>현재 프리미엄 플랜({currentBillingPeriodLabel}) 이용 중 · <strong>{benefitEndDate || '결제 기간 만료일'}</strong>에 무료 플랜으로 전환 예정</span>
                  </>
                )}
                {isPremium && !isSubscriptionCanceled && (
                  <>
                    <Star className="w-4 h-4 shrink-0 text-[#6B54E7]" />
                    <span>현재 프리미엄 플랜({currentBillingPeriodLabel}) 이용 중</span>
                  </>
                )}
                {!isPremium && (
                  <>
                    <Award className="w-4 h-4 shrink-0" />
                    <span>현재 무료 플랜 이용 중</span>
                  </>
                )}
              </div>

              {/* Bento-style Plan Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* 1. Free Plan Card */}
                <div className="p-5 rounded-2xl border border-[#E6E2FC]/60 bg-[#FAF9FF] flex flex-col justify-between text-left space-y-4">
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] text-[#7C769D] tracking-wider font-extrabold uppercase">Free</span>
                      <h4 className="text-base font-black text-[#2F2D59] mt-0.5">무료 플랜</h4>
                    </div>

                    <span className="text-2xl font-black text-[#2F2D59] block">₩0</span>

                    <div className="space-y-2 border-t border-[#E6E2FC]/40 pt-3 text-xs text-[#7C769D]">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>무료 체험 {plans.free?.trialPageLimit ?? '-'}페이지 제공</span>
                      </div>
                    </div>
                  </div>

                  {!isPremium && (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl text-xs font-extrabold text-center bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>현재 이용 중인 플랜</span>
                    </button>
                  )}

                  {isPremium && !isSubscriptionCanceled && (
                    <button
                      type="button"
                      onClick={openCancelConfirm}
                      className="w-full py-3 rounded-xl text-xs font-bold transition-all text-center bg-[#E6E2FC] hover:bg-[#d8d2f7] text-[#6B54E7] cursor-pointer"
                    >
                      무료 플랜으로 변경
                    </button>
                  )}

                  {isPremium && isSubscriptionCanceled && (
                    <button
                      disabled
                      className="w-full py-3 rounded-xl text-xs font-bold text-center bg-[#FAF9FF] text-[#7C769D] border border-dashed border-[#E6E2FC] cursor-default"
                    >
                      {benefitEndDate || '만료일'}부터 자동 적용 예정
                    </button>
                  )}
                </div>

                {/* 2. Premium Plan Card */}
                <div className={`p-5 rounded-2xl border-2 flex flex-col justify-between text-left space-y-4 transition-all duration-300 relative ${
                  isPremium && !isSubscriptionCanceled
                    ? 'border-[#6B54E7] bg-white shadow-xl shadow-[#6B54E7]/5'
                    : 'border-[#E6E2FC]/60 bg-white hover:border-[#6B54E7]/40 hover:shadow-lg'
                }`}>
                  {/* Popular Badge */}
                  <div className="absolute -top-3.5 right-6 bg-[#6B54E7] text-white text-[10px] font-black tracking-wider px-3 py-1 rounded-full uppercase shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-yellow-300" />
                    <span>추천</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] text-[#6B54E7] tracking-wider font-extrabold uppercase">Premium</span>
                      <h4 className="text-base font-black text-[#2F2D59] mt-0.5">프리미엄 플랜</h4>
                    </div>

                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-[#6B54E7]">
                          {plans[selectedPlanType]?.price != null ? `₩${plans[selectedPlanType].price.toLocaleString()}` : '-'}
                        </span>
                        <span className="text-xs text-[#7C769D] font-bold">
                          {selectedPlanType === 'yearly' ? '/ 년 자동 결제' : '/ 월 자동 결제'}
                        </span>
                      </div>
                      {selectedPlanType === 'yearly' && yearlyDiscountPercent != null && (
                        <span className="text-[10px] bg-red-50 text-red-600 font-extrabold px-2 py-0.5 rounded-lg inline-block mt-1.5">
                          연간 결제 {yearlyDiscountPercent}% 할인 적용
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 border-t border-[#E6E2FC]/40 pt-3 text-xs text-[#2F2D59]">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#6B54E7] shrink-0 font-bold" />
                        <span className="font-semibold">AI 텍스트 생성 하루 {plans[selectedPlanType]?.dailyTextLimit ?? '-'}회</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#6B54E7] shrink-0 font-bold" />
                        <span className="font-semibold">AI 이미지 생성 하루 {plans[selectedPlanType]?.dailyImageLimit ?? '-'}회</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#6B54E7] shrink-0 font-bold" />
                        <span className="font-semibold">PDF 다운로드</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-[#E6E2FC]/40">
                    {!isPremium && (
                      <button
                        onClick={handleSelectPremium}
                        className="w-full py-3 rounded-xl text-xs font-black transition-all text-center cursor-pointer shadow-md bg-gradient-to-r from-[#5179E6] via-[#6B54E7] to-[#835AF1] text-white hover:opacity-95"
                      >
                        프리미엄 구독 시작
                      </button>
                    )}

                    {isPremium && !isSubscriptionCanceled && (
                      <>
                        {changePlanError && (
                          <p className="text-[11px] text-rose-600 font-bold text-center">{changePlanError}</p>
                        )}
                        {isCurrentBillingPeriod ? (
                          <button
                            disabled
                            className="w-full py-3 rounded-xl text-xs font-extrabold text-center bg-[#F3F0FF] text-[#6B54E7] border border-[#E6E2FC] cursor-default"
                          >
                            현재 이용 중인 요금제
                          </button>
                        ) : isUnsupportedDowngrade ? (
                          <div className="p-3 rounded-xl bg-[#FAF9FF] border border-dashed border-[#E6E2FC] text-[11px] text-[#7C769D] leading-relaxed text-left">
                            연간 → 월간 전환은 지원되지 않습니다. 구독을 해지하고 이용 기간이 끝난 뒤 월간 요금제로 다시 가입해 주세요.
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={isChangingPlan}
                            onClick={handleChangePlan}
                            className="w-full py-3 rounded-xl text-xs font-black transition-all text-center cursor-pointer shadow-md bg-[#110F24] hover:bg-neutral-800 text-white disabled:opacity-60"
                          >
                            {isChangingPlan ? '변경 중...' : `${selectedPlanType === 'yearly' ? '연간' : '월간'} 결제로 전환`}
                          </button>
                        )}
                        <div className="text-center">
                          <button
                            type="button"
                            onClick={openCancelConfirm}
                            className="text-[11px] text-rose-500 hover:text-rose-600 font-extrabold transition-all cursor-pointer inline-flex items-center gap-1 hover:underline"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>구독 해지</span>
                          </button>
                        </div>
                      </>
                    )}

                    {isPremium && isSubscriptionCanceled && (
                      <button
                        type="button"
                        disabled={isResuming}
                        onClick={handleResumeSubscription}
                        className="w-full py-3 rounded-xl text-xs font-black transition-all text-center cursor-pointer shadow-md bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 disabled:opacity-60"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{isResuming ? '처리 중...' : '구독 유지하기 (해지 취소)'}</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* Collapsible FAQ list */}
              <div className="mt-5 pt-4 border-t border-[#E6E2FC]/40 text-left">
                <span className="text-xs text-[#7C769D] font-extrabold flex items-center gap-2 uppercase mb-3">
                  <HelpCircle className="w-4.5 h-4.5 text-[#6B54E7]" />
                  <span>자주 묻는 질문</span>
                </span>

                <div className="space-y-2">
                  {faqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="rounded-2xl border border-[#E6E2FC]/40 bg-[#FAF9FF] overflow-hidden transition-all duration-200"
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex justify-between items-center text-left px-4 py-3 text-xs sm:text-sm font-extrabold text-[#2F2D59] hover:bg-[#E6E2FC]/20 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-[#6B54E7] font-black">Q.</span>
                          <span>{faq.q}</span>
                        </span>
                        <ChevronDown 
                          className="w-4.5 h-4.5 text-[#7C769D] transition-transform duration-300 shrink-0" 
                          style={{ transform: openFaqId === faq.id ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        />
                      </button>
                      
                      {openFaqId === faq.id && (
                        <div className="px-6 pb-4 pt-1.5 text-xs text-[#7C769D] leading-relaxed border-t border-[#E6E2FC]/40 bg-white">
                          <p>{faq.a}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* ==================== RIGHT SIDE: Bill Receipts (Colspan 4) ==================== */}
          <div className="lg:col-span-4 space-y-6">

            {/* Payment logs timeline */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E6E2FC]/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-3">

              <div className="border-b border-[#E6E2FC]/40 pb-3 flex justify-between items-center text-left">
                <h3 className="text-xs font-extrabold text-[#2F2D59] uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-[#6B54E7]" />
                  <span>최근 결제 영수 기록</span>
                </h3>
                <span className="text-[10px] text-[#7C769D] font-semibold">최근 {records.length}건</span>
              </div>

              {isRecordsLoading && (
                <div className="text-xs text-[#7C769D] font-semibold py-6 text-center">불러오는 중...</div>
              )}

              {!isRecordsLoading && recordsError && (
                <div className="text-xs text-rose-600 font-bold p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  {recordsError}
                </div>
              )}

              {!isRecordsLoading && !recordsError && records.length === 0 && (
                <div className="text-xs text-[#7C769D] font-semibold py-6 text-center bg-[#FAF9FF] border border-dashed border-[#E6E2FC] rounded-xl">
                  아직 결제 내역이 없습니다.
                </div>
              )}

              <div className="divide-y divide-[#E6E2FC]/30 max-h-64 overflow-y-auto pr-1">
                {!isRecordsLoading && !recordsError && records.map((rec) => (
                  <div key={rec.id} className="py-3 flex justify-between items-center text-xs text-left">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-[#FAF9FF] rounded-xl flex items-center justify-center border border-[#E6E2FC]/50 text-[#6B54E7] shrink-0">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-[#2F2D59] truncate text-xs">{rec.title}</h4>
                        <p className="text-[10px] text-[#7C769D] font-mono mt-0.5">{rec.date.split(' • ')[0]}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 font-sans pl-2">
                      <span className="text-sm font-black text-[#2F2D59] font-mono">
                        ₩{rec.amount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => viewInvoice(rec)}
                        className="px-2 py-1 bg-[#FAF9FF] hover:bg-[#E6E2FC]/30 border border-[#E6E2FC]/60 text-[#6B54E7] text-[10px] font-bold rounded-lg cursor-pointer transition-all active:scale-95"
                      >
                        상세
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* 3. DIALOG MODAL: Printable Invoice details */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-[#110F24]/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-left border border-[#E6E2FC]/50 shadow-2xl relative animate-in zoom-in-95 duration-200">
            
            <button
              onClick={closeInvoiceModal}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-[#FAF9FF] text-[#7C769D] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-5">
              
              <div className="text-center pt-2 space-y-1">
                <div className="inline-flex items-center justify-center w-11 h-11 bg-[#FAF9FF] text-[#6B54E7] rounded-2xl border border-[#E6E2FC]/60 mb-2 shadow-sm">
                  <Receipt className="w-5.5 h-5.5" />
                </div>
                <h4 className="font-black text-base text-[#2F2D59]">결제 영수증</h4>
                <p className="text-[10px] text-[#7C769D] font-mono">영수 번호: {selectedInvoice.id}</p>
              </div>

              <div className="border-t border-b border-dashed border-[#E6E2FC] py-4 space-y-2.5 text-xs text-[#7C769D]">
                <div className="flex justify-between">
                  <span>가맹점</span>
                  <span className="font-bold text-[#2F2D59]">{selectedInvoice.merchantName || '상상서가'}</span>
                </div>
                <div className="flex justify-between">
                  <span>결제 항목</span>
                  <span className="font-bold text-[#6B54E7]">{selectedInvoice.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>결제 일시</span>
                  <span className="font-mono text-[#2F2D59]">{selectedInvoice.date.split(' • ')[0]}</span>
                </div>
                {selectedInvoice.maskedCardNumber && (
                  <div className="flex justify-between">
                    <span>결제 카드</span>
                    <span className="font-mono text-[#2F2D59]">{selectedInvoice.maskedCardNumber}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span>거래 상태</span>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-200">
                    {selectedInvoice.status || '성공'}
                  </span>
                </div>
                {selectedInvoice.merchantBusinessNumber && (
                  <div className="flex justify-between">
                    <span>사업자 번호</span>
                    <span className="font-mono text-[#2F2D59]">{selectedInvoice.merchantBusinessNumber}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-baseline pt-2">
                <span className="text-xs text-[#7C769D] font-bold">결제 금액</span>
                <span className="text-xl font-black text-[#6B54E7] font-mono">
                  ₩{selectedInvoice.amount.toLocaleString()} 원
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={printInvoice}
                  className="w-full py-3 bg-[#6B54E7] hover:bg-[#5b45d6] text-white text-xs font-black rounded-xl text-center cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#6B54E7]/15"
                >
                  <Printer className="w-4 h-4" />
                  <span>인쇄 / PDF 저장</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. DIALOG MODAL: Subscription Cancel Confirm */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-[#110F24]/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center border border-[#E6E2FC]/50 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-12 h-12 bg-rose-50 rounded-2xl border border-rose-200 flex items-center justify-center text-rose-600 mb-4 animate-bounce">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#2F2D59]">구독 해지</h3>

            <p className="text-xs text-[#7C769D] mt-3 leading-relaxed text-left bg-[#FAF9FF] p-4 rounded-2xl border border-[#E6E2FC]/50">
              구독을 해지하시겠습니까? 해지하더라도 결제 기간 만료일인 <strong className="text-[#6B54E7] font-extrabold">{benefitEndDate || '2026.07.15'}</strong>까지는 프리미엄 혜택을 계속 이용할 수 있습니다.
            </p>

            <div className="mt-5 flex space-x-3">
              <button
                onClick={closeCancelConfirm}
                className="flex-1 py-3 bg-[#FAF9FF] hover:bg-[#E6E2FC]/30 text-[#6B54E7] border border-[#E6E2FC]/60 text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95"
              >
                유지하기
              </button>
              <button
                onClick={confirmCancelSubscription}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95 shadow-md shadow-rose-600/15"
              >
                해지하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. DIALOG MODAL: Subscription Cancel Success */}
      {showCancelSuccess && (
        <div className="fixed inset-0 bg-[#110F24]/50 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in duration-200">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center border border-[#E6E2FC]/50 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#2F2D59]">구독 해지 완료</h3>
            <p className="text-xs text-[#7C769D] mt-2 leading-relaxed text-left">
              구독 해지가 예약되었습니다. 결제 기간 만료일까지는 프리미엄 혜택을 계속 이용할 수 있습니다.
            </p>
            <button
              onClick={() => setShowCancelSuccess(false)}
              className="mt-5 w-full py-3 bg-[#6B54E7] hover:bg-[#5b45d6] text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-md shadow-[#6B54E7]/15"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 6. DIALOG MODAL: Printer Simulation */}
      {printSuccess && (
        <div className="fixed inset-0 bg-[#110F24]/50 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in duration-200">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center border border-[#E6E2FC]/50 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-12 h-12 bg-[#FAF9FF] border border-[#E6E2FC]/50 rounded-2xl flex items-center justify-center text-[#6B54E7] mb-4 animate-pulse">
              <Printer className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#2F2D59]">인쇄 파일 생성 중</h3>
            <p className="text-xs text-[#7C769D] mt-2 leading-relaxed">
              잠시 후 브라우저에서 인쇄하거나 PDF로 저장할 수 있습니다.
            </p>
            <button
              onClick={() => setPrintSuccess(false)}
              className="mt-5 w-full py-3 bg-[#110F24] hover:bg-neutral-800 text-white text-xs font-black rounded-xl cursor-pointer transition-all active:scale-95"
            >
              정상 확인
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
