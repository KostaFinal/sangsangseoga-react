export const BOOK_TYPE_TO_GENRE_LABEL = {
  NOVEL: '소설',
  POEM: '시',
  ESSAY: '에세이',
  FAIRY_TALE: '동화',
};

export const BOOK_GENRE_BADGE_CLASS =
  'text-[9px] font-extrabold px-2 py-0.5 bg-lavender-bg text-brand-purple rounded-full';

export const getBookGenreLabel = (book = {}, fallback = '기타') => {
  const rawGenre =
    typeof book === 'string'
      ? book
      : book.category || book.bookType || book.genre;

  return BOOK_TYPE_TO_GENRE_LABEL[rawGenre] || rawGenre || fallback;
};
