'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Star, ThumbsUp, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { allMovies } from '@/app/data/movies';
import { getReviewsForMovie, UserReview, likeReview, unlikeReview, hasUserLiked, getTotalLikes } from '@/app/lib/reviews';

type SortOption = 'newest' | 'oldest' | 'mostLiked' | 'highestRated';

// Функция для вычисления среднего рейтинга фильма
const calculateAverageRating = (movie: typeof allMovies[0], userReviews: UserReview[]) => {
  let ratings: number[] = [];
  if (movie.bestReview?.rating) ratings.push(movie.bestReview.rating);
  if (movie.reviews?.length) ratings.push(...movie.reviews.map(r => r.rating));
  ratings.push(...userReviews.map(r => r.rating));
  if (ratings.length === 0) return movie.rating;
  const sum = ratings.reduce((a, b) => a + b, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
};

export default function MovieDetail() {
  const params = useParams();
  const movieId = parseInt(params.id as string);
  const movie = allMovies.find(m => m.id === movieId);
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [, forceUpdate] = useState({});

  useEffect(() => {
    if (movieId) {
      const reviews = getReviewsForMovie(movieId);
      setUserReviews(reviews);
    }
  }, [movieId]);

  if (!movie) {
    return <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center text-2xl">Фильм не найден</div>;
  }

  // Вычисляем средний рейтинг
  const avgRating = calculateAverageRating(movie, userReviews);

  // Формируем список всех рецензий (статических + пользовательских) для отображения
  const staticReviews = movie.reviews?.map((r, idx) => ({
    id: `static_${movie.id}_${idx}`,
    author: r.author,
    rating: r.rating,
    text: r.text,
    baseLikes: r.likes,
    isUser: false,
    date: new Date(2024, 0, idx + 1).toISOString(),
  })) || [];
  const bestReview = movie.bestReview ? {
    id: `best_${movie.id}`,
    author: movie.bestReview.author,
    rating: movie.bestReview.rating,
    text: movie.bestReview.text,
    baseLikes: movie.bestReview.likes,
    isUser: false,
    date: new Date(2023, 11, 31).toISOString(),
  } : null;
  const dynamicReviews = userReviews.map(r => ({
    id: `user_${r.id}`,
    author: r.author,
    rating: r.rating,
    text: r.text,
    baseLikes: r.likes,
    isUser: true,
    date: r.date,
  }));

  const allReviewsRaw = bestReview ? [bestReview, ...staticReviews, ...dynamicReviews] : [...staticReviews, ...dynamicReviews];
  const sortedReviews = useMemo(() => {
    const copy = [...allReviewsRaw];
    switch (sortBy) {
      case 'newest':
        return copy.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'oldest':
        return copy.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'mostLiked':
        return copy.sort((a, b) => (b.baseLikes + (hasUserLiked(b.id) ? 1 : 0)) - (a.baseLikes + (hasUserLiked(a.id) ? 1 : 0)));
      case 'highestRated':
        return copy.sort((a, b) => b.rating - a.rating);
      default:
        return copy;
    }
  }, [allReviewsRaw, sortBy]);

  const handleLike = (reviewId: string) => {
    if (hasUserLiked(reviewId)) {
      unlikeReview(reviewId);
    } else {
      likeReview(reviewId);
    }
    forceUpdate({});
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2"><div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white font-bold text-2xl">M</div><span className="text-2xl font-semibold">Marka</span></Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium"><Link href="/" className="text-black">Главная</Link><Link href="/add-review" className="text-gray-600 hover:text-black">Добавить рецензию</Link></nav>
          <Link href="/profile" className="w-9 h-9 bg-teal-700 text-white rounded-full flex items-center justify-center font-medium hover:bg-teal-800 transition">П</Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-8">← Назад к фильмам</Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Постер с зелёной плашкой среднего рейтинга */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img src={movie.image} alt={movie.title} className="w-full aspect-[2/3] object-cover" />
            <div className="absolute top-6 right-6 bg-green-500 text-white font-bold text-4xl px-6 py-3 rounded-2xl">
              {avgRating.toFixed(1)}
            </div>
          </div>

          <div>
            <h1 className="text-5xl font-semibold mb-3">{movie.title}</h1>
            <p className="text-2xl text-gray-500 mb-8">{movie.year} • {movie.country}</p>
            <p className="text-lg leading-relaxed text-gray-700 mb-12">{movie.description}</p>
            <div className="bg-white rounded-3xl p-8 mb-8">
              <h3 className="font-semibold text-xl mb-6">О фильме</h3>
              <div className="grid grid-cols-1 gap-y-4 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Режиссёр</span><span>{movie.director}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Сценарий</span><span>{movie.screenwriter}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Оператор</span><span>{movie.operator}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Продюсер</span><span>{movie.producer}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Композитор</span><span>{movie.composer}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Бюджет</span><span>{movie.budget}</span></div>
              </div>
            </div>
            <Link href={`/add-review?id=${movie.id}`} className="w-full bg-purple-700 hover:bg-purple-800 text-white py-5 rounded-2xl font-semibold text-lg transition text-center block">Оценить фильм</Link>
          </div>
        </div>

        {/* Секция рецензий с сортировкой */}
        <div className="mt-16">
          <div className="flex flex-wrap justify-between items-end mb-8 gap-4">
            <h2 className="text-2xl font-semibold">Рецензии</h2>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-gray-500">Сортировать:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm">
                <option value="newest">Новые</option>
                <option value="oldest">Старые</option>
                <option value="mostLiked">По лайкам</option>
                <option value="highestRated">По оценке</option>
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {sortedReviews.map((review) => {
              const totalLikes = getTotalLikes(review.id, review.baseLikes);
              const liked = hasUserLiked(review.id);
              return (
                <div key={review.id} className="bg-white rounded-3xl p-8">
                  <div className="flex gap-3 mb-5">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`w-5 h-5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">{review.text}</p>
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium">{review.author}</p>
                      <p className="text-gray-500">{review.isUser ? 'Пользователь' : 'Критик'}</p>
                      {review.date && <p className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</p>}
                    </div>
                    <button onClick={() => handleLike(review.id)} className={`flex items-center gap-1 transition ${liked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
                      <ThumbsUp className="w-4 h-4" />
                      <span>{totalLikes}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <footer className="bg-white py-10 text-center text-gray-500 border-t mt-20">© Marka. Все права защищены</footer>
    </div>
  );
}