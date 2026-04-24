'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, Search } from 'lucide-react';
import { API } from 'app/lib/api';
import Header from 'components/Header';


interface Film {
  id: number;
  name: string;
  year: number;
  country: string;
  image: string;
  genres: string[];
}

type FilmDTO = {
  id: number;
  name: string;
  year?: number;
  country?: string;
  poster_url?: string;
  genres?: string[];
};

export default function Home() {
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [avgRatings, setAvgRatings] = useState<{ [key: number]: number }>({});
  const itemsPerPage = 10;

  // Загрузка списка фильмов
  useEffect(() => {
    API.films.getAll()
      .then(async (res) => {
        const filmsData = res.data.data;
        const normalizedFilms: Film[] = filmsData.films.map((f: FilmDTO) => ({
          id: f.id,
          name: f.name ?? 'Без названия',
          year: f.year ?? 0,
          country: f.country ?? 'Неизвестно',
          image: f.poster_url ?? '',
          genres: Array.isArray(f.genres) ? f.genres : []
        }));
        setFilms(normalizedFilms);
        // Загружаем средние рейтинги для каждого фильма
        const ratingsMap: { [key: number]: number } = {};
        for (const film of normalizedFilms) {
          try {
            const avgRes = await API.reviews.getAverageRating(film.id);
            ratingsMap[film.id] = avgRes.data.data.averageRating || 0;
          } catch {
            ratingsMap[film.id] = 0;
          }
        }
        setAvgRatings(ratingsMap);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Уникальные жанры для фильтра
  const allGenres = Array.from(new Set(films.flatMap(f => f.genres)));

  // Фильтрация
  const filteredFilms = films.filter(film => {
    const matchesSearch = film.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre ? film.genres.includes(selectedGenre) : true;
    return matchesSearch && matchesGenre;
  });

  const totalPages = Math.ceil(filteredFilms.length / itemsPerPage);
  const paginatedFilms = filteredFilms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleFilterChange = (setter: (value: string) => void, value: string) => {
    setCurrentPage(1);
    setter(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5F0]">
        <Header />
        <div className="flex items-center justify-center h-64">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      <Header />

      {/* Hero секция — можно оставить статичной или тоже загружать избранный фильм с бэка */}
      <div className="bg-[#0A0A0A] text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-white text-black rounded-3xl overflow-hidden shadow-2xl">
              <div className="relative">
                <img src="/images/movies/Legend.png" alt="Я - легенда" className="w-full h-[420px] object-cover" />
                <div className="absolute top-4 left-4 bg-green-500 text-white text-sm font-bold px-3 py-1 rounded">7.9</div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                  <span className="ml-2 text-sm text-gray-500">Великолепно!</span>
                </div>
                <h2 className="text-3xl font-semibold mb-1">Я - легенда</h2>
                <p className="text-gray-500 mb-6">2007 • США, Великобритания</p>
                <p className="text-gray-600 leading-relaxed mb-8 line-clamp-6">
                  Уилл Смит тащит весь фильм на своих плечах — при том, что большую часть экранного времени он разговаривает с манекеном и собакой. Атмосфера пустого Нью-Йорка давит, мурашки гарантированы...
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {["Ужасы", "Драма", "Боевик"].map(g => <span key={g} className="px-4 py-1 bg-gray-100 rounded-full text-sm">{g}</span>)}
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl font-semibold leading-tight">
                Честные оценки.<br />
                <span className="text-[#4ADE80]">РЕАЛЬНЫЕ ОТЗЫВЫ.</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-md">
                Ставь оценки, пиши отзывы и помогай другим не терять время на посредственность.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Список фильмов */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск фильмов..."
              value={searchQuery}
              onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:border-purple-600"
            />
          </div>
          <select
            value={selectedGenre}
            onChange={(e) => handleFilterChange(setSelectedGenre, e.target.value)}
            className="px-4 py-3 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:border-purple-600"
          >
            <option value="">Все жанры</option>
            {allGenres.map(genre => <option key={genre} value={genre}>{genre}</option>)}
          </select>
        </div>

        {filteredFilms.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Фильмы не найдены</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
              {paginatedFilms.map((film) => (
                <div key={film.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-200 flex flex-col h-full">
                  <Link href={`/movie/${film.id}`} className="block group">
                    <div className="relative">
                      <img src={film.image} alt={film.name} className="w-full aspect-[2/3] object-cover" />
                      <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded">
                        {avgRatings[film.id] ? avgRatings[film.id].toFixed(1) : '?'}
                      </div>
                    </div>
                    <div className="p-5 pb-2">
                      <h3 className="font-semibold text-lg leading-tight mb-2 group-hover:text-purple-700 transition">{film.name}</h3>
                      <p className="text-sm text-gray-500 mb-4">{film.year} • {film.country}</p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {film.genres.slice(0, 2).map(g => <span key={g} className="text-[10px] bg-gray-100 px-3 py-1 rounded-full">{g}</span>)}
                      </div>
                    </div>
                  </Link>
                  <div className="px-5 pb-5 mt-auto">
                    <button
                      onClick={() => window.location.href = `/add-review?id=${film.id}`}
                      className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3.5 rounded-2xl text-sm font-medium transition"
                    >
                      Написать рецензию
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl border bg-white disabled:opacity-50"
                >
                  ←
                </button>
                <span className="px-4 py-2 text-gray-700">{currentPage} / {totalPages}</span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl border bg-white disabled:opacity-50"
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <footer className="bg-[#F8F5F0] py-10 text-center text-sm text-gray-500 border-t">
        © Marka. Все права защищены
      </footer>
    </div>
  );
}