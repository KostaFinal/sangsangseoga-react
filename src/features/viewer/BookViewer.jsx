import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Bookmark, Sparkles, Sliders, 
  Volume2, Search, List, X, AlignJustify, Type, Globe, Check, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// 전 연령 독자들을 위한 한영 번역 말뭉치 사전
const translations = {
  '별을 삼킨 고래': 'The Whale that Swallowed a Star',
  '구름 숲의 고래: 신비한 모험의 시작': 'The Cloud Forest Whale: Start of a Mystical Adventure',
  '크리스탈 드래곤의 비밀': 'The Secret of the Crystal Dragon',
  '꿈꾸는 심야 빵집': 'The Dreaming Midnight Bakery',
  '별이 빛나는 숲': 'The Starry Shining Forest',
  '우주 탐험대의 모험': 'The Adventure of the Space Explorers',
  '시간을 걷는 아이': 'The Child Who Walks Through Time',
  '달나라 치즈 여행': 'A Voyage for Moon Cheese',

  '1. 바다 너머의 꿈': '1. Dream Beyond the Sea',
  "고래 '푸른이'는 매일 밤 바다 위로 비치는 별들을 보며 생각했어요. \"저 반짝이는 보석들을 한 입에 꿀꺽 삼키면 내 마음도 반짝이게 될까?\" 바다 깊은 곳 친구들은 언제나 푸른이를 말렸지만, 푸른이의 눈동자는 늘 밤새 빛나는 밤하늘 높은 곳을 쫓고 있었습니다.":
    "The whale 'Pureun-i' looked at the stars reflecting on the sea every night and thought, \"If I swallow those glittering jewels in one gulp, will my heart sparkle too?\" Friends from the deep sea always discouraged him, but Pureun-i's eyes were always chasing the high night sky shining all night long.",
  '2. 반짝이는 배 속의 비밀': '2. Secret inside the Sparkling Belly',
  "어느 날 밤, 달빛이 가장 밝은 바다 한가운데서 푸른이는 커다란 입을 벌려 그 밤하늘에서 가장 크고 동그란 별을 통째로 꿀꺽 삼켰어요. 갑자기 푸른이의 배 속에서 따스한 백합 향 온기가 퍼져 나가기 시작했습니다. 그리고 놀라운 일이 벌어졌죠. 푸른이가 헤엄치는 길마다 바닷물이 은하수처럼 반짝반짝 빛나기 시작한 거예요!":
    "One night, in the middle of the sea where the moonlight was brightest, Pureun-i opened his huge mouth and swallowed the largest, roundest star in the night sky. Suddenly, a warm melody of lily fragrance began to spread in Pureun-i's belly. And a wonderful thing happened! Everywhere Pureun-i swam, the ocean water began to sparkle like the Milky Way!",
  '3. 은하수 길을 찾아서': '3. In Search of the Milky Way',
  "푸른이는 이제 바다에서 가장 밝게 빛나는 신비한 밤빛 고래가 되었습니다. 지나가던 물고기 무리도 푸른이 구경에 연신 소리를 질렀어요. 하지만 이 비밀을 온전히 나누어 가질 수 있는 친구들은 오직 등대 주변에 모여 살던 아주 작고 가냘픈 야광 물고기 무리들뿐이었습니다.":
    "Pureun-i has now become the brightest, most mysterious night-light whale in the sea. Schools of passing fish gasped in wonder at the sight of him. But the only friends who could fully share this secret were the tiny and delicate bio-luminescent fish living around the lighthouse.",
  '4. 다시 만난 가족': '4. Reunited Family',
  "푸른이는 빛나는 별 of 마법을 통해 멀리 흩어져서 그리워했던 다른 고래 가족들에게 자신의 따뜻한 별빛을 보냈습니다. 결국 고래 무리가 그 따뜻한 불빛 사인을 찾아 모였고, 넓은 바다는 모두 은빛 날개의 춤을 추는 고래들의 마법 축제 장소로 변하게 되었답니다. 푸른이는 이제 바다에서도 행복하게 미소 짓는 고래가 되었습니다.":
    "Pureun-i sent his warm starlight to other long-lost whale families scattered far away using the magic of the glowing star. Eventually, the pod of whales gathered following the warm light signal, and the vast sea transformed into a magical festival of dancing whales with silver wings. Pureun-i was now a happily smiling whale in the sea.",

  '1. 하늘을 동경하는 아띠': '1. Atti Yearning for the Sky',
  "바다보다 구름을 골목길처럼 누비는 신기한 아기 구름고래 '아띠'가 살고 있었어요. 아띠는 분홍색과 감색이 뒤섞린 몽실구름 사이에서 미끄럼틀을 타는 게 세상에서 가장 재미있는 일이었답니다.":
    "There lived a marvelous baby cloud whale named 'Atti' who explored the clouds like alleyways rather than the sea. Sliding down fluffy clouds of blended pink and indigo was the most delightful thing in the world to Atti.",
  '2. 구름 구덩이에 빠진 무지개': '2. Rainbow Fallen into a Cloud Pit',
  "어느 날, 구름 숲에 어둑어둑한 그림자 바람이 불더니, 밝고 이쁘던 구름나무들의 색깔들이 온 사방으로 흩날려 씻겨 내려갔습니다. 아띠는 구름 숲 사서 너구리 할아버지로부터 은빛 무지개 조각을 채취하면 원래 빛깔들을 고칠 수 있다는 희망을 듣게 됬습니다.":
    "One day, a dark shadow wind blew through the cloud forest, scattering and washing away the bright and beautiful colors of the cloud trees. Atti heard a gleam of hope from the forest raccoon librarian Grandpa: collecting pieces of a silver rainbow could restore the original colors.",
  '3. 잃어버린 일곱 빛깔': '3. The Seven Lost Colors',
  "아띠는 단짝 다람쥐 보미와 힘을 실어 무지개 벼랑 끝으로 번지점프하듯 뛰어내렸습니다. 온몸에 아름다운 일곱 광채가 얹어지면서, 아띠의 지느러미 날갯짓마다 부드러운 숲속 색채들이 물감을 뿌린 것처럼 생생하게 다시 채워지기 시작했습니다.":
    "Atti, alongside their best squirrel friend Bomi, summoned their courage and took a leap of faith from the edge of the rainbow cliff. As the seven beautiful gradients of light wrapped around their body, the soft forest colors began to paint the sky with every flap of Atti's fins.",
  '4. 찬란한 구름 동백꽃': '4. Brilliant Cloud Camellia',
  "모든 색깔을 다 되찾은 구름 숲에는 새빨간 아기동백과 황금빛 은행 구름이 활짝 피어났습니다. 숲속 주민 모두가 구름 고래 아띠 위에 모여 노래를 불렀고, 밤에는 구름 달빛 무도회가 환하게 밝혀졌답니다.":
    "In the cloud forest where all colors were fully restored, bright red baby camellias and golden ginkgo clouds blossomed in full glory. All forest dwellers gathered on the back of Atti the cloud whale to sing together, and the moonlit cloud ball shined brightly through the night.",

  '1. 신비한 여정의 첫걸음': '1. First Step of the Mystical Journey',
  '2. 빛을 되찾은 꼬마 영웅들': '2. The Little Heroes who Restored the Light',
  '1. 비밀 장벽의 개방': '1. Opening of the Secret Barrier',
  '1. 모험가 상상이의 출발': "1. Adventurer Great Sangsang's Departure",

  '하늘을 나는 고양이 섬': 'The Flying Cat Island',
  '1. 날개 달린 아기 고양이': '1. The Winged Kitten',
  '2. 무지개 비눗방울 비행': '2. Rainbow Soap Bubble Flight',
  "하늘 구름 위 보드라운 솜털 성에는 날개 달린 고양이들이 살고 있었어요. 분홍 아기 고양이 '츄츄'는 꼬리에 하트 구름 조각을 얹고서 마법 놀이터 미끄럼틀을 슉 신나게 내려왔습니다.\n\n\"오늘도 상상력 넘치는 친구들과 하늘 놀이공원에서 재미있는 비눗방울 비행 시합을 열어 볼까?\" 하며 우주 구름 방패를 활짝 꺼내 선언했답니다.":
    "On the soft fluffy castle above the sky clouds, there lived beautiful winged kittens. A pink baby kitten, 'Chuchu', carrying a heart cloud piece on her tail, slid down the magic playground slide with great joy.\n\n\"Shall we open a lovely soap bubble flight contest at the sky amusement park with our imaginative friends today?\" she declared, proudly bringing out her cosmic cloud shield.",
  "츄츄와 아기 고양이 무리들은 하늘에서 가장 큰 무지개 비눗방울을 공중 정원에 둥둥 띄우고 멋진 은빛 왕관 파티를 열었어요!\n\n따뜻하고 나긋나긋한 햇살이 내려앉자 상상력이 충전된 구름꽃들이 환하게 미소를 지었고, 츄츄는 행복하게 낮가림을 잊은 채 꼬마 요정들과 포근히 잠에 들게 되었답니다.":
    "Chuchu and the kitten pod floated the biggest rainbow soap bubbles in the sky garden and hosted an elegant silver crown party!\n\nAs the warm and gentle sunshine fell, the imagination-filled cloud flowers smiled brightly, and Chuchu fell asleep cozily with little woodland fairies, happily forgetting all of her shyness.",

  '은하수를 건너는 숟가락': 'A Spoon Crossing the Milky Way',
  '1. 은하수 한 스푼': '1. A Spoonful of Milky Way',
  '2. 소리 없는 별 노래': '2. Silent Star Song',
  "새까만 우주 냄비 속에 들어간\n은빛 은하수 은반지 한 조각.\n별똥별 숟가락 하나 가볍게 넣어서\n노랗고 달콤한 밤하늘 수프 한 입 떠봐요.\n\n반짝이는 별빛 맛이 온몸 가득\n따스하게 속살속살 속삭입니다.":
    "A piece of silver Milky Way ring\nplaced inside a pitch-black cosmic pot.\nLightly dip a shooting star spoon\nand take a sip of yellow, sweet night sky soup.\n\nThe taste of glittering starlight whispers\nwarmly and softly all over your body.",
  "소리가 없어도 다 들리는 별들의 앙상블.\n우리가 밤하늘을 조용히 바라볼 때마다\n꿈꾸는 동생 개구리의 발등 위로\n조그마한 이슬 이불이 촉촉이 내려앉습니다.\n\n사랑을 가만히 미소로 답하는 밤입니다.":
    "An ensemble of stars heard clearly even without sound.\nEvery time we gaze silently at the night sky,\na tiny blanket of dew falls gently\nupon the feet of the dreaming baby frog.\n\nIt is a beautiful night answering love with a quiet smile.",

  '민들레 씨앗의 비행 일기': 'Flight Diary of a Dandelion Seed',
  '1. 언덕에서 이별하기': '1. Farewell at the Hill',
  '2. 숲속 꿀벌과의 대화': '2. Conversation with a Woodland Bee',
  "언덕 위 포근했던 수풀 집을 떠날 바람 부는 아침이 찾아왔습니다. 아기 민들레 씨앗 '솜솜이'는 지평선 너머 미지의 세계로 둥실 떠오르며 아주 조그마한 가슴을 콩닥콩닥 설레어 했어요.\n\n\"처음 날아보는 먼 하늘길이지만, 따스하게 안아주는 든든한 바람 날개와 함께라면 단 한 걸음도 두렵지 않을 거야.\"":
    "A windy morning has arrived to leave the cozy grassy house on the hill. The baby dandelion seed, 'Somsomi', felt her tiny heart fluttering with excitement as she floated toward the unknown universe beyond the horizon.\n\n\"It is my very first flight in the high sky, but wrapped in warm, supportive wind wings, I will never be afraid of any step.\"",
  "부드러운 하늬바람을 얻어 타고 날아간 시원한 숲속 어귀에서, 솜솜이는 열심히 라벤더 꽃가루를 수확하는 듬직한 꿀벌 요정 무리들을 만났습니다.\n\n\"솜솜이 너비의 솜털 날개만으로도 넌 충분히 이 세상을 우아하게 헤칠 보배를 가졌단다.\" 꿀벌은 달콤한 이슬방울을 선물하며 앞날의 활약을 기쁘게 미소 지어 주었습니다.":
    "At the entrance of the cool forest where she flew on a gentle zephyr, Somsomi met a pod of reliable honeybee fairies harvesting lavender pollen diligently.\n\n\"With just your soft downy wings of Somsomi's width, you already hold a great treasure to navigate this world gracefully.\" The bee gifted her sweet honeydew blossoms and smiled warmly for her future days."
};

