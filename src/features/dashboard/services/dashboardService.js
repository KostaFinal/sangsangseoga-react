/**
 * Dashboard Service Layer (대시보드 API 연동 서비스)
 *
 * TODO: API 연동 필요 (실제 백엔드 API 엔드포인트가 연동되어야 하는 영역입니다.)
 * 현재는 협업 및 페이지 병합을 고려하여 Mock 데이터와 인터페이스가 먼저 설계되어 있으며,
 * 실 배포 시 axios 또는 fetch를 이용한 비동기 통신 코드로 간편하게 대체할 수 있도록 설계되었습니다.
 */

const MOCK_STORAGE_KEYS = {
  BLOCKED_BOOKS: 'blocked_books',
  BLOCKED_AUTHORS: 'blocked_authors',
};

export const dashboardService = {
  /** 어드민에 의해 차단된 도서 ID 목록 조회 */
  getBlockedBookIds: () => {
    return JSON.parse(localStorage.getItem(MOCK_STORAGE_KEYS.BLOCKED_BOOKS) || '[]');
  },

  /** 어드민에 의해 차단된 작가(이메일/닉네임) 목록 조회 */
  getBlockedAuthorIds: () => {
    return JSON.parse(localStorage.getItem(MOCK_STORAGE_KEYS.BLOCKED_AUTHORS) || '[]');
  },

  /** 차단된 도서/작가를 제외한 도서 목록 필터링 */
  filterVisibleBooks: (books) => {
    const blockedBooks = dashboardService.getBlockedBookIds();
    const blockedAuthors = dashboardService.getBlockedAuthorIds();
    return books.filter(book =>
      !blockedBooks.includes(book.id) &&
      !blockedAuthors.includes(book.authorEmail) &&
      !blockedAuthors.some(authorId => book.author === authorId || book.authorEmail === authorId)
    );
  },

  /** 차단된 도서/작가에 대한 AI 리뷰 항목 필터링 */
  filterVisibleReviews: (reviews, allBooks) => {
    const blockedBooks = dashboardService.getBlockedBookIds();
    const blockedAuthors = dashboardService.getBlockedAuthorIds();

    const blockedBookTitles = allBooks
      .filter(b => blockedBooks.includes(b.id) || blockedAuthors.includes(b.authorEmail))
      .map(b => b.title);

    return reviews.filter(rev => !blockedBookTitles.includes(rev.bookTitle));
  },

  /**
   * 내 서재(작성 도서) 목록 조회
   * TODO: API 연동 필요 (GET /api/library/my-books)
   */
  getMyCabinetBooks: async () => ([
    { id: 301, title: '별빛이 된 고래', category: '동화', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4qbLMXrDeSvtACQrqxaabRXhUcLWI6ISEPbVCL4zP57a5y85IerCnkSy5pgzsSQmnNvDc1q2s-ibxVkN7ZqJ31_b8pC4F9l3lfBrQYbyPWPxUbP86iX2oTav5lZ0ev4-koEU62F0a8awUxxeRhuKpbx11aiJCLL1Ac5DNjJFB_E6OqjY7OCfsrzj9vnGnBx1ksipJacKjVdyp8736LnR-kx6bUc_klYIKrF7BlzGIXFzpeSpGXPTsZHSfJlVMQOc3tUYU5ecEPPc', date: '2024.05.28 14:30' },
    { id: 302, title: '초록의 계절', category: '소설', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQHaZbTIh-qZz2zWXqdVpVBhMMmTyM82fnx_hh17ZiHkj27S_HTNBgEow5mw54n8enyKHv0aPXoZbHoIIXHQmmXPYyRAtWlG3basGWcjJDb2OGTNsSjQRphauo8WObivk8sXjpu1J1CjKEOqGmfZ3pHaollH6-uGl4Z_VNgSwPD_VrGTnOK5yRUg1QsaQIefQG1oXxyMmfjWGkX2FLRL5jfOanTv7SGBdqwgeB-adv_ra9SHzaImv3uqDJp5GDI4pKZeRAApklAaA', date: '2024.05.27 09:15' },
    { id: 303, title: '너에게 가는 가장 느린 길', category: '시', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGreyv2VCoj1SJwbqdcjhrdvT4ozFoylrIcpjpy1mnc9dUMrk8t640Dx27FQffZMJWaK8o3IlvcqUizLvPBZHI9sbXmvrjwfCe3xg-3-a04c1kSYuQmO-_202kNkpSd0ISkWhbB6C0zZ-FzbO6aSER03Dt29sbdp73dOr1OzyQgsGUuZK1ov1P5THT8VHZ2SQQvRnIEdekIqTY0rrFecEtEv71DSQV8Qgbt0n79jVeDPUakxCXSB9I-aheu67K5DvPSMUiCZUaRV8', date: '2024.05.26 21:40' },
    { id: 304, title: '작은 하루의 기록', category: '에세이', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBL9C026912DWIR1LG1aQKUHDO0L5tB1PxdJVonj8bxfKQ75IV6uR99DoLyUg5iNVqKW4ev8bK2aL2BlTbVxn229HmaAO9sRDdAPkLWiWlcE1gawXlfOmeRX8WJCPiDsttSWRVJOOhgVWLBXWfS6LVxJ9kjDI9wPvEkD851Ok7e_hSpVr0cTBTFVYvIJLm8XNQzQx_ESFnx3tM27mBrOsK16EdHSGfyOc0zpOhyvCEZWSpb7Y7A8kZ3Gl2NKGhuOZgXcTEJ_E7Pgf0', date: '2024.05.25 16:10' },
    { id: 305, title: '등대가 건네는 말', category: '교육/지식', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaDaaVKQXJiSQ-D3L1F02zwhZ2prTvtAzSMhZjbbYH_cK2GWQhB7AQsuEZeUbdEi8l5QoglpYbdXwhGKJaQiOdO76asNfdM1c0o4uqu_5NmypZk44uuOzQj3JQJtMqHZMcNTKB1keJ3Tv5r3AP1EINS9skP6DzsFzORmTdSA67hSZHoo-RUlel0KgvAof3zq2I4BfTwIv-6BUEj7qGsnb6L9Z5awI2d6ImWdfF2GMx4ET2zXRLJLFo7qeehBzKVTfs5gpDrXWAxwM', date: '2024.05.24 10:05' },
    { id: 306, title: '겨울, 그리고 우리', category: '소설', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6zPpuADYLE4UddvrL9_GPFaghMkihFhNSA5Q0uEmPX03CLHNK55MvdOPdKqz6C6Tw-KY7ZjA4YHpLOqiKayz5rdxk9MKC-S6L_iTf9VFgvtriHMKWrW-Bx028hoUurbMFFwpCtp2JHXPkngAFI_h-0Niar3MYpfvUWfeQk2dfAlRU57abyGrYzPxWkYXY-EhQE1gmx2voruHMq_4jXGHWVo6KyfbBFgwIZbR_EmjG5mPH0036MoFnzchL12D6YIHAN5mTEAK-G6w', date: '2024.05.23 22:18' }
  ]),

  /** 내 서재 도서를 장르/검색어로 필터링 */
  filterCabinetBooks: (books, genreFilter, searchQuery) => {
    return books.filter(b => {
      const matchGenre = genreFilter === '전체' || b.category === genreFilter;
      const matchSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchGenre && matchSearch;
    });
  },

  /**
   * 팔로우 중인 친구의 서재 목록 조회
   * TODO: API 연동 필요 (GET /api/library/friends-books)
   */
  getFriendBooks: async () => ([
    { id: 401, title: '여름의 조각들', category: '에세이', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAlgov4Ndwbkqsdj-Wy320A6sm5eIrOAh0fJ9iql5uxYkUWODJzuvxDJGOarbrHyWZpKki_6W--5-y1C2PHZRmzdsgBb7BLEc8IxTCMXTW9R0hfy7uqjy5U1X7Aihqk1llWQjtgmHQkRnbckz8nBMYbpe4r_WXrVQNutTxX7SutNuluLR0MbYoKoVS6SETBbzSXShKPS2VAUTzYyUUYyHFcm5k7kpBLau2Lk4MiFNQyio7tD96chDlTfKp3NSSvNmq4rM8O8j0oGM', date: '2024.05.28', likes: '321', views: '1.1k' },
    { id: 402, title: '밤하늘 산책', category: '시', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4qbLMXrDeSvtACQrqxaabRXhUcLWI6ISEPbVCL4zP57a5y85IerCnkSy5pgzsSQmnNvDc1q2s-ibxVkN7ZqJ31_b8pC4F9l3lfBrQYbyPWPxUbP86iX2oTav5lZ0ev4-koEU62F0a8awUxxeRhuKpbx11aiJCLL1Ac5DNjJFB_E6OqjY7OCfsrzj9vnGnBx1ksipJacKjVdyp8736LnR-kx6bUc_klYIKrF7BlzGIXFzpeSpGXPTsZHSfJlVMQOc3tUYU5ecEPPc', date: '2024.05.27', likes: '289', views: '972' },
    { id: 403, title: '고양이 탐정 나비의 비밀', category: '동화', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCznlvT7W-W0NUxinTfAkyigdk2z3I-k-uZK5biSPoGv-2D69bAp-MLEgeUx5_bmFFebrWpllo42X0LF3ihgtEq_p51DrgtnqEOxsjsT2H7Q-4z9A8CHXtLdWGVPongYJImv13zsDsLze4Y5uqVGkpuCACb2TG-2iz1K-vbt4oS_rN6GRYPOtDCaDeTYNF5cOuMY590pmj3N-GlXuNg4x60NRJiF503Y7d0x4f_0J72onLQeH8GK5y5bHOU6vlUE5fnCZo9xc1SEig', date: '2024.05.26', likes: '445', views: '1.6k' },
    { id: 404, title: '커피 한 잔의 인문학', category: '교육/지식', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2O_PD7xdQCc_iGfXoKwNrVIurVlo0ugo_weeYOYZOG-Wh7f6vj3_DVFNiSln1HzMbFHhwypEYn9qPXQRQ2x8rytzojL6ot4tX_9mXRZB-OO0IANHl_DZM9OrB17ajZemU93sWq3W66bOlFJdjmkeDtvqCmbG_BQln7wrzg4vFRQrmn0Mqlbt4NOhAIZX_FDgxT1X3R9q6wVpNMIjLbN0ioReZ88c5QTD0GfjDeChjMbk1UZw-N3JIAVoL1fzcD4ansUKeIZxSdXk', date: '2024.05.24', likes: '233', views: '801' },
    { id: 405, title: '기억의 온도', category: '소설', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaDaaVKQXJiSQ-D3L1F02zwhZ2prTvtAzSMhZjbbYH_cK2GWQhB7AQsuEZeUbdEi8l5QoglpYbdXwhGKJaQiOdO76asNfdM1c0o4uqu_5NmypZk44uuOzQj3JQJtMqHZMcNTKB1keJ3Tv5r3AP1EINS9skP6DzsFzORmTdSA67hSZHoo-RUlel0KgvAof3zq2I4BfTwIv-6BUEj7qGsnb6L9Z5awI2d6ImWdfF2GMx4ET2zXRLJLFo7qeehBzKVTfs5gpDrXWAxwM', date: '2024.05.23', likes: '512', views: '1.7k' },
    { id: 406, title: '단단한 마음 연습', category: '에세이', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDra40jzJO5MIslf39NjFPm_5AXP_36tnCR4qTZi0w_TzI4IyrIrsf7PJqxFo0B0eB0-tQ3e20wCkpgRDwIKgdDijHMYDkSLqnh26rOPVh0axoRcKGTkG2Y7h7ZCi6FKxfXfkU6mCrxG8tdffOx6ED-ivJN-UfC9wj686_sFEB3BWH-2TpoZSR6qtNOLl0oKp7MhNEI04ejrg5VpxxyWioZ_ez-099qQu-7U_eeV4CdJfnv3w8LJ5ozVnexb14fO80dJFduGSbOZ6E', date: '2024.05.22', likes: '276', views: '934' },
    { id: 407, title: '봄을 기다리는 사람에게', category: '시', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGreyv2VCoj1SJwbqdcjhrdvT4ozFoylrIcpjpy1mnc9dUMrk8t640Dx27FQffZMJWaK8o3IlvcqUizLvPBZHI9sbXmvrjwfCe3xg-3-a04c1kSYuQmO-_202kNkpSd0ISkWhbB6C0zZ-FzbO6aSER03Dt29sbdp73dOr1OzyQgsGUuZK1ov1P5THT8VHZ2SQQvRnIEdekIqTY0rrFecEtEv71DSQV8Qgbt0n79jVeDPUakxCXSB9I-aheu67K5DvPSMUiCZUaRV8', date: '2024.05.21', likes: '198', views: '668' },
    { id: 408, title: '바다를 건너는 법', category: '교육/지식', coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQHaZbTIh-qZz2zWXqdVpVBhMMmTyM82fnx_hh17ZiHkj27S_HTNBgEow5mw54n8enyKHv0aPXoZbHoIIXHQmmXPYyRAtWlG3basGWcjJDb2OGTNsSjQRphauo8WObivk8sXjpu1J1CjKEOqGmfZ3pHaollH6-uGl4Z_VNgSwPD_VrGTnOK5yRUg1QsaQIefQG1oXxyMmfjWGkX2FLRL5jfOanTv7SGBdqwgeB-adv_ra9SHzaImv3uqDJp5GDI4pKZeRAApklAaA', date: '2024.05.20', likes: '221', views: '723' }
  ]),

  /**
   * 프롬프트 기반 AI 콘텐츠(도서 초안) 생성
   * TODO: API 연동 필요 (POST /api/ai/generate-draft)
   */
  generateStoryContent: ({ genre, prompt, tier }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const titleByGenre = {
          fantasy: {
            premium: '시간을 녹이는 시계방 (Premium)',
            trial: '시간을 녹이는 시계방 (체험판)',
          },
          mystery: {
            premium: '어스름 저녁의 거짓말 (Premium)',
            trial: '어스름 저녁의 거짓말 (체험판)',
          },
          default: {
            premium: '유성우 내리는 밤의 기억 (Premium)',
            trial: '유성우 내리는 밤의 기억 (체험판)',
          },
        };

        const contentByTier = {
          premium: `천천히 흔들리며 돌아가는 톱니바퀴 너머로, 수집가는 먼지 낀 렌즈를 만지작거렸다. "${prompt}" 이라니, 상상했던 것보다 훨씬 더 따뜻한 발상이었다.\n\n"모든 흘러간 순간들은 결국 어딘가에 머무는 법이지. 당신이 문을 연 순간, 소중한 이야기가 새로이 피어나기 시작했다네..."`,
          trial: `수집가는 먼지 낀 렌즈를 흔들며 엷은 미소를 지었다. "${prompt}" 의 이야기가 알록달록한 글귀가 되어 피어난다. \n\n"상상했던 그림책 속 이야기가 아주 아름답게 쓰였네. 책방에 하나씩 차곡차곡 채우다 보면 아주 훌륭한 작가가 될 거야."`,
        };

        const genreKey = titleByGenre[genre] ? genre : 'default';

        resolve({
          title: titleByGenre[genreKey][tier],
          content: contentByTier[tier],
        });
      }, 2000);
    });
  },
};
