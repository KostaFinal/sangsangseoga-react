import React from 'react';
import { Compass, ArrowLeft } from 'lucide-react';

export const ErrorPage404 = ({ onNavigateToHome }) => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
      <div className="relative mb-8 flex flex-col items-center">
        {/* Large Gradient Error Code */}
        <div className="text-[120px] sm:text-[150px] font-black tracking-tighter leading-none select-none bg-gradient-to-b from-[#6B54E7] to-[#8F7CFF] bg-clip-text text-transparent">
          404
        </div>
        {/* Badge representing Error Status */}
        <div className="absolute -bottom-2 px-3.5 py-1 bg-[#F3F0FF] border border-[#E6E2FC] rounded-full text-[10px] font-extrabold text-[#6B54E7] uppercase tracking-wider shadow-xs flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-[#6B54E7] animate-pulse" />
          <span>Page Not Found</span>
        </div>
      </div>

      <div className="space-y-3 max-w-md mx-auto mb-8">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#2F2D59]">원하는 페이지를 찾을 수 없습니다</h2>
        <p className="text-xs sm:text-sm text-[#7C769D] leading-relaxed">
          요청하신 페이지의 주소가 잘못 입력되었거나, 주소가 변경 혹은 삭제되어 현재 접근할 수 없습니다. 아래 버튼을 눌러 안전하게 홈 화면으로 돌아가실 수 있습니다.
        </p>
      </div>

      <button
        onClick={onNavigateToHome}
        className="px-6 py-3.5 bg-[#6B54E7] hover:bg-[#5b45d6] text-white text-xs sm:text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#6B54E7]/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>홈으로 이동</span>
      </button>
    </div>
  );
};