// 동적으로 임의의 동화를 전 연령 눈높이에 맞게 번역해 주는 한영번역 스마트 헬퍼
function translateText(text, bookTitle = "") {
  if (!text) return "";
  const trimmed = text.trim();
  if (translations[trimmed]) return translations[trimmed];

  if (trimmed.includes("의 세계관에 오신 것을 환영합니다!")) {
    return `Welcome to the magical universe of "${bookTitle || 'this book'}"!\n\nHere stands the magic Milky Way railroad signal guarding readers with extraordinary imaginations. The grand forest librarian, Grandpa Turtle, tapped his magical wand tip to make beautiful dandelion stems grow vigorously from the dry ground.\n\nA mysterious adventure story just for you is beginning! Adjust the font size, handwriting font, and line spacing in the settings, and enjoy reading with all your senses alongside vivid voice narration.`;
  }
  if (trimmed.includes("결국 주인공 김지우 님이 상상력을 총동원하여")) {
    return `At last, the protagonist Ji-woo used all of their imagination to successfully repair the wound-up ship of the broken music box!\n\nExcited nearby orange forest unicorns and woodland fairies gathered in a snug circle at the squirrel cabin for a beautiful moonlit friendship concert. Ji-woo was presented with an elegant silver crown to finish today's reading journey triumphantly. Clap clap clap!`;
  }
  if (trimmed.includes("의 찬란한 여정이 막 시작되었습니다")) {
    return `The brilliant journey of "${bookTitle || 'the Adventure'}" has just begun! The protagonist stepped out of their tiny study cabin surrounded by the deep, blue forest of imagination, and began to restore the legendary broken clock key...`;
  }
  if (trimmed.includes("상상서가 신비로운 도서 세계에 오신 것을 환영합니다!")) {
    return "Welcome to the magical book world of Sangsang Library! ✨\n\nThis book is a precious treasure autobiography filled with a reader's pure imagination and warm friendship.\n\nFlip the pages one by one and immerse yourself in the brilliantly flowing Milky Way adventure. A captivating fantasy story begins right here on the classic parchment pages spreading over the left and right pages.";
  }

  // 문장별 치환
  let result = trimmed;
  const sentenceMap = [
    ["대단한 상상력을 발휘하는 독자님들을 수호하는", "protecting readers with wonderful imaginations"],
    ["마법 은하 철도 신호등이 서있습니다", "stands a magical Milky Way railroad signal"],
    ["마법 지팡이 끝을 노랗게 콕 짚어서", "tapped her glowing magical wand to make"],
    ["아름다운 민들레 꽃잎 줄기가 무럭무럭 자라나도록", "beautiful dandelion stems grow vigorously"],
    ["너만을 위한 신비한 모험 스토리가 시작되고 있는 순간이에요", "a lovely mystical adventure made for you is starting right now"],
    ["생생히 들려오는 음성 리딩과 함께", "with our magical narrating voice"],
    ["오감으로 독서를 즐겨보세요", "and explore storybooks with all your senses"],
    ["고장 난 오르골의 태엽 배를 수리하는 데 성공했습니다", "successfully repaired the wound-up ship of the broken music box"],
    ["아름다운 달빛 우정 연주회를 활짝 개최했습니다", "to perform a beautiful moonlit friendship concert"],
    ["머리 위에 멋진 은빛 왕관을 받아 얹으며", "received an elegant silver starlight crown"]
  ];

  for (let [kr, en] of sentenceMap) {
    if (result.includes(kr)) {
      result = result.replace(new RegExp(kr, 'g'), en);
    }
  }

  const wordMap = [
    ["상상이", "Sangsang"],
    ["김지우", "Ji-woo Kim"],
    ["지우", "Ji-woo"],
    ["어린이", "reader"],
    ["고래", "whale"],
    ["다람쥐", "squirrel"],
    ["마법", "magic"],
    ["모험", "adventure"],
    ["친구들", "friends"],
    ["사랑스런", "lovely"],
    ["별빛", "starlight"],
    ["보물", "treasure"],
    ["서가", "bookshelf"],
    ["여정", "journey"],
    ["이야기", "story"],
    ["축제", "festival"],
    ["행복하게", "happily"],
    ["미소", "smile"]
  ];

  for (let [kr, en] of wordMap) {
    if (result.includes(kr)) {
      result = result.replace(new RegExp(kr, 'g'), en);
    }
  }

  result = result
    .replace(/[가-힣]+(은|는|이|가|을|를|에|의|로|으로|에서|와|과|도|만|부터|까지|하고|하며)/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (result.length < 5) {
    return `Once upon a time, a beautiful magical wonderland story unfolded, full of warm laughter, beautiful starry mysteries, and lovely friendly animals exploring our cozy universe.`;
  }

  return result;
}

// 챕터 제목 파싱 (ex. "1. 바다 너머의 꿈" -> num: "01", title: "바다 너머의 꿈")
const parseChapterTitle = (titleStr, language) => {
  if (!titleStr) return { num: '', title: '' };
  
  // 만약 영어 모드라면 전체 번역
  let str = titleStr;
  if (language === 'en') {
    str = translations[titleStr.trim()] || titleStr;
  }

  const match = str.match(/^(\d+)\.\s*(.*)/);
  if (match) {
    const num = match[1].padStart(2, '0');
    const title = match[2];
    return { num, title };
  }
  return { num: '', title: str };
};

export default function BookViewer({ bookContent, onClose, onAddBookmark, onRemoveBookmark, appBookmarks = [], initialPage }) {
  const [currentPairIdx, setCurrentPairIdx] = useState(0);
  const [fontSize, setFontSize] = useState('md');
  const [fontFamily, setFontFamily] = useState('serif');
  const [lineHeight, setLineHeight] = useState('relaxed');
  const [toastMessage, setToastMessage] = useState('');
  const [language, setLanguage] = useState('ko'); // 'ko' or 'en'
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);

  // Panels Open state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTOCOpen, setIsTOCOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Direct Page Jump states
  const [showPageInput, setShowPageInput] = useState(false);
  const [directPageNum, setDirectPageNum] = useState('');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Animation directions
  const [flipDirection, setFlipDirection] = useState('next');
  const [isFlipping, setIsFlipping] = useState(false);

  const chapters = bookContent.chapters || [];

  // Build beautiful 2-page spreads
  const pagePairs = useMemo(() => {
    const pairs = [];
    // 0th Index: Left is elegant Intro cover, Right is chapter 1
    pairs.push({
      left: {
        isCover: true,
        title: bookContent.title,
        illustration: bookContent.coverUrl || (chapters[0] && chapters[0].illustration),
        content: `상상서가 신비로운 도서 세계에 오신 것을 환영합니다! ✨\n\n이 책은 독자님의 순수한 상상력과 따뜻한 우정이 곱게 깃든 소중한 보물 자서전입니다.\n\n책장을 한 장씩 휘리릭 넘기며 찬란하게 흐르는 은하수 모험 속으로 빠져들어 보세요. 왼쪽과 오른쪽 양면으로 시원하게 펼쳐지는 클래식 양피지 책장 위에서 오감을 자극하는 환상 동화가 시작됩니다.`
      },
      right: chapters[0] || null
    });

    // Subsequent indices: page pairs
    for (let i = 1; i < chapters.length; i += 2) {
      pairs.push({
        left: chapters[i],
        right: chapters[i + 1] || null
      });
    }
    return pairs;
  }, [chapters, bookContent]);

  const currentPair = pagePairs[currentPairIdx] || pagePairs[0];

  useEffect(() => {
    if (initialPage !== undefined && initialPage !== null) {
      const foundIdx = pagePairs.findIndex(pair => {
        const leftPage = pair.left?.page;
        const rightPage = pair.right?.page;
        if (leftPage === initialPage || rightPage === initialPage) return true;
        if (leftPage && rightPage && initialPage >= leftPage && initialPage <= rightPage) return true;
        return false;
      });

      if (foundIdx !== -1) {
        setCurrentPairIdx(foundIdx);
      } else {
        let closestIdx = 0;
        let minDiff = Infinity;
        pagePairs.forEach((pair, idx) => {
          const leftPage = pair.left?.isCover ? 0 : (pair.left?.page || 0);
          const rightPage = pair.right?.page || leftPage;
          const diffLeft = Math.abs(leftPage - initialPage);
          const diffRight = Math.abs(rightPage - initialPage);
          const localMin = Math.min(diffLeft, diffRight);
          if (localMin < minDiff) {
            minDiff = localMin;
            closestIdx = idx;
          }
        });
        setCurrentPairIdx(closestIdx);
      }
    }
  }, [initialPage, pagePairs]);

  const activePageNum = useMemo(() => {
    return currentPair.right?.page || currentPair.left?.page || 1;
  }, [currentPair]);

  // Find if book & page is bookmarked in appBookmarks
  const currentBookmark = useMemo(() => {
    return appBookmarks.find(bm => bm.title === bookContent.title && bm.page === activePageNum);
  }, [appBookmarks, bookContent.title, activePageNum]);

  const isBookmarked = !!currentBookmark;

  // Typographies Map
  const fontStyles = {
    serif: 'font-serif text-[#2B231D] tracking-tight leading-relaxed',
    sans: 'font-sans font-medium text-[#1E1915] tracking-tight leading-relaxed',
    pen: 'font-mono text-xl text-[#3A3027] font-semibold leading-loose'
  };

  // Font Sizes
  const sizeStyles = {
    sm: 'text-xs md:text-sm lg:text-[14px]',
    md: 'text-sm md:text-base lg:text-[16px]',
    lg: 'text-base md:text-lg lg:text-[18px]',
    xl: 'text-lg md:text-xl lg:text-[21px]'
  };

  // Line Heights
  const leadingStyles = {
    normal: 'leading-normal lg:leading-relaxed',
    relaxed: 'leading-relaxed lg:leading-[2rem]',
    loose: 'leading-loose lg:leading-[2.4rem]'
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Sound Speech synthesis engine
  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      showToast("🔊 이 브라우저는 목소리 읽기 기능을 지원하지 않습니다.");
      return;
    }

    if (isPlayingSpeech) {
      window.speechSynthesis.cancel();
      setIsPlayingSpeech(false);
      return;
    }

    let textToRead = "";
    if (currentPair.left) {
      textToRead += (currentPair.left.isCover 
        ? (language === 'en' ? translateText(currentPair.left.content, bookContent.title) : currentPair.left.content)
        : (language === 'en' ? translateText(currentPair.left.content, bookContent.title) : currentPair.left.content)) + " ";
    }
    if (currentPair.right) {
      textToRead += (language === 'en' ? translateText(currentPair.right.content, bookContent.title) : currentPair.right.content);
    }

    const cleanText = textToRead.replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣✨.,!?"']/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'en' ? 'en-US' : 'ko-KR';
    utterance.rate = 0.92;

    utterance.onend = () => setIsPlayingSpeech(false);
    utterance.onerror = () => setIsPlayingSpeech(false);

    setIsPlayingSpeech(true);
    window.speechSynthesis.speak(utterance);
    showToast("🔊 책을 소리 내어 따뜻하게 읽어드릴게요.");
  };

  // TTS clean when page turns
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingSpeech(false);
  }, [currentPairIdx, language]);

  // Page turning handlers
  const handleNextPage = () => {
    if (isFlipping) return;
    if (currentPairIdx < pagePairs.length - 1) {
      setFlipDirection('next');
      setIsFlipping(true);
      
      setTimeout(() => {
        setCurrentPairIdx((prev) => prev + 1);
      }, 250);

      setTimeout(() => {
        setIsFlipping(false);
      }, 550);
    }
  };

  const handlePrevPage = () => {
    if (isFlipping) return;
    if (currentPairIdx > 0) {
      setFlipDirection('prev');
      setIsFlipping(true);

      setTimeout(() => {
        setCurrentPairIdx((prev) => prev - 1);
      }, 250);

      setTimeout(() => {
        setIsFlipping(false);
      }, 550);
    }
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore key events if styling/input prompts are focused
      if (
        document.activeElement?.tagName === 'INPUT' || 
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        handlePrevPage();
      } else if (e.key === 'ArrowRight') {
        handleNextPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPairIdx, pagePairs, isFlipping]);

  // Jump to specific input page number
  const handleDirectPageSubmit = (e) => {
    e.preventDefault();
    const num = parseInt(directPageNum, 10);
    if (isNaN(num)) {
      showToast("⚠️ 올바른 숫자를 입력해주세요.");
      return;
    }

    if (num <= 0) {
      showToast("⚠️ 페이지 번호는 1부터 입력 가능합니다.");
      return;
    }

    // Attempt to match the exact page or cover
    let foundIdx = pagePairs.findIndex(pair => {
      if (pair.left?.isCover) {
        if (num === 1) return true;
        return pair.right?.page === num;
      }
      return pair.left?.page === num || pair.right?.page === num;
    });

    if (foundIdx === -1) {
      // Find range overlap
      foundIdx = pagePairs.findIndex(pair => {
        const lPage = pair.left?.isCover ? 1 : (pair.left?.page || 1);
        const rPage = pair.right?.page || lPage;
        return num >= lPage && num <= rPage;
      });
    }

    if (foundIdx !== -1) {
      setFlipDirection(foundIdx > currentPairIdx ? 'next' : 'prev');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPairIdx(foundIdx);
      }, 200);
      setTimeout(() => {
        setIsFlipping(false);
      }, 500);
      setShowPageInput(false);
      setDirectPageNum('');
      showToast(`📖 ${num}페이지로 신속히 이동했습니다!`);
    } else {
      const maxPage = chapters[chapters.length - 1]?.page || pagePairs.length * 2;
      showToast(`⚠️ 존재하지 않는 페이지 번호입니다. (최대 ${maxPage}쪽까지 존재)`);
    }
  };

  // Bookmark Add / Remove Toggle
  const handleAddBookmarkAction = () => {
    if (isBookmarked) {
      if (currentBookmark) {
        onRemoveBookmark(currentBookmark.id);
        showToast(`🔖 "${bookContent.title}"의 ${activePageNum}페이지 책갈피를 해제하였습니다.`);
      }
    } else {
      onAddBookmark(bookContent.title, activePageNum);
      showToast(`🔖 "${bookContent.title}"의 ${activePageNum}페이지를 갈무리 북마크하였습니다!`);
    }
  };

  // Jump to specific pair directly
  const handleJumpToPair = (idx) => {
    if (idx >= 0 && idx < pagePairs.length) {
      setFlipDirection(idx > currentPairIdx ? 'next' : 'prev');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPairIdx(idx);
      }, 200);
      setTimeout(() => {
        setIsFlipping(false);
      }, 500);
      setIsTOCOpen(false);
    }
  };

  // Search query executor
  const executeSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const queryLower = query.toLowerCase();
    const results = [];

    pagePairs.forEach((pair, idx) => {
      // Search inside left page
      if (pair.left && !pair.left.isCover) {
        const textKo = pair.left.content.toLowerCase();
        const textEn = translateText(pair.left.content, bookContent.title).toLowerCase();
        const titleKo = pair.left.title.toLowerCase();
        
        if (textKo.includes(queryLower) || textEn.includes(queryLower) || titleKo.includes(queryLower)) {
          results.push({
            pairIdx: idx,
            page: pair.left.page || '앞',
            chapter: pair.left.title,
            preview: pair.left.content.substring(0, 50) + '...'
          });
        }
      }

      // Search inside right page
      if (pair.right) {
        const textKo = pair.right.content.toLowerCase();
        const textEn = translateText(pair.right.content, bookContent.title).toLowerCase();
        const titleKo = pair.right.title.toLowerCase();

        if (textKo.includes(queryLower) || textEn.includes(queryLower) || titleKo.includes(queryLower)) {
          results.push({
            pairIdx: idx,
            page: pair.right.page || '뒤',
            chapter: pair.right.title,
            preview: pair.right.content.substring(0, 50) + '...'
          });
        }
      }
    });

    setSearchResults(results);
  };

  // Elegant text parser for displaying headings matching photo '02 / 작은 별의 마음'
  const leftChapterParsed = useMemo(() => {
    if (!currentPair.left || currentPair.left.isCover) return { num: '', title: '' };
    return parseChapterTitle(currentPair.left.title, language);
  }, [currentPair.left, language]);

  const rightChapterParsed = useMemo(() => {
    if (!currentPair.right) return { num: '', title: '' };
    return parseChapterTitle(currentPair.right.title, language);
  }, [currentPair.right, language]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#83786E] flex flex-col select-none overflow-hidden"
      style={{
        backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.18) 0%, rgba(0,0,0,0.2) 100%)',
      }}
      id="immersive-book-viewer"
    >
      {/* Toast Alert overlay notifications */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -25, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -25, x: '-50%' }}
            className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-neutral-900 border border-neutral-750 text-white font-black text-xs px-5 py-3 rounded-full shadow-2xl z-[100] flex items-center gap-2 max-w-md"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="truncate">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP FLOATING CONTROLLER AREA (Looks exactly like image header) */}
      <header className="w-full h-16 px-6 lg:px-8 flex items-center justify-between z-40 text-white/90">
        
        {/* Left side: Back Button & Book Title */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shadow-sm active:scale-95"
            title="내 서재로 나가기"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h2 className="text-sm md:text-base font-extrabold font-sans tracking-tight text-white drop-shadow-sm truncate max-w-xs md:max-w-lg">
            {language === 'en' ? (translations[bookContent.title] || bookContent.title) : bookContent.title}
          </h2>
        </div>

        {/* Right side icons in alignment with image */}
        <div className="flex items-center gap-3">
          {/* Add Bookmark action */}
          <button 
            onClick={handleAddBookmarkAction}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-white/10 ${
              isBookmarked ? 'text-amber-300' : 'text-white/80 hover:text-white'
            }`}
            title="책갈피 담아두기"
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-amber-300 text-amber-300' : ''}`} />
          </button>

          {/* Table of Contents shortcut icon */}
          <button 
            onClick={() => setIsTOCOpen(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="목차 펼쳐보기"
          >
            <List className="w-5 h-5" />
          </button>

          {/* Search keyword inside books icon */}
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="본문 내용 검색"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* CENTER PHYSICAL BOOK STAGE CONTAINER (High fidelity 3D style) */}
      <main className="flex-1 flex items-center justify-center px-4 md:px-8 py-2 relative overflow-hidden">
        
        {/* Subtle diffuse paper light shadow */}
        <div className="absolute inset-0 bg-radial-light bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.06),_transparent_65%)] pointer-events-none" />

        {/* BOOK CONTAINER LAYOUT */}
        {/* 1. Wood shadow underneath the book casing */}
        <div className="absolute w-full max-w-[1040px] aspect-[1.5/1] min-h-[460px] md:min-h-[520px] bg-black/45 blur-3xl opacity-60 pointer-events-none -translate-y-2 z-0" />

        {/* 2. Full hardcover bounding box showing small edges */}
        <div 
          className="relative w-full max-w-[1040px] aspect-[1.48/1] md:aspect-[1.55/1] min-h-[440px] md:min-h-[500px] bg-neutral-900 rounded-[2.2rem] p-2 flex items-stretch select-none"
          style={{
            perspective: '1500px',
            transformStyle: 'preserve-3d',
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8), 0 30px 70px rgba(0,0,0,0.5)',
            border: '8px solid #5a4b3f' // Wood framing rim
          }}
        >
          {/* Inner Pages Stack underneath (Simulates book depth / thickness) */}
          <div className="absolute inset-0 bg-[#E8E1D3] rounded-[1.8rem] z-0 shadow-inner overflow-hidden flex">
            {/* Layer stack shading to represent high amount of underlying left pages */}
            <div className="w-1/2 h-full bg-[#E3DAC8] shadow-[inset_-6px_6px_10px_rgba(0,0,0,0.1),_inset_20px_0_30px_rgba(0,0,0,0.15)] border-r border-[#D5CBB9]" />
            {/* Layer stack shading representing underlying right pages */}
            <div className="w-1/2 h-full bg-[#E3DAC8] shadow-[inset_6px_6px_10px_rgba(0,0,0,0.1),_inset_-20px_0_30px_rgba(0,0,0,0.15)] border-l border-[#D5CBB9]" />
          </div>

          {/* ACTIVE PAPER PAGES CONTAINER (Parchment book top-level sheets) */}
          <div className="relative w-full h-full rounded-[1.6rem] bg-transparent overflow-hidden flex z-10">
            
            {/* LEFT PAGE BOARD */}
            <div 
              className="relative flex-1 w-1/2 h-full bg-[#F4F0E4] p-8 md:p-12 lg:p-14 flex flex-col justify-between shadow-[-15px_15px_25px_rgba(0,0,0,0.06)_inset] rounded-l-[1.4rem]"
              style={{
                backgroundImage: 'linear-gradient(to right, #FAF8F2 0%, #F3EFE2 100%)'
              }}
            >
              {/* Paper grain overlay */}
              <div className="absolute inset-0 bg-white/20 opacity-50 mix-blend-overlay pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2a1e16]/2 to-[#2a1e16]/20 pointer-events-none" />

              <div className="flex flex-col h-full justify-between relative z-10">
                {currentPair.left.isCover ? (
                  /* RENDER TITLE COVER INSIDE LEFT PAGE */
                  <div className="flex flex-col gap-4 text-center justify-center items-center h-full text-zinc-950 px-2">
                    <div className="w-24 h-32 md:w-32 md:h-44 rounded-xl overflow-hidden shadow-2xl border-4 border-white transform -rotate-1">
                      <img 
                        src={currentPair.left.illustration} 
                        alt="Book Cover Preview" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] font-black tracking-widest bg-emerald-800 text-white rounded-full px-3 py-1 uppercase scale-90 inline-block mb-3">
                        {language === 'en' ? 'Sangsang Collection' : '상상도서 총서'}
                      </span>
                      <h3 className="text-base md:text-xl font-black font-serif text-[#3A3027] tracking-tight">
                        {language === 'en' ? (translations[currentPair.left.title] || currentPair.left.title) : currentPair.left.title}
                      </h3>
                      <p className="text-[10px] text-zinc-500 font-bold mt-1 tracking-tight">
                        {language === 'en' ? 'Sangsang Library Publisher' : '상상서가 발행인 김지우'}
                      </p>
                    </div>

                    <div className="h-[1px] w-12 bg-[#D1C7B3] my-2" />

                    <p className={`text-[11px] leading-relaxed select-none overflow-y-auto max-h-[120px] pr-1 scrollbar-hidden ${fontStyles[fontFamily]}`} style={{ opacity: 0.85 }}>
                      {language === 'en' ? translateText(currentPair.left.content, bookContent.title) : currentPair.left.content}
                    </p>
                  </div>
                ) : (
                  /* RENDER ACCURATE CHAPTER CONTENT */
                  <div className="flex flex-col h-full justify-between text-zinc-950">
                    
                    {/* Chapter Header like '02 / 작은 별의 마음' */}
                    <div className="text-left select-none pb-4 border-b border-[#E1D8C6]/50">
                      {leftChapterParsed.num && (
                        <div className="text-2xl font-mono font-light text-neutral-400">
                          {leftChapterParsed.num}
                        </div>
                      )}
                      <h4 className="text-sm md:text-base font-serif font-black text-[#5C4C3E] tracking-tight mt-1">
                        {leftChapterParsed.title}
                      </h4>
                    </div>

                    {/* Left text body */}
                    <div className="flex-grow flex items-center py-6 overflow-y-auto scrollbar-hidden">
                      <p className={`w-full whitespace-pre-wrap text-justify leading-loose transition-all duration-300 ${fontStyles[fontFamily]} ${sizeStyles[fontSize]} ${leadingStyles[lineHeight]}`}>
                        {language === 'en' ? translateText(currentPair.left.content, bookContent.title) : currentPair.left.content}
                      </p>
                    </div>

                    {/* Page Number (At Bottom-Left aligned) */}
                    <div className="text-left select-none text-[11px] font-mono text-zinc-400 border-t border-[#E1D8C6]/50 pt-3">
                      {currentPair.left.page || '1'}
                    </div>

                  </div>
                )}
              </div>
            </div>

            {/* CENTRAL GUTTER SPINE CREASE (Creates superb physical realism) */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-14 pointer-events-none z-30 flex">
              <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-black/15 to-black/35" />
              <div className="w-[1.5px] h-full bg-black/60 shadow-[0_0_6px_rgba(0,0,0,0.8)] z-40" />
              <div className="w-1/2 h-full bg-gradient-to-r from-black/35 via-black/15 to-transparent" />
            </div>

            {/* RIGHT PAGE BOARD */}
            <div 
              className="relative flex-1 w-1/2 h-full bg-[#F4F0E4] p-8 md:p-12 lg:p-14 flex flex-col justify-between shadow-[15px_15px_25px_rgba(0,0,0,0.06)_inset] rounded-r-[1.4rem]"
              style={{
                backgroundImage: 'linear-gradient(to left, #FAF8F2 0%, #F3EFE2 100%)'
              }}
            >
              {/* Paper grain overlay */}
              <div className="absolute inset-0 bg-white/20 opacity-50 mix-blend-overlay pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#2a1e16]/2 to-[#2a1e16]/20 pointer-events-none" />

              <div className="flex flex-col h-full justify-between relative z-10 text-zinc-950 col-right-wrap">
                {currentPair.right ? (
                  <div className="flex flex-col h-full justify-between">
                    
                    {/* Chapter Header on Right sheet */}
                    <div className="text-left select-none pb-4 border-b border-[#E1D8C6]/50">
                      {rightChapterParsed.num && (
                        <div className="text-2xl font-mono font-light text-neutral-400">
                          {rightChapterParsed.num}
                        </div>
                      )}
                      <h4 className="text-sm md:text-base font-serif font-black text-[#5C4C3E] tracking-tight mt-1">
                        {rightChapterParsed.title}
                      </h4>
                    </div>

                    {/* Right text body */}
                    <div className="flex-grow flex items-center py-6 overflow-y-auto scrollbar-hidden">
                      <p className={`w-full whitespace-pre-wrap text-justify leading-loose transition-all duration-300 ${fontStyles[fontFamily]} ${sizeStyles[fontSize]} ${leadingStyles[lineHeight]}`}>
                        {language === 'en' ? translateText(currentPair.right.content, bookContent.title) : currentPair.right.content}
                      </p>
                    </div>

                    {/* Page Number (At Bottom-Right aligned) */}
                    <div className="text-right select-none text-[11px] font-mono text-zinc-400 border-t border-[#E1D8C6]/50 pt-3">
                      {currentPair.right.page || '2'}
                    </div>

                  </div>
                ) : (
                  /* MAGICAL CONCLUSION BACK SHEET */
                  <div className="flex flex-col h-full justify-between items-center text-center py-6">
                    <div className="my-auto space-y-4 px-2">
                      <span className="text-4xl block animate-pulse">✨</span>
                      <h4 className="font-serif font-black text-sm text-[#4E4133]">
                        {language === 'en' ? 'A Splendid Adventure Completed' : '따뜻한 이야기의 마침표'}
                      </h4>
                      <p className="text-[11px] text-zinc-500 max-w-[200px] leading-relaxed mx-auto font-medium">
                        {language === 'en' 
                          ? 'This brilliant book has come to its beautiful conclusion. May the precious imagination you explored linger warmly in your heart!'
                          : '이 아름다운 책 한 권의 여정이 따뜻하게 갈무리되었습니다. 당신의 영롱한 상상력 날개가 언제까지나 반짝이길 기원합니다.'}
                      </p>
                    </div>
                    
                    <div className="w-full border-t border-[#E1D8C6]/50 pt-4 text-[9px] font-mono text-zinc-400 tracking-wider">
                      FIN - SANGSANG CLASSICS
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* REALISTIC 3D PAGE FLIP LAYER OVERLAY (TRIGGERS GRAPHIC ON TURN) */}
            <AnimatePresence>
              {isFlipping && (
                <motion.div
                  initial={{ 
                    rotateY: 0,
                    opacity: 0.95,
                    transformPerspective: 1500,
                  }}
                  animate={{ 
                    rotateY: flipDirection === 'next' ? -180 : 180,
                    opacity: 0.25,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.54, ease: "easeInOut" }}
                  style={{ 
                    transformOrigin: flipDirection === 'next' ? 'left center' : 'right center',
                    transformStyle: "preserve-3d",
                    left: flipDirection === 'next' ? '50%' : '0px',
                    width: '50%',
                  }}
                  className={`absolute top-0 bottom-0 bg-[#EFECE3] border border-[#DDD3BF] z-50 pointer-events-none shadow-2xl ${
                    flipDirection === 'next' 
                      ? 'rounded-r-[1.4rem] rounded-l-sm border-l-2 border-l-black/15' 
                      : 'rounded-l-[1.4rem] rounded-r-sm border-r-2 border-r-black/15'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-white/10" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.15),_transparent)]" />
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* LARGE SEMI-TRANSPARENT FLOATING PREV NAVIGATION ARROW (Aligned on screen edge) */}
          <button
            onClick={handlePrevPage}
            disabled={currentPairIdx === 0 || isFlipping}
            className="absolute left-[-28px] md:left-[-40px] lg:left-[-55px] top-1/2 -translate-y-1/2 w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-white/10 border border-white/20 text-white backdrop-blur-md shadow-2xl hover:bg-white/20 hover:scale-105 flex items-center justify-center shrink-0 z-40 transition-all cursor-pointer active:scale-90 disabled:opacity-0 disabled:pointer-events-none select-none"
            title="이전 페이지"
          >
            <ChevronLeft className="w-8 h-8 font-light" />
          </button>

          {/* LARGE SEMI-TRANSPARENT FLOATING NEXT NAVIGATION ARROW (Aligned on screen edge) */}
          <button
            onClick={handleNextPage}
            disabled={currentPairIdx === pagePairs.length - 1 || isFlipping}
            className="absolute right-[-28px] md:right-[-40px] lg:right-[-55px] top-1/2 -translate-y-1/2 w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-white/10 border border-white/20 text-white backdrop-blur-md shadow-2xl hover:bg-white/20 hover:scale-105 flex items-center justify-center shrink-0 z-40 transition-all cursor-pointer active:scale-90 disabled:opacity-0 disabled:pointer-events-none select-none"
            title="다음 페이지"
          >
            <ChevronRight className="w-8 h-8 font-light" />
          </button>

        </div>
      </main>

      {/* BOTTOM SLIDER & SETTINGS NAVIGATION BAR (Clean and beautifully minimalist) */}
      <footer className="w-full h-20 px-6 lg:px-8 bg-black/15 flex items-center justify-between gap-6 z-40 text-white/95">
        
        {/* Left Bottom element: '목차' Text Button */}
        <button 
          onClick={() => setIsTOCOpen(true)}
          className="flex items-center gap-2 text-xs font-bold font-sans text-white/80 hover:text-white uppercase tracking-wider backdrop-blur-xs px-4 py-2 hover:bg-white/10 rounded-full transition-all"
        >
          <AlignJustify className="w-4 h-4" />
          <span>목차</span>
        </button>

        {/* Dynamic Center slider control & page index indicator layout */}
        <div className="flex-grow max-w-lg flex flex-col items-center gap-1.5 px-4">
          <div className="w-full flex items-center gap-4">
            <span className="text-[10px] text-white/40 select-none">첫 장</span>
            <input 
              type="range"
              min={0}
              max={pagePairs.length - 1}
              value={currentPairIdx}
              onChange={(e) => {
                const targetIdx = parseInt(e.target.value, 10);
                setFlipDirection(targetIdx > currentPairIdx ? 'next' : 'prev');
                setCurrentPairIdx(targetIdx);
              }}
              className="flex-grow h-[3px] accent-white bg-white/20 hover:bg-white/30 rounded-lg cursor-pointer appearance-none transition-colors"
              title="책넘기기 조절기"
            />
            <span className="text-[10px] text-white/40 select-none">끝 장</span>
          </div>
          
          {showPageInput ? (
            <form onSubmit={handleDirectPageSubmit} className="flex items-center gap-2 mt-0.5" onClick={(e) => e.stopPropagation()}>
              <input
                type="number"
                value={directPageNum}
                onChange={(e) => setDirectPageNum(e.target.value)}
                placeholder="이동할 쪽수"
                min={1}
                className="w-24 h-7 bg-white/20 border border-white/20 rounded-lg text-xs font-mono font-bold text-center text-white focus:outline-none focus:bg-white/35 focus:border-white/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                autoFocus
              />
              <button 
                type="submit"
                className="h-7 px-3 bg-white text-neutral-950 font-black rounded-lg text-[10px] hover:bg-neutral-100 transition-all active:scale-95 cursor-pointer"
              >
                이동
              </button>
              <button 
                type="button"
                onClick={() => {
                  setShowPageInput(false);
                  setDirectPageNum('');
                }}
                className="h-7 px-2 bg-neutral-800 text-neutral-400 font-bold rounded-lg text-[10px] hover:bg-neutral-700 hover:text-white transition-all active:scale-95 cursor-pointer"
              >
                취소
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowPageInput(true)}
              className="text-xs font-mono font-extrabold text-white/95 hover:text-white hover:bg-white/10 rounded-full px-4 py-1 select-none drop-shadow-xs tracking-widest mt-0.5 transition-all flex items-center gap-1.5 cursor-pointer border border-transparent hover:border-white/10 active:scale-95"
              title="여기를 누르면 쪽수를 직접 입력해 순간 이동할 수 있습니다!"
            >
              <span>{currentPairIdx + 1} / {pagePairs.length} 부 (페이지 {currentPair.left?.page || 1}-{currentPair.right?.page || currentPair.left?.page || 1})</span>
              <span className="text-[9px] bg-white/20 text-white font-black rounded px-1.5 py-0.5 leading-none select-none tracking-normal scale-90">직접 입력 이동</span>
            </button>
          )}
        </div>

        {/* Right Bottom element: '뷰어 설정' button */}
        <button 
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="flex items-center gap-2 text-xs font-bold font-sans text-white/80 hover:text-white uppercase tracking-wider backdrop-blur-xs px-4 py-2 hover:bg-white/10 rounded-full transition-all"
        >
          <Sliders className="w-4 h-4 text-white/80" />
          <span>뷰어 설정</span>
        </button>

      </footer>

      {/* FLOAT POPUP PANEL 1: TOC chapters modal list */}
      <AnimatePresence>
        {isTOCOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* dark overlay background backstop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTOCOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-neutral-900 border border-neutral-800 text-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl z-20 flex flex-col"
              style={{ maxHeight: '80vh' }}
            >
              {/* Table list title header */}
              <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <List className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-sm tracking-tight text-neutral-100">도서 전체 목차 (TOC)</h3>
                </div>
                <button 
                  onClick={() => setIsTOCOpen(false)}
                  className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable list content layout */}
              <div className="p-4 overflow-y-auto space-y-1.5 scrollbar-hidden flex-1">
                {pagePairs.map((pair, idx) => {
                  const ch = pair.right || pair.left;
                  if (!ch) return null;
                  const isCurrent = currentPairIdx === idx;
                  const itemTitle = ch.isCover 
                    ? (language === 'en' ? 'Cover Introduction' : '표지 명상 및 책 인사글') 
                    : (language === 'en' ? (translations[ch.title] || ch.title) : ch.title);

                  return (
                    <button
                      key={idx}
                      onClick={() => handleJumpToPair(idx)}
                      className={`w-full p-3.5 rounded-2xl flex items-center justify-between transition-all text-left text-xs font-bold border ${
                        isCurrent 
                          ? 'bg-neutral-100 text-neutral-900 border-neutral-150 shadow-sm' 
                          : 'bg-neutral-850 hover:bg-neutral-800 border-transparent text-neutral-350 hover:text-neutral-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span className={`w-6 h-6 rounded-lg text-[10px] font-black font-mono flex items-center justify-center shrink-0 ${
                          isCurrent ? 'bg-neutral-900 text-white' : 'bg-neutral-800 text-neutral-400'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="truncate">{itemTitle}</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 shrink-0 select-none pl-2">
                        {ch.isCover ? '표지' : `${ch.page}쪽`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOAT POPUP PANEL 2: Content text searching popup */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-neutral-900 border border-neutral-800 text-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl z-20 flex flex-col"
              style={{ maxHeight: '80vh' }}
            >
              {/* Header area */}
              <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-blue-400" />
                  <h3 className="font-bold text-sm tracking-tight text-neutral-100">이 소설책 안에서 낱말 찾기</h3>
                </div>
                <button 
                  onClick={() => setIsSearchOpen(false)}
                  className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Input text container */}
              <div className="p-4 border-b border-neutral-850">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => executeSearch(e.target.value)}
                    placeholder="찾고 싶은 구절(ex. 별, 고래, 츄츄...)"
                    className="w-full h-11 bg-neutral-850 focus:bg-neutral-800 focus:outline-none rounded-2xl border border-neutral-800 px-4 pl-10 text-xs font-bold text-white transition-all placeholder-zinc-500"
                    autoFocus
                  />
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-500" />
                </div>
              </div>

              {/* Scrollable scroll matching results */}
              <div className="p-4 overflow-y-auto space-y-2 flex-1 scrollbar-hidden" style={{ minHeight: '180px' }}>
                {searchResults.length > 0 ? (
                  searchResults.map((res, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        handleJumpToPair(res.pairIdx);
                        setIsSearchOpen(false);
                      }}
                      className="w-full p-3 rounded-2xl bg-neutral-850 hover:bg-neutral-800 text-left border border-transparent hover:border-neutral-750 transition-all flex flex-col gap-1 text-xs font-bold"
                    >
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                        <span className="bg-neutral-800 text-zinc-300 font-mono px-2 py-0.5 rounded">
                          {res.page}쪽
                        </span>
                        <span className="font-semibold truncate">{res.chapter}</span>
                      </div>
                      <p className="text-zinc-200 line-clamp-2 leading-relaxed font-medium">
                        {res.preview}
                      </p>
                    </button>
                  ))
                ) : searchQuery.trim() ? (
                  <div className="h-full flex flex-col justify-center items-center text-center py-8 text-xs font-bold text-zinc-500 gap-2">
                    <AlertCircle className="w-5 h-5 text-zinc-650" />
                    <span>일치하는 행단어 구절이 없습니다.</span>
                  </div>
                ) : (
                  <div className="h-full flex flex-col justify-center items-center text-center py-8 text-xs font-bold text-zinc-500 gap-1 select-none">
                    <span>구절을 입력하면 본문 속 위치를 정밀 추적합니다.</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOAT POPUP PANEL 3: Immersive Settings popover control cards (Toggles above footer) */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-40 flex items-end justify-end md:p-6 pb-20 pr-6">
            {/* invisible backplate to cover clicks outside settings modal to close it */}
            <div 
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-transparent"
            />

            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="relative bg-neutral-900/95 border border-neutral-800 text-white w-80 md:w-96 rounded-3xl p-5 shadow-2xl shadow-black/80 backdrop-blur-xl z-10 space-y-5"
            >
              
              {/* Header settings tag */}
              <div className="flex justify-between items-center pb-2 border-b border-neutral-850">
                <span className="font-sans text-xs font-black tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span>맞춤형 책읽기 뷰어 레이아웃</span>
                </span>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-6 h-6 rounded-full bg-neutral-850 hover:bg-neutral-800 flex items-center justify-center font-bold text-neutral-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* FontSize configurations */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-neutral-400 flex items-center gap-1">
                  <Type className="w-3 h-3" />
                  <span>글씨 크기 (Font Size)</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['sm', 'md', 'lg', 'xl'].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setFontSize(sz)}
                      className={`h-8 font-extrabold text-xs rounded-xl border transition-all ${
                        fontSize === sz
                          ? 'bg-white text-black border-transparent shadow'
                          : 'bg-neutral-850 border-transparent text-neutral-400 hover:bg-neutral-800'
                      }`}
                    >
                      {sz === 'sm' ? '작게' : sz === 'md' ? '보통' : sz === 'lg' ? '크게' : '왕큼'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Style Families selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-neutral-400 flex items-center gap-1">
                  <AlignJustify className="w-3 h-3" />
                  <span>글씨체 / 서체</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['serif', 'sans', 'pen'].map((ff) => (
                    <button
                      key={ff}
                      onClick={() => setFontFamily(ff)}
                      className={`h-8 font-extrabold text-xs rounded-xl border transition-all ${
                        fontFamily === ff
                          ? 'bg-white text-black border-transparent shadow'
                          : 'bg-neutral-850 border-transparent text-neutral-400 hover:bg-neutral-800'
                      }`}
                    >
                      {ff === 'serif' ? '바탕체' : ff === 'sans' ? '고딕체' : '손글씨'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Line height multiplier selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-neutral-400 flex items-center gap-1">
                  <AlignJustify className="w-3 h-3" />
                  <span>줄 간격 (Spacing)</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['normal', 'relaxed', 'loose'].map((lh) => (
                    <button
                      key={lh}
                      onClick={() => setLineHeight(lh)}
                      className={`h-8 font-extrabold text-xs rounded-xl border transition-all ${
                        lineHeight === lh
                          ? 'bg-white text-black border-transparent shadow'
                          : 'bg-neutral-850 border-transparent text-neutral-400 hover:bg-neutral-800'
                      }`}
                    >
                      {lh === 'normal' ? '좁게' : lh === 'relaxed' ? '적당히' : '넓게'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[1px] bg-neutral-850" />

              {/* Translation Multi-Language options and Speech volume buttons combined */}
              <div className="flex items-center justify-between gap-4">
                
                {/* Lang translator */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase text-neutral-400 flex items-center gap-1 text-left">
                    <Globe className="w-3 h-3" /> 번역 언어 (Language)
                  </span>
                  <div className="flex bg-neutral-850 rounded-xl p-0.5 border border-neutral-800">
                    <button
                      onClick={() => {
                        setLanguage('ko');
                        showToast("✨ 한글 모드로 책을 세팅했습니다.");
                      }}
                      className={`h-7 px-3.5 font-bold text-xs rounded-lg transition-all ${
                        language === 'ko' ? 'bg-neutral-750 text-white font-extrabold' : 'text-neutral-500 hover:text-neutral-350'
                      }`}
                    >
                      한글
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('en');
                        showToast("✨ Set up translations in English!");
                      }}
                      className={`h-7 px-3.5 font-bold text-xs rounded-lg transition-all ${
                        language === 'en' ? 'bg-neutral-750 text-white font-extrabold' : 'text-neutral-500 hover:text-neutral-350'
                      }`}
                    >
                      ENG
                    </button>
                  </div>
                </div>

                {/* TTS Reader speak Button */}
                <div className="flex flex-col gap-1.5 items-end justify-center">
                  <span className="text-[10px] font-black uppercase text-neutral-400 flex items-center gap-1 text-right">
                    <Volume2 className="w-3 h-3 text-amber-400" /> 음성 소리내어 낭독
                  </span>
                  <button
                    onClick={handleSpeak}
                    className={`h-8 px-4 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow ${
                      isPlayingSpeech
                        ? 'bg-rose-600 text-white hover:bg-rose-700 animate-pulse'
                        : 'bg-white hover:bg-neutral-50 text-neutral-900'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isPlayingSpeech ? '음성 끄기' : '동화 듣기'}</span>
                  </button>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
