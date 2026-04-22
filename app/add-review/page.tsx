// app/add-review/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Plus } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { allMovies } from '@/app/data/movies';
import { saveReview, updateReview, getAllReviews, hasUserReviewedMovie } from '@/app/lib/reviews';

export default function AddReview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const movieId = searchParams.get('id');
  const editId = searchParams.get('editId');

  const [formData, setFormData] = useState({
    movieTitle: '',
    year: '',
    description: '',
    productionYear: '',
    country: '',
    director: '',
    screenwriter: '',
    operator: '',
    producer: '',
    composer: '',
    budget: '',
    reviewText: '',
  });
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [moviePoster, setMoviePoster] = useState('');

  useEffect(() => {
    if (editId) {
      const reviews = getAllReviews();
      const review = reviews.find(r => r.id === parseInt(editId));
      if (review) {
        setFormData({
          movieTitle: review.movieTitle,
          year: review.year.toString(),
          description: '',
          productionYear: review.year.toString(),
          country: '',
          director: '',
          screenwriter: '',
          operator: '',
          producer: '',
          composer: '',
          budget: '',
          reviewText: review.text,
        });
        setRating(review.rating);
        setMoviePoster(review.image);
      }
    } else if (movieId) {
      const movie = allMovies.find(m => m.id === parseInt(movieId));
      if (movie) {
        setFormData({
          movieTitle: movie.title,
          year: movie.year.toString(),
          description: movie.description,
          productionYear: movie.year.toString(),
          country: movie.country,
          director: movie.director,
          screenwriter: movie.screenwriter,
          operator: movie.operator,
          producer: movie.producer,
          composer: movie.composer,
          budget: movie.budget,
          reviewText: '',
        });
        setMoviePoster(movie.image);
      }
    }
  }, [movieId, editId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editId) {
      updateReview(parseInt(editId), { rating, text: formData.reviewText });
      alert('Рецензия обновлена!');
      router.push('/profile');
      return;
    }

    if (!movieId) {
      alert('Не указан фильм');
      return;
    }
    if (rating === 0) {
      alert('Поставьте оценку фильму');
      return;
    }

    const movieIdNum = parseInt(movieId);
    // Проверка: есть ли уже рецензия от этого пользователя на этот фильм
    if (hasUserReviewedMovie(movieIdNum)) {
      alert('Вы уже написали рецензию на этот фильм. Можно отредактировать её в профиле.');
      return;
    }

    const movie = allMovies.find(m => m.id === movieIdNum);
    if (!movie) return;

    saveReview({
      movieId: movie.id,
      movieTitle: movie.title,
      year: movie.year,
      rating: rating,
      text: formData.reviewText,
      image: movie.image,
      author: 'User Userovich',
      date: new Date().toISOString(),
    });

    alert('Рецензия добавлена!');
    router.push(`/movie/${movieIdNum}`);
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2"><div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white font-bold text-2xl">M</div><span className="text-2xl font-semibold">Marka</span></Link>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium"><Link href="/" className="text-gray-600 hover:text-black">Главная</Link><Link href="/add-review" className="text-black font-medium">Добавить рецензию</Link></nav>
          </div>
          <Link href="/profile" className="w-9 h-9 bg-teal-700 text-white rounded-full flex items-center justify-center font-medium hover:bg-teal-800 transition">П</Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <Link href={editId ? "/profile" : "/"} className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-10">← Назад</Link>
        <h1 className="text-4xl font-semibold mb-10">{editId ? 'Редактировать рецензию' : 'Добавить рецензию'}</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Левая часть – постер */}
            <div>
              <div className="text-sm text-gray-500 mb-3">Постер фильма</div>
              {moviePoster ? (
                <div className="w-full aspect-square max-w-md rounded-3xl overflow-hidden shadow-md">
                  <img src={moviePoster} alt="Постер" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full aspect-square max-w-md bg-gray-200 border-2 border-dashed border-gray-400 rounded-3xl flex items-center justify-center hover:border-purple-600 transition cursor-pointer group">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-gray-300 rounded-2xl flex items-center justify-center group-hover:bg-purple-100 transition">
                      <Plus className="w-10 h-10 text-gray-500 group-hover:text-purple-600" />
                    </div>
                    <p className="mt-4 text-gray-500 text-center">Нажмите или перетащите<br />изображение сюда</p>
                  </div>
                </div>
              )}
            </div>

            {/* Правая часть – форма */}
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm text-gray-500 mb-2">Название фильма</label><input type="text" name="movieTitle" value={formData.movieTitle} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-purple-600" required /></div>
                <div><label className="block text-sm text-gray-500 mb-2">Год</label><input type="text" name="year" value={formData.year} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl" required /></div>
              </div>
              <div><label className="block text-sm text-gray-500 mb-2">Описание</label><textarea name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-3xl resize-y" required /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div><label>Год производства</label><input type="text" name="productionYear" value={formData.productionYear} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl" /></div>
                  <div><label>Страна</label><input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl" /></div>
                  <div><label>Режиссер</label><input type="text" name="director" value={formData.director} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl" /></div>
                  <div><label>Сценарий</label><input type="text" name="screenwriter" value={formData.screenwriter} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl" /></div>
                </div>
                <div className="space-y-6">
                  <div><label>Оператор</label><input type="text" name="operator" value={formData.operator} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl" /></div>
                  <div><label>Продюсер</label><input type="text" name="producer" value={formData.producer} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl" /></div>
                  <div><label>Композитор</label><input type="text" name="composer" value={formData.composer} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl" /></div>
                  <div><label>Бюджет</label><input type="text" name="budget" value={formData.budget} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl" /></div>
                </div>
              </div>
              <div className="pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-lg font-medium">Ваша рецензия</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((star) => (<Star key={star} className={`w-8 h-8 cursor-pointer transition ${star <= (hoveredRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} onClick={() => setRating(star)} onMouseEnter={() => setHoveredRating(star)} onMouseLeave={() => setHoveredRating(0)} />))}
                  </div>
                </div>
                <textarea name="reviewText" rows={8} value={formData.reviewText} onChange={handleChange} placeholder="Напишите вашу рецензию здесь..." className="w-full px-6 py-5 bg-white border border-gray-200 rounded-3xl resize-y text-base" required />
              </div>
              <button type="submit" className="w-full bg-purple-700 hover:bg-purple-800 text-white py-5 rounded-2xl font-semibold text-lg transition mt-8">{editId ? 'Сохранить изменения' : 'Опубликовать рецензию'}</button>
            </div>
          </div>
        </form>
      </div>

      <footer className="bg-white py-10 text-center text-gray-500 border-t mt-20">© Marka. Все права защищены</footer>
    </div>
  );
}