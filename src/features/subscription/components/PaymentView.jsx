import React, { useState } from 'react';
import { ILLUSTRATION_BOOKS } from '../../../shared/data';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const PaymentView = ({ paymentParams, onPaymentSuccess, onNavigateBack }) => {
  const [cardNumber, setCardNumber] = useState('4571 8820 4400 9715');
  const [expiry, setExpiry] = useState('11/29');
  const [cvc, setCvc] = useState('389');
  const [passwordPrefix, setPasswordPrefix] = useState('12');
  const [birth, setBirth] = useState('951215');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // 2026-06-19 추가: 토스페이먼츠 승인 결과 모의 시뮬레이터 옵션
  const [simulatedStatus, setSimulatedStatus] = useState('SUCCESS'); // 'SUCCESS' | 'EXCEEDED_LIMIT' | 'INSUFFICIENT_BALANCE' | 'LOST_CARD'
  const [paymentPhase, setPaymentPhase] = useState('FORM'); // 'FORM' | 'PROCESSING' | 'FAILURE_SCREEN'
  const [failureReason, setFailureReason] = useState('');

  // Fallback defaults if paymentParams is empty
  const isSubscriptionType = paymentParams?.type === 'subscription';
  const displayPrice = paymentParams?.price || 9900;
  const creditsAmount = paymentParams?.creditsCount || 50;
  const subPeriod = paymentParams?.subType === 'yearly' ? '연간' : '월간';

  const handleCardFormat = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleExpiryFormat = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  const handlePayment = (e) => {
    e.preventDefault();
    setError('');

    if (cardNumber.length < 15) {
      setError('올바른 신용카드 번호 16자리를 기재해 주세요.');
      return;
    }
    if (expiry.length < 4) {
      setError('유효기간 MM/YY 포맷을 확인해 주세요.');
      return;
    }
    if (cvc.length < 3) {
      setError('올바른 CVC 번호 3자리를 입력해 주세요.');
      return;
    }

    setIsProcessing(true);
    setPaymentPhase('PROCESSING');

    // PG사 테스트 결제 (토스페이먼츠 모사 페이지)
    setTimeout(() => {
      setIsProcessing(false);

      if (simulatedStatus === 'SUCCESS') {
        setSuccess(true);
        setTimeout(() => {
          onPaymentSuccess();
        }, 1200);
      } else {
        // 결제 실패 처리 단계 진입
        let details = '';
        if (simulatedStatus === 'EXCEEDED_LIMIT') {
          details = '한도 초과 (오류 코드: EXCEEDED_LIMIT) - 등록하신 신용카드의 1회 혹은 월간 한도가 초과되어 금융사 대행 승인이 반려되었습니다.';
        } else if (simulatedStatus === 'INSUFFICIENT_BALANCE') {
          details = '잔액 부족 (오류 코드: INSUFFICIENT_BALANCE) - 계좌 또는 카드 한도 잔액이 부족하여 결제 승인을 완수하지 못하였습니다.';
        } else if (simulatedStatus === 'LOST_CARD') {
          details = '정지된 카드 (오류 코드: LOST_OR_STOLEN_CARD) - 요청하신 신용카드가 분실 또는 유효 정지된 상태로 대행 금융사에 의해 폐기 조회되었습니다.';
        }
        
        setFailureReason(details);
        setPaymentPhase('FAILURE_SCREEN');
      }
    }, 1500);
  };

  // 1단계: 결제 실패 전용 화면 렌더링 분기
  if (paymentPhase === 'FAILURE_SCREEN') {
    return (
      <div className="py-12 bg-[#FAF9FF] min-h-screen px-4 sm:px-6 lg:px-8 flex items-center justify-center font-sans text-[#2F2D59] animate-in fade-in duration-150">
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
              결제 수납대행 거절 사유
            </p>
            <p className="leading-relaxed text-[11px]">{failureReason}</p>
          </div>

          <p className="text-xs text-[#7C769D] leading-relaxed">
             실패 상태에서는 기존 구독 등급이 변동되지 않으며, 단건 생성권 역시 충전 지급되지 않습니다. <br />
             카드를 다시 확인하신 후 재시도 버튼을 눌러 결제 정보 입력 화면으로 복구할 수 있습니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 text-xs">
            <button
              onClick={() => {
                setPaymentPhase('FORM');
                setError('');
              }}
              className="flex-1 py-3.5 bg-[#6B54E7] hover:bg-[#5b45d6] text-white font-extrabold rounded-2xl tracking-wide shadow-md transition-all cursor-pointer"
            >
              다시 시도해주세요 (재시도)
            </button>
            <button
              onClick={onNavigateBack}
              className="flex-1 py-3.5 bg-white hover:bg-neutral-50 text-[#7C769D] font-bold rounded-2xl tracking-wide transition-all border border-neutral-200 cursor-pointer"
            >
              결제 취소 (이전으로 복귀)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2단계: PG 모의 진행 로딩 기동 중
  if (paymentPhase === 'PROCESSING' && isProcessing) {
    return (
      <div className="py-12 bg-[#FAF9FF] min-h-screen px-4 sm:px-6 lg:px-8 flex items-center justify-center font-sans text-[#2F2D59] animate-in fade-in duration-200">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#6B54E7] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-[#2F2D59]">토스페이먼츠(Toss Payments) 수납대행 심사 승인 요청 중...</p>
          <p className="text-xs text-[#7C769D]">네트워크 보안 가상터널 세션을 할당받아 심사가 즉시 기동되고 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-[#FAF9FF] min-h-screen px-4 sm:px-6 lg:px-8 flex items-center justify-center font-sans text-[#2F2D59]">
      <div className="w-full max-w-5xl grid md:grid-cols-12 gap-6 items-start">
        
        {/* Left Credit Card Form */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#E6E2FC] space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-neutral-100">
            <div className="text-left">
              <h3 id="payment-form-title" className="text-base font-bold text-[#2F2D59]">결제 신용카드 정보 등록</h3>
              <p className="text-[11px] text-[#7C769D] mt-0.5">
                {isSubscriptionType ? '정기 아틀리에 구독 가입에 연동할 카드 정보를 등록합니다.' : '추가 생성권 충전에 필요한 카드 정보를 등록합니다.'}
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
                onChange={(e) => setCardNumber(handleCardFormat(e.target.value))}
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
                  onChange={(e) => setExpiry(handleExpiryFormat(e.target.value))}
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
                  onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/g, ''))}
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
                  onChange={(e) => setPasswordPrefix(e.target.value.replace(/[^0-9]/g, ''))}
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
                  onChange={(e) => setBirth(e.target.value.replace(/[^0-9]/g, ''))}
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
                  `신용카드 등록 및 ${isSubscriptionType ? '구독 시작' : '단건 즉시결제'}`
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
              {isSubscriptionType ? `상상서가 프리미엄 ${subPeriod} 구독` : `추가 창작 생성권 구매`}
            </h4>
          </div>

          <div className="border-t border-white/10 pt-4 space-y-3 text-xs text-neutral-300">
            <div className="flex justify-between">
              <span>상품 유형</span>
              <span className="text-white font-bold">{isSubscriptionType ? `정기 충전 플랜 (${subPeriod})` : `단편 집필 충전 패키지`}</span>
            </div>
            
            {isSubscriptionType ? (
              <>
                <div className="flex justify-between">
                  <span>프리미엄 정기 요금</span>
                  <span className="font-bold text-white">₩{displayPrice?.toLocaleString()} / 월</span>
                </div>
                <div className="flex justify-between">
                  <span>제공 혜택</span>
                  <span className="text-neutral-100 font-bold">AI 아틀리에 무제한 구동</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span>추가 생성권 수량</span>
                  <span className="font-bold text-white">{creditsAmount} 매</span>
                </div>
                <div className="flex justify-between">
                  <span>충전 결제액</span>
                  <span className="font-semibold text-white">₩{displayPrice?.toLocaleString()}</span>
                </div>
              </>
            )}
            
            <div className="flex justify-between">
              <span>결제 주기</span>
              <span>{isSubscriptionType ? '매월 자동결제 (토스 수납대행)' : '일회적 즉시 구매'}</span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 flex justify-between items-baseline">
            <span className="text-xs font-bold text-neutral-400">최종 청구 예정액</span>
            <span className="text-3xl font-extrabold text-white">
              ₩{displayPrice?.toLocaleString()}원
            </span>
          </div>

          <p className="text-[10px] text-neutral-400 leading-relaxed pt-2">
            * 카드 등록 및 결제가 완료되면 프리미엄 혜택과 생성권 제한이 즉시 적용됩니다.
          </p>
        </div>

      </div>
    </div>
  );
};
