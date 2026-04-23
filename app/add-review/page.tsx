// app/add-review/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Plus } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { API } from 'app/lib/api';
import Header from 'components/Header';

interface FilmData {
  id: number;
  title: string;
  year: number;
  description: string;
  country: string;
  director: string;
  screenwriter: string;
  operator: string;
  producer: string;
  composer: string;
  budget: string;
  image: string;
}

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Проверка авторизации
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) router.push('/login');
  }, [router]);

  // Загрузка данных фильма (для нового отзыва) или существующей рецензии (для редактирования)
  useEffect(() => {
    if (editId) {
      // Режим редактирования: загружаем рецензию по ID
      API.reviews.getById(parseInt(editId))
        .then(res => {
          const review = res.data.data;
          setFormData({
            movieTitle: review.film.title,
            year: review.film.year.toString(),
            description: review.film.description,
            productionYear: review.film.year.toString(),
            country: review.film.country,
            director: review.film.director,
            screenwriter: review.film.screenwriter,
            operator: review.film.operator,
            producer: review.film.producer,
            composer: review.film.composer,
            budget: review.film.budget,
            reviewText: review.comment,
          });
          setRating(review.rating);
          setMoviePoster(review.film.image);
        })
        .catch(err => {
          console.error(err);
          setError('Не удалось загрузить рецензию');
        });
    } else if (movieId) {
      // Новый отзыв: загружаем данные фильма
      API.films.getById(parseInt(movieId))
        .then(res => {
          const film: FilmData = res.data.data;
          setFormData({
            movieTitle: film.title,
            year: film.year.toString(),
            description: film.description,
            productionYear: film.year.toString(),
            country: film.country,
            director: film.director,
            screenwriter: film.screenwriter,
            operator: film.operator,
            producer: film.producer,
            composer: film.composer,
            budget: film.budget,
            reviewText: '',
          });
          setMoviePoster(film.image);
        })
        .catch(err => {
          console.error(err);
          setError('Не удалось загрузить информацию о фильме');
        });
    }
  }, [movieId, editId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Редактирование
    if (editId) {
      try {
        await API.reviews.update(parseInt(editId), {
          rating: rating,
          comment: formData.reviewText,
        });
        alert('Рецензия обновлена!');
        router.push('/profile');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка обновления');
        setLoading(false);
      }
      return;
    }

    // Новый отзыв
    if (!movieId) {
      setError('Не указан фильм');
      setLoading(false);
      return;
    }
    if (rating === 0) {
      setError('Поставьте оценку фильму');
      setLoading(false);
      return;
    }

    try {
      await API.reviews.create(parseInt(movieId), rating, formData.reviewText);
      alert('Рецензия добавлена!');
      router.push(`/movie/${movieId}`);
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('already')) {
        setError('Вы уже написали рецензию на этот фильм. Можно отредактировать её в профиле.');
      } else {
        setError(err.response?.data?.message || 'Ошибка при сохранении рецензии');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <Link href={editId ? "/profile" : "/"} className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-10">
          ← Назад
        </Link>
        <h1 className="text-4xl font-semibold mb-10">{editId ? 'Редактировать рецензию' : 'Добавить рецензию'}</h1>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-2xl text-center">
            {error}
          </div>
        )}

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
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Название фильма</label>
                  <input
                    type="text"
                    name="movieTitle"
                    value={formData.movieTitle}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-purple-600"
                    required
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Год</label>
                  <input
                    type="text"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-purple-600"
                    required
                    disabled
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-2">Описание</label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-white border border-gray-200 rounded-3xl resize-y"
                  required
                  disabled
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div><label>Год производства</label><input type="text" name="productionYear" value={formData.productionYear} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl" disabled /></div>
                  <div><label>Страна</label><input type="text" name="country" value={formData.country} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl" disabled /></div>
                  <div><label>Режиссер</label><input type="text" name="director" value={formData.director} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl" disabled /></div>
                  <div><label>Сценарий</label><input type="text" name="screenwriter" value={formData.screenwriter} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl" disabled /></div>
                </div>
                <div className="space-y-6">
                  <div><label>Оператор</label><input type="text" name="operator" value={formData.operator} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl" disabled /></div>
                  <div><label>Продюсер</label><input type="text" name="producer" value={formData.producer} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl" disabled /></div>
                  <div><label>Композитор</label><input type="text" name="composer" value={formData.composer} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl" disabled /></div>
                  <div><label>Бюджет</label><input type="text" name="budget" value={formData.budget} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl" disabled /></div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-lg font-medium">Ваша рецензия</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-8 h-8 cursor-pointer transition ${
                          star <= (hoveredRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        onClick={() => !editId && setRating(star)} // при редактировании оценку менять не даём (если хотим запретить)
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                      />
                    ))}
                  </div>
                </div>
                <textarea
                  name="reviewText"
                  rows={8}
                  value={formData.reviewText}
                  onChange={handleChange}
                  placeholder="Напишите вашу рецензию здесь..."
                  className="w-full px-6 py-5 bg-white border border-gray-200 rounded-3xl resize-y text-base"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-700 hover:bg-purple-800 text-white py-5 rounded-2xl font-semibold text-lg transition mt-8 disabled:opacity-50"
              >
                {loading ? 'Сохранение...' : editId ? 'Сохранить изменения' : 'Опубликовать рецензию'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <footer className="bg-white py-10 text-center text-gray-500 border-t mt-20">
        © Marka. Все права защищены
      </footer>
    </div>
  );
}