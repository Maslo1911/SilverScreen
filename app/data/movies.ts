// app/data/movies.ts
export interface Movie {
  id: number;
  title: string;
  year: number;
  country: string;
  rating: number;
  image: string;
  description: string;
  director: string;
  screenwriter: string;
  operator: string;
  producer: string;
  composer: string;
  budget: string;
  bestReview: {
    author: string;
    rating: number;
    text: string;
    likes: number;
  };
  reviews: Array<{
    author: string;
    rating: number;
    text: string;
    likes: number;
  }>;
}

export const allMovies: Movie[] = [
  {
    id: 1,
    title: "Дракула",
    year: 2025,
    country: "Франция",
    rating: 8.5,
    image: "/images/movies/image 1.jpg",
    description: "Князь Влад теряет жену и становится вампиром. 400 лет поисков — и он находит её реинкарнацию в Париже XIX века.",
    director: "Люк Бессон",
    screenwriter: "Люк Бессон, Брэм Стокер",
    operator: "Коли Ундерсон",
    producer: "Дороти Кэнтон, Марк Кэнтон",
    composer: "Дэнни Элфман",
    budget: "€45 000 000",
    bestReview: {
      author: "Darya Prokopova",
      rating: 4,
      text: "Люк Бессон снял не хоррор, а сентиментальную мелодраму уровня «Сумерек». Режиссёр честно признался, что терпеть не может «кровь и зубы», поэтому превратил князя тьмы в тоскующего романтика, который 400 лет ищет любовь.",
      likes: 968
    },
    reviews: [
      { author: "Alexey Morozov", rating: 5, text: "Визуально один из самых красивых фильмов года. Атмосфера Парижа XIX века просто завораживает.", likes: 1240 },
      { author: "Elena Petrova", rating: 3, text: "Слишком много романтики и мало хоррора. Для фанатов «Сумерек» — идеально, для любителей классического Дракулы — разочарование.", likes: 432 },
      { author: "Ivan Sokolov", rating: 4, text: "Отличная игра главных актёров. Финал оставляет послевкусие, хотя и спорный.", likes: 789 },
      { author: "Maria Volkova", rating: 2, text: "Очень затянуто. После первого часа уже хотелось выключить.", likes: 156 }
    ]
  },
  {
    id: 2,
    title: "Пророк",
    year: 2025,
    country: "Россия",
    rating: 8.5,
    image: "/images/movies/prorok_det.jpg",
    description: "Эпическая биографическая драма о жизни и духовном пути одного из самых загадочных религиозных деятелей России.",
    director: "Андрей Звягинцев",
    screenwriter: "Олег Негин",
    operator: "Александр Симонов",
    producer: "Александр Роднянский",
    composer: "Филипп Гласс",
    budget: "₽420 000 000",
    bestReview: {
      author: "Ivan Sokolov",
      rating: 5,
      text: "Звягинцев снова на высоте. Фильм, который заставляет думать и переосмысливать свою жизнь. Одна из сильнейших работ режиссёра.",
      likes: 1342
    },
    reviews: [
      { author: "Darya Prokopova", rating: 5, text: "Глубокий, тяжёлый и очень честный фильм. Мастерская работа со светом и актёрской игрой.", likes: 987 },
      { author: "Alexey Morozov", rating: 4, text: "Медленный темп, но это именно то, что нужно для такого материала.", likes: 654 },
      { author: "Elena Petrova", rating: 3, text: "Слишком мрачно и депрессивно даже для Звягинцева.", likes: 321 },
      { author: "Maria Volkova", rating: 5, text: "Лучший российский фильм 2025 года. Обязателен к просмотру.", likes: 1123 }
    ]
  },
  {
    id: 3,
    title: "Выживший",
    year: 2025,
    country: "США",
    rating: 8.2,
    image: "/images/movies/vyzhivshii_det.jpg",
    description: "В мире, уничтоженном катастрофой, небольшая группа людей пытается выжить и сохранить человечность.",
    director: "Джордж Миллер",
    screenwriter: "Джордж Миллер",
    operator: "Джон Сил",
    producer: "Дуг Митчелл",
    composer: "Том Холкенборг",
    budget: "$180 000 000",
    bestReview: {
      author: "Alexey Morozov",
      rating: 5,
      text: "Визуально невероятный фильм. Джордж Миллер доказал, что может делать не только безумные экшен-фильмы, но и глубокие драмы.",
      likes: 1456
    },
    reviews: [
      { author: "Ivan Sokolov", rating: 4, text: "Отличный саунд-дизайн и операторская работа. Напряжение держит до последних минут.", likes: 876 },
      { author: "Darya Prokopova", rating: 4, text: "Хороший баланс экшена и драмы. Не ожидала такого уровня от постапокалипсиса.", likes: 743 },
      { author: "Elena Petrova", rating: 3, text: "Местами слишком предсказуемо.", likes: 289 },
      { author: "Maria Volkova", rating: 5, text: "Шедевр жанра. Буду пересматривать.", likes: 934 }
    ]
  },
  {
    id: 4,
    title: "Поезд на Юму",
    year: 2007,
    country: "США",
    rating: 8.1,
    image: "/images/movies/poezd-na-yumu_det.webp",
    description: "Честный фермер соглашается доставить опасного преступника в тюрьму, чтобы спасти свою семью.",
    director: "Джеймс Мангольд",
    screenwriter: "Майкл Брандт, Дерек Хаас",
    operator: "Фил Мехе",
    producer: "Кэти Конрад",
    composer: "Марко Белтрами",
    budget: "$55 000 000",
    bestReview: {
      author: "Elena Petrova",
      rating: 5,
      text: "Классика современного вестерна. Химия между Кристианом Бейлом и Расселом Кроу на высшем уровне.",
      likes: 1123
    },
    reviews: [
      { author: "Ivan Sokolov", rating: 5, text: "Один из лучших вестернов XXI века. Напряжение и моральные дилеммы на каждом шагу.", likes: 945 },
      { author: "Darya Prokopova", rating: 4, text: "Отличный сценарий и актёрская игра.", likes: 678 },
      { author: "Alexey Morozov", rating: 4, text: "Сильный фильм, но концовка могла быть лучше.", likes: 521 },
      { author: "Maria Volkova", rating: 3, text: "Для меня слишком затянуто.", likes: 234 }
    ]
  },
  {
    id: 5,
    title: "Эйфель",
    year: 2021,
    country: "Франция",
    rating: 8.3,
    image: "/images/movies/eifel_det.jpg",
    description: "История любви и создания самого знаменитого символа Парижа — Эйфелевой башни.",
    director: "Мартен Бурбулон",
    screenwriter: "Каролин Томпсон",
    operator: "Матьё Вадепон",
    producer: "Ванесса Дюваль",
    composer: "Александр Деспла",
    budget: "€20 000 000",
    bestReview: {
      author: "Darya Prokopova",
      rating: 4,
      text: "Очень красивая и романтичная история. Париж снят потрясающе.",
      likes: 834
    },
    reviews: [
      { author: "Elena Petrova", rating: 5, text: "Фильм, после которого хочется поехать в Париж.", likes: 723 },
      { author: "Ivan Sokolov", rating: 4, text: "Хорошая актёрская игра и прекрасная музыка.", likes: 612 },
      { author: "Maria Volkova", rating: 3, text: "Местами слишком слащаво.", likes: 298 },
      { author: "Alexey Morozov", rating: 4, text: "Отличная работа оператора.", likes: 541 }
    ]
  },
  {
    id: 6,
    title: "Левша",
    year: 2026,
    country: "Россия",
    rating: 7.9,
    image: "/images/movies/levsha_det(1).png",
    description: "Экранизация повести Николая Лескова о талантливом тульском оружейнике.",
    director: "Никита Михалков",
    screenwriter: "Никита Михалков",
    operator: "Владимир Климов",
    producer: "Никита Михалков",
    composer: "Эдуард Артемьев",
    budget: "₽850 000 000",
    bestReview: {
      author: "Ivan Sokolov",
      rating: 4,
      text: "Михалков вернулся в хорошей форме. Красивая, патриотичная и очень русская картина.",
      likes: 789
    },
    reviews: [
      { author: "Darya Prokopova", rating: 4, text: "Отличная работа с историческим материалом.", likes: 654 },
      { author: "Elena Petrova", rating: 3, text: "Слишком много пафоса.", likes: 312 },
      { author: "Alexey Morozov", rating: 5, text: "Лучшая экранизация Лескова за последние годы.", likes: 923 },
      { author: "Maria Volkova", rating: 4, text: "Прекрасные костюмы и декорации.", likes: 567 }
    ]
  },
  {
    id: 7,
    title: "Джек Булл",
    year: 1999,
    country: "США",
    rating: 7.6,
    image: "/images/movies/jack-bull_det(1).jpeg",
    description: "История о человеке, который готов пойти на всё ради справедливости.",
    director: "Джон Бэдэм",
    screenwriter: "Стивен Блум",
    operator: "Гейл Таттерсолл",
    producer: "Роберт Редфорд",
    composer: "Лоуренс Шварц",
    budget: "$10 000 000",
    bestReview: {
      author: "Elena Petrova",
      rating: 4,
      text: "Крепкий вестерн с отличной актёрской игрой. Незаслуженно забытый фильм.",
      likes: 543
    },
    reviews: [
      { author: "Ivan Sokolov", rating: 4, text: "Хороший сюжет и динамика.", likes: 478 },
      { author: "Darya Prokopova", rating: 3, text: "Немного устаревшая картинка.", likes: 289 },
      { author: "Maria Volkova", rating: 5, text: "Один из любимых вестернов.", likes: 612 },
      { author: "Alexey Morozov", rating: 4, text: "Сильная моральная история.", likes: 398 }
    ]
  },
  {
    id: 8,
    title: "Девятая",
    year: 2019,
    country: "Россия",
    rating: 7.2,
    image: "/images/movies/devyataya_det.jpg",
    description: "Мистический триллер о девушке, обладающей необычными способностями.",
    director: "Сарик Андреасян",
    screenwriter: "Сарик Андреасян",
    operator: "Антон Зенкович",
    producer: "Сарик Андреасян",
    composer: "Артём Федоров",
    budget: "₽180 000 000",
    bestReview: {
      author: "Alexey Morozov",
      rating: 3,
      text: "Хорошая атмосфера, но слабый сценарий и предсказуемая концовка.",
      likes: 367
    },
    reviews: [
      { author: "Darya Prokopova", rating: 2, text: "Очень разочарована. Ожидала большего от Андреасяна.", likes: 189 },
      { author: "Elena Petrova", rating: 4, text: "Напряжение держит хорошо, особенно ночью смотреть страшно.", likes: 456 },
      { author: "Ivan Sokolov", rating: 3, text: "Средний российский хоррор.", likes: 278 },
      { author: "Maria Volkova", rating: 4, text: "Хорошие спецэффекты для российского кино.", likes: 389 }
    ]
  },
  {
    id: 9,
    title: "Дориан Грей",
    year: 2009,
    country: "Великобритания",
    rating: 7.7,
    image: "/images/movies/dorrian-gray_det.jpg",
    description: "Современная экранизация классического романа Оскара Уайльда.",
    director: "Оливер Паркер",
    screenwriter: "Тоби Финли",
    operator: "Гиллиан Диксон",
    producer: "Дэвид Никольс",
    composer: "Чарли Клоузер",
    budget: "$20 000 000",
    bestReview: {
      author: "Darya Prokopova",
      rating: 4,
      text: "Стильная и атмосферная экранизация. Бен Барнс идеально смотрится в роли Дориана.",
      likes: 712
    },
    reviews: [
      { author: "Elena Petrova", rating: 5, text: "Очень красиво снято. Один из лучших фильмов по Уайльду.", likes: 834 },
      { author: "Ivan Sokolov", rating: 4, text: "Хорошая игра главных актёров.", likes: 623 },
      { author: "Maria Volkova", rating: 3, text: "Местами слишком современно для классики.", likes: 345 },
      { author: "Alexey Morozov", rating: 4, text: "Отличный саундтрек.", likes: 521 }
    ]
  },
  {
    id: 10,
    title: "Дэдвуд",
    year: 2019,
    country: "США",
    rating: 8.3,
    image: "/images/movies/dedvud_det.jpg",
    description: "Жестокий и реалистичный взгляд на жизнь в лагере золотоискателей Дэдвуд.",
    director: "Неизвестен",
    screenwriter: "Неизвестен",
    operator: "Неизвестен",
    producer: "Неизвестен",
    composer: "Неизвестен",
    budget: "—",
    bestReview: {
      author: "Ivan Sokolov",
      rating: 5,
      text: "Один из лучших современных вестернов. Грязный, жестокий и очень реалистичный.",
      likes: 1023
    },
    reviews: [
      { author: "Darya Prokopova", rating: 5, text: "Атмосфера на высшем уровне. Чувствуешь себя в настоящем Дэдвуде.", likes: 945 },
      { author: "Alexey Morozov", rating: 4, text: "Очень сильный актёрский состав.", likes: 678 },
      { author: "Elena Petrova", rating: 4, text: "Не для слабонервных.", likes: 543 },
      { author: "Maria Volkova", rating: 3, text: "Слишком много жестокости.", likes: 289 }
    ]
  }
];