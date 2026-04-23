// app/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, ThumbsUp, Edit, Trash2, User } from 'lucide-react';
import { API } from '../lib/api';
import Header from '../components/Header';

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  likesCount: number;
  isLikedByUser: boolean;
  film: {
    id: number;
    title: string;
    year: number;
    image: string;
  };
}

interface UserProfile {
  email: string;
  createdAt?: string;
}

export default function Profile() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Загрузка профиля и рецензий
  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // Получаем данные текущего пользователя
      const meRes = await API.auth.me();
      setProfile(meRes.data.data);

      // Получаем рецензии пользователя
      const reviewsRes = await API.users.getMyReviews();
      setReviews(reviewsRes.data.data);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        router.push('/login');
      } else {
        setError('Не удалось загрузить данные профиля');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить рецензию?')) return;
    try {
      await API.reviews.delete(id);
      // Обновляем список после удаления
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert('Ошибка при удалении');
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/add-review?editId=${id}`);
  };

  const handleLike = async (reviewId: number, isLiked: boolean) => {
    try {
      if (isLiked) {
        await API.reviews.unlike(reviewId);
      } else {
        await API.reviews.like(reviewId);
      }
      // Обновляем локальное состояние лайка
      setReviews(prev =>
        prev.map(r =>
          r.id === reviewId
            ? {
                ...r,
                isLikedByUser: !isLiked,
                likesCount: isLiked ? r.likesCount - 1 : r.likesCount + 1,
              }
            : r
        )
      );
    } catch (err) {
      alert('Ошибка при изменении лайка');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5F0]">
        <Header />
        <div className="flex items-center justify-center h-64">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F5F0]">
        <Header />
        <div className="flex items-center justify-center h-64 text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Шапка профиля */}
        <div className="bg-white rounded-3xl p-8 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-sm">
          <div className="w-40 h-40 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-20 h-20 text-gray-400" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-semibold">{profile?.email || 'Пользователь'}</h1>
            <p className="text-gray-500 mt-1">Мой профиль</p>
            {profile?.createdAt && (
              <p className="text-gray-500 mt-2">
                Зарегистрирован: {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Список рецензий */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-8">
            Мои рецензии {reviews.length > 0 && `(${reviews.length})`}
          </h2>

          {reviews.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-gray-500">
              <p className="text-lg">У вас пока нет рецензий</p>
              <Link href="/" className="inline-block mt-4 text-purple-700 hover:underline">
                Перейти к фильмам
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full"
                >
                  <div className="relative">
                    <img
                      src={review.film.image}
                      alt={review.film.title}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-black/70 text-white text-sm font-medium px-3 py-1 rounded-xl">
                      {review.film.year}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-semibold text-xl leading-tight mb-2">
                      {review.film.title}
                    </h3>

                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-gray-600 text-[15px] leading-relaxed line-clamp-4 mb-6 flex-1">
                      {review.comment}
                    </p>

                    <div className="flex justify-between items-center mt-auto">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(review.id)}
                          className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition"
                          title="Редактировать"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="bg-red-50 hover:bg-red-100 p-2 rounded-xl transition"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                        <Link
                          href={`/movie/${review.film.id}`}
                          className="bg-purple-700 text-white py-2 px-4 rounded-2xl text-sm font-medium hover:bg-purple-800 transition"
                        >
                          К фильму
                        </Link>
                      </div>

                      <button
                        onClick={() => handleLike(review.id, review.isLikedByUser)}
                        className={`flex items-center gap-1 transition ${
                          review.isLikedByUser
                            ? 'text-blue-600'
                            : 'text-gray-500 hover:text-blue-600'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{review.likesCount}</span>
                      </button>
                    </div>
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