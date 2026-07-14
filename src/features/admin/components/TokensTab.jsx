import React from 'react';
import { PenTool, BookOpen, Sliders, Search, AlertTriangle } from 'lucide-react';

export const TokensTab = ({
  tokenTrendUnit,
  setTokenTrendUnit,
  tokenSortPeriod,
  setTokenSortPeriod,
  tokenSearchQuery,
  setTokenSearchQuery,
  selectedTokenUser,
  setSelectedTokenUser,
  currentTrends,
  searchedTokenUsages,
  memberTokenTimelineLogs,
  tokenSummary
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-left">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { title: '누적 텍스트 생성량', value: `${(tokenSummary.totalTextUsage / 1000).toFixed(1)}k`, desc: '자', icon: PenTool },
          { title: '누적 이미지 생성량', value: `${tokenSummary.totalImageUsage.toLocaleString()}`, desc: '장', icon: BookOpen },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white border border-[#E6E2FC]/60 rounded-2xl p-5 shadow-xs space-y-2">
              <div className="flex justify-between items-center text-[#7C769D]">
                <span className="text-xs font-black uppercase tracking-wider">{card.title}</span>
                <Icon className="w-4 h-4 text-[#6B54E7]" />
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-mono font-black text-[#110F24]">{card.value}</span>
                <span className="text-sm text-[#7C769D] font-bold">{card.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Graphic Usage Trend Grid */}
      <div className="bg-white border border-[#E6E2FC]/60 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-[#E6E2FC]/30 pb-4">
          <div>
            <h3 className="text-sm font-black text-[#110F24] flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#6B54E7]" />
              <span>전체 AI 리소스 사용량</span>
            </h3>
            <p className="text-sm text-[#7C769D] mt-0.5">요금제별 생성량을 비교합니다.</p>
          </div>
          <div className="flex bg-[#FAF9FF] p-1 rounded-xl border border-[#E6E2FC]/40">
            <button
              onClick={() => setTokenTrendUnit('daily')}
              className={`px-3 py-1.5 text-sm font-bold rounded-lg transition-all cursor-pointer ${tokenTrendUnit === 'daily' ? 'bg-[#6B54E7] text-white shadow-xs' : 'text-[#7C769D] hover:text-[#110F24]'}`}
            >
              일간
            </button>
            <button
              onClick={() => setTokenTrendUnit('monthly')}
              className={`px-3 py-1.5 text-sm font-bold rounded-lg transition-all cursor-pointer ${tokenTrendUnit === 'monthly' ? 'bg-[#6B54E7] text-white shadow-xs' : 'text-[#7C769D] hover:text-[#110F24]'}`}
            >
              월간
            </button>
          </div>
        </div>

        {/* Minimalist Visual Bar Chart Custom Render using SVGs */}
        <div className="relative pt-2 h-56 bg-[#FAF9FF]/50 rounded-2xl border border-[#E6E2FC]/30 p-4 flex flex-col justify-end space-y-4">
          <div className="absolute top-4 right-4 flex items-center space-x-4 text-xs font-bold">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 bg-[#6B54E7] rounded-xs"></span>
              <span className="text-[#7C769D]">프리미엄 요금제</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 bg-[#E6E2FC] rounded-xs"></span>
              <span className="text-[#7C769D]">일반 요금제</span>
            </span>
          </div>

          <div className="flex items-end justify-around h-36 border-b border-[#E6E2FC]/30 pb-2">
            {currentTrends.map((col, idx) => {
              const maxNumTxt = tokenTrendUnit === 'daily' ? 7.0 : 130.0;
              const premHeight = `${(col.premiumTxt / maxNumTxt) * 100}%`;
              const freeHeight = `${(col.freeTxt / maxNumTxt) * 100}%`;

              return (
                <div key={idx} className="flex flex-col items-center flex-1 group relative">
                  <div className="flex items-end space-x-1.5 h-28 w-full justify-center">
                    {/* Premium Bar */}
                    <div 
                      style={{ height: premHeight }} 
                      className="w-3 bg-[#6B54E7] hover:opacity-85 transition-all rounded-t-xs relative cursor-pointer"
                      title={`프리미엄: ${col.premiumTxt}k 자, 이미지 ${col.premiumImg}장`}
                    ></div>
                    {/* Free Bar */}
                    <div 
                      style={{ height: freeHeight }} 
                      className="w-3 bg-[#E6E2FC] hover:bg-[#dcd7f9] transition-all rounded-t-xs relative cursor-pointer"
                      title={`일반: ${col.freeTxt}k 자, 이미지 ${col.freeImg}장`}
                    ></div>
                  </div>
                  {/* Label */}
                  <span className="text-xs font-mono font-bold text-[#7C769D] mt-2 block">{col.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Members specific lists / Search block */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Usage High Order list */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E6E2FC]/60 p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-[#E6E2FC]/30 pb-3.5">
            <div>
              <h4 className="text-sm font-black text-[#110F24] flex items-center gap-1">
                AI 리소스 사용 회원 순위
              </h4>
              <p className="text-sm text-[#7C769D]">AI 사용량이 많은 순서입니다.</p>
            </div>
            <div className="flex bg-[#FAF9FF] rounded-lg p-0.5 border border-[#E6E2FC]/40">
              <button
                onClick={() => setTokenSortPeriod('7d')}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-all cursor-pointer ${tokenSortPeriod === '7d' ? 'bg-[#6B54E7] text-white shadow-xs' : 'text-[#7C769D] hover:text-[#110F24]'}`}
              >
                7일
              </button>
              <button
                onClick={() => setTokenSortPeriod('30d')}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-all cursor-pointer ${tokenSortPeriod === '30d' ? 'bg-[#6B54E7] text-white shadow-xs' : 'text-[#7C769D] hover:text-[#110F24]'}`}
              >
                30일
              </button>
            </div>
          </div>

          {/* List */}
          <div className="space-y-2.5">
            {searchedTokenUsages.map((usage, idx) => (
              <div 
                key={usage.userId}
                onClick={() => setSelectedTokenUser(usage.userId)}
                className={`p-3.5 border rounded-xl flex justify-between items-center hover:bg-[#FAF9FF]/60 cursor-pointer transition-all ${
                  selectedTokenUser === usage.userId ? 'border-[#6B54E7] bg-[#FAF9FF] shadow-xs' : 'border-[#E6E2FC]/60'
                }`}
              >
                <div className="flex items-center space-x-3 text-left">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                    idx === 0 ? 'bg-[#6B54E7] text-white' : 'bg-[#FAF9FF] text-[#7C769D] border border-[#E6E2FC]/40'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-[#2F2D59] text-sm block">{usage.nickname}</span>
                    <span className="text-xs font-semibold block mt-0.5 text-[#7C769D]">{usage.plan === 'PREMIUM' ? '프리미엄' : '일반 요금제'}</span>
                  </div>
                </div>

                <div className="text-right flex items-center space-x-4">
                  <div>
                    <p className="text-sm text-[#2F2D59] font-mono font-black">
                      {usage.textUsage.toLocaleString()}자 <span className="text-xs text-[#7C769D] font-normal">({usage.imgUsage}장)</span>
                    </p>
                  </div>

                  {usage.status === 'ABNORMAL' ? (
                    <span className="px-2 py-1 bg-amber-50 text-amber-700 font-extrabold border border-amber-200 rounded text-xs animate-pulse flex items-center gap-1 shrink-0">
                      <AlertTriangle className="w-3 h-3 text-amber-700" /> 과다 사용 의심
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-800 font-semibold border border-emerald-150 rounded text-xs shrink-0">
                      정상
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline audit tracking */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E6E2FC]/60 p-6 space-y-4">
          <div>
            <h4 className="text-sm font-black text-[#110F24] flex items-center gap-1.5">
              상세 사용 기록 조회
            </h4>
            <p className="text-sm text-[#7C769D]">회원을 선택하면 사용 이력을 확인할 수 있습니다.</p>
          </div>

          <div className="relative text-left">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C769D] w-3.5 h-3.5" />
            <input
              type="text"
              value={tokenSearchQuery}
              onChange={(e) => setTokenSearchQuery(e.target.value)}
              placeholder="작가명 검색..."
              className="w-full pl-9 pr-3 py-2 bg-[#FAF9FF] rounded-xl text-sm border border-[#E6E2FC] focus:bg-white focus:outline-none transition-all placeholder:text-[#B9B0DC] text-[#2F2D59]"
            />
          </div>

          {/* Output timeline */}
          {selectedTokenUser && memberTokenTimelineLogs[selectedTokenUser] ? (
            <div className="space-y-3 pt-2 text-left">
              <div className="flex items-center justify-between border-b border-[#E6E2FC]/30 pb-2">
                <span className="text-sm font-black text-[#2F2D59]">
                  {searchedTokenUsages.find(u => u.userId === selectedTokenUser)?.nickname || '조사 대상'} 회원 사용 이력
                </span>
                <button
                  onClick={() => setSelectedTokenUser(null)}
                  className="text-xs font-bold text-[#7C769D] hover:text-[#6B54E7] cursor-pointer"
                >
                  선택 해제
                </button>
              </div>

              <div className="relative border-l border-[#E6E2FC] pl-4.5 space-y-4 pt-1 ml-1.5">
                {memberTokenTimelineLogs[selectedTokenUser].map((log, lidx) => (
                  <div key={lidx} className="relative text-sm">
                    <span className="absolute -left-7 top-1 w-2.5 h-2.5 rounded-full bg-[#6B54E7] border border-white"></span>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#7C769D] font-mono">{log.date}</span>
                      <span className="font-mono font-black text-[#2F2D59]">{log.usage === 'image' ? '이미지 생성' : 'AI 텍스트 생성'}</span>
                    </div>
                    <p className="text-xs text-[#7C769D] font-mono mt-0.5">산출량: {log.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 border border-dashed border-[#E6E2FC] rounded-xl text-center text-[#7C769D] text-sm">
              <p className="font-medium">회원을 선택하면 사용 이력이 표시됩니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
