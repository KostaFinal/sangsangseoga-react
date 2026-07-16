import React, { useState, useEffect } from 'react';
import { PenTool, BookOpen, Sliders, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const USAGE_RANKING_PAGE_SIZE = 10;
const TIMELINE_PAGE_SIZE = 5;

export const TokensTab = ({
  tokenTrendUnit,
  setTokenTrendUnit,
  trendYear,
  trendMonth,
  goToPrevTrendPeriod,
  goToNextTrendPeriod,
  tokenSearchQuery,
  setTokenSearchQuery,
  selectedTokenUser,
  setSelectedTokenUser,
  currentTrends,
  searchedTokenUsages,
  memberTokenTimelineLogs,
  tokenSummary
}) => {
  // 트렌드 차트에서 현재 hover 중인 구간(일/월) index + 위치 — 커스텀 상세 툴팁 표시용
  // (차트 영역이 가로 스크롤 컨테이너라 absolute 대신 뷰포트 기준 fixed 위치로 렌더링해야 잘림 없이 보임)
  const [hoveredTrendIdx, setHoveredTrendIdx] = useState(null);
  const [hoveredTrendRect, setHoveredTrendRect] = useState(null);
  const clearHoveredTrend = () => { setHoveredTrendIdx(null); setHoveredTrendRect(null); };

  // 회원 순위 리스트는 서버 페이지네이션 없이 전체를 한 번에 받아오므로 프론트에서만 페이지 처리
  const [rankingPage, setRankingPage] = useState(0);
  useEffect(() => {
    setRankingPage(0);
  }, [searchedTokenUsages]);
  const rankingTotalPages = Math.max(1, Math.ceil(searchedTokenUsages.length / USAGE_RANKING_PAGE_SIZE));
  const pagedTokenUsages = searchedTokenUsages.slice(
    rankingPage * USAGE_RANKING_PAGE_SIZE,
    rankingPage * USAGE_RANKING_PAGE_SIZE + USAGE_RANKING_PAGE_SIZE
  );

  // 상세 사용 기록 조회(타임라인)도 서버 페이지네이션 없이 전체를 받아오므로 프론트에서만 페이지 처리
  const [timelinePage, setTimelinePage] = useState(0);
  useEffect(() => {
    setTimelinePage(0);
  }, [selectedTokenUser]);
  const timelineLogs = (selectedTokenUser && memberTokenTimelineLogs[selectedTokenUser]) || [];
  const timelineTotalPages = Math.max(1, Math.ceil(timelineLogs.length / TIMELINE_PAGE_SIZE));
  const pagedTimelineLogs = timelineLogs.slice(
    timelinePage * TIMELINE_PAGE_SIZE,
    timelinePage * TIMELINE_PAGE_SIZE + TIMELINE_PAGE_SIZE
  );

  // BE는 premiumTxt/freeTxt를 "만 토큰" 단위로 내려주므로, 실제 토큰 수로 되돌린 뒤
  // 현재 데이터 범위(최댓값)에 맞춰 표시 단위(토큰/만 토큰/억 토큰)를 자동으로 고른다.
  const toRawTokens = (v) => (v || 0) * 10000;
  const maxRawTokens = Math.max(
    ...currentTrends.flatMap(col => [toRawTokens(col.premiumTxt), toRawTokens(col.freeTxt)]),
    1
  );
  let unitDivisor = 1;
  let trendUnitLabel = '토큰';
  if (maxRawTokens >= 100_000_000) {
    unitDivisor = 100_000_000;
    trendUnitLabel = '억 토큰';
  } else if (maxRawTokens >= 10_000) {
    unitDivisor = 10_000;
    trendUnitLabel = '만 토큰';
  }
  const toDisplayUnit = (v) => {
    const raw = toRawTokens(v);
    const scaled = raw / unitDivisor;
    return Number(scaled.toFixed(scaled < 10 ? 2 : scaled < 100 ? 1 : 0));
  };
  const scaledTrends = currentTrends.map(col => ({
    ...col,
    premiumDisplay: toDisplayUnit(col.premiumTxt),
    freeDisplay: toDisplayUnit(col.freeTxt),
  }));
  const hoveredTrendCol = hoveredTrendIdx != null ? scaledTrends[hoveredTrendIdx] : null;

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
                <span className="text-2xl font-gowun font-black text-[#110F24]">{card.value}</span>
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
              <span>전체 AI 리소스 사용량 추이</span>
            </h3>
            <p className="text-sm text-[#7C769D] mt-0.5">
              요금제별 텍스트 생성량 비교 · 막대에 마우스를 올리면 상세 수치를 확인할 수 있습니다.
            </p>
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

        {/* 조회 기간 이동 (일간: 월 단위 이동, 월간: 연 단위 이동) */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={goToPrevTrendPeriod}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E6E2FC] text-[#7C769D] hover:border-[#6B54E7] hover:text-[#6B54E7] transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-black text-[#110F24] font-gowun min-w-[110px] text-center">
            {tokenTrendUnit === 'daily' ? `${trendYear}년 ${trendMonth}월` : `${trendYear}년`}
          </span>
          <button
            onClick={goToNextTrendPeriod}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#E6E2FC] text-[#7C769D] hover:border-[#6B54E7] hover:text-[#6B54E7] transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Bar Chart with y-axis ticks + gridlines */}
        <div className="relative pt-2 h-64 bg-[#FAF9FF]/50 rounded-2xl border border-[#E6E2FC]/30 p-4 flex flex-col justify-end space-y-4">
          <div className="absolute top-4 left-4 text-xs font-black text-[#6B54E7] bg-white/70 px-2 py-0.5 rounded-md border border-[#E6E2FC]/60">
            단위: {trendUnitLabel}
          </div>
          <div className="absolute top-4 right-4 flex items-center space-x-4 text-xs font-bold">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 bg-[#6B54E7] rounded-xs"></span>
              <span className="text-[#7C769D]">유료 구독</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 bg-[#E6E2FC] rounded-xs"></span>
              <span className="text-[#7C769D]">무료 이용</span>
            </span>
          </div>

          {(() => {
            // 실데이터 범위에 맞춰 y축 최댓값을 매번 계산 (고정값이면 실사용량이 넘거나 훨씬 작을 때 그래프가 깨짐)
            const maxDisplay = Math.max(...scaledTrends.flatMap(col => [col.premiumDisplay, col.freeDisplay]), 0.1);
            // 좌측 축 눈금: 위(최댓값)부터 아래(0)까지 5단계
            // 값이 작을수록(1 미만) 소수점을 더 보여줘야 눈금이 전부 같은 값으로 뭉치지 않음
            const tickDecimals = maxDisplay < 1 ? 2 : maxDisplay < 10 ? 1 : 0;
            const ticks = [1, 0.75, 0.5, 0.25, 0].map(ratio => Number((maxDisplay * ratio).toFixed(tickDecimals)));

            return (
              <div className="flex gap-2.5">
                {/* Y축 눈금 라벨 */}
                <div className="flex flex-col justify-between h-36 shrink-0 w-8 text-right">
                  {ticks.map((t, i) => (
                    <span key={i} className="text-[12px] font-gowun font-bold text-[#B9B0DC] leading-none">{t}</span>
                  ))}
                </div>

                <div className="flex-1 min-w-0 overflow-x-auto" onScroll={clearHoveredTrend}>
                <div style={{ minWidth: tokenTrendUnit === 'daily' ? `${Math.max(scaledTrends.length * 56, 200)}px` : '100%' }}>
                  <div className="relative h-36">
                    {/* 가로 줄선 (눈금과 같은 높이에 정렬) */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      {ticks.map((_, i) => (
                        <div key={i} className={`w-full border-t ${i === ticks.length - 1 ? 'border-[#E6E2FC]' : 'border-[#E6E2FC]/50 border-dashed'}`}></div>
                      ))}
                    </div>

                    {/* 막대 */}
                    <div className="relative flex items-end justify-around h-36">
                      {scaledTrends.map((col, idx) => {
                        const premHeight = `${(col.premiumDisplay / maxDisplay) * 100}%`;
                        const freeHeight = `${(col.freeDisplay / maxDisplay) * 100}%`;

                        return (
                          <div
                            key={idx}
                            className="relative flex items-end space-x-2 h-full flex-1 justify-center"
                            onMouseEnter={(e) => {
                              setHoveredTrendIdx(idx);
                              setHoveredTrendRect(e.currentTarget.getBoundingClientRect());
                            }}
                            onMouseLeave={() => clearHoveredTrend()}
                          >
                            {/* Premium Bar */}
                            <div
                              style={{ height: premHeight }}
                              className="w-3.5 bg-[#6B54E7] hover:opacity-85 transition-all rounded-t-xs cursor-pointer"
                            ></div>
                            {/* Free Bar */}
                            <div
                              style={{ height: freeHeight }}
                              className="w-3.5 bg-[#E6E2FC] hover:bg-[#dcd7f9] transition-all rounded-t-xs cursor-pointer"
                            ></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* X축 날짜/월 라벨 */}
                  <div className="flex items-start justify-around mt-2">
                    {currentTrends.map((col, idx) => (
                      <span key={idx} className="flex-1 text-center text-xs font-gowun font-bold text-[#7C769D]">{col.label}</span>
                    ))}
                  </div>
                </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* 커스텀 상세 툴팁 — 가로 스크롤 컨테이너 밖으로 뷰포트 기준 고정 배치해서 잘리지 않게 함 */}
        {hoveredTrendCol && hoveredTrendRect && (
          <div
            className="fixed z-50 w-56 bg-white border border-[#E6E2FC] text-[#2F2D59] text-xs rounded-2xl shadow-xl p-3 space-y-1.5 pointer-events-none"
            style={{
              left: hoveredTrendRect.left + hoveredTrendRect.width / 2,
              top: hoveredTrendRect.top - 8,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <p className="font-black text-[#110F24] border-b border-[#E6E2FC] pb-1.5 mb-1">{hoveredTrendCol.label}</p>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[#7C769D] whitespace-nowrap">
                <span className="w-2 h-2 rounded-xs bg-[#6B54E7] shrink-0"></span>유료 구독 텍스트
              </span>
              <span className="font-gowun font-bold whitespace-nowrap text-[#2F2D59]">{toRawTokens(hoveredTrendCol.premiumTxt).toLocaleString()} 토큰</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[#7C769D] whitespace-nowrap">
                <span className="w-2 h-2 rounded-xs bg-[#B9B0DC] shrink-0"></span>무료 이용 텍스트
              </span>
              <span className="font-gowun font-bold whitespace-nowrap text-[#2F2D59]">{toRawTokens(hoveredTrendCol.freeTxt).toLocaleString()} 토큰</span>
            </div>
            <div className="flex items-center justify-between gap-2 border-t border-[#E6E2FC] pt-1.5 mt-1.5 text-[#7C769D]">
              <span className="whitespace-nowrap">유료 구독 이미지</span>
              <span className="font-gowun font-bold text-[#2F2D59] whitespace-nowrap">{hoveredTrendCol.premiumImg.toLocaleString()}장</span>
            </div>
            <div className="flex items-center justify-between gap-2 text-[#7C769D]">
              <span className="whitespace-nowrap">무료 이용 이미지</span>
              <span className="font-gowun font-bold text-[#2F2D59] whitespace-nowrap">{hoveredTrendCol.freeImg.toLocaleString()}장</span>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[7px] border-transparent border-t-white" style={{ filter: 'drop-shadow(0 1px 0 #E6E2FC)' }}></div>
          </div>
        )}
      </div>

      {/* Members specific lists / Search block */}
      <div className="grid lg:grid-cols-12 gap-6 items-stretch">
        {/* Usage High Order list */}
        <div className={`bg-white rounded-2xl border border-[#E6E2FC]/60 p-6 space-y-4 flex flex-col h-full ${selectedTokenUser ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          <div className="border-b border-[#E6E2FC]/30 pb-3.5">
            <h4 className="text-sm font-black text-[#110F24] flex items-center gap-1">
              AI 리소스 사용 회원 순위
            </h4>
            <p className="text-sm text-[#7C769D]">AI 사용량이 많은 순서입니다.</p>
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

          {/* List */}
          <div className="space-y-2.5">
            {pagedTokenUsages.map((usage, idx) => (
              <div
                key={usage.userId}
                onClick={() => setSelectedTokenUser(usage.userId)}
                className={`p-3.5 border rounded-xl flex justify-between items-center hover:bg-[#FAF9FF]/60 cursor-pointer transition-all ${
                  selectedTokenUser === usage.userId ? 'border-[#6B54E7] bg-[#FAF9FF] shadow-xs' : 'border-[#E6E2FC]/60'
                }`}
              >
                <div className="flex items-center space-x-3 text-left">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-gowun text-xs font-bold ${
                    rankingPage === 0 && idx === 0 ? 'bg-[#6B54E7] text-white' : 'bg-[#FAF9FF] text-[#7C769D] border border-[#E6E2FC]/40'
                  }`}>
                    {rankingPage * USAGE_RANKING_PAGE_SIZE + idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-[#2F2D59] text-sm block">{usage.nickname}</span>
                    <span className="text-xs font-semibold block mt-0.5 text-[#7C769D]">{usage.plan === 'PREMIUM' ? '유료 구독' : '무료 이용'}</span>
                  </div>
                </div>

                <p className="text-sm text-[#2F2D59] font-gowun font-black">
                  {usage.textUsage.toLocaleString()}자 <span className="text-xs text-[#7C769D] font-normal">({usage.imgUsage}장)</span>
                </p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {searchedTokenUsages.length > 0 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-[#7C769D] font-semibold">
                {rankingPage + 1} / {rankingTotalPages} 페이지
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setRankingPage(p => Math.max(0, p - 1))}
                  disabled={rankingPage === 0}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E6E2FC] text-[#7C769D] hover:border-[#6B54E7] hover:text-[#6B54E7] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRankingPage(p => Math.min(rankingTotalPages - 1, p + 1))}
                  disabled={rankingPage >= rankingTotalPages - 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E6E2FC] text-[#7C769D] hover:border-[#6B54E7] hover:text-[#6B54E7] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Timeline audit tracking — 좌측 순위 리스트에서 회원을 클릭했을 때만 표시 */}
        {selectedTokenUser && (
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E6E2FC]/60 p-6 space-y-4 flex flex-col h-full">
            <div>
              <h4 className="text-sm font-black text-[#110F24] flex items-center gap-1.5">
                상세 사용 기록 조회
              </h4>
              <p className="text-sm text-[#7C769D]">선택한 회원의 사용 이력입니다.</p>
            </div>

            <div className="flex-1 flex flex-col pt-2 text-left">
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

              <div className="relative border-l border-[#E6E2FC] pl-4.5 space-y-4 pt-4 pb-1 ml-1.5 flex-1">
                {pagedTimelineLogs.map((log, lidx) => (
                  <div key={lidx} className="relative text-sm">
                    <span className="absolute -left-7 top-1 w-2.5 h-2.5 rounded-full bg-[#6B54E7] border border-white"></span>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#7C769D] font-gowun">{log.date}</span>
                      <span className="font-gowun font-black text-[#2F2D59]">{log.usage === 'image' ? '이미지 생성' : 'AI 텍스트 생성'}</span>
                    </div>
                    <p className="text-xs text-[#7C769D] font-gowun mt-0.5">산출량: {log.amount}</p>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {timelineLogs.length > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-[#E6E2FC]/30">
                  <span className="text-sm text-[#7C769D] font-semibold">
                    {timelinePage + 1} / {timelineTotalPages} 페이지
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setTimelinePage(p => Math.max(0, p - 1))}
                      disabled={timelinePage === 0}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E6E2FC] text-[#7C769D] hover:border-[#6B54E7] hover:text-[#6B54E7] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setTimelinePage(p => Math.min(timelineTotalPages - 1, p + 1))}
                      disabled={timelinePage >= timelineTotalPages - 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#E6E2FC] text-[#7C769D] hover:border-[#6B54E7] hover:text-[#6B54E7] disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
