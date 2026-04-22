'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Star, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getReviewsForMovie } from '@/app/lib/reviews';

const featuredReview = {
  title: "Я - легенда",
  year: 2007,
  country: "США, Великобритания",
  rating: 7.9,
  image: "/images/movies/Legend.png",
  review: "Уилл Смит тащит весь фильм на своих плечах — при том, что большую часть экранного времени он разговаривает с манекеном и собакой. Атмосфера пустого Нью-Йорка давит, мурашки гарантированы...",
  genres: ["Ужасы", "Драма", "Боевик"]
};

// Локальный массив фильмов (все поля, включая bestReview и reviews)
const allMovies = [
  {
    id: 1,
    title: "Дракула",
    year: 2025,
    country: "Великобритания",
    rating: 7.9,
    genres: ["Ужасы", "Мелодрама"],
    image: "/images/movies/image 4.png",
    bestReview: { rating: 4 },
    reviews: [{ rating: 5 }, { rating: 3 }]
  },
  {
    id: 2,
    title: "Пророк",
    year: 2025,
    country: "Россия",
    rating: 8.5,
    genres: ["Драма", "Биография"],
    image: "/images/movies/image 5.png",
    bestReview: { rating: 5 },
    reviews: [{ rating: 5 }, { rating: 4 }]
  },
  {
    id: 3,
    title: "Выживший",
    year: 2025,
    country: "США",
    rating: 8.2,
    genres: ["Боевик", "Приключения"],
    image: "/images/movies/image 6.png",
    bestReview: { rating: 5 },
    reviews: [{ rating: 4 }, { rating: 3 }]
  },
  {
    id: 4,
    title: "Поезд на Юму",
    year: 2007,
    country: "США",
    rating: 8.1,
    genres: ["Боевик", "Драма"],
    image: "/images/movies/image 7.png",
    bestReview: { rating: 5 },
    reviews: [{ rating: 5 }, { rating: 4 }]
  },
  {
    id: 5,
    title: "Эйфель",
    year: 2021,
    country: "Франция",
    rating: 8.3,
    genres: ["Биография", "Драма"],
    image: "/images/movies/image 8.png",
    bestReview: { rating: 4 },
    reviews: [{ rating: 5 }, { rating: 3 }]
  },
  {
    id: 6,
    title: "Левша",
    year: 2026,
    country: "Россия",
    rating: 7.9,
    genres: ["Исторические", "Фантастика"],
    image: "/images/movies/image 9.png",
    bestReview: { rating: 4 },
    reviews: [{ rating: 4 }, { rating: 3 }]
  },
  {
    id: 7,
    title: "Джек Булл",
    year: 1999,
    country: "США",
    rating: 7.6,
    genres: ["Драма", "Вестерн"],
    image: "/images/movies/image 10.png",
    bestReview: { rating: 4 },
    reviews: [{ rating: 4 }, { rating: 3 }]
  },
  {
    id: 8,
    title: "Девятая",
    year: 2019,
    country: "Россия",
    rating: 7.2,
    genres: ["Триллеры", "Ужасы"],
    image: "/images/movies/image 11.png",
    bestReview: { rating: 3 },
    reviews: [{ rating: 2 }, { rating: 4 }]
  },
  {
    id: 9,
    title: "Дориан Грей",
    year: 2009,
    country: "Великобритания",
    rating: 7.7,
    genres: ["Фэнтези", "Триллеры"],
    image: "/images/movies/image 12.png",
    bestReview: { rating: 4 },
    reviews: [{ rating: 5 }, { rating: 4 }]
  },
  {
    id: 10,
    title: "Дэдвуд",
    year: 2019,
    country: "США",
    rating: 8.3,
    genres: ["Вестерн", "Криминал"],
    image: "/images/movies/image 13.png",
    bestReview: { rating: 5 },
    reviews: [{ rating: 5 }, { rating: 4 }]
  },
];

