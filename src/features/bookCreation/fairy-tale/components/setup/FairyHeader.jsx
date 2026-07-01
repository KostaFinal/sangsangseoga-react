export default function FairyHeader() {
  return (
    <header className="fairy-header">
      <div className="header-left">
        <div className="fairy-logo">🏰</div>
        <span className="brand-name">동화마을</span>
      </div>

      <nav className="header-nav">
        <button type="button">내 책장</button>
        <button type="button" className="active">
          동화 만들기
        </button>
        <button type="button">템플릿</button>
        <button type="button">이용 가이드</button>
        <button type="button">요금제</button>
      </nav>

      <div className="header-right">
        <button type="button" className="premium-btn">
          ✨ 프리미엄
        </button>
        <button type="button" className="icon-btn">
          🔔
        </button>
        <div className="profile-area">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky"
            alt="profile"
          />
          <span>하늘빛 작가님 ▾</span>
        </div>
      </div>
    </header>
  );
}
