'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Plus } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import API from '@/src/api';
import Header from '@/components/Header';

interface FilmData {
  id: number;
  name: string;
  title?: string;
  year?: number;
  release_date?: string;
  overview?: string;
  description?: string;
  country?: string;
  director?: string;
  screenwriter?: string;
  operator?: string;
  producer?: string;
  composer?: string;
  budget?: string;
  revenue?: string;
  runtime?: number;
  poster_url?: string;
  image?: string;
  rating?: number;
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
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingFilm, setIsLoadingFilm] = useState(true);

  // Проверка авторизации
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // Загрузка данных фильма
  useEffect(() => {
    if (!movieId) {
      setIsLoadingFilm(false);
      return;
    }

    const loadFilm = async () => {
      setIsLoadingFilm(true);
      setError('');
      
      try {
        const res = await API.films.getById(parseInt(movieId));
        const film = res.data?.data || res.data;
        
        // Извлекаем год
        let year = '';
        if (film.year) {
          year = film.year.toString();
        } else if (film.release_date) {
          year = new Date(film.release_date).getFullYear().toString();
        }
        
        // Извлекаем описание
        const description = film.overview || film.description || '';
        
        setFormData({
          movieTitle: film.name || film.title || 'Без названия',
          year: year,
          description: description,
          country: film.country || '',
          director: film.director || '',
          screenwriter: film.screenwriter || '',
          operator: film.operator || '',
          producer: film.producer || '',
          composer: film.composer || '',
          budget: film.budget || '',
          reviewText: '',
        });
        
        setMoviePoster(film.poster_url || film.image || '');
        
      } catch (err: any) {
        console.error('Ошибка загрузки фильма:', err);
        setError('Не удалось загрузить данные фильма');
      } finally {
        setIsLoadingFilm(false);
      }
    };

    loadFilm();
  }, [movieId]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!movieId) {
      setError('ID фильма не найден');
      return;
    }
    
    if (rating === 0) {
      setError('Поставьте оценку фильму');
      return;
    }
    
    if (!formData.reviewText.trim()) {
      setError('Напишите текст рецензии');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await API.reviews.create(parseInt(movieId), rating, formData.reviewText);
      alert('Рецензия успешно опубликована!');
      router.push(`/movie/${movieId}`);
      
    } catch (err: any) {
      console.error('Ошибка при публикации:', err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          'Ошибка при публикации рецензии';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingFilm) {
    return (
      <div className="min-h-screen bg-[#F8F5F0]">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Загрузка информации о фильме...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!movieId) {
    return (
      <div className="min-h-screen bg-[#F8F5F0]">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h1 className="text-2xl font-semibold mb-4">Фильм не выбран</h1>
            <Link href="/" className="text-purple-700 hover:underline">
              Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <Link 
          href={`/movie/${movieId}`} 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к фильму
        </Link>

        <h1 className="text-4xl font-semibold mb-10">Добавить рецензию</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Постер */}
            <div>
              <div className="text-sm text-gray-500 mb-3">Постер фильма</div>
              {moviePoster ? (
                <img 
                  src={moviePoster} 
                  alt={formData.movieTitle} 
                  className="w-full max-w-md rounded-3xl shadow-md" 
                />
              ) : (
                <div className="w-full max-w-md aspect-square bg-gray-200 rounded-3xl flex items-center justify-center">
                  <Plus className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Информация о фильме (только для ознакомления) */}
            <div className="space-y-6">
              {/* Название и год */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Название</label>
                  <div className="px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-700">
                    {formData.movieTitle}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Год</label>
                  <div className="px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-700">
                    {formData.year || '—'}
                  </div>
                </div>
              </div>

              {/* Страна */}
              <div>
                <label className="block text-sm text-gray-500 mb-2">Страна</label>
                <div className="px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-700">
                  {formData.country || '—'}
                </div>
              </div>

              {/* Описание */}
              <div>
                <label className="block text-sm text-gray-500 mb-2">Описание</label>
                <div className="px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-700 min-h-[100px]">
                  {formData.description || '—'}
                </div>
              </div>

              {/* Создатели фильма - 2 колонки */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Режиссёр</label>
                  <div className="px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-700">
                    {formData.director || '—'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Сценарий</label>
                  <div className="px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-700">
                    {formData.screenwriter || '—'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Оператор</label>
                  <div className="px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-700">
                    {formData.operator || '—'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Продюсер</label>
                  <div className="px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-700">
                    {formData.producer || '—'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Композитор</label>
                  <div className="px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-700">
                    {formData.composer || '—'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Бюджет</label>
                  <div className="px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-700">
                    {formData.budget || '—'}
                  </div>
                </div>
              </div>

              {/* Поле для рецензии */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-lg font-medium">Ваша рецензия</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-8 h-8 cursor-pointer transition-all ${
                          star <= (hoveredRating || rating) 
                            ? 'fill-yellow-400 text-yellow-400 scale-110' 
                            : 'text-gray-300 hover:text-yellow-200'
                        }`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                      />
                    ))}
                  </div>
                </div>
                
                <textarea
                  name="reviewText"
                  value={formData.reviewText}
                  onChange={handleChange}
                  placeholder="Поделитесь своим мнением о фильме..."
                  rows={6}
                  className="w-full px-6 py-5 bg-white border border-gray-200 rounded-2xl resize-y focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition"
                  required
                />
              </div>

              {/* Кнопка отправки */}
              <button
                type="submit"
                disabled={isSubmitting || rating === 0 || !formData.reviewText.trim()}
                className="w-full bg-purple-700 hover:bg-purple-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-semibold text-lg transition"
              >
                {isSubmitting ? 'Публикация...' : 'Опубликовать рецензию'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}