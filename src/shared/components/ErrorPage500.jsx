import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export const ErrorPage500 = ({ onReload }) => {
  const handleReload = () => {
    if (onReload) {
      onReload();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
      <div className="relative mb-8 flex flex-col items-center">
        {/* Large Gradient Error Code */}
        <div className="text-[120px] sm:text-[150px] font-black tracking-tighter leading-none select-none bg-gradient-to-b from-red-500 to-rose-400 bg-clip-text text-transparent">
          500
        </div>
        {/* Badge representing Error Status */}
        <div className="absolute -bottom-2 px-3.5 py-1 bg-red-50 border border-red-150 rounded-full text-[10px] font-extrabold text-red-500 uppercase tracking-wider shadow-xs flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-red-500 animate-bounce" />
          <span>Internal Server Error</span>
        </div>
      </div>

      <div className="space-y-3 max-w-md mx-auto mb-8">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#2F2D59]">서버 오류가 발생했습니다</h2>
        <p className="text-xs sm:text-sm text-[#7C769D] leading-relaxed">
          시스템에 일시적인 오류가 발생하여 요청하신 페이지를 불러올 수 없습니다. 아래 [다시 시도] 버튼을 클릭해 정상 복구를 확인해 주십시오.
        </p>
      </div>

      <div className="bg-[#FAF9FF] border border-[#E6E2FC]/40 p-4 rounded-2xl max-w-md text-left space-y-1.5 text-xs text-[#7C769D] mx-auto w-full mb-8">
        <p>• <strong>고객 지원:</strong> support@sangsangseoga.com</p>
        <p>• 페이지를 다시 불러오려면 아래에 있는 <strong>[다시 시도]</strong> 버튼을 이용할 수 있습니다.</p>
      </div>

      <button
        onClick={handleReload}
        className="px-6 py-3.5 bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
      >
        <RotateCcw className="w-4 h-4" />
        <span>다시 시도</span>
      </button>
    </div>
  );
};
