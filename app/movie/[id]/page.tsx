'use client';

import { useEffect, useState, useMemo } from 'react';
import { Star, ThumbsUp, ArrowLeft, Calendar, Clock, DollarSign, User } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import API from '@/src/api';
import Header from '@/components/Header';

type SortOption = 'newest' | 'oldest' | 'mostLiked' | 'highestRated';

interface Actor {
  id: number;
  name: string;
  character: string;
  photo_url: string;
  birth_date?: string;
  biography?: string;
}

interface Film {
  id: number;
  name: string;
  rating: number;
  poster_url: string;
  overview: string;
  release_date: string;
  budget: number;
  revenue: number;
  runtime: number;
  director?: string;
  screenwriter?: string;
  operator?: string;
  producer?: string;
  composer?: string;
  country?: string;
  categories?: Array<{ id: number; name: string }>;
  actors?: Actor[];
}

interface ReviewUser {
  id: number;
  name: string;
  email: string;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  user_id: number;
  user: ReviewUser | null;
  created_at: string;
  likes: number;
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
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [likedReviews, setLikedReviews] = useState<Set<number>>(new Set());

  const getUserName = (user: ReviewUser | null): string => {
    if (!user) return 'Аноним';
    if (user.name) return user.name;
    if (user.email) return user.email.split('@')[0];
    return 'Пользователь';
  };

  useEffect(() => {
    const loadLikedReviews = () => {
      const stored = localStorage.getItem(`liked_reviews_${currentUserId}`);
      if (stored) {
        setLikedReviews(new Set(JSON.parse(stored)));
      }
    };
    
    if (currentUserId) {
      loadLikedReviews();
    }
  }, [currentUserId]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          try {
            const meRes = await API.auth.me();
            const userData = meRes.data?.data || meRes.data;
            setCurrentUserId(userData.id);
          } catch {}
        }

        // Загружаем фильм (с актёрами из БД)
        const filmRes = await API.films.getById(movieId);
        let filmData = filmRes.data?.data || filmRes.data;
        
        console.log('Загруженные данные фильма с актёрами:', filmData);
        
        const normalizedFilm: Film = {
          id: filmData.id,
          name: filmData.name,
          rating: filmData.rating || 0,
          poster_url: filmData.poster_url,
          overview: filmData.overview,
          release_date: filmData.release_date,
          budget: filmData.budget,
          revenue: filmData.revenue,
          runtime: filmData.runtime,
          director: filmData.director,
          screenwriter: filmData.screenwriter,
          operator: filmData.operator,
          producer: filmData.producer,
          composer: filmData.composer,
          country: filmData.country,
          categories: filmData.categories || [],
          actors: filmData.actors || [],
        };
        setFilm(normalizedFilm);

        // Загружаем рецензии
        const reviewsRes = await API.reviews.getByFilm(movieId);
        let rawReviews = reviewsRes.data?.data || reviewsRes.data || [];
        if (!Array.isArray(rawReviews)) rawReviews = [];
        
