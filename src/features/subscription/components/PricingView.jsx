import React, { useState } from 'react';
import { ILLUSTRATION_BOOKS } from '../../../shared/data';
import { ArrowLeft, Sparkles, HelpCircle, ChevronUp, ChevronDown, CheckCircle2, XCircle } from 'lucide-react';

export const PricingView = ({ onSelectPlan, onNavigateHome }) => {
  const [selectedPlanType, setSelectedPlanType] = useState('monthly');
  const [openFaqId, setOpenFaqId] = useState(1);

  const faqs = [
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
  ];

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="py-12 bg-[#FAF9FF] min-h-screen px-4 sm:px-6 lg:px-8 relative font-sans text-[#2F2D59]">
      
      {/* Back button to dashboard */}
      <div className="w-full max-w-4xl mx-auto mb-6 text-left">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center space-x-2 text-xs font-bold text-[#7C769D] hover:text-[#2F2D59] cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>사용자 개인 서재 복귀</span>
        </button>
      </div>

      <div className="w-full max-w-4xl mx-auto text-center space-y-6">
        <div className="space-y-3">
          <span className="inline-block px-3 py-1 bg-[#110F24] text-white rounded-full text-[10px] tracking-widest font-bold uppercase">
            Premium Atelier Plan
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2F2D59] tracking-tight">
            나에게 맞는 창작 플랜을 선택하세요
          </h2>
          <p className="text-xs sm:text-sm text-[#7C769D] max-w-lg mx-auto leading-relaxed">
            무료 작가로 소소한 일상을 가로지르거나, 프리미엄 아틀리에 구독자가 되어 완성도 높은 책 한 편을 완전히 집필 및 모사해 보세요.
          </p>
        </div>

        {/* Plan toggle options tabs */}
        <div className="flex justify-center mt-6">
          <div className="bg-white p-1 rounded-2xl shadow-xs border border-[#E6E2FC] flex space-x-1">
            <button
              onClick={() => setSelectedPlanType('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                selectedPlanType === 'monthly' ? 'bg-[#6B54E7] text-white shadow-xs' : 'text-[#7C769D] hover:text-[#2F2D59]'
              }`}
            >
              월간 구독 요금
            </button>
            <button
              onClick={() => setSelectedPlanType('yearly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                selectedPlanType === 'yearly' ? 'bg-[#6B54E7] text-white shadow-xs' : 'text-[#7C769D] hover:text-[#2F2D59]'
              }`}
            >
              연간 구독 요금 (20% 할인)
            </button>
          </div>
        </div>

        {/* Price comparison layout cards */}
        <div className="grid md:grid-cols-2 gap-8 items-stretch pt-6 text-left">
          
          {/* FREE PLAN */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-[#E6E2FC] shadow-xs relative">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#2F2D59]">무료 새싹 작가</h3>
                <p className="text-xs text-[#7C769D] mt-1 leading-relaxed">상상서가의 기본적인 AI 서재를 소소하게 체험해 봅니다.</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-4xl font-black text-[#2F2D59]">₩0</span>
                <span className="text-xs text-[#7C769D] block mt-1">평생 무료 전산 제약 모드</span>
              </div>

              {/* Checklist details */}
              <div className="space-y-3.5 border-t border-[#E6E2FC]/40 pt-6">
                <div className="flex items-center text-xs text-[#2F2D59]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                  <span>일일 AI 소설 초안 생성 10편 한정</span>
                </div>
                <div className="flex items-center text-xs text-[#2F2D59]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                  <span>기본 6가지 도서 서재 가구 양식 지원</span>
                </div>
                <div className="flex items-center text-xs text-[#2F2D59]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                  <span>줄거리 가이드 수정 기회 2회 제공</span>
                </div>
                <div className="flex items-center text-xs text-[#7C769D]/50 line-through">
                  <XCircle className="w-4 h-4 text-rose-300 mr-2 shrink-0" />
                  <span>대형 고성능 AI 추론 엔진 (대화 일관성 제어권 없음)</span>
                </div>
                <div className="flex items-center text-xs text-[#7C769D]/50 line-through">
                  <XCircle className="w-4 h-4 text-rose-300 mr-2 shrink-0" />
                  <span>실시간 무제한 소설 책 제작 및 자택 실물 제본 신청</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button
                onClick={onNavigateHome}
                className="w-full py-3 bg-[#F3F0FF] hover:bg-[#E6E2FC] text-[#6B54E7] text-xs font-bold rounded-2xl transition-colors cursor-pointer text-center"
              >
                무료 아틀리에 등단 유지
              </button>
            </div>
          </div>

          {/* PREMIUM PLAN */}
          <div className="rounded-3xl p-6 sm:p-8 flex flex-col justify-between border border-[#110F24] relative bg-[#110F24] text-white shadow-xl">
            {/* Recommend Badge top corner */}
            <div className="absolute top-4 right-4 bg-white text-[#110F24] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
              Best 추천 플랜
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center">
                  <Sparkles className="text-yellow-300 mr-1.5 w-4 h-4" />
                  프리미엄 창작자
                </h3>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">상상서가 내 표지, 소설, 완벽 수치를 무제한 조합하여 단행본을 편찬합니다.</p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-extrabold text-white">
                    {selectedPlanType === 'monthly' ? '₩9,900' : '₩7,900'}
                  </span>
                  <span className="text-xs text-neutral-400">/ 월 결제</span>
                </div>
                {selectedPlanType === 'yearly' && (
                  <span className="text-[10px] bg-white/10 text-white px-2 py-0.5 rounded font-bold inline-block mt-1">
                    연간 정기 결제 시 월 2,000원 추가 절약!
                  </span>
                )}
              </div>

              {/* Checklist details key */}
              <div className="space-y-3.5 border-t border-neutral-800 pt-6">
                <div className="flex items-center text-xs text-neutral-200 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-yellow-300 mr-2 shrink-0" />
                  <span>일일 AI 소설 초작 무제한 및 속도 부스팅 가구</span>
                </div>
                <div className="flex items-center text-xs text-neutral-200 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-yellow-300 mr-2 shrink-0" />
                  <span>고성능 제미니 작가 모드 (소나기 에디션 묘사 일관성 지원)</span>
                </div>
                <div className="flex items-center text-xs text-neutral-200 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-yellow-300 mr-2 shrink-0" />
                  <span>AI 서가 고화질 일러스트 무제한 리터치</span>
                </div>
                <div className="flex items-center text-xs text-neutral-200 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-yellow-300 mr-2 shrink-0" />
                  <span>단행본 인쇄 및 무료 자택 배송 (연 1회 무료 쿠폰)</span>
                </div>
                <div className="flex items-center text-xs text-neutral-200 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-yellow-300 mr-2 shrink-0" />
                  <span>PDF 자가 제본 및 ePub 완본 단말기 다운로드 자유</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button
                id="pricing-premium-select"
                onClick={() => onSelectPlan(selectedPlanType)}
                className="w-full py-3.5 bg-white hover:bg-neutral-100 text-[#110F24] text-xs font-black rounded-2xl tracking-wide shadow-md transition-all duration-200 cursor-pointer text-center"
              >
                프리미엄 창작 시작하기 (결제 이동)
              </button>
            </div>
          </div>

        </div>

        {/* FAQ Toggle list wrapper */}
        <div className="mt-16 bg-white rounded-3xl p-6 sm:p-8 border border-[#E6E2FC] relative z-10 text-left shadow-xs">
          <h3 className="text-lg font-bold text-[#2F2D59] mb-6 flex items-center gap-1.5">
            <HelpCircle className="text-[#6B54E7] w-5 h-5" />
            자주 묻는 질문 (FAQ)
          </h3>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="border-b border-[#E6E2FC]/40 pb-3.5">
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex justify-between items-center text-left py-2 text-xs sm:text-sm font-bold text-[#2F2D59] hover:text-[#6B54E7] focus:outline-none cursor-pointer"
                >
                  <span className="pr-4">{faq.q}</span>
                  {openFaqId === faq.id ? <ChevronUp className="w-4 h-4 text-[#7C769D]" /> : <ChevronDown className="w-4 h-4 text-[#7C769D]" />}
                </button>
                {openFaqId === faq.id && (
                  <p className="mt-2 text-xs text-[#7C769D] leading-relaxed pl-1 bg-[#FAF9FF] p-3.5 rounded-2xl border border-[#E6E2FC]/40">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Decorative graphic watercolor banner */}
        <div className="flex flex-col sm:flex-row items-center bg-white rounded-3xl p-5 text-xs text-[#2F2D59] border border-[#E6E2FC] text-left mt-8 shadow-xs">
          <img 
            src={ILLUSTRATION_BOOKS} 
            alt="Watercolor books collection representation" 
            referrerPolicy="no-referrer"
            className="w-16 h-16 object-cover rounded-2xl mb-3 sm:mb-0 sm:mr-4 border border-neutral-100" 
          />
          <div>
            <span className="font-extrabold block text-[#2F2D59] text-xs">💡 실물 도서 1부 무료 실물 제본 혜택!</span>
            <span className="text-[11px] text-[#7C769D] block mt-0.5 leading-relaxed">
              프리미엄 창작자 전용 첫 월 구독 시 원하시는 내용을 수록한 실제 무선 제본 가죽 책 한 권을 무료로 정교히 가공하여 집앞 전송하여 드립니다.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
