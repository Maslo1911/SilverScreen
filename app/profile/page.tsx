'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, ThumbsUp, Edit, Camera, Mail, User } from 'lucide-react';
import API from '@/src/api';
import Header from '@/components/Header';

interface Review {
  id: number;
  rating: number;
  comment: string;
  film_id: number;
  film?: {
    id: number;
    name: string;
    title?: string;
    poster_url?: string;
    year?: number;
  };
  created_at?: string;
  likes?: number;
}

export default function Profile() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', email: '' });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [meRes, reviewsRes] = await Promise.all([
        API.auth.me(),
        API.users.getMyReviews()
      ]);
      
      const userData = meRes.data?.data || meRes.data;
      setProfile(userData);
      setEditForm({ username: userData.username || '', email: userData.email || '' });
      
      let reviewsData = reviewsRes.data?.data || reviewsRes.data || [];
      if (!Array.isArray(reviewsData)) reviewsData = [];
      
      // Fetch film details for each review
      const enrichedReviews = await Promise.all(
        reviewsData.map(async (review: any) => {
          try {
            const filmRes = await API.films.getById(review.film_id);
            return { ...review, film: filmRes.data?.data || filmRes.data };
          } catch {
            return review;
          }
        })
      );
      setReviews(enrichedReviews);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.users.updateProfile(editForm.username, editForm.email);
      setProfile({ ...profile, ...editForm });
      setEditing(false);
    } catch (err) {
      console.error('Ошибка обновления профиля:', err);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (confirm('Удалить эту рецензию?')) {
      try {
        await API.reviews.delete(reviewId);
        setReviews(reviews.filter(r => r.id !== reviewId));
      } catch (err) {
        console.error('Ошибка удаления:', err);
      }
    }
  };

  const totalLikes = reviews.reduce((sum, r) => sum + (r.likes || 0), 0);
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5F0]">
        <Header />
        <div className="flex items-center justify-center h-96">Загрузка профиля...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-5xl text-white font-bold">
                  {profile?.username?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            
            <div className="flex-1">
              {editing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Имя пользователя</label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={e => setEditForm({...editForm, username: e.target.value})}
                      className="w-full px-4 py-2 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={e => setEditForm({...editForm, email: e.target.value})}
                      className="w-full px-4 py-2 border rounded-xl"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="bg-purple-700 text-white px-4 py-2 rounded-xl">Сохранить</button>
                    <button type="button" onClick={() => setEditing(false)} className="border px-4 py-2 rounded-xl">Отмена</button>
                  </div>
                </form>
              ) : (
                <>
                  <h1 className="text-3xl font-semibold">{profile?.username || profile?.name || 'Пользователь'}</h1>
                  <p className="text-gray-500 flex items-center gap-2 mt-1"><Mail className="w-4 h-4" />{profile?.email}</p>
                  <button onClick={() => setEditing(true)} className="mt-4 text-purple-700 hover:underline flex items-center gap-1">
                    <Edit className="w-4 h-4" /> Редактировать профиль
                  </button>
                </>
              )}
            </div>
            
            <div className="flex gap-8 text-center">
              <div><div className="text-2xl font-bold">{reviews.length}</div><div className="text-sm text-gray-500">Рецензий</div></div>
              <div><div className="text-2xl font-bold">{totalLikes}</div><div className="text-sm text-gray-500">Лайков</div></div>
              <div><div className="text-2xl font-bold">{avgRating.toFixed(1)}</div><div className="text-sm text-gray-500">Ср. оценка</div></div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <h2 className="text-2xl font-semibold mb-6">Мои рецензии</h2>
        
        {reviews.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-gray-500">
            У вас пока нет рецензий. Напишите свою первую рецензию!
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {reviews.map(review => (
              <div key={review.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition">
                <div className="flex gap-4 p-6">
                  {review.film?.poster_url && (
                    <img src={review.film.poster_url} alt={review.film.name} className="w-20 h-28 object-cover rounded-xl" />
                  )}
                  <div className="flex-1">
                    <Link href={`/movie/${review.film_id}`} className="font-semibold text-lg hover:text-purple-700 transition">
                      {review.film?.name || review.film?.title || `Фильм #${review.film_id}`}
                    </Link>
                    <div className="flex gap-1 mt-2 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-3">{review.comment || 'Без текста'}</p>
                    <div className="flex gap-4 mt-4">
                      <Link href={`/add-review?editId=${review.id}`} className="text-blue-600 text-sm hover:underline">Редактировать</Link>
                      <button onClick={() => handleDeleteReview(review.id)} className="text-red-600 text-sm hover:underline">Удалить</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}