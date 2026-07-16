import React from 'react';
import { ILLUSTRATION_BOOKS } from '../../../shared/data';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { usePaymentState } from '../hooks/usePaymentState';

export const PaymentView = ({ paymentParams, onPaymentSuccess, onNavigateBack }) => {
  const {
    cardNumber,
    expiry,
    cvc,
    passwordPrefix,
    birth,
    isProcessing,
    success,
    error,
    paymentPhase,
    failureReason,
    displayPrice,
    subPeriod,
    handleCardNumberChange,
    handleExpiryChange,
    handleCvcChange,
    handlePasswordPrefixChange,
    handleBirthChange,
    handlePayment,
    retryPayment,
  } = usePaymentState({ paymentParams, onPaymentSuccess });

  // 1단계: 결제 실패 전용 화면 렌더링 분기
  if (paymentPhase === 'FAILURE_SCREEN') {
    return (
      <div className="py-12 bg-[#FAF9FF] min-h-screen px-4 sm:px-6 lg:px-8 flex items-center justify-center font-gowun text-[#2F2D59] animate-in fade-in duration-150">
        <div className="max-w-xl w-full bg-white rounded-3xl p-8 shadow-2xl border border-[#E6E2FC] text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[#2F2D59]">
              ❌ 결제 승인이 실패하였습니다
            </h3>
            <p className="text-xs text-[#7C769D] mt-1">
              토스페이먼츠(Toss Payments) 결제 게이트웨이 승인 검사 실패
            </p>
          </div>

          <div className="p-4 bg-red-50/50 rounded-2xl text-left border border-red-100 text-xs text-red-800 space-y-2.5">
            <p className="font-extrabold text-red-900 flex items-center gap-1.5 border-b border-red-100 pb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
              실패 사유
            </p>
            <p className="leading-relaxed text-[11px]">{failureReason}</p>
          </div>

          <p className="text-xs text-[#7C769D] leading-relaxed">
             실패 상태에서는 기존 구독 등급이 변동되지 않습니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 text-xs">
            <button
              onClick={retryPayment}
              className="flex-1 py-3.5 bg-[#6B54E7] hover:bg-[#5b45d6] text-white font-extrabold rounded-2xl tracking-wide shadow-md transition-all cursor-pointer"
            >
              다시 시도
            </button>
            <button
              onClick={onNavigateBack}
              className="flex-1 py-3.5 bg-white hover:bg-neutral-50 text-[#7C769D] font-bold rounded-2xl tracking-wide transition-all border border-neutral-200 cursor-pointer"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2단계: PG 모의 진행 로딩 기동 중
  if (paymentPhase === 'PROCESSING' && isProcessing) {
    return (
      <div className="py-12 bg-[#FAF9FF] min-h-screen px-4 sm:px-6 lg:px-8 flex items-center justify-center font-gowun text-[#2F2D59] animate-in fade-in duration-200">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#6B54E7] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-[#2F2D59]">결제 승인 처리 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-[#FAF9FF] min-h-screen px-4 sm:px-6 lg:px-8 flex items-center justify-center font-gowun text-[#2F2D59]">
      <div className="w-full max-w-5xl grid md:grid-cols-12 gap-6 items-start">
        
        {/* Left Credit Card Form */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E6E2FC] space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-neutral-100">
            <div className="text-left">
              <h3 id="payment-form-title" className="text-base font-bold text-[#2F2D59]">결제 신용카드 정보 등록</h3>
              <p className="text-[11px] text-[#7C769D] mt-0.5">
                구독 결제에 사용할 카드 정보를 등록합니다.
              </p>
            </div>
            <button
              onClick={onNavigateBack}
              className="text-xs text-[#6B54E7] font-extrabold hover:underline cursor-pointer"
            >
              이전으로
            </button>
          </div>

          {/* 결제 보안 안내 */}
          <div className="bg-[#FAF9FF] text-[#2F2D59] border border-[#E6E2FC] p-4 rounded-2xl text-xs space-y-3 text-left">
            <p className="font-extrabold flex items-center text-[#2F2D59] gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              안전한 결제 시스템 안내
            </p>
            <p className="text-[11px] text-[#7C769D] leading-relaxed mt-0.5">
              * 토스페이먼츠(Toss Payments)의 보안 결제 시스템을 통해 카드 정보가 암호화되어 안전하게 처리됩니다.
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-150 text-rose-800 rounded-xl p-3 text-xs leading-relaxed text-left">
              {error}
            </div>
          )}

          <form onSubmit={handlePayment} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-[#7C769D] mb-1">
                신용카드 번호
              </label>
              <input
                type="text"
                required
                value={cardNumber}
                maxLength={19}
                onChange={handleCardNumberChange}
                className="w-full px-4 py-2.5 bg-[#FAF9FF] hover:bg-neutral-50 font-mono text-sm tracking-wider text-[#2F2D59] rounded-xl border border-[#E6E2FC] focus:border-[#6B54E7] focus:outline-none focus:bg-white transition-all duration-200"
                placeholder="4571 0000 0000 0000"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#7C769D] mb-1">
                  유효기간 (MM/YY)
                </label>
                <input
                  type="text"
                  required
                  value={expiry}
                  maxLength={5}
                  onChange={handleExpiryChange}
                  className="w-full px-4 py-2.5 bg-[#FAF9FF] hover:bg-neutral-50 font-mono text-sm text-[#2F2D59] rounded-xl border border-[#E6E2FC] focus:border-[#6B54E7] focus:outline-none focus:bg-white transition-all duration-200"
                  placeholder="12/29"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7C769D] mb-1">
                  CVC 번호 (3자리)
                </label>
                <input
                  type="password"
                  required
                  maxLength={3}
                  value={cvc}
                  onChange={handleCvcChange}
                  className="w-full px-4 py-2.5 bg-[#FAF9FF] hover:bg-neutral-50 font-mono text-sm text-[#ea580c] rounded-xl border border-[#E6E2FC] focus:border-[#6B54E7] focus:outline-none focus:bg-white transition-all duration-200"
                  placeholder="카드의 CVC 번호"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#7C769D] mb-1">
                  비밀번호 앞 2자리
                </label>
                <input
                  type="password"
                  required
                  maxLength={2}
                  value={passwordPrefix}
                  onChange={handlePasswordPrefixChange}
                  className="w-full px-4 py-2.5 bg-[#FAF9FF] hover:bg-neutral-50 font-mono text-sm text-[#2F2D59] rounded-xl border border-[#E6E2FC] focus:border-[#6B54E7] focus:outline-none focus:bg-white transition-all duration-200"
                  placeholder="앞 2글자 번호"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7C769D] mb-1">
                  소유자 생년월일 (6자리)
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={birth}
                  onChange={handleBirthChange}
                  placeholder="예: 951215"
                  className="w-full px-4 py-2.5 bg-[#FAF9FF] hover:bg-neutral-50 text-sm text-[#2F2D59] rounded-xl border border-[#E6E2FC] focus:border-[#6B54E7] focus:outline-none focus:bg-white transition-all duration-200"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isProcessing || success}
                className="w-full py-3.5 bg-[#6B54E7] hover:bg-[#5b45d6] text-white text-xs font-black rounded-xl tracking-wide transition-all shadow-md cursor-pointer"
              >
                {success ? (
                  <span className="flex items-center justify-center text-white font-bold gap-1">
                    <ShieldCheck className="w-4 h-4 text-white" />
                    결제 승인 및 처리 완료!
                  </span>
                ) : (
                  '신용카드 등록 및 구독 시작'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Product Bill Detail summary */}
        <div className="md:col-span-5 bg-[#110F24] text-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-left relative overflow-hidden border border-neutral-800">
          <div className="absolute top-[-30px] right-[-30px] w-48 h-48 bg-white/5 rounded-full filter blur-xl"></div>
          
          <div className="space-y-1">
            <span className="text-[10px] bg-white/10 text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider">
              Selected Item
            </span>
            <h4 className="text-lg font-bold">
              상상서가 프리미엄 {subPeriod} 구독
            </h4>
          </div>

          <div className="border-t border-white/10 pt-4 space-y-3 text-xs text-neutral-300">
            <div className="flex justify-between">
              <span>결제 금액</span>
              <span className="font-bold text-white">₩{displayPrice?.toLocaleString()} / 월</span>
            </div>
            <div className="flex justify-between">
              <span>제공 혜택</span>
              <span className="text-neutral-100 font-bold">AI 텍스트/이미지 생성 무제한</span>
            </div>
            <div className="flex justify-between">
              <span>결제 주기</span>
              <span>매월 자동결제</span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 flex justify-between items-baseline">
            <span className="text-xs font-bold text-neutral-400">최종 청구 예정액</span>
            <span className="text-3xl font-extrabold text-white">
              ₩{displayPrice?.toLocaleString()}원
            </span>
          </div>

          <p className="text-[10px] text-neutral-400 leading-relaxed pt-2">
            * 카드 등록 및 결제가 완료되면 프리미엄 혜택이 즉시 적용됩니다.
          </p>
        </div>

      </div>
    </div>
  );
};
