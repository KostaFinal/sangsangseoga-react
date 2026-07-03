// 책 목록 원본 데이터
export const initialBooks = [
  {
    id: 'stats_magic_book',
    title: '지우를 위한 마법 독서 통계 책',
    author: '상상서가 인공지능 사서',
    illustrator: '은하별 AI 화가',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPVBWqLsCBgg8PJuoJJomJC3f8OSvgE89YHcxnMWKBy4wvRvL1cZQN6QDSbPrmqpA04kfaFL2WLamfw2T7ahBXAP-9D0-TGdKVb_uoubDPsJezesu4X-K9HiU_oKXf_tB7Hy4Bok0W0ay0YbQVSQ9fXyrxDGxFAOPnnFbdoS6IibG-20KBf-1LDX2uNBWVRt8IaSkxGr-5Ju6m1k8HKa6v72K1NKdKOODyRlIvMbFo9t1A9QzUF49YmARdMrheFQYF97bn-chMLXQr',
    category: '독서 통계',
    rating: 5.0,
    description: '반짝반짝 은하수로 그린 우리들의 생각 정원! 지우 님이 지금까지 가꾸어 온 고운 상상력 날개와 소중한 낭독 여정들이 알록달록 무지개 빛 통계로 예쁘게 펼쳐집니다.',
    readingTime: '매일 낭독',
    magicLevel: 'Lv. 4',
    pages: 100,
    progress: 100,
    startedDate: "2026.06.18",
    finishedDate: '매일 업데이트됨'
  },
  {
    id: 'wish_dragon',
    title: '크리스탈 드래곤의 비밀',
    author: '김마법',
    illustrator: '신비',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB39WyhX1GndPch_fxx0U_w2STtxNammzCcK1mQbgpf-frWT0D5Ytvcbe3gYWsGt1kv5KdG-GMAPEPJKAKogLLkoAWbNnjGWcuLdUmcnZ4NJcyefYy63AFu6Cm22b8B9Hu9OTA-TJAxUZP9L50FU90sWPwTWkD7Ul_DW6p7mKhn66z1yvG6k0m76l0weZVEhpckBx1WYFciywZymNGfdhgAoXk6xXup-D4YM878r_GGMASHuN4sI06TRr5TgECMD6Xzzw9Gjcwe1bLY',
    category: '소설',
    rating: 4.9,
    description: '마법의 숲 너머 깊은 동굴 속에 잠들어 있는 전설의 크리스탈 드래곤을 깨우기 위해 떠나는 어린 마법사 아린의 가슴 뛰는 모험 이야기!',
    readingTime: '20분',
    magicLevel: 'Lv. 4',
    pages: 40,
    progress: 0
  },
  {
    id: 'wish_bakery',
    title: '꿈꾸는 심야 빵집',
    author: '이온정',
    illustrator: '수채화',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI6_9o3ivagt0U0ZJhyWk8kCy6y8zQGge0rR_epJsHnAoDaUJTRODbMbk3INGzHpSouisJV6Y4L_DG1Nvajif5PIfDVzzLzXtyalNpAlPNJ9n3jvkCr3mS2LVMy3oJqWPTtXYBWOPJXZavJsN5Tm0Ozy_5MIV0hMt6fFyADARfXlazAqdfWuNHDodoUJ-Zp7uw5Gj2QIQ9iDrUKv_-BXF3iNJhxyUmZXpjWJ5YTxHeKpwoIumUKLx090wOlIdRY1rslqNke_9guV17',
    category: '소설',
    rating: 4.7,
    description: '모두가 잠든 밤 12시, 비밀의 골목길 끝에서만 문이 열리는 마법 같은 빵집. 그곳에서 구워지는 따듯한 크루아상을 먹으면 잃어버렸던 소중한 꿈이 다시 찾아옵니다.',
    readingTime: '18분',
    magicLevel: 'Lv. 2',
    pages: 35,
    progress: 0
  },
  {
    id: 'wish_forest',
    title: '별이 빛나는 숲',
    author: '정은하',
    illustrator: '조이',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB39WyhX1GndPch_fxx0U_w2STtxNammzCcK1mQbgpf-frWT0D5Ytvcbe3gYWsGt1kv5KdG-GMAPEPJKAKogLLkoAWbNnjGWcuLdUmcnZ4NJcyefYy63AFu6Cm22b8B9Hu9OTA-TJAxUZP9L50FU90sWPwTWkD7Ul_DW6p7mKhn66z1yvG6k0m76l0weZVEhpckBx1WYFciywZymNGfdhgAoXk6xXup-D4YM878r_GGMASHuN4sI06TRr5TgECMD6Xzzw9Gjcwe1bLY',
    category: '동화',
    rating: 4.8,
    description: '숲속 밤하늘에 별을 다는 일을 하는 별총총 개구리와 길 잃은 아기 고양이가 펼치는, 밤하늘 감성 가득한 잔잔하고 예쁜 치유의 동화.',
    readingTime: '15분',
    magicLevel: 'Lv. 1',
    pages: 28,
    progress: 0
  },
  {
    id: 'reading_space',
    title: '우주 탐험대의 모험',
    author: '박코스모',
    illustrator: '루나',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPVBWqLsCBgg8PJuoJJomJC3f8OSvgE89YHcxnMWKBy4wvRvL1cZQN6QDSbPrmqpA04kfaFL2WLamfw2T7ahBXAP-9D0-TGdKVb_uoubDPsJezesu4X-K9HiU_oKXf_tB7Hy4Bok0W0ay0YbQVSQ9fXyrxDGxFAOPnnFbdoS6IibG-20KBf-1LDX2uNBWVRt8IaSkxGr-5Ju6m1k8HKa6v72K1NKdKOODyRlIvMbFo9t1A9QzUF49YmARdMrheFQYF97bn-chMLXQr',
    category: '소설',
    rating: 4.9,
    description: '반짝이는 고리를 가진 토성을 넘어 미지의 은하를 개척하는 꼬마 선장 마루와 AI 로봇 단짝이 해쳐나가는 스릴 넘치는 우주 비행 대작전!',
    readingTime: '25분',
    magicLevel: 'Lv. 3',
    pages: 45,
    progress: 65
  },
  {
    id: 'reading_time',
    title: '시간을 걷는 아이',
    author: '민타임',
    illustrator: '하루',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI6_9o3ivagt0U0ZJhyWk8kCy6y8zQGge0rR_epJsHnAoDaUJTRODbMbk3INGzHpSouisJV6Y4L_DG1Nvajif5PIfDVzzLzXtyalNpAlPNJ9n3jvkCr3mS2LVMy3oJqWPTtXYBWOPJXZavJsN5Tm0Ozy_5MIV0hMt6fFyADARfXlazAqdfWuNHDodoUJ-Zp7uw5Gj2QIQ9iDrUKv_-BXF3iNJhxyUmZXpjWJ5YTxHeKpwoIumUKLx090wOlIdRY1rslqNke_9guV17',
    category: '소설',
    rating: 4.6,
    description: '째깍째깍 시계 바늘을 돌려 과거 공룡 시대부터 미래 하늘 도시까지 시간 여행 시계를 타고 날아다니는 시간 나그네 시우의 모험기.',
    readingTime: '22분',
    magicLevel: 'Lv. 3',
    pages: 38,
    progress: 28
  },
  {
    id: 'whale_cloud',
    title: '구름 숲의 고래: 신비한 모험의 시작',
    author: '푸른하늘',
    illustrator: '조이',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk98G4T7fQztD_xwso8VBG6FHiE7BzL2FU8rUyprGIsTW9pUncF1xn38Z_Vs-jhAkapiZARyyawL-zjntj6wMRrzLAkiF1VXfTutWclanPI9ZafkCc2oEomuT6ajayI877AhSo8yReEsJvalCRlZ9P3r2CiVXeR9hDADC3x3pxyQlROA19UzvkJpuiopfwL-19jpBbLUVplcuNE65IKPn3M-xljJGagsWIGX6kHB4rY9aktDZ3eG14iLbvi-E6jEc4xAtcBO28oubL',
    category: '동화',
    rating: 4.8,
    description: "바다보다 구름을 더 좋아하는 신기한 고래 '아띠'의 이야기를 들어볼까요? 아띠는 매일 아침 구름 숲으로 날아가 숲속 동물 친구들과 숨바꼭질을 해요. 어느 날, 구름 숲의 색깔이 점점 사라지기 시작했어요. 아띠와 친구들은 잃어버린 색깔을 찾기 위해 무지개 끝으로 모험을 떠나기로 합니다. 과연 아띠는 구름 숲의 아름다운 색깔들을 되찾아올 수 있을까요?",
    readingTime: '15분',
    magicLevel: 'Lv. 3',
    pages: 32,
    progress: 0
  },
  {
    id: 'done_fairy',
    title: '숲속의 작은 요정들',
    author: '김상상',
    illustrator: '초록',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxpPIJ3bxftSyKnPmh9S3hNqCT_Imb0eHGBAql0MacKm-KjDJwrdOf0tSkm8Gqe_P3-UUMO2r3zq8VGUegmvHhs1GdapNXcT7GvswktkYL0kDy1grAFC_iVXpiG7viOWFcWI2BXscWmxjn4gGZHNfSepRd0Abd3XTi4sjyR4ADXNp35H_Yx3zpEzLaQHXW8Xs2EJYk4CJ0YgLu-Lwk9Qh_DcsFSN7rcb2qelj0w0Ub03sOZwMF5ZdORTVtE-9BymeB4waTaW6vOxfU',
    category: '시',
    rating: 4.9,
    description: '민들레 씨앗 배를 타고 날아다니는 꼬마 요정 루루와 콕콕이가 전하는, 대자연 속 숲 친구들의 포근하고 사랑스러운 이야기.',
    readingTime: '12분',
    magicLevel: 'Lv. 2',
    pages: 25,
    progress: 100,
    startedDate: "2026.06.18",
    finishedDate: '2026.06.20'
  },
  {
    id: 'done_cheese',
    title: '달나라 치즈 여행',
    author: '박우주',
    illustrator: '밀키',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvQPrEDObfZLjStViRbituC9Xr4bPEWseNkV88Sisl8-GF5vgSKlQwg_OW26UIJD0r5eEMYkGHLULD3oqMDuiltnvAZENnehZ86_rQRu86zOTNJLujq7LiwykaAbQGrXWMtrM8H0pXHx3MuBWte-KrA2Ry2NktpTVYxMleo7Y2g76aWJPM7v-HLDWxRVic7_ZOtaaFhhJjrV1dYrJrTewNp0RH7Vo33gv2u_-EH3axy51ISy98POYQk1bOZrvXJ_L5sUMbVbvqmw5V',
    category: '동화',
    rating: 4.8,
    description: '달나라 표면이 진짜 맛보고 고소한 체다 치즈로 되어 있다면 어떨까요? 생쥐 토미가 우주선을 타고 달에 가서 노란 치즈를 우적우적 먹어보는 달콤하고 유머러스한 이야기.',
    readingTime: '15분',
    magicLevel: 'Lv. 2',
    pages: 30,
    progress: 100,
    startedDate: "2026.06.15",
    finishedDate: '2026.06.18'
  },
  {
    id: 'whale_star',
    title: '별을 삼킨 고래',
    author: '상상서가 AI도서관',
    illustrator: 'AI',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPVBWqLsCBgg8PJuoJJomJC3f8OSvgE89YHcxnMWKBy4wvRvL1cZQN6QDSbPrmqpA04kfaFL2WLamfw2T7ahBXAP-9D0-TGdKVb_uoubDPsJezesu4X-K9HiU_oKXf_tB7Hy4Bok0W0ay0YbQVSQ9fXyrxDGxFAOPnnFbdoS6IibG-20KBf-1LDX2uNBWVRt8IaSkxGr-5Ju6m1k8HKa6v72K1NKdKOODyRlIvMbFo9t1A9QzUF49YmARdMrheFQYF97bn-chMLXQr',
    category: '에세이',
    rating: 5.0,
    description: '하늘의 아름다운 별빛을 동경하여 깊고 푸른 바다에서 숨쉬던 중 가장 빛나는 별을 한 입 삼킨 아기 고래 푸른이의 은하수 바다 여행기!',
    readingTime: '20분',
    magicLevel: 'Lv. 3',
    pages: 45,
    progress: 8,
    finishedDate: ''
  },
  {
    id: 'manual_flying_island',
    title: '하늘을 나는 고양이 섬',
    author: '김지우 님',
    illustrator: '상상서가 AI 화가',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI6_9o3ivagt0U0ZJhyWk8kCy6y8zQGge0rR_epJsHnAoDaUJTRODbMbk3INGzHpSouisJV6Y4L_DG1Nvajif5PIfDVzzLzXtyalNpAlPNJ9n3jvkCr3mS2LVMy3oJqWPTtXYBWOPJXZavJsN5Tm0Ozy_5MIV0hMt6fFyADARfXlazAqdfWuNHDodoUJ-Zp7uw5Gj2QIQ9iDrUKv_-BXF3iNJhxyUmZXpjWJ5YTxHeKpwoIumUKLx090wOlIdRY1rslqNke_9guV17',
    category: '나만의 AI 창작',
    rating: 5.0,
    description: '날개 달린 아기 고양이들이 평화롭게 몽실구름 비누방울을 타고 모험을 즐기는 하늘 저편 고양이 섬의 하루!',
    readingTime: '10분',
    magicLevel: 'Lv. 4',
    pages: 12,
    progress: 0,
    finishedDate: ''
  },
  {
    id: 'wish_poetry_stars',
    title: '은하수를 건너는 숟가락',
    author: '정민들레',
    illustrator: '은하수',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPVBWqLsCBgg8PJuoJJomJC3f8OSvgE89YHcxnMWKBy4wvRvL1cZQN6QDSbPrmqpA04kfaFL2WLamfw2T7ahBXAP-9D0-TGdKVb_uoubDPsJezesu4X-K9HiU_oKXf_tB7Hy4Bok0W0ay0YbQVSQ9fXyrxDGxFAOPnnFbdoS6IibG-20KBf-1LDX2uNBWVRt8IaSkxGr-5Ju6m1k8HKa6v72K1NKdKOODyRlIvMbFo9t1A9QzUF49YmARdMrheFQYF97bn-chMLXQr',
    category: '시',
    rating: 4.9,
    description: '달콤한 구름 수프 한 그릇을 뜨기 위해, 은빛 반짝인 숟가락을 들고 은하수 강물을 타는 꼬마 별똥별의 따뜻한 감성 시집.',
    readingTime: '8분',
    magicLevel: 'Lv. 2',
    pages: 16,
    progress: 0,
    finishedDate: ''
  },
  {
    id: 'essay_dandelion',
    title: '민들레 씨앗의 비행 일기',
    author: '한바람',
    illustrator: '초록',
    coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk98G4T7fQztD_xwso8VBG6FHiE7BzL2FU8rUyprGIsTW9pUncF1xn38Z_Vs-jhAkapiZARyyawL-zjntj6wMRrzLAkiF1VXfTutWclanPI9ZafkCc2oEomuT6ajayI877AhSo8yReEsJvalCRlZ9P3r2CiVXeR9hDADC3x3pxyQlROA19UzvkJpuiopfwL-19jpBbLUVplcuNE65IKPn3M-xljJGagsWIGX6kHB4rY9aktDZ3eG14iLbvi-E6jEc4xAtcBO28oubL',
    category: '에세이',
    rating: 4.8,
    description: '바람 부는 날 언덕에서 넓은 세상으로 용기 있게 날아오른 아기 민들레 씨앗의 잔잔하고 따스한 일상을 담은 성장 수필집.',
    readingTime: '12분',
    magicLevel: 'Lv. 3',
    pages: 20,
    progress: 0,
    finishedDate: ''
  }
];