        const formattedReviews: Review[] = rawReviews.map((review: any) => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          user_id: review.user_id,
          user: review.user ? {
            id: review.user.id,
            name: review.user.name,
            email: review.user.email
          } : null,
          created_at: review.created_at,
          likes: review.likes || 0,
        }));
        
        setReviews(formattedReviews);

        const avgRes = await API.reviews.getAverageRating(movieId);
        let avg = avgRes.data?.data?.averageRating ?? avgRes.data?.averageRating ?? avgRes.data ?? 0;
        setAvgRating(typeof avg === 'number' ? avg : parseFloat(avg) || 0);

      } catch (err: any) {
        console.error('Ошибка загрузки:', err);
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
        return copy.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'oldest':
        return copy.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case 'mostLiked':
        return copy.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      case 'highestRated':
        return copy.sort((a, b) => b.rating - a.rating);
      default:
        return copy;
    }
  }, [reviews, sortBy]);

  const handleLike = async (reviewId: number) => {
    if (!currentUserId) {
      window.location.href = '/login';
      return;
    }
    
    try {
      const isLiked = likedReviews.has(reviewId);
      
      if (isLiked) {
        await API.reviews.unlike(reviewId);
        setLikedReviews(prev => {
          const newSet = new Set(prev);
          newSet.delete(reviewId);
          localStorage.setItem(`liked_reviews_${currentUserId}`, JSON.stringify([...newSet]));
          return newSet;
        });
        setReviews(prev =>
          prev.map(r =>
            r.id === reviewId
              ? { ...r, likes: Math.max((r.likes || 0) - 1, 0) }
              : r
          )
        );
      } else {
        await API.reviews.like(reviewId);
        setLikedReviews(prev => {
          const newSet = new Set(prev);
          newSet.add(reviewId);
          localStorage.setItem(`liked_reviews_${currentUserId}`, JSON.stringify([...newSet]));
          return newSet;
        });
        setReviews(prev =>
          prev.map(r =>
            r.id === reviewId
              ? { ...r, likes: (r.likes || 0) + 1 }
              : r
          )
        );
      }
    } catch (err) {
      console.error('Ошибка лайка:', err);
    }
  };

  const formatCurrency = (value: number) => {
    if (!value) return '—';
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getYear = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).getFullYear();
  };

  const formatRuntime = (minutes: number) => {
    if (!minutes) return '—';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}ч ${mins}мин` : `${mins}мин`;
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
          {/* Постер */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={film.poster_url || '/images/placeholder.jpg'}
              alt={film.name}
              className="w-full aspect-[2/3] object-cover"
            />
            <div className="absolute top-6 right-6 bg-green-500 text-white font-bold text-4xl px-6 py-3 rounded-2xl shadow-lg">
              {avgRating !== null && avgRating > 0 ? avgRating.toFixed(1) : film.rating?.toFixed(1) || '—'}
            </div>
          </div>

          {/* Информация о фильме */}
          <div>
            <h1 className="text-5xl font-semibold mb-2">{film.name}</h1>
            <p className="text-xl text-gray-500 mb-6">
              {getYear(film.release_date)} {film.country && `• ${film.country}`}
            </p>

            {film.categories && film.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {film.categories.map(cat => (
                  <span key={cat.id} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                    {cat.name}
                  </span>
                ))}
              </div>
            )}

            <p className="text-lg leading-relaxed text-gray-700 mb-8">
              {film.overview || 'Описание отсутствует.'}
            </p>

            <div className="bg-white rounded-3xl p-6 mb-6">
              <h3 className="font-semibold text-lg mb-4">О фильме</h3>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                {film.director && <><span className="text-gray-500">Режиссёр</span><span>{film.director}</span></>}
                {film.screenwriter && <><span className="text-gray-500">Сценарий</span><span>{film.screenwriter}</span></>}
                {film.operator && <><span className="text-gray-500">Оператор</span><span>{film.operator}</span></>}
                {film.producer && <><span className="text-gray-500">Продюсер</span><span>{film.producer}</span></>}
                {film.composer && <><span className="text-gray-500">Композитор</span><span>{film.composer}</span></>}
                {film.runtime && <><span className="text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Длительность</span><span>{formatRuntime(film.runtime)}</span></>}
                {film.budget && <><span className="text-gray-500 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Бюджет</span><span>{formatCurrency(film.budget)}</span></>}
                {film.revenue && <><span className="text-gray-500 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Сборы</span><span>{formatCurrency(film.revenue)}</span></>}
                {film.release_date && <><span className="text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> Дата выхода</span><span>{formatDate(film.release_date)}</span></>}
              </div>
            </div>

            {/* Актёры - подгружаются из БД (некликабельные) */}
{film.actors && film.actors.length > 0 && (
  <div className="bg-white rounded-3xl p-6 mb-6">
    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
      <User className="w-5 h-5" />
      В главных ролях ({film.actors.length})
    </h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {film.actors.map((actor) => (
        <div key={actor.id} className="flex items-center gap-3 p-2 rounded-xl">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
            {actor.photo_url ? (
              <img src={actor.photo_url} alt={actor.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-lg font-medium">
                {actor.name?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm text-gray-800 truncate">
              {actor.name}
            </p>
            {actor.character && (
              <p className="text-xs text-gray-500 truncate">
                {actor.character}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
)}

            <Link
              href={`/add-review?id=${film.id}`}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white py-5 rounded-2xl font-semibold text-lg transition text-center block"
            >
              Написать рецензию
            </Link>
          </div>
        </div>

        {/* Рецензии */}
        <div className="mt-16">
          <div className="flex flex-wrap justify-between items-end mb-8 gap-4">
            <h2 className="text-2xl font-semibold">Рецензии ({reviews.length})</h2>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-gray-500">Сортировать:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm cursor-pointer"
              >
                <option value="newest">Сначала новые</option>
                <option value="oldest">Сначала старые</option>
                <option value="mostLiked">По лайкам</option>
                <option value="highestRated">По оценке</option>
              </select>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-gray-500">
              Пока нет рецензий. Будьте первым!
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {sortedReviews.map((review) => {
                const isLiked = likedReviews.has(review.id);
                const userName = getUserName(review.user);
                const avatarLetter = userName !== 'Аноним' ? userName[0]?.toUpperCase() : '?';
                
                return (
                  <div key={review.id} className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                        />
                      ))}
                    </div>

                    <p className="text-gray-700 mb-5 leading-relaxed whitespace-pre-wrap line-clamp-4">
                      {review.comment || 'Без комментария'}
                    </p>

                    <div className="flex justify-between items-center pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-700 text-sm font-medium">{avatarLetter}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-800">{userName}</p>
                          <p className="text-xs text-gray-400">
                            {review.created_at ? new Date(review.created_at).toLocaleDateString('ru-RU') : 'Дата неизвестна'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleLike(review.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition ${
                          isLiked 
                            ? 'text-blue-600 bg-blue-50' 
                            : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm">{review.likes || 0}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
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