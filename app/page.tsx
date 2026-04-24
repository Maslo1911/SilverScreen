'use client';

import { useEffect, useState } from 'react';
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
  revenue?: number;
  runtime?: number;
}

export default function Home() {
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    const fetchFilms = async () => {
      try {
        const res = await API.films.getAll();
        console.log('📥 Ответ от API.films.getAll():', res.data);

        // Адаптация под твою БД
        let rawFilms = res.data?.data?.films ||
            res.data?.data ||
            res.data?.films ||
            res.data || [];

        if (!Array.isArray(rawFilms)) rawFilms = [rawFilms];

        const normalizedFilms: Film[] = rawFilms.map((f: any) => ({
          id: f.id,
          name: f.name || 'Без названия',
          poster_url: f.poster_url,
          release_date: f.release_date,
          overview: f.overview,
          budget: f.budget,
          revenue: f.revenue,
          runtime: f.runtime,
        }));

        setFilms(normalizedFilms);
        console.log('✅ Загружено фильмов:', normalizedFilms.length);
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

  if (loading) {
    return (
        <div className="min-h-screen bg-[#F8F5F0]">
          <Header />
          <div className="flex items-center justify-center h-96">Загрузка фильмов...</div>
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
                <img src="/images/movies/Legend.png" alt="Я - легенда" className="w-full h-[420px] object-cover" />
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
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                  type="text"
                  placeholder="Поиск фильмов..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-purple-600 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {paginatedFilms.map((film) => (
                <div key={film.id} className="bg-white rounded-3xl overflow-hidden hover:shadow-xl transition flex flex-col">
                  <Link href={`/movie/${film.id}`} className="block">
                    <div className="relative aspect-[2/3] bg-gray-200">
                      <img
                          src={film.poster_url || '/images/placeholder.jpg'}
                          alt={film.name}
                          className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>

                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg leading-tight mb-2">{film.name}</h3>
                    <p className="text-sm text-gray-500 mt-auto">
                      {film.release_date ? new Date(film.release_date).getFullYear() : '—'}
                    </p>

                    <button
                        onClick={() => window.location.href = `/add-review?id=${film.id}`}
                        className="mt-4 w-full bg-purple-700 hover:bg-purple-800 text-white py-3 rounded-2xl text-sm font-medium transition"
                    >
                      Написать рецензию
                    </button>
                  </div>
                </div>
            ))}
          </div>

          {totalPages > 1 && (
              <div className="flex justify-center gap-3 mt-12">
                <button onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}>←</button>
                <span>{currentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages}>→</button>
              </div>
          )}
        </div>
      </div>
  );
}