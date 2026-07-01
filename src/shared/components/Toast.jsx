import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export const Toast = ({
  message,
  type = 'info', // 'success' | 'error' | 'info' | 'warning'
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTheme = () => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-4 h-4 text-emerald-500" />,
          bg: 'bg-white border-emerald-100 shadow-emerald-100/30',
          textColor: 'text-neutral-800',
        };
      case 'error':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
          bg: 'bg-white border-red-100 shadow-red-100/30',
          textColor: 'text-neutral-800',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
          bg: 'bg-white border-amber-100 shadow-amber-100/30',
          textColor: 'text-neutral-800',
        };
      default:
        return {
          icon: <Info className="w-4 h-4 text-[#6B54E7]" />,
          bg: 'bg-white border-[#E6E2FC] shadow-[#E6E2FC]/30',
          textColor: 'text-neutral-800',
        };
    }
  };

  const theme = getTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-4 py-3 border border-neutral-150 rounded-2xl shadow-xl max-w-sm sm:max-w-md w-[calc(100%-2rem)] md:w-auto ${theme.bg}`}
    >
      <div className="flex-shrink-0">{theme.icon}</div>
      <p className={`text-xs font-bold ${theme.textColor} flex-1`}>{message}</p>
      <button 
        onClick={onClose}
        className="text-neutral-400 hover:text-neutral-600 transition-colors p-0.5 rounded-lg hover:bg-neutral-50 cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};
