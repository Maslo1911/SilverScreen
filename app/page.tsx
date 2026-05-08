'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import API from '@/src/api';
import Header from '@/components/Header';

interface Film {
  id: number;
  name: string;
  poster_url?: string;
  release_date?: string;
  overview?: string;
  budget?: number;
  averageRating?: number;
}

export default function Home() {
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchFilms = async () => {
      try {
        const res = await API.films.getAll();
        console.log('📥 Ответ от API:', res.data);

        let rawFilms = res.data?.data?.films ||
                       res.data?.data ||
                       res.data?.films ||
                       res.data || [];

        if (!Array.isArray(rawFilms)) rawFilms = [rawFilms];

        const normalizedFilms: Film[] = rawFilms.map((f: any) => ({
          id: f.id,
          name: f.name || f.title || 'Без названия',
          poster_url: f.poster_url || f.image,
          release_date: f.release_date,
          overview: f.overview || f.description,
          budget: f.budget,
          averageRating: f.averageRating || 0,
        }));

        console.log('Фильмы с рейтингами:', normalizedFilms.map(f => ({ name: f.name, rating: f.averageRating })));
        setFilms(normalizedFilms);
      } catch (err: any) {
        console.error('❌ Ошибка загрузки фильмов:', err);
        setError('Не удалось загрузить фильмы');
      } finally {
        setLoading(false);
      }
    };

    fetchFilms();
  }, []);

  const filteredFilms = films.filter(film =>
    film.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredFilms.length / itemsPerPage);
  const paginatedFilms = filteredFilms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Функция для отображения рейтинга
  const getRatingDisplay = (rating?: number) => {
    if (rating && rating > 0) {
      return rating.toFixed(1);
    }
    return '—';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5F0]">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Загрузка фильмов...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F5F0]">
        <Header />
        <div className="flex items-center justify-center h-96 text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      <Header />

      {/* Hero секция */}
      <div className="bg-[#0A0A0A] text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-white text-black rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="/images/movies/Legend.png" 
                alt="Я - легенда" 
                className="w-full h-[420px] object-cover" 
              />
              <div className="p-8">
                <h2 className="text-3xl font-semibold mb-1">Я - легенда</h2>
                <p className="text-gray-500">2007 • США, Великобритания</p>
              </div>
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-semibold leading-tight">
                Честные оценки.<br />
                <span className="text-[#4ADE80]">РЕАЛЬНЫЕ ОТЗЫВЫ.</span>
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск фильмов..."
              value={searchQuery}
              onChange={(e) => { 
                setSearchQuery(e.target.value); 
                setCurrentPage(1); 
              }}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-purple-600 outline-none transition"
            />
          </div>
        </div>

        {filteredFilms.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Фильмы не найдены</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {paginatedFilms.map((film) => (
                <div 
                  key={film.id} 
                  className="bg-white rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group"
                >
                  <Link href={`/movie/${film.id}`} className="block flex-1">
                    <div className="relative aspect-[2/3] bg-gray-200 overflow-hidden">
                      <img
                        src={film.poster_url || '/images/placeholder.jpg'}
                        alt={film.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Зелёная плашка с рейтингом - ВСЕГДА ЗЕЛЁНАЯ */}
                      <div className="absolute top-3 left-3 bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-xl shadow-lg">
                        {getRatingDisplay(film.averageRating)}
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-base leading-tight mb-1 line-clamp-2 group-hover:text-purple-700 transition">
                        {film.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-auto">
                        {film.release_date ? new Date(film.release_date).getFullYear() : '—'}
                      </p>
                    </div>
                  </Link>

                  <div className="p-4 pt-0">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/add-review?id=${film.id}`;
                      }}
                      className="w-full bg-purple-700 hover:bg-purple-800 text-white py-2.5 rounded-xl text-sm font-medium transition transform hover:scale-[1.02]"
                    >
                      Написать рецензию
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-3 mt-12">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  ← Назад
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-xl transition ${
                          currentPage === pageNum
                            ? 'bg-purple-700 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                >
                  Вперёд →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <footer className="bg-white py-10 text-center text-gray-500 border-t mt-10">
        <p>© Marka. Все права защищены</p>
        <p className="text-sm mt-2">Кинорецензии от настоящих зрителей</p>
      </footer>
    </div>
  );
}