// 진짜 동화책 본문 데이터
export const bookContents = {
  'manual_flying_island': {
    id: 'manual_flying_island',
    title: '하늘을 나는 고양이 섬',
    chapters: [
      {
        title: '1. 날개 달린 아기 고양이',
        page: 1,
        content: `하늘 구름 위 보드라운 솜털 성에는 날개 달린 고양이들이 살고 있었어요. 분홍 아기 고양이 '츄츄'는 꼬리에 하트 구름 조각을 얹고서 마법 놀이터 미끄럼틀을 슉 신나게 내려왔습니다.\n\n"오늘도 상상력 넘치는 친구들과 하늘 놀이공원에서 재미있는 비눗방울 비행 시합을 열어 볼까?" 하며 우주 구름 방패를 활짝 꺼내 선언했답니다.`,
        illustration: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI6_9o3ivagt0U0ZJhyWk8kCy6y8zQGge0rR_epJsHnAoDaUJTRODbMbk3INGzHpSouisJV6Y4L_DG1Nvajif5PIfDVzzLzXtyalNpAlPNJ9n3jvkCr3mS2LVMy3oJqWPTtXYBWOPJXZavJsN5Tm0Ozy_5MIV0hMt6fFyADARfXlazAqdfWuNHDodoUJ-Zp7uw5Gj2QIQ9iDrUKv_-BXF3iNJhxyUmZXpjWJ5YTxHeKpwoIumUKLx090wOlIdRY1rslqNke_9guV17'
      },
      {
        title: '2. 무지개 비눗방울 비행',
        page: 12,
        content: `츄츄와 아기 고양이 무리들은 하늘에서 가장 큰 무지개 비눗방울을 공중 정원에 둥둥 띄우고 멋진 은빛 왕관 파티를 열었어요!\n\n따뜻하고 나긋나긋한 햇살이 내려앉자 상상력이 충전된 구름꽃들이 환하게 미소를 지었고, 츄츄는 행복하게 낮가림을 잊은 채 꼬마 요정들과 포근히 잠에 들게 되었답니다.`,
        illustration: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI6_9o3ivagt0U0ZJhyWk8kCy6y8zQGge0rR_epJsHnAoDaUJTRODbMbk3INGzHpSouisJV6Y4L_DG1Nvajif5PIfDVzzLzXtyalNpAlPNJ9n3jvkCr3mS2LVMy3oJqWPTtXYBWOPJXZavJsN5Tm0Ozy_5MIV0hMt6fFyADARfXlazAqdfWuNHDodoUJ-Zp7uw5Gj2QIQ9iDrUKv_-BXF3iNJhxyUmZXpjWJ5YTxHeKpwoIumUKLx090wOlIdRY1rslqNke_9guV17'
      }
    ]
  },
  'wish_poetry_stars': {
    id: 'wish_poetry_stars',
    title: '은하수를 건너는 숟가락',
    chapters: [
      {
        title: '1. 은하수 한 스푼',
        page: 1,
        content: `새까만 우주 냄비 속에 들어간\n은빛 은하수 은반지 한 조각.\n별똥별 숟가락 하나 가볍게 넣어서\n노랗고 달콤한 밤하늘 수프 한 입 떠봐요.\n\n반짝이는 별빛 맛이 온몸 가득\n따스하게 속살속살 속삭입니다.`,
        illustration: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPVBWqLsCBgg8PJuoJJomJC3f8OSvgE89YHcxnMWKBy4wvRvL1cZQN6QDSbPrmqpA04kfaFL2WLamfw2T7ahBXAP-9D0-TGdKVb_uoubDPsJezesu4X-K9HiU_oKXf_tB7Hy4Bok0W0ay0YbQVSQ9fXyrxDGxFAOPnnFbdoS6IibG-20KBf-1LDX2uNBWVRt8IaSkxGr-5Ju6m1k8HKa6v72K1NKdKOODyRlIvMbFo9t1A9QzUF49YmARdMrheFQYF97bn-chMLXQr'
      },
      {
        title: '2. 소리 없는 별 노래',
        page: 16,
        content: `소리가 없어도 다 들리는 별들의 앙상블.\n우리가 밤하늘을 조용히 바라볼 때마다\n꿈꾸는 동생 개구리의 발등 위로\n조그마한 이슬 이불이 촉촉이 내려앉습니다.\n\n사랑을 가만히 미소로 답하는 밤입니다.`,
        illustration: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPVBWqLsCBgg8PJuoJJomJC3f8OSvgE89YHcxnMWKBy4wvRvL1cZQN6QDSbPrmqpA04kfaFL2WLamfw2T7ahBXAP-9D0-TGdKVb_uoubDPsJezesu4X-K9HiU_oKXf_tB7Hy4Bok0W0ay0YbQVSQ9fXyrxDGxFAOPnnFbdoS6IibG-20KBf-1LDX2uNBWVRt8IaSkxGr-5Ju6m1k8HKa6v72K1NKdKOODyRlIvMbFo9t1A9QzUF49YmARdMrheFQYF97bn-chMLXQr'
      }
    ]
  },
  'essay_dandelion': {
    id: 'essay_dandelion',
    title: '민들레 씨앗의 비행 일기',
    chapters: [
      {
        title: '1. 언덕에서 이별하기',
        page: 1,
        content: `언덕 위 포근했던 수풀 집을 떠날 바람 부는 아침이 찾아왔습니다. 아기 민들레 씨앗 '솜솜이'는 지평선 너머 미지의 세계로 둥실 떠오르며 아주 조그마한 가슴을 콩닥콩닥 설레어 했어요.\n\n"처음 날아보는 먼 하늘길이지만, 따스하게 안아주는 든든한 바람 날개와 함께라면 단 한 걸음도 두렵지 않을 거야."`,
        illustration: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk98G4T7fQztD_xwso8VBG6FHiE7BzL2FU8rUyprGIsTW9pUncF1xn38Z_Vs-jhAkapiZARyyawL-zjntj6wMRrzLAkiF1VXfTutWclanPI9ZafkCc2oEomuT6ajayI877AhSo8yReEsJvalCRlZ9P3r2CiVXeR9hDADC3x3pxyQlROA19UzvkJpuiopfwL-19jpBbLUVplcuNE65IKPn3M-xljJGagsWIGX6kHB4rY9aktDZ3eG14iLbvi-E6jEc4xAtcBO28oubL'
      },
      {
        title: '2. 숲속 꿀벌과의 대화',
        page: 20,
        content: `부드러운 하늬바람을 얻어 타고 날아간 시원한 숲속 어귀에서, 솜솜이는 열심히 라벤더 꽃가루를 수확하는 듬직한 꿀벌 요정 무리들을 만났습니다.\n\n"솜솜이 너비의 솜털 날개만으로도 넌 충분히 이 세상을 우아하게 헤칠 보배를 가졌단다." 꿀벌은 달콤한 이슬방울을 선물하며 앞날의 활약을 기쁘게 미소 지어 주었습니다.`,
        illustration: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk98G4T7fQztD_xwso8VBG6FHiE7BzL2FU8rUyprGIsTW9pUncF1xn38Z_Vs-jhAkapiZARyyawL-zjntj6wMRrzLAkiF1VXfTutWclanPI9ZafkCc2oEomuT6ajayI877AhSo8yReEsJvalCRlZ9P3r2CiVXeR9hDADC3x3pxyQlROA19UzvkJpuiopfwL-19jpBbLUVplcuNE65IKPn3M-xljJGagsWIGX6kHB4rY9aktDZ3eG14iLbvi-E6jEc4xAtcBO28oubL'
      }
    ]
  },
  'whale_star': {
    id: 'whale_star',
    title: '별을 삼킨 고래',
    chapters: [
      {
        title: '1. 바다 너머의 꿈',
        page: 4,
        content: "고래 '푸른이'는 매일 밤 바다 위로 비치는 별들을 보며 생각했어요. \"저 반짝이는 보석들을 한 입에 꿀꺽 삼키면 내 마음도 반짝이게 될까?\" 바다 깊은 곳 친구들은 언제나 푸른이를 말렸지만, 푸른이의 눈동자는 늘 밤새 빛나는 밤하늘 높은 곳을 쫓고 있었습니다.",
        illustration: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPVBWqLsCBgg8PJuoJJomJC3f8OSvgE89YHcxnMWKBy4wvRvL1cZQN6QDSbPrmqpA04kfaFL2WLamfw2T7ahBXAP-9D0-TGdKVb_uoubDPsJezesu4X-K9HiU_oKXf_tB7Hy4Bok0W0ay0YbQVSQ9fXyrxDGxFAOPnnFbdoS6IibG-20KBf-1LDX2uNBWVRt8IaSkxGr-5Ju6m1k8HKa6v72K1NKdKOODyRlIvMbFo9t1A9QzUF49YmARdMrheFQYF97bn-chMLXQr'
      },
      {
        title: '2. 반짝이는 배 속의 비밀',
        page: 12,
        content: "어느 날 밤, 달빛이 가장 밝은 바다 한가운데서 푸른이는 커다란 입을 벌려 그 밤하늘에서 가장 크고 동그란 별을 통째로 꿀꺽 삼켰어요. 갑자기 푸른이의 배 속에서 따스한 백합 향 온기가 퍼져 나가기 시작했습니다. 그리고 놀라운 일이 벌어졌죠. 푸른이가 헤엄치는 길마다 바닷물이 은하수처럼 반짝반짝 빛나기 시작한 거예요!",
        illustration: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPVBWqLsCBgg8PJuoJJomJC3f8OSvgE89YHcxnMWKBy4wvRvL1cZQN6QDSbPrmqpA04kfaFL2WLamfw2T7ahBXAP-9D0-TGdKVb_uoubDPsJezesu4X-K9HiU_oKXf_tB7Hy4Bok0W0ay0YbQVSQ9fXyrxDGxFAOPnnFbdoS6IibG-20KBf-1LDX2uNBWVRt8IaSkxGr-5Ju6m1k8HKa6v72K1NKdKOODyRlIvMbFo9t1A9QzUF49YmARdMrheFQYF97bn-chMLXQr'
      },
      {
        title: '3. 은하수 길을 찾아서',
        page: 28,
        content: '푸른이는 이제 바다에서 가장 밝게 빛나는 신비한 밤빛 고래가 되었습니다. 지나가던 물고기 무리도 푸른이 구경에 연신 소리를 질렀어요. 하지만 이 비밀을 온전히 나누어 가질 수 있는 친구들은 오직 등대 주변에 모여 살던 아주 작고 가냘픈 야광 물고기 무리들뿐이었습니다.',
        illustration: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPVBWqLsCBgg8PJuoJJomJC3f8OSvgE89YHcxnMWKBy4wvRvL1cZQN6QDSbPrmqpA04kfaFL2WLamfw2T7ahBXAP-9D0-TGdKVb_uoubDPsJezesu4X-K9HiU_oKXf_tB7Hy4Bok0W0ay0YbQVSQ9fXyrxDGxFAOPnnFbdoS6IibG-20KBf-1LDX2uNBWVRt8IaSkxGr-5Ju6m1k8HKa6v72K1NKdKOODyRlIvMbFo9t1A9QzUF49YmARdMrheFQYF97bn-chMLXQr'
      },
      {
        title: '4. 다시 만난 가족',
        page: 45,
        content: '푸른이는 빛나는 별 of 마법을 통해 멀리 흩어져서 그리워했던 다른 고래 가족들에게 자신의 따뜻한 별빛을 보냈습니다. 결국 고래 무리가 그 따뜻한 불빛 사인을 찾아 모였고, 넓은 바다는 모두 은빛 날개의 춤을 추는 고래들의 마법 축제 장소로 변하게 되었답니다. 푸른이는 이제 바다에서도 행복하게 미소 짓는 고래가 되었습니다.',
        illustration: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPVBWqLsCBgg8PJuoJJomJC3f8OSvgE89YHcxnMWKBy4wvRvL1cZQN6QDSbPrmqpA04kfaFL2WLamfw2T7ahBXAP-9D0-TGdKVb_uoubDPsJezesu4X-K9HiU_oKXf_tB7Hy4Bok0W0ay0YbQVSQ9fXyrxDGxFAOPnnFbdoS6IibG-20KBf-1LDX2uNBWVRt8IaSkxGr-5Ju6m1k8HKa6v72K1NKdKOODyRlIvMbFo9t1A9QzUF49YmARdMrheFQYF97bn-chMLXQr'
      }
    ]
  },
  'whale_cloud': {
    id: 'whale_cloud',
    title: '구름 숲의 고래: 신비한 모험의 시작',
    chapters: [
      {
        title: '1. 하늘을 동경하는 아띠',
        page: 1,
        content: "바다보다 구름을 골목길처럼 누비는 신기한 아기 구름고래 '아띠'가 살고 있었어요. 아띠는 분홍색과 감색이 뒤섞린 몽실구름 사이에서 미끄럼틀을 타는 게 세상에서 가장 재미있는 일이었답니다.",
        illustration: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk98G4T7fQztD_xwso8VBG6FHiE7BzL2FU8rUyprGIsTW9pUncF1xn38Z_Vs-jhAkapiZARyyawL-zjntj6wMRrzLAkiF1VXfTutWclanPI9ZafkCc2oEomuT6ajayI877AhSo8yReEsJvalCRlZ9P3r2CiVXeR9hDADC3x3pxyQlROA19UzvkJpuiopfwL-19jpBbLUVplcuNE65IKPn3M-xljJGagsWIGX6kHB4rY9aktDZ3eG14iLbvi-E6jEc4xAtcBO28oubL'
      },
      {
        title: '2. 구름 구덩이에 빠진 무지개',
        page: 10,
        content: '어느 날, 구름 숲에 어둑어둑한 그림자 바람이 불더니, 밝고 이쁘던 구름나무들의 색깔들이 온 사방으로 흩날려 씻겨 내려갔습니다. 아띠는 구름 숲 사서 너구리 할아버지로부터 은빛 무지개 조각을 채취하면 원래 빛깔들을 고칠 수 있다는 희망을 듣게 됬습니다.',
        illustration: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk98G4T7fQztD_xwso8VBG6FHiE7BzL2FU8rUyprGIsTW9pUncF1xn38Z_Vs-jhAkapiZARyyawL-zjntj6wMRrzLAkiF1VXfTutWclanPI9ZafkCc2oEomuT6ajayI877AhSo8yReEsJvalCRlZ9P3r2CiVXeR9hDADC3x3pxyQlROA19UzvkJpuiopfwL-19jpBbLUVplcuNE65IKPn3M-xljJGagsWIGX6kHB4rY9aktDZ3eG14iLbvi-E6jEc4xAtcBO28oubL'
      },
      {
        title: '3. 잃어버린 일곱 빛깔',
        page: 20,
        content: '아띠는 단짝 다람쥐 보미와 힘을 실어 무지개 벼랑 끝으로 번지점프하듯 뛰어내렸습니다. 온몸에 아름다운 일곱 광채가 얹어지면서, 아띠의 지느러미 날갯짓마다 부드러운 숲속 색채들이 물감을 뿌린 것처럼 생생하게 다시 채워지기 시작했습니다.',
        illustration: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk98G4T7fQztD_xwso8VBG6FHiE7BzL2FU8rUyprGIsTW9pUncF1xn38Z_Vs-jhAkapiZARyyawL-zjntj6wMRrzLAkiF1VXfTutWclanPI9ZafkCc2oEomuT6ajayI877AhSo8yReEsJvalCRlZ9P3r2CiVXeR9hDADC3x3pxyQlROA19UzvkJpuiopfwL-19jpBbLUVplcuNE65IKPn3M-xljJGagsWIGX6kHB4rY9aktDZ3eG14iLbvi-E6jEc4xAtcBO28oubL'
      },
      {
        title: '4. 찬란한 구름 동백꽃',
        page: 32,
        content: '모든 색깔을 다 되찾은 구름 숲에는 새빨간 아기동백과 황금빛 은행 구름이 활짝 피어났습니다. 숲속 주민 모두가 구름 고래 아띠 위에 모여 노래를 불렀고, 밤에는 구름 달빛 무도회가 환하게 밝혀졌답니다.',
        illustration: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk98G4T7fQztD_xwso8VBG6FHiE7BzL2FU8rUyprGIsTW9pUncF1xn38Z_Vs-jhAkapiZARyyawL-zjntj6wMRrzLAkiF1VXfTutWclanPI9ZafkCc2oEomuT6ajayI877AhSo8yReEsJvalCRlZ9P3r2CiVXeR9hDADC3x3pxyQlROA19UzvkJpuiopfwL-19jpBbLUVplcuNE65IKPn3M-xljJGagsWIGX6kHB4rY9aktDZ3eG14iLbvi-E6jEc4xAtcBO28oubL'
      }
    ]
  }
};

