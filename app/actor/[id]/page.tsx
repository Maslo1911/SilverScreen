'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Film as FilmIcon } from 'lucide-react';
import Header from '@/components/Header';
import API from '@/src/api';

interface Actor {
  id: number;
  name: string;
  biography: string;
  birth_date: string;
  photo_url: string;
  films?: Array<{
    id: number;
    name: string;
    character: string;
    poster_url?: string;
  }>;
}

export default function ActorPage() {
  const params = useParams();
  const actorId = parseInt(params.id as string);
  
  const [actor, setActor] = useState<Actor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadActor = async () => {
      try {
        const res = await API.actors.getById(actorId);
        const actorData = res.data?.data || res.data;
        setActor(actorData);
      } catch (err) {
        setError('Актёр не найден');
      } finally {
        setLoading(false);
      }
    };
    loadActor();
  }, [actorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5F0]">
        <Header />
        <div className="flex items-center justify-center h-64">Загрузка...</div>
      </div>
    );
  }

  if (error || !actor) {
    return (
      <div className="min-h-screen bg-[#F8F5F0]">
        <Header />
        <div className="flex items-center justify-center h-64 text-red-600">{error || 'Актёр не найден'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-6 py-10">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-8">
          <ArrowLeft className="w-4 h-4" /> Назад
        </Link>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Фото */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl overflow-hidden shadow-lg">
              <img 
                src={actor.photo_url || '/images/placeholder-actor.jpg'} 
                alt={actor.name}
                className="w-full aspect-[3/4] object-cover"
              />
            </div>
          </div>

          {/* Информация */}
          <div className="lg:col-span-2 space-y-6">
            <h1 className="text-5xl font-semibold">{actor.name}</h1>
            
            {actor.birth_date && (
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="w-5 h-5" />
                <span>Дата рождения: {new Date(actor.birth_date).toLocaleDateString('ru-RU')}</span>
              </div>
            )}

            <div className="bg-white rounded-3xl p-8">
              <h2 className="text-2xl font-semibold mb-4">Биография</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {actor.biography || 'Биография пока не добавлена.'}
              </p>
            </div>

            {actor.films && actor.films.length > 0 && (
              <div className="bg-white rounded-3xl p-8">
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                  <FilmIcon className="w-6 h-6" />
                  Фильмография
                </h2>
                <div className="grid gap-4">
                  {actor.films.map(film => (
                    <Link 
                      key={film.id} 
                      href={`/movie/${film.id}`}
                      className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition"
                    >
                      {film.poster_url && (
                        <img src={film.poster_url} alt={film.name} className="w-12 h-16 object-cover rounded-lg" />
                      )}
                      <div>
                        <h3 className="font-medium">{film.name}</h3>
                        {film.character && <p className="text-sm text-gray-500">Роль: {film.character}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}