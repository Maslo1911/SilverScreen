'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, ThumbsUp } from 'lucide-react';
import {getAllReviews, likeReview, unlikeReview, hasUserLiked, getTotalLikes, UserReview} from '@/app/lib/reviews';
import { useState, useEffect } from 'react';

export default function ReviewPage() {
  const params = useParams();
  const id = parseInt(params.id as string);
  const [review, setReview] = useState<UserReview | null | undefined>(null);
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const reviews = getAllReviews();
    const found = reviews.find(r => r.id === id);
    setReview(found);
  }, [id]);

  if (!review) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Рецензия не найдена</h1>
          <Link href="/" className="text-purple-700 hover:underline">На главную</Link>
        </div>
      </div>
    );
  }

  const reviewKey = `user_${review.id}`;
  const totalLikes = getTotalLikes(reviewKey, review.likes);
  const liked = hasUserLiked(reviewKey);

  const handleLike = () => {
    if (liked) {
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
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white font-bold text-2xl">M</div>
            <span className="text-2xl font-semibold">Marka</span>
          </Link>
          <Link href="/profile" className="w-9 h-9 bg-teal-700 text-white rounded-full flex items-center justify-center font-medium">П</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <Link href="/profile" className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-8">← Назад в профиль</Link>

        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="flex gap-4 mb-6">
            <img src={review.image} alt={review.movieTitle} className="w-32 h-48 object-cover rounded-2xl" />
            <div>
              <h1 className="text-3xl font-semibold mb-1">{review.movieTitle}</h1>
              <p className="text-gray-500 mb-2">{review.year}</p>
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => <Star key={i} className={`w-5 h-5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}
              </div>
              <p className="text-gray-600">Автор: {review.author}</p>
              <p className="text-gray-400 text-sm">{new Date(review.date).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="border-t pt-6">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{review.text}</p>
          </div>
          <div className="mt-8 flex justify-between items-center">
            <Link href={`/movie/${review.movieId}`} className="inline-block bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-2xl font-medium transition">Перейти к фильму</Link>
            <button onClick={handleLike} className={`flex items-center gap-2 transition ${liked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'}`}>
              <ThumbsUp className="w-5 h-5" />
              <span>{totalLikes}</span>
            </button>
          </div>
        </div>
      </main>

      <footer className="bg-white py-10 text-center text-gray-500 border-t mt-20">© Marka. Все права защищены</footer>
    </div>
  );
}