import scenarioBg from "../../assets/scenario-bg.png";
import { useNovelComplete } from "../hooks/useNovelComplete";

function NovelCompletePage() {
  const {
    scenes,
    cover,
    title,
    protagonist,
    genre,
    pointOfView,
    mood,
    style,
    volume,
    totalCharacters,
    handleGoLibrary,
    handleSavePdf,
    handleNewNovel,
  } = useNovelComplete();
  return (
    <div className="novel-complete-page">
      <img
        className="novel-complete-bg"
        src={scenarioBg}
        alt=""
        aria-hidden="true"
      />
      <div className="novel-complete-overlay" />


      <main className="novel-complete-main">
        <section className="complete-hero">
          <h1>✦ 소설이 완성되었습니다! ✦</h1>
          <p>정말 멋진 이야기를 만들어주셨어요.</p>
        </section>

        <section className="complete-content">
          <aside className="complete-summary-panel">
            <h2>📖 작품 요약</h2>

            <p className="story-summary">
              제국의 음모 속에서 별이 사라지는 이상 현상을 목격한 소년{" "}
              {protagonist.split(",")[0]}.
              <br />
              그는 잊힌 진실을 찾아 모험을 떠나며 세계를 뒤흔드는 비밀과
              마주하게 됩니다.
            </p>

            <div className="summary-divider" />

            <CompleteInfoRow label="장르" value={genre} />
            <CompleteInfoRow label="주인공" value={protagonist} />
            <CompleteInfoRow label="시점" value={pointOfView} />
            <CompleteInfoRow label="분위기" value={mood} />
            <CompleteInfoRow label="문체" value={style} />
            <CompleteInfoRow label="분량" value={volume} />
            <CompleteInfoRow
              label="장면 수"
              value={`${scenes.length.toLocaleString()}개`}
            />
            <CompleteInfoRow
              label="글자 수"
              value={`${totalCharacters.toLocaleString()}자`}
            />
          </aside>

          <section className="complete-book-panel">
            <div className="book-display-wrap">
              <div className={`complete-book ${cover.themeClass || ""}`}>
                <div className="complete-book-spine" />
                <div className="complete-book-front">
                  <div className="book-ornament top">✦</div>

                  <p className="book-subtitle">제국이 숨긴 진실을 찾아서</p>
                  <h2>{title}</h2>
                  <p className="book-type">당신의 장편 판타지 소설</p>

                  <div className="book-character">
                    <span />
                  </div>

                  <div className="book-ornament bottom">✦</div>
                </div>
              </div>
            </div>

            <div className="complete-title-block">
              <h2>{title}</h2>
              <p>
                {genre} · {volume} · {scenes.length}개 장면 ·{" "}
                {totalCharacters.toLocaleString()}자
              </p>
            </div>
          </section>

          <aside className="complete-next-panel">
            <section className="congrats-card">
              <h2>축하합니다!</h2>

              <div className="congrats-icon">
                <span>📖</span>
              </div>

              <p>
                당신의 상상력이
                <br />
                한 편의 소설로 완성되었어요.
              </p>
            </section>

            <section className="next-suggestion-card">
              <h3>다음 단계 제안</h3>

              {/* <button type="button" onClick={handleShare}>
                <span>🔗</span>
                <div>
                  <strong>작품을 공유해보세요</strong>
                  <p>SNS로 멋진 작품을 자랑해보세요.</p>
                </div>
              </button> */}

              <button type="button">
                <span>💬</span>
                <div>
                  <strong>AI에게 후기를 받아보세요</strong>
                  <p>작품에 대한 감상평을 들어보세요.</p>
                </div>
              </button>

              <button type="button">
                <span>✨</span>
                <div>
                  <strong>속편 아이디어 얻기</strong>
                  <p>AI가 추천하는 다음 이야기를 확인해보세요.</p>
                </div>
              </button>
            </section>
          </aside>
        </section>

        <section className="complete-actions">
          <button type="button" onClick={handleGoLibrary}>
            📚 내 서재로 이동
          </button>

          <button type="button" className="primary" onClick={handleSavePdf}>
            ⬇ PDF로 저장
          </button>

          {/* <button type="button" onClick={handleShare}>
            🔗 공유하기
          </button> */}

          <button type="button" onClick={handleNewNovel}>
            ✨ 새 소설 만들기
          </button>
        </section>

        <p className="complete-quote">
          “이야기는 끝나도, 상상은 계속됩니다.”
        </p>
      </main>
    </div>
  );
}

function CompleteInfoRow({ label, value }) {
  return (
    <div className="complete-info-row">
      <span>{label}</span>
      <strong>{value || "미정"}</strong>
    </div>
  );
}

export default NovelCompletePage;





