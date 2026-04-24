'use client';

import { useEffect, useState, useMemo } from 'react';
import { Star, ThumbsUp, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import API from '@/src/api';
import Header from '@/components/Header';

type SortOption = 'newest' | 'oldest' | 'mostLiked' | 'highestRated';

interface Film {
  id: number;
  title: string;
  year?: number;
  country?: string;
  poster_url?: string;
  overview?: string;
  director?: string;
  screenwriter?: string;
  operator?: string;
  producer?: string;
  composer?: string;
  budget?: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  user?: { email: string };
  createdAt: string;
  likesCount: number;
  isLikedByUser: boolean;
}

export default function MovieDetail() {
  const params = useParams();
  const movieId = parseInt(params.id as string);

  const [film, setFilm] = useState<Film | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  useEffect(() => {
    if (!movieId) return;

    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const [filmRes, reviewsRes, avgRes] = await Promise.all([
          API.films.getById(movieId),
          API.reviews.getByFilm(movieId),
          API.reviews.getAverageRating(movieId),
        ]);

        setFilm(filmRes.data?.data || filmRes.data || filmRes);

        const reviewsData = reviewsRes.data?.data || reviewsRes.data || [];
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);

        let avg = avgRes.data?.data?.averageRating ??
            avgRes.data?.averageRating ??
            avgRes.data ?? 0;
        avg = typeof avg === 'number' ? avg : parseFloat(avg) || 0;
        setAvgRating(avg);

      } catch (err: any) {
        console.error('Ошибка загрузки фильма:', err);
        setError('Не удалось загрузить информацию о фильме');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [movieId]);

  const sortedReviews = useMemo(() => {
    const copy = [...reviews];
    switch (sortBy) {
      case 'newest':
        return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return copy.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'mostLiked':
        return copy.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
      case 'highestRated':
        return copy.sort((a, b) => b.rating - a.rating);
      default:
        return copy;
    }
  }, [reviews, sortBy]);

  const handleLike = async (reviewId: number, currentLiked: boolean) => {
    try {
      if (currentLiked) {
        await API.reviews.unlike(reviewId);
      } else {
        await API.reviews.like(reviewId);
      }

      setReviews(prev =>
          prev.map(r =>
              r.id === reviewId
                  ? {
                    ...r,
                    isLikedByUser: !currentLiked,
                    likesCount: currentLiked ? r.likesCount - 1 : r.likesCount + 1,
                  }
                  : r
          )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-[#F8F5F0]">
          <Header />
          <div className="flex items-center justify-center h-64">Загрузка фильма...</div>
        </div>
    );
  }

  if (error || !film) {
    return (
        <div className="min-h-screen bg-[#F8F5F0]">
          <Header />
          <div className="flex items-center justify-center h-64 text-xl text-red-600">
            {error || 'Фильм не найден'}
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-[#F8F5F0]">
        <Header />

        <div className="max-w-7xl mx-auto px-6 py-10">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-8">
            <ArrowLeft className="w-4 h-4" /> Назад к фильмам
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                  src={film.poster_url || film.image || '/images/placeholder.jpg'}
                  alt={film.title}
                  className="w-full aspect-[2/3] object-cover"
              />
              <div className="absolute top-6 right-6 bg-green-500 text-white font-bold text-4xl px-6 py-3 rounded-2xl">
                {avgRating !== null && avgRating > 0 ? avgRating.toFixed(1) : '—'}
              </div>
            </div>

            <div>
              <h1 className="text-5xl font-semibold mb-3">{film.title}</h1>
              <p className="text-2xl text-gray-500 mb-8">
                {film.year || '—'} • {film.country || 'Неизвестно'}
              </p>

              <p className="text-lg leading-relaxed text-gray-700 mb-12">
                {film.overview || 'Описание отсутствует.'}
              </p>

              <div className="bg-white rounded-3xl p-8 mb-8">
                <h3 className="font-semibold text-xl mb-6">О фильме</h3>
                <div className="grid grid-cols-1 gap-y-4 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Режиссёр</span><span>{film.director || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Сценарий</span><span>{film.screenwriter || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Оператор</span><span>{film.operator || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Продюсер</span><span>{film.producer || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Композитор</span><span>{film.composer || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Бюджет</span><span>{film.budget || '—'}</span></div>
                </div>
              </div>

              <Link
                  href={`/add-review?id=${film.id}`}
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white py-5 rounded-2xl font-semibold text-lg transition text-center block"
              >
                Оценить фильм
              </Link>
            </div>
          </div>

          {/* Рецензии */}
          <div className="mt-16">
            <div className="flex flex-wrap justify-between items-end mb-8 gap-4">
              <h2 className="text-2xl font-semibold">Рецензии</h2>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-500">Сортировать:</span>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
                >
                  <option value="newest">Новые</option>
                  <option value="oldest">Старые</option>
                  <option value="mostLiked">По лайкам</option>
                  <option value="highestRated">По оценке</option>
                </select>
              </div>
            </div>

            {sortedReviews.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center text-gray-500">
                  Пока нет рецензий. Будьте первым!
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {sortedReviews.map((review) => (
                      <div key={review.id} className="bg-white rounded-3xl p-8">
                        <div className="flex gap-3 mb-5">
                          {[...Array(5)].map((_, i) => (
                              <Star
                                  key={i}
                                  className={`w-5 h-5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                          ))}
                        </div>
                        <p className="text-gray-700 mb-6 leading-relaxed">{review.comment}</p>

                        <div className="flex justify-between text-sm">
                          <div>
                            <p className="font-medium">
                              {review.user?.email || 'Анонимный пользователь'}
                            </p>
                            <p className="text-gray-500">Пользователь</p>
                            <p className="text-xs text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                          <button
                              onClick={() => handleLike(review.id, review.isLikedByUser)}
                              className={`flex items-center gap-1 transition ${
                                  review.isLikedByUser ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                              }`}
                          >
                            <ThumbsUp className="w-4 h-4" />
                            <span>{review.likesCount}</span>
                          </button>
                        </div>
                      </div>
                  ))}
                </div>
            )}
          </div>
        </div>

        <footer className="bg-white py-10 text-center text-gray-500 border-t mt-20">
          © Marka. Все права защищены
        </footer>
      </div>
  );
}