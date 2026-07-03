import { motion, AnimatePresence } from "motion/react";

export default function PageBookmark({ isBookmarked, onClick }) {
  return (
    <AnimatePresence>
      {isBookmarked && (
        <motion.div
          key="bookmarked"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
          onClick={onClick}
          title="북마크 제거"
          className="absolute top-0 right-10 z-20 cursor-pointer select-none flex flex-row items-start"
        >
          {/* 리본 세로 몸통 */}
          <div
            style={{
              width: "28px",
              height: "40px",
              backgroundColor: "#1e3a8a",
              boxShadow: "0 4px 12px rgba(30,58,138,0.35)",
            }}
          />
          {/* 리본 하단 V자 */}
          <div
            style={{
              position: "absolute",
              bottom: "-10px",
              left: 0,
              width: 0,
              height: 0,
              borderLeft: "14px solid #1e3a8a",
              borderRight: "14px solid #1e3a8a",
              borderBottom: "10px solid transparent",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
