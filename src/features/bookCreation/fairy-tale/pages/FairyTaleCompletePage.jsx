import fairyback from "../../assets/fairyback.png";
import fairysheep from "../../assets/fairysheep.png";
import painting from "../../assets/painting.png";
import fairybook from "../../assets/fairybook.png";
import { useFairyTaleComplete } from "../hooks/useFairyTaleComplete";

function FairyTaleCompletePage() {
  const {
    handleGoHome,
    handleRestart,
    handleShare,
    handleGoLibrary,
  } = useFairyTaleComplete();
  return (
    <div
      className="fairy-complete-page"
      style={{ "--complete-bg": `url(${fairyback})` }}
    >

      <main className="complete-main">
        <div className="confetti confetti-1" />
        <div className="confetti confetti-2" />
        <div className="confetti confetti-3" />
        <div className="confetti confetti-4" />
        <div className="confetti confetti-5" />
        <div className="confetti confetti-6" />
        <div className="confetti confetti-7" />
        <div className="confetti confetti-8" />
        <div className="confetti confetti-9" />
        <div className="confetti confetti-10" />
        <div className="confetti confetti-11" />
        <div className="confetti confetti-12" />

        <section className="complete-hero">
          <div className="ribbon">
            <span>⭐</span>
            <strong>동화책 완성!</strong>
            <span>⭐</span>
          </div>

          <p className="complete-subtitle">
            루미와 친구들의 모험이 한 권의 책이 되었어요
          </p>
          <p className="complete-desc">
            저장된 동화책은 내 책장에서 다시 볼 수 있어요.
          </p>

          <h1>별빛을 찾아 떠난 루미</h1>

          <div className="title-decoration">
            <span />
            <em>☆</em>
            <span />
          </div>

          <div className="complete-showcase">
            <div className="sheep-teacher">
              <img src={fairysheep} alt="마법사 양 루미" />
            </div>

            <div className="book-display">
              <div className="book-spine" />
              <div className="book-cover">
                <img src={painting} alt="완성된 동화책 표지" />
              </div>
              <div className="book-bookmark" />
            </div>

            <aside className="congrats-card">
               <img
                  className="congrats-book-img"
                  src={fairybook}
                  alt="완성된 동화책 아이콘"
                />
              <h2>축하해요!</h2>
 
            </aside>
          </div>

          <div className="complete-actions">
            <button type="button" onClick={handleGoHome}>
              🏠 처음으로
            </button>

            <button
              type="button"
              onClick={handleRestart}
            >
              ↻ 다시 만들기
            </button>

            <button type="button" onClick={handleShare}>
              ⤴ 공유하기
            </button>

            <button
              type="button"
              className="primary"
              onClick={handleGoLibrary}
            >
              📖 내 책장으로 이동
            </button>
          </div>
        </section>
      </main>

    </div>
  );
}

export default FairyTaleCompletePage;




