import React from 'react';
import { useSubscriptionState } from '../hooks/useSubscriptionState';
import {
  Award, 
  Star, 
  Crown, 
  Sparkles, 
  Zap, 
  Clock, 
  Coins, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  TrendingUp, 
  Check, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  Receipt, 
  ArrowLeft,
  Activity,
  CreditCard,
  Plus
} from 'lucide-react';

export const SubscriptionView = ({ 
  onNavigateHome, 
  onNavigate,
  onCancelSubscription,
  onSelectPlan,
  isPremium,
  freeTrialRemaining,
  freeTrialTextTokens,
  freeTrialImageCount,
  extraCreditsRemaining,
  setExtraCreditsRemaining,
  dailyScore,
  dailyTextTokens,
  dailyImageCount,
  isSubscriptionCanceled,
  benefitEndDate,
  onInitiateCreditsPayment
}) => {
  const {
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
  } = useSubscriptionState({ onCancelSubscription, onSelectPlan, setExtraCreditsRemaining, onInitiateCreditsPayment });

  return (
    <div className="bg-[#FAF9FF] min-h-screen font-sans text-[#2F2D59] w-full px-0 py-0 pb-16 relative">
      
      {/* Top Ambient Blurs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#E6E2FC]/40 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-[#EDF5FF]/50 rounded-full filter blur-[100px] pointer-events-none"></div>

      {/* 1. Header Hero Panel with back button and elegant metrics */}
      <div className="relative w-full bg-[#110F24] text-white overflow-hidden rounded-b-[2.5rem] shadow-lg border-b border-[#2F2D59]/30 z-10 px-4 py-8 sm:py-12 sm:px-8">
        {/* Deep starry background vibe */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(107,84,231,0.2),transparent)] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 relative z-10">
          
          {/* Back button and Tag */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 text-xs font-bold transition-all border border-white/5 active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>작가 홈으로 가기</span>
            </button>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#6B54E7]/30 text-[#B9B0DC] rounded-full text-xs font-semibold border border-[#6B54E7]/40">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>실시간 구독 통계 센터</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="text-left space-y-2 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                <Crown className="w-8 h-8 text-yellow-300 fill-yellow-300/10 shrink-0" />
                <span>나의 구독 및 아틀리에 관리 대시보드</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#B9B0DC] leading-relaxed">
                현재 이용 현황, 실시간 소모량 통계 확인은 물론 정기 결제 플랜 변경 및 추가 생성권 개별 보충까지, 작가님만의 풍요롭고 편리한 집필 전산망을 원스톱으로 관리합니다.
              </p>
            </div>

            {/* Quick status card with glowing effect */}
            <div className="relative w-full lg:w-auto flex items-center gap-5 bg-white/[0.04] backdrop-blur-md px-6 py-5 rounded-2xl border border-white/10 shrink-0 text-left">
              <div className="absolute -top-3 -right-3 w-12 h-12 bg-[#6B54E7]/30 rounded-full filter blur-md"></div>
              
              <div className="space-y-1">
                <span className="text-[10px] text-[#B9B0DC] block tracking-wider font-bold uppercase">나의 현재 작가 등급</span>
                <span className={`text-sm sm:text-base font-black flex items-center gap-1.5 ${isPremium ? 'text-yellow-300' : 'text-slate-300'}`}>
                  {isPremium ? (
                    <>
                      <Star className="w-4.5 h-4.5 text-yellow-300 fill-yellow-300" />
                      <span>프리미엄 작가 플랜</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-4.5 h-4.5 text-slate-300" />
                      <span>새싹 작가 회원 (기본)</span>
                    </>
                  )}
                </span>
              </div>
              
              <div className="h-10 w-[1px] bg-white/10"></div>
              
              <div className="space-y-1">
                <span className="text-[10px] text-[#B9B0DC] block tracking-wider font-bold uppercase">내 잔여 단편 크레딧</span>
                <span className="text-sm sm:text-base font-extrabold text-white block">
                  {isPremium ? '무제한 (∞)' : `${extraCreditsRemaining || 0}매`}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 2. Unified Grid Layout Container */}
      <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 md:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ==================== LEFT SIDE: Current Subscription + Usage + Pricing (Colspan 8) ==================== */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Left Card 1: Real-time Resource usage stats */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6E2FC]/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
              
              <div className="flex items-center justify-between border-b border-[#E6E2FC]/40 pb-4">
                <div className="flex items-center gap-2 text-left">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <h3 className="text-base font-black text-[#2F2D59]">
                    실시간 리소스 소모 지표
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#EDF5FF] text-[#5179E6] text-[10px] font-bold rounded-md">
                  <Activity className="w-3 h-3 animate-pulse" />
                  <span>실시간 동기화 활성</span>
                </span>
              </div>

              {isPremium ? (
                // Premium Status report (Unified tracking with co-weighted components)
                (() => {
                  const score = dailyScore || 2400;
                  const textTokens = dailyTextTokens || 1200;
                  const imageCount = dailyImageCount || 1;
                  const scorePercent = Math.min(100, (score / 5000) * 100);

                  return (
                    <div className="space-y-6">
                      
                      {/* Sleek Gauge Area */}
                      <div className="bg-[#FAF9FF] rounded-2xl p-5 sm:p-6 border border-[#E6E2FC]/40 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-left">
                          <div className="space-y-1">
                            <span className="text-[9px] bg-[#6B54E7] text-white font-extrabold px-2.5 py-0.5 rounded-full tracking-wider uppercase">
                              통합 풀 모델 (Unified Pool)
                            </span>
                            <h4 className="text-sm sm:text-base font-extrabold text-[#2F2D59] pt-1">
                              종합 인공지능 리소스 소모 상태
                            </h4>
                          </div>
                          <div className="text-left sm:text-right font-mono">
                            <span className="text-2xl sm:text-3xl font-black text-[#6B54E7]">{score.toLocaleString()}</span>
                            <span className="text-xs text-[#7C769D] font-bold"> / 5,000 pt (일일 한도)</span>
                          </div>
                        </div>

                        {/* Combined Premium Progress Bar */}
                        <div className="relative w-full bg-[#E6E2FC]/50 h-3.5 rounded-full overflow-hidden">
                          <div 
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#6B54E7] via-[#5179E6] to-[#835AF1] transition-all duration-700 rounded-full" 
                            style={{ width: `${scorePercent}%` }}
                          ></div>
                        </div>

                        {/* Breakdown Legend inside premium */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E6E2FC]/50 text-xs text-left">
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[#5179E6]">
                              <span className="flex items-center gap-2 font-bold">
                                <span className="w-2 h-2 bg-[#5179E6] rounded-full"></span>
                                📖 텍스트 소모 (자당 1.0 pt)
                              </span>
                              <span className="font-mono font-black text-[#2F2D59]">{textTokens.toLocaleString()} pt</span>
                            </div>
                            <p className="text-[11px] text-[#7C769D] leading-normal pl-4">
                              문장 필사, 퇴고 조력 및 대화 생성 자수 한도에 비례하여 자동 산정
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[#6B54E7]">
                              <span className="flex items-center gap-2 font-bold">
                                <span className="w-2 h-2 bg-[#6B54E7] rounded-full"></span>
                                🎨 이미지 소모 (장당 1,200 pt)
                              </span>
                              <span className="font-mono font-black text-[#2F2D59]">{(imageCount * 1200).toLocaleString()} pt</span>
                            </div>
                            <p className="text-[11px] text-[#7C769D] leading-normal pl-4">
                              시네마틱 수채화 및 소설 맞춤식 인공지능 명화 일러스트 삽화 차감
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Informative advice banner */}
                      <div className="bg-[#E6E2FC]/20 border border-[#E6E2FC]/50 rounded-xl p-4 text-xs text-[#6B54E7] leading-relaxed text-left flex items-start gap-2.5">
                        <Zap className="w-5 h-5 text-[#6B54E7] shrink-0 mt-0.5" />
                        <p>
                          <strong>리소스 통합 정산 규칙:</strong> 상상서가의 실시간 제어 모델은 복잡하고 인위적인 기능별 제약을 생략하는 대신, <strong>텍스트와 이미지를 자산 가중 비율로 신축 통합해 단일 전산 풀로 조율</strong>합니다. 작가님의 스타일대로 삽화 중심 구상 또는 순수 문학 중심 집필을 능동적으로 배분해 보세요.
                        </p>
                      </div>

                    </div>
                  );
                })()
              ) : (
                // Free trial status report (Unified tracking with co-weighted components)
                (() => {
                  const textTokens = freeTrialTextTokens || 0;
                  const imageCount = freeTrialImageCount || 0;
                  const isExpired = freeTrialRemaining === 0 || (textTokens >= 1000 && imageCount >= 3);
                  
                  const trialUsed = textTokens + (imageCount * 300);
                  const trialTotal = 1900; 
                  const scorePercent = Math.min(100, (trialUsed / trialTotal) * 100);

                  return (
                    <div className="space-y-6">
                      
                      {isExpired && (
                        <div className="bg-rose-50 border border-rose-150 p-4 rounded-xl text-xs text-rose-800 leading-relaxed text-left flex items-start gap-2.5">
                          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                          <p>
                            <strong>무료 체험 패키지 소진:</strong> 지급해 드린 가입 무료 체험 패키지가 모두 소멸되었습니다. 상상력을 멈추지 않으시도록 아래 프리미엄 플랜을 자유롭게 이용해 보세요!
                          </p>
                        </div>
                      )}

                      {/* Unified Gauge Box */}
                      <div className="bg-[#FAF9FF] rounded-2xl p-5 sm:p-6 border border-[#E6E2FC]/40 space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-left">
                          <div className="space-y-1">
                            <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-2.5 py-0.5 rounded-full tracking-wider uppercase">
                              체험판 통합 모형 (Free-Trial Pool)
                            </span>
                            <h4 className="text-sm sm:text-base font-extrabold text-[#2F2D59] pt-1">
                              체험판 실시간 가중 리소스 사용량
                            </h4>
                          </div>
                          <div className="text-left sm:text-right font-mono">
                            <span className="text-2xl sm:text-3xl font-black text-emerald-600">{trialUsed.toLocaleString()}</span>
                            <span className="text-xs text-[#7C769D] font-bold"> / {trialTotal.toLocaleString()} pt (전체 혜택)</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative w-full bg-[#E6E2FC]/50 h-3.5 rounded-full overflow-hidden">
                          <div 
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-[#5179E6] transition-all duration-700 rounded-full" 
                            style={{ width: `${scorePercent}%` }}
                          ></div>
                        </div>

                        {/* Weight Breakdown */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E6E2FC]/50 text-xs text-left">
                          <div className="space-y-1">
                            <span className="text-[#7C769D] block">📖 체험 텍스트 소모 (가중치: 자당 1.0 pt)</span>
                            <span className="font-mono font-black text-[#2F2D59] block text-sm">{textTokens} / 1,000 pt</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[#7C769D] block">🎨 체험 이미지 삽화 (가중치: 장당 300 pt)</span>
                            <span className="font-mono font-black text-[#2F2D59] block text-sm">{(imageCount * 300)} / 900 pt ({imageCount}장)</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#FAF9FF] border border-[#E6E2FC]/40 rounded-xl p-4 text-[11px] text-[#7C769D] leading-relaxed text-left flex items-start gap-2">
                        <HelpCircle className="w-4 h-4 text-[#6B54E7] shrink-0 mt-0.5" />
                        <p>
                          <strong>체험판 이용 안내:</strong> 신규 작가님께는 부정 이용 방지를 위해 무료 체험 리소스가 일정 한도로 제공됩니다.
                        </p>
                      </div>

                    </div>
                  );
                })()
              )}
            </div>

            {/* Left Card 2: Subscription Pricing Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6E2FC]/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E2FC]/40 pb-5 text-left">
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-[#2F2D59]">
                    아틀리에 멤버십 구독 요금제
                  </h3>
                  <p className="text-xs text-[#7C769D]">
                    상상서가의 고품격 무제한 초안 생성과 맞춤 제본용 명화 일러스트 패키지를 가동합니다.
                  </p>
                </div>

                {/* Subcription toggle switch */}
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
                    <span className="text-[9px] bg-red-100 text-red-600 px-1 py-0.25 rounded-md font-black">20% 할인</span>
                  </button>
                </div>
              </div>

              {/* Bento-style Plan Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* 1. Free Plan Card */}
                <div className="p-6 rounded-2xl border border-[#E6E2FC]/60 bg-[#FAF9FF] flex flex-col justify-between text-left space-y-6">
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] text-[#7C769D] tracking-wider font-extrabold uppercase">Standard Free</span>
                      <h4 className="text-base font-black text-[#2F2D59] mt-0.5">새싹 작가 무료 이용권</h4>
                      <p className="text-xs text-[#7C769D] mt-1.5 leading-relaxed">
                        상상서가의 문장력 수사 및 기초 가구 배치를 가볍게 체험하고 아이디어를 기록할 수 있습니다.
                      </p>
                    </div>

                    <div className="pt-2">
                      <span className="text-3xl font-black text-[#2F2D59]">₩0</span>
                      <span className="text-[11px] text-[#7C769D] block mt-1">추가 결제 의무 및 청구 없이 평생 이용 가능</span>
                    </div>

                    <div className="space-y-2.5 border-t border-[#E6E2FC]/40 pt-4 text-xs text-[#7C769D]">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>하루 AI 초안 집필 10편 한정 제공</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>기초 동화 일러스트 6종 장식 지원</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#7C769D]/50 line-through">
                        <X className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>고선명 인명 일러스트 무제한 영속 보존 불가</span>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={!isPremium}
                    onClick={() => {
                      if (isPremium) {
                        openCancelConfirm();
                      }
                    }}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition-all text-center ${
                      isPremium
                        ? 'bg-[#E6E2FC] hover:bg-[#d8d2f7] text-[#6B54E7] cursor-pointer'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default font-extrabold flex items-center justify-center gap-1.5'
                    }`}
                  >
                    {isPremium ? (
                      '기본 무료 요금으로 다운그레이드'
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>현재 이용 중인 기본 요금제</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 2. Premium Plan Card */}
                <div className={`p-6 rounded-2xl border-2 flex flex-col justify-between text-left space-y-6 transition-all duration-300 relative ${
                  isPremium && !isSubscriptionCanceled
                    ? 'border-[#6B54E7] bg-white shadow-xl shadow-[#6B54E7]/5'
                    : 'border-[#E6E2FC]/60 bg-white hover:border-[#6B54E7]/40 hover:shadow-lg'
                }`}>
                  {/* Popular Badge */}
                  <div className="absolute -top-3.5 right-6 bg-[#6B54E7] text-white text-[10px] font-black tracking-wider px-3 py-1 rounded-full uppercase shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-yellow-300" />
                    <span>추천 아틀리에</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] text-[#6B54E7] tracking-wider font-extrabold uppercase">Premium Membership</span>
                      <h4 className="text-base font-black text-[#2F2D59] mt-0.5">프리미엄 창작 패키지</h4>
                      <p className="text-xs text-[#7C769D] mt-1.5 leading-relaxed">
                        초고선명 시네마틱 화풍과 장문 줄거리 일관성을 영속 보정받아 가치 높은 가공 책을 빌드합니다.
                      </p>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-[#6B54E7]">
                          {selectedPlanType === 'monthly' ? '₩9,900' : '₩7,900'}
                        </span>
                        <span className="text-xs text-[#7C769D] font-bold">/ 월 자동 결제</span>
                      </div>
                      {selectedPlanType === 'yearly' && (
                        <span className="text-[10px] bg-red-50 text-red-600 font-extrabold px-2 py-0.5 rounded-lg inline-block mt-1.5">
                          연간 20% 특별 우대 적용 완료 (연 24,000원 절약)
                        </span>
                      )}
                    </div>

                    <div className="space-y-2.5 border-t border-[#E6E2FC]/40 pt-4 text-xs text-[#2F2D59]">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#6B54E7] shrink-0 font-bold" />
                        <span className="font-semibold">실시간 소설 창작 무제한 (Gemini Pro 전담)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#6B54E7] shrink-0 font-bold" />
                        <span className="font-semibold">시네마틱/유화 명화 화풍 일러스트 무제한 제공</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#6B54E7] shrink-0 font-bold" />
                        <span className="font-semibold">PDF 정밀 이북 다운로드 및 제본 인가권 포함</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-[#E6E2FC]/40">
                    <button
                      onClick={handleSelectPremium}
                      className={`w-full py-3 rounded-xl text-xs font-black transition-all text-center cursor-pointer shadow-md ${
                        isPremium && !isSubscriptionCanceled
                          ? 'bg-[#110F24] hover:bg-neutral-800 text-white'
                          : 'bg-gradient-to-r from-[#5179E6] via-[#6B54E7] to-[#835AF1] text-white hover:opacity-95'
                      }`}
                    >
                      {isPremium && !isSubscriptionCanceled ? '구독 변경 및 결제 내역 확인' : '프리미엄 정기 구독 개시'}
                    </button>
                    
                    {isPremium && !isSubscriptionCanceled && (
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={openCancelConfirm}
                          className="text-[11px] text-rose-500 hover:text-rose-600 font-extrabold transition-all cursor-pointer inline-flex items-center gap-1 hover:underline"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>정기 결제 자동 갱신 해지 예약</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Collapsible FAQ list */}
              <div className="mt-8 pt-6 border-t border-[#E6E2FC]/40 text-left">
                <span className="text-xs text-[#7C769D] font-extrabold flex items-center gap-2 uppercase mb-4">
                  <HelpCircle className="w-4.5 h-4.5 text-[#6B54E7]" />
                  <span>멤버십 및 창작 아틀리에 FAQ</span>
                </span>

                <div className="space-y-3">
                  {faqs.map((faq) => (
                    <div 
                      key={faq.id} 
                      className="rounded-2xl border border-[#E6E2FC]/40 bg-[#FAF9FF] overflow-hidden transition-all duration-200"
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex justify-between items-center text-left px-5 py-4 text-xs sm:text-sm font-extrabold text-[#2F2D59] hover:bg-[#E6E2FC]/20 transition-colors cursor-pointer"
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

          {/* ==================== RIGHT SIDE: Add-on Purchases + Bill Receipts (Colspan 4) ==================== */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Right Card 1: Single item credit charging block */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6E2FC]/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-6">
              
              <div className="space-y-1.5 text-left">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-black tracking-wider uppercase rounded-md">
                  <Coins className="w-3.5 h-3.5 text-amber-600" />
                  <span>단발 보강 충전소</span>
                </span>
                <h3 className="text-base font-black text-[#2F2D59]">
                  단편 생성권 개별 즉시 구매
                </h3>
                <p className="text-xs text-[#7C769D] leading-relaxed">
                  정기 구독 갱신일과 관계없이 소설 책 삽화와 긴 소설 영감이 갑자기 소진되었을 때, 긴급하게 가용 단편을 추가 충전합니다.
                </p>
              </div>

              {/* Direct Package Selection list */}
              <div className="space-y-3 pt-1">
                {creditPackages.map((pkg) => (
                  <button
                    key={pkg.count}
                    type="button"
                    onClick={() => setExtraCreditsCount(pkg.count)}
                    className={`relative w-full p-4 rounded-2xl border text-left transition-all duration-200 flex justify-between items-center cursor-pointer ${
                      extraCreditsCount === pkg.count
                        ? 'border-[#6B54E7] bg-[#E6E2FC]/20 shadow-xs ring-1 ring-[#6B54E7]'
                        : 'border-[#E6E2FC]/60 hover:border-[#6B54E7]/40 bg-white'
                    }`}
                  >
                    {pkg.isPopular && (
                      <span className="absolute -top-2 right-4 bg-[#6B54E7] text-white text-[8px] font-black tracking-wider px-2 py-0.5 rounded-full uppercase shadow-xs">
                        BEST
                      </span>
                    )}
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-[#2F2D59]">{pkg.label}</h4>
                      <p className="text-[10px] text-[#7C769D]">{pkg.desc}</p>
                    </div>
                    <span className="text-xs font-black text-[#6B54E7] font-mono">
                      ₩{pkg.price.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>

              {/* Interactive slider */}
              <div className="space-y-4 pt-4 border-t border-[#E6E2FC]/40 text-left">
                <div className="flex justify-between items-center text-[11px] text-[#7C769D] font-semibold">
                  <span>원하는 장수 직접 조절 (10~200매)</span>
                  <span className="text-[#6B54E7]">장당 ₩98 won</span>
                </div>

                <div className="flex items-center gap-4 bg-[#FAF9FF] p-3 rounded-2xl border border-[#E6E2FC]/40">
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="10"
                    value={extraCreditsCount < 10 ? 10 : extraCreditsCount}
                    onChange={(e) => setExtraCreditsCount(Number(e.target.value))}
                    className="flex-grow h-1.5 bg-[#E6E2FC] rounded-lg appearance-none cursor-pointer accent-[#6B54E7]"
                  />
                  <span className="text-xs font-extrabold text-[#2F2D59] shrink-0 bg-white px-3 py-1 rounded-xl border border-[#E6E2FC]/50 font-mono shadow-xs">
                    {extraCreditsCount}매
                  </span>
                </div>

                {/* Confirm pricing box */}
                <div className="flex justify-between items-center pt-4 border-t border-[#E6E2FC]/40">
                  <div className="space-y-0.5">
                    <span className="text-[#7C769D] text-[10px] font-bold block">총 결제 금액</span>
                    <span className="text-base font-black text-[#2F2D59] font-mono">
                      ₩{calculatedCost.toLocaleString()}원
                    </span>
                  </div>

                  <button
                    onClick={handleBuyCredits}
                    className="px-4 py-2.5 bg-[#6B54E7] hover:bg-[#5b45d6] text-white text-xs font-black rounded-xl transition-all shadow-md shadow-[#6B54E7]/15 cursor-pointer hover:scale-[1.02] active:scale-95"
                  >
                    충전하기
                  </button>
                </div>
              </div>

            </div>

            {/* Right Card 2: Payment logs timeline */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6E2FC]/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4">
              
              <div className="border-b border-[#E6E2FC]/40 pb-3 flex justify-between items-center text-left">
                <h3 className="text-xs font-extrabold text-[#2F2D59] uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-[#6B54E7]" />
                  <span>최근 결제 영수 기록</span>
                </h3>
                <span className="text-[10px] text-[#7C769D] font-semibold">최근 4건</span>
              </div>

              <div className="divide-y divide-[#E6E2FC]/30 max-h-64 overflow-y-auto pr-1">
                {records.map((rec) => (
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
                      <span className="font-black text-[#2F2D59] font-mono">
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
                <h4 className="font-black text-base text-[#2F2D59]">상상서가 명세 내역서</h4>
                <p className="text-[10px] text-[#7C769D] font-mono">영수 일련번호: {selectedInvoice.id}</p>
              </div>

              <div className="border-t border-b border-dashed border-[#E6E2FC] py-4 space-y-2.5 text-xs text-[#7C769D]">
                <div className="flex justify-between">
                  <span>공급 가맹점</span>
                  <span className="font-bold text-[#2F2D59]">상상서가 아틀리에</span>
                </div>
                <div className="flex justify-between">
                  <span>품목 규격</span>
                  <span className="font-bold text-[#6B54E7]">{selectedInvoice.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>인증 완료 시간</span>
                  <span className="font-mono text-[#2F2D59]">{selectedInvoice.date.split(' • ')[0]}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>거래 거래 상태</span>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-200">
                    {selectedInvoice.status || '성공'}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-baseline pt-2">
                <span className="text-xs text-[#7C769D] font-bold">정산 금액</span>
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
                  <span>출력 인쇄 및 PDF 저장</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. DIALOG MODAL: Credit Charge Success */}
      {purchaseSuccess && (
        <div className="fixed inset-0 bg-[#110F24]/50 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center border border-[#E6E2FC]/50 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#2F2D59]">생성권 개별 보완 충전 완료</h3>
            
            <div className="text-xs text-[#7C769D] mt-3.5 space-y-1.5 text-left bg-[#FAF9FF] p-4 rounded-2xl border border-[#E6E2FC]/60 font-mono">
              <p>📦 <strong>물품:</strong> 아틀리에 생성권 {extraCreditsCount}장</p>
              <p>💳 <strong>정산금액:</strong> ₩{calculatedCost.toLocaleString()} 원</p>
              <p>✓ 안전하게 충전이 완료되었습니다.</p>
            </div>

            <button
              onClick={() => setPurchaseSuccess(false)}
              className="mt-5 w-full py-3 bg-[#6B54E7] hover:bg-[#5b45d6] text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-md shadow-[#6B54E7]/15"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 5. DIALOG MODAL: Subscription Cancel Confirm */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-[#110F24]/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center border border-[#E6E2FC]/50 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-12 h-12 bg-rose-50 rounded-2xl border border-rose-200 flex items-center justify-center text-rose-600 mb-4 animate-bounce">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#2F2D59]">구독 자동 결제 해지 예약</h3>
            
            <p className="text-xs text-[#7C769D] mt-3 leading-relaxed text-left bg-[#FAF9FF] p-4 rounded-2xl border border-[#E6E2FC]/50">
              정말로 프리미엄 멤버십 해지 예약을 신청하시겠습니까? 해지하시더라도 이번 결제 기간 만료일인 <strong className="text-[#6B54E7] font-extrabold">{benefitEndDate || '2026.07.15'}</strong>까지는 고품격 시네마틱 명화 일러스트 및 무제한 소설 쓰기 혜택을 제약 없이 안전하게 누리실 수 있습니다.
            </p>

            <div className="mt-5 flex space-x-3">
              <button
                onClick={closeCancelConfirm}
                className="flex-1 py-3 bg-[#FAF9FF] hover:bg-[#E6E2FC]/30 text-[#6B54E7] border border-[#E6E2FC]/60 text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95"
              >
                멤버십 계속 유지
              </button>
              <button
                onClick={confirmCancelSubscription}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95 shadow-md shadow-rose-600/15"
              >
                해지 진행 승인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. DIALOG MODAL: Subscription Cancel Success */}
      {showCancelSuccess && (
        <div className="fixed inset-0 bg-[#110F24]/50 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in duration-200">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center border border-[#E6E2FC]/50 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-center text-emerald-600 mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#2F2D59]">자동 결제 해지 예약 승인</h3>
            <p className="text-xs text-[#7C769D] mt-2 leading-relaxed text-left">
              정상적으로 멤버십 자동 갱신 해지 처리가 적용되었습니다. 남은 유효 이용 기한까지는 프리미엄 우대 혜택이 정상 보존됩니다. 그동안 함께해주셔서 감사합니다!
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

      {/* 7. DIALOG MODAL: Printer Simulation */}
      {printSuccess && (
        <div className="fixed inset-0 bg-[#110F24]/50 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in duration-200">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 text-center border border-[#E6E2FC]/50 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-12 h-12 bg-[#FAF9FF] border border-[#E6E2FC]/50 rounded-2xl flex items-center justify-center text-[#6B54E7] mb-4 animate-pulse">
              <Printer className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-[#2F2D59]">인쇄 파일 생성 중</h3>
            <p className="text-xs text-[#7C769D] mt-2 leading-relaxed">
              명세서가 포함된 인쇄용 파일을 생성하고 있습니다. 잠시 후 브라우저에서 인쇄하거나 PDF로 저장하실 수 있습니다.
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
