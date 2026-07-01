import React from 'react';
import { WifiOff, RotateCcw } from 'lucide-react';

export const NetworkError = ({
  message = '인터넷 연결 상태가 불안정합니다.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 bg-white border border-red-50 rounded-3xl shadow-xl max-w-md mx-auto text-center space-y-5 my-6 animate-in fade-in duration-300">
      <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
        <WifiOff className="w-7 h-7" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-extrabold text-[#2F2D59]">네트워크 연결 실패</h3>
        <p className="text-xs text-[#7C769D] leading-relaxed max-w-xs mx-auto">
          {message} 와이파이(Wi-Fi)나 모바일 데이터 연결을 확인하고 다시 시도해 주세요.
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2.5 bg-[#6B54E7] hover:bg-[#5b45d6] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-[#6B54E7]/15 hover:shadow-lg transition-all cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>다시 시도</span>
        </button>
      )}
    </div>
  );
};
