import React from 'react';

export default function NonfictionLearningCard({ learning }) {
  const hasSummary = learning.summary?.length > 0;
  const hasTerms = learning.terms?.length > 0;
  const hasQuestions = learning.questions?.length > 0;

  return (
    <div className="nf-card-learning-box">
      {hasSummary && (
        <section>
          <h3>핵심 정리</h3>
          <ol>{learning.summary.map((item) => <li key={item}>{item}</li>)}</ol>
        </section>
      )}
      {hasTerms && (
        <section>
          <h3>용어 설명</h3>
          <dl>{learning.terms.map((item) => <React.Fragment key={item.word}><dt>{item.word}</dt><dd>{item.desc}</dd></React.Fragment>)}</dl>
        </section>
      )}
      {hasQuestions && (
        <section>
          <h3>확인 질문</h3>
          <ul>{learning.questions.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      )}
    </div>
  );
}
