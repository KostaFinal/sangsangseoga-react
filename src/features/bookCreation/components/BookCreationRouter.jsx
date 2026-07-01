import React, { useState, useContext } from 'react';
import { NavigationContext } from '../../../shared/components/Header';
import { LogOut } from 'lucide-react';
import PoemApp from './PoemCreationView.jsx';
import EssayApp from './EssayCreationView.jsx';
import NonfictionApp from './NonfictionCreationView.jsx';
import MemberCreationRoutes from '../routes/MemberCreationRoutes.jsx';
import '../styles/bookCreation.css';

export default function BookCreationRouter({ initialGenre }) {
  const { onNavigate } = useContext(NavigationContext);
  const [activeGenre, setActiveGenre] = useState(initialGenre || 'poem');
  const [initialView, setInitialView] = useState('step1');
  const [switchKey, setSwitchKey] = useState(0);

  const switchGenre = (genre) => {
    setActiveGenre(genre);
    setInitialView('step1');
    setSwitchKey((prev) => prev + 1);
  };

  const handleExit = () => {
    if (onNavigate) {
      onNavigate('home');
    }
  };

  return (
    <div className="book-creation-scope relative min-h-screen bg-[#f8f7ff]">
      {/* Floating Exit Button */}
      <button
        onClick={handleExit}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#6b54e7] hover:bg-[#5140c6] text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-sans text-sm font-semibold cursor-pointer border-none"
        style={{ boxShadow: '0 10px 25px rgba(107, 84, 231, 0.3)' }}
      >
        <LogOut className="w-4 h-4" />
        <span>대시보드로 돌아가기</span>
      </button>

      {activeGenre === 'essay' && (
        <EssayApp key={`essay-${switchKey}`} onSwitchGenre={switchGenre} initialView={initialView} />
      )}
      {activeGenre === 'nonfiction' && (
        <NonfictionApp key={`nonfiction-${switchKey}`} onSwitchGenre={switchGenre} initialView={initialView} />
      )}
      {activeGenre === 'poem' && (
        <PoemApp key={`poem-${switchKey}`} onSwitchGenre={switchGenre} initialView={initialView} />
      )}
      {activeGenre === 'fairy-tale' && (
        <MemberCreationRoutes key={`fairy-tale-${switchKey}`} initialGenre="fairy-tale" />
      )}
      {activeGenre === 'novel' && (
        <MemberCreationRoutes key={`novel-${switchKey}`} initialGenre="novel" />
      )}
    </div>
  );
}
