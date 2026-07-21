import { motion, AnimatePresence } from "motion/react";
import { BookOpen } from "lucide-react";

export default function LastPageModal({ show, onClose }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#110F24]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            className="bg-white rounded-2xl max-w-xs w-full p-6 shadow-2xl border border-black/5 flex flex-col items-center text-center select-none"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-10 text-amber-600 bg-amber-55/10 rounded-full flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5 text-amber-600" />
            </div>
            <h4 className="text-[14px] font-sans font-bold text-neutral-800 tracking-tight">
              마지막 페이지입니다
            </h4>
            <div className="mt-5 w-full">
              <button onClick={onClose} className="w-full bg-[#6b54e7] hover:bg-[#6148e1] text-white text-xs font-bold py-2.5 rounded-lg transition">
                확인
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
