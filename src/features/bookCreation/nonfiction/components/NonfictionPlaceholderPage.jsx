import React from 'react';

export default function NonfictionPlaceholderPage({ view }) {
  const labels = {
    fairy: ['동화 서가', '장면과 삽화를 함께 구성하는 동화 제작 메뉴입니다.'],
    novel: ['소설 서가', '인물과 사건을 쌓아 긴 이야기를 만드는 공간입니다.'],
    friends: ['친구의 서재', '다른 작가의 작품을 둘러보고 영감을 얻는 공간입니다.'],
  };
  const [title, desc] = labels[view] || ['상상서가', 'AI와 함께 책을 만드는 공간입니다.'];
  return (
    <section className="essay-hero nf-card-placeholder">
      <div>
        <span className="essay-kicker">상상서가</span>
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
      <div className="essay-hero-card"><strong>준비 중인 메뉴</strong><p>현재 요청에서는 교육·지식 화면을 중심으로 구성했어요.</p></div>
    </section>
  );
}