// 캘린더 세부 더미 데이터
export const calendarDays = {
  2: {
    day: 2,
    books: [
      {
        title: '크리스탈 드래곤의 비밀',
        coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB39WyhX1GndPch_fxx0U_w2STtxNammzCcK1mQbgpf-frWT0D5Ytvcbe3gYWsGt1kv5KdG-GMAPEPJKAKogLLkoAWbNnjGWcuLdUmcnZ4NJcyefYy63AFu6Cm22b8B9Hu9OTA-TJAxUZP9L50FU90sWPwTWkD7Ul_DW6p7mKhn66z1yvG6k0m76l0weZVEhpckBx1WYFciywZymNGfdhgAoXk6xXup-D4YM878r_GGMASHuN4sI06TRr5TgECMD6Xzzw9Gjcwe1bLY',
        time: '35분',
        status: '읽는 중',
        category: '모험'
      }
    ]
  },
  7: {
    day: 7,
    books: [
      {
        title: '우주 탐험대의 모험',
        coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPVBWqLsCBgg8PJuoJJomJC3f8OSvgE89YHcxnMWKBy4wvRvL1cZQN6QDSbPrmqpA04kfaFL2WLamfw2T7ahBXAP-9D0-TGdKVb_uoubDPsJezesu4X-K9HiU_oKXf_tB7Hy4Bok0W0ay0YbQVSQ9fXyrxDGxFAOPnnFbdoS6IibG-20KBf-1LDX2uNBWVRt8IaSkxGr-5Ju6m1k8HKa6v72K1NKdKOODyRlIvMbFo9t1A9QzUF49YmARdMrheFQYF97bn-chMLXQr',
        time: '45분',
        status: '완독',
        category: 'SF 과학'
      },
      {
        title: '달나라 치즈 여행',
        coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvQPrEDObfZLjStViRbituC9Xr4bPEWseNkV88Sisl8-GF5vgSKlQwg_OW26UIJD0r5eEMYkGHLULD3oqMDuiltnvAZENnehZ86_rQRu86zOTNJLujq7LiwykaAbQGrXWMtrM8H0pXHx3MuBWte-KrA2Ry2NktpTVYxMleo7Y2g76aWJPM7v-HLDWxRVic7_ZOtaaFhhJjrV1dYrJrTewNp0RH7Vo33gv2u_-EH3axy51ISy98POYQk1bOZrvXJ_L5sUMbVbvqmw5V',
        time: '15분',
        status: '완독',
        category: '유머/위트'
      }
    ]
  },
  10: {
    day: 10,
    books: [
      {
        title: '꿈꾸는 심야 빵집',
        coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDI6_9o3ivagt0U0ZJhyWk8kCy6y8zQGge0rR_epJsHnAoDaUJTRODbMbk3INGzHpSouisJV6Y4L_DG1Nvajif5PIfDVzzLzXtyalNpAlPNJ9n3jvkCr3mS2LVMy3oJqWPTtXYBWOPJXZavJsN5Tm0Ozy_5MIV0hMt6fFyADARfXlazAqdfWuNHDodoUJ-Zp7uw5Gj2QIQ9iDrUKv_-BXF3iNJhxyUmZXpjWJ5YTxHeKpwoIumUKLx090wOlIdRY1rslqNke_9guV17',
        time: '30분',
        status: '읽는 중',
        category: '치유 판타지'
      }
    ]
  },
  13: {
    day: 13,
    books: [
      {
        title: '별을 삼킨 고래',
        coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPVBWqLsCBgg8PJuoJJomJC3f8OSvgE89YHcxnMWKBy4wvRvL1cZQN6QDSbPrmqpA04kfaFL2WLamfw2T7ahBXAP-9D0-TGdKVb_uoubDPsJezesu4X-K9HiU_oKXf_tB7Hy4Bok0W0ay0YbQVSQ9fXyrxDGxFAOPnnFbdoS6IibG-20KBf-1LDX2uNBWVRt8IaSkxGr-5Ju6m1k8HKa6v72K1NKdKOODyRlIvMbFo9t1A9QzUF49YmARdMrheFQYF97bn-chMLXQr',
        time: '25분',
        status: '읽는 중',
        category: '동화 창작'
      },
      {
        title: '구름 숲의 고래: 신비한 모험의 시작',
        coverUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCk98G4T7fQztD_xwso8VBG6FHiE7BzL2FU8rUyprGIsTW9pUncF1xn38Z_Vs-jhAkapiZARyyawL-zjntj6wMRrzLAkiF1VXfTutWclanPI9ZafkCc2oEomuT6ajayI877AhSo8yReEsJvalCRlZ9P3r2CiVXeR9hDADC3x3pxyQlROA19UzvkJpuiopfwL-19jpBbLUVplcuNE65IKPn3M-xljJGagsWIGX6kHB4rY9aktDZ3eG14iLbvi-E6jEc4xAtcBO28oubL',
        time: '20분',
        status: '읽는 중',
        category: '모험과 우정'
      }
    ]
  }
};
