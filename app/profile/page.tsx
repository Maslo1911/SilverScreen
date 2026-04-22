// app/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, ThumbsUp, Edit, Trash2 } from 'lucide-react';
import { getUserReviews, UserReview, deleteReview, likeReview, unlikeReview, hasUserLiked, getTotalLikes } from '@/app/lib/reviews';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const router = useRouter();
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [, forceUpdate] = useState({});

  const loadReviews = () => {
    const userReviews = getUserReviews('User Userovich');
    setReviews(userReviews);
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleDelete = (id: number) => {
    if (confirm('Удалить рецензию?')) {
      deleteReview(id);
      loadReviews();
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/add-review?editId=${id}`);
  };

  const handleLike = (id: number) => {
    const reviewKey = `user_${id}`;
    if (hasUserLiked(reviewKey)) {
      unlikeReview(reviewKey);
    } else {
      likeReview(reviewKey);
    }
    forceUpdate({});
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2"><div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white font-bold text-2xl">M</div><span className="text-2xl font-semibold">Marka</span></Link>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium"><Link href="/" className="text-gray-600 hover:text-black">Главная</Link><Link href="/add-review" className="text-gray-600 hover:text-black">Добавить рецензию</Link></nav>
          </div>
          <div className="w-9 h-9 bg-teal-700 text-white rounded-full flex items-center justify-center font-medium">П</div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-white rounded-3xl p-8 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-sm">
          <div className="w-40 h-40 bg-gray-200 rounded-full flex-shrink-0" />
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-semibold">User Userovich</h1>
            <p className="text-gray-500 mt-1">Публичный профиль</p>
            <p className="text-gray-500 mt-2">Зарегистрирован: 06.09.2026</p>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-8">Мои рецензии {reviews.length > 0 && `(${reviews.length})`}</h2>
          {reviews.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center text-gray-500">
              <p className="text-lg">У вас пока нет рецензий</p>
              <Link href="/" className="inline-block mt-4 text-purple-700 hover:underline">Перейти к фильмам</Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review) => {
                const reviewKey = `user_${review.id}`;
                const totalLikes = getTotalLikes(reviewKey, review.likes);
                const liked = hasUserLiked(reviewKey);
                return (
                  <div key={review.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full">
                    <div className="relative">
                      <img src={review.image} alt={review.movieTitle} className="w-full h-64 object-cover" />
                      <div className="absolute top-4 right-4 bg-black/70 text-white text-sm font-medium px-3 py-1 rounded-xl">{review.year}</div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="font-semibold text-xl leading-tight mb-2">{review.movieTitle}</h3>
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`w-5 h-5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}
                      </div>
                      <p className="text-gray-600 text-[15px] leading-relaxed line-clamp-4 mb-6 flex-1">{review.text}</p>
                      <div className="flex justify-between items-center mt-auto">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(review.id)} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-xl transition"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(review.id)} className="bg-red-50 hover:bg-red-100 p-2 rounded-xl transition"><Trash2 className="w-4 h-4 text-red-600" /></button>
                          <Link href={`/movie/${review.movieId}`} className="bg-purple-700 text-white py-2 px-4 rounded-2xl text-sm font-medium hover:bg-purple-800 transition">К фильму</Link>
                        </div>
                        <button onClick={() => handleLike(review.id)} className={`flex items-center gap-1 transition ${liked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
                          <ThumbsUp className="w-4 h-4" />
                          <span>{totalLikes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <footer className="bg-white py-10 text-center text-gray-500 border-t mt-20">© Marka. Все права защищены</footer>
    </div>
  );
}