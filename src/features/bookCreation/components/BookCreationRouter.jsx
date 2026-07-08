import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PoemApp from '../poem/components/PoemCreationView.jsx';
import EssayApp from '../essay/components/EssayCreationView.jsx';
import MemberCreationRoutes from '../routes/MemberCreationRoutes.jsx';
import '../styles/bookCreation.css';

export default function BookCreationRouter({ initialGenre, onGoToMyBooks, onBookComplete }) {
  const navigate = useNavigate();
  const [activeGenre, setActiveGenre] = useState(initialGenre || 'poem');
  const [initialView, setInitialView] = useState('step1');
  const [switchKey, setSwitchKey] = useState(0);

  const handleGoToMyBooks = (payload = {}) => {
    const normalizedPayload = {
      ...payload,
      targetPage: 'my-library',
      targetTab: 'all-books',
      activeTab: 'all-books',
      targetComponent: 'AllBooksTab',
    };

    onBookComplete?.(normalizedPayload.book);
    onGoToMyBooks?.(normalizedPayload);

    if (typeof window !== 'undefined') {
      window.localStorage?.setItem('sangsang:my-library-active-tab', 'all-books');
      window.dispatchEvent(new CustomEvent('sangsang:go-to-my-books', { detail: normalizedPayload }));
    }

    navigate('/library/all-books', { state: normalizedPayload });
  };

  const switchGenre = (genre) => {
    setActiveGenre(genre);
    setInitialView('step1');
    setSwitchKey((prev) => prev + 1);
  };

  return (
    <div className="book-creation-scope relative min-h-screen bg-[#f8f7ff]">

      {activeGenre === 'essay' && (
        <EssayApp key={`essay-${switchKey}`} onSwitchGenre={switchGenre} initialView={initialView} onGoToMyBooks={handleGoToMyBooks} onBookComplete={onBookComplete} />
      )}
      {activeGenre === 'poem' && (
        <PoemApp key={`poem-${switchKey}`} onSwitchGenre={switchGenre} initialView={initialView} onGoToMyBooks={handleGoToMyBooks} onBookComplete={onBookComplete} />
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
