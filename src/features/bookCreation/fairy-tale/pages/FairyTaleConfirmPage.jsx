import fairyBg from "../../assets/fairy-bg.png";
import { useFairyTaleConfirm } from "../hooks/useFairyTaleConfirm";

function FairyTaleConfirmPage() {
  const { rows, getValue, handlePrev, handleGoImages } = useFairyTaleConfirm();

  return (
    <div className="fairy-confirm-page" style={{ "--fairy-confirm-bg": `url(${fairyBg})` }}>
      <main className="fairy-confirm-card">
        <p>SETTING CONFIRM</p>
        <h1>동화 설정 확인</h1>
        <span>  </span>

        <section className="confirm-grid">
          {rows.map(([label, key]) => (
            <div key={key} className="confirm-row">
              <span>{label}</span>
              <strong>{getValue(key)}</strong>
            </div>
          ))}
        </section>

        <div className="confirm-actions">
          <button type="button" className="sub" onClick={handlePrev}>이전으로</button>
          <button type="button" onClick={handleGoImages}>
            그림 스타일 선택하기 →
          </button>
        </div>
      </main>
    </div>
  );
}

export default FairyTaleConfirmPage;

