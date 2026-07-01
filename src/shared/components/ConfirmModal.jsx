import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = '확인',
  message = '정말로 진행하시겠습니까?',
  confirmText = '확인',
  cancelText = '취소',
  type = 'primary', // 'primary' | 'danger' | 'success'
}) => {
  if (!isOpen) return null;

  const getThemeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          confirmBg: 'bg-red-500 hover:bg-red-600 focus:ring-red-500',
          iconBg: 'bg-red-50',
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
          confirmBg: 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500',
          iconBg: 'bg-emerald-50',
        };
      default:
        return {
          icon: <HelpCircle className="w-5 h-5 text-[#6B54E7]" />,
          confirmBg: 'bg-[#6B54E7] hover:bg-[#5b45d6] focus:ring-[#6B54E7]',
          iconBg: 'bg-[#F3F0FF]',
        };
    }
  };

  const theme = getThemeStyles();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#E6E2FC] relative z-10 text-left space-y-4"
        >
          <div className="flex gap-3">
            <div className={`p-2.5 h-10 w-10 flex items-center justify-center rounded-2xl ${theme.iconBg} flex-shrink-0`}>
              {theme.icon}
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-[#2F2D59]">{title}</h3>
              <p className="text-xs text-[#7C769D] leading-relaxed">{message}</p>
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-2.5 text-white text-xs font-bold rounded-2xl transition-all cursor-pointer active:scale-[0.98] ${theme.confirmBg}`}
            >
              {confirmText}
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-neutral-200 hover:bg-neutral-50 text-neutral-600 text-xs font-bold rounded-2xl transition-all cursor-pointer active:scale-[0.98]"
            >
              {cancelText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