const allGenres = Array.from(new Set(allMovies.flatMap(m => m.genres)));

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [ratings, setRatings] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    const newRatings: { [key: number]: number } = {};
    allMovies.forEach(movie => {
      let ratingsArr: number[] = [];
      if (movie.bestReview?.rating) ratingsArr.push(movie.bestReview.rating);
      if (movie.reviews?.length) ratingsArr.push(...movie.reviews.map(r => r.rating));
      const userReviews = getReviewsForMovie(movie.id);
      ratingsArr.push(...userReviews.map(r => r.rating));
      if (ratingsArr.length === 0) {
        newRatings[movie.id] = movie.rating;
      } else {
        const sum = ratingsArr.reduce((a, b) => a + b, 0);
        newRatings[movie.id] = Math.round((sum / ratingsArr.length) * 10) / 10;
      }
    });
    setRatings(newRatings);
  }, []);

  const filteredMovies = useMemo(() => {
    return allMovies.filter(movie => {
      const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGenre = selectedGenre ? movie.genres.includes(selectedGenre) : true;
      return matchesSearch && matchesGenre;
    });
  }, [searchQuery, selectedGenre]);

  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);
  const paginatedMovies = filteredMovies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleFilterChange = (setter: any, value: any) => {
    setCurrentPage(1);
    setter(value);
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#1A1A1A]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white font-bold text-2xl">M</div>
              <span className="text-2xl font-semibold tracking-tight">Marka</span>
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              <Link href="/" className="text-black">Главная</Link>
              <Link href="/add-review" className="text-gray-600 hover:text-black">Добавить рецензию</Link>
            </nav>
          </div>
          <Link href="/profile" className="w-9 h-9 bg-teal-700 text-white rounded-full flex items-center justify-center font-medium hover:bg-teal-800 transition">П</Link>
        </div>
      </header>

      <div className="bg-[#0A0A0A] text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-white text-black rounded-3xl overflow-hidden shadow-2xl">
              <div className="relative">
                <img src={featuredReview.image} alt={featuredReview.title} className="w-full h-[420px] object-cover" />
                <div className="absolute top-4 left-4 bg-green-500 text-white text-sm font-bold px-3 py-1 rounded">{featuredReview.rating}</div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                  <span className="ml-2 text-sm text-gray-500">Великолепно!</span>
                </div>
                <h2 className="text-3xl font-semibold mb-1">{featuredReview.title}</h2>
                <p className="text-gray-500 mb-6">{featuredReview.year} • {featuredReview.country}</p>
                <p className="text-gray-600 leading-relaxed mb-8 line-clamp-6">{featuredReview.review}</p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {featuredReview.genres.map(g => <span key={g} className="px-4 py-1 bg-gray-100 rounded-full text-sm">{g}</span>)}
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl font-semibold leading-tight">Честные оценки.<br /><span className="text-[#4ADE80]">РЕАЛЬНЫЕ ОТЗЫВЫ.</span></h1>
              <p className="text-xl text-gray-300 max-w-md">Ставь оценки, пиши отзывы и помогай другим не терять время на посредственность.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск фильмов..."
              value={searchQuery}
              onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:border-purple-600"
            />
          </div>
          <select
            value={selectedGenre}
            onChange={(e) => handleFilterChange(setSelectedGenre, e.target.value)}
            className="px-4 py-3 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:border-purple-600"
          >
            <option value="">Все жанры</option>
            {allGenres.map(genre => <option key={genre} value={genre}>{genre}</option>)}
          </select>
        </div>

        {filteredMovies.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Фильмы не найдены</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
              {paginatedMovies.map((movie) => (
                <div key={movie.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-200 flex flex-col h-full">
                  <Link href={`/movie/${movie.id}`} className="block group">
                    <div className="relative">
                      <img src={movie.image} alt={movie.title} className="w-full aspect-[2/3] object-cover" />
                      <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded">
                        {ratings[movie.id] !== undefined ? ratings[movie.id].toFixed(1) : movie.rating}
                      </div>
                    </div>
                    <div className="p-5 pb-2">
                      <h3 className="font-semibold text-lg leading-tight mb-2 group-hover:text-purple-700 transition">{movie.title}</h3>
                      <p className="text-sm text-gray-500 mb-4">{movie.year} • {movie.country}</p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {movie.genres.map(g => <span key={g} className="text-[10px] bg-gray-100 px-3 py-1 rounded-full">{g}</span>)}
                      </div>
                    </div>
                  </Link>
                  <div className="px-5 pb-5 mt-auto">
                    <button
                      onClick={() => router.push(`/add-review?id=${movie.id}`)}
                      className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3.5 rounded-2xl text-sm font-medium transition"
                    >
                      Написать рецензию
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1} className="px-4 py-2 rounded-xl border bg-white disabled:opacity-50">←</button>
                <span className="px-4 py-2 text-gray-700">{currentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages} className="px-4 py-2 rounded-xl border bg-white disabled:opacity-50">→</button>
              </div>
            )}
          </>
        )}
      </div>

      <footer className="bg-[#F8F5F0] py-10 text-center text-sm text-gray-500 border-t">© Marka. Все права защищены</footer>
    </div>
  );
}