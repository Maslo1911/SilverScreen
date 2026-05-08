'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, Edit, Trash2, Users, Film, Star, X, 
  Search, ChevronLeft, ChevronRight, Shield, 
  Calendar, DollarSign, Clock, Eye 
} from 'lucide-react';
import Header from '@/components/Header';
import AdminGuard from '@/components/AdminGuard';
import API from '@/src/api';

interface Film {
  id: number;
  name: string;
  year?: number;
  release_date?: string;
  description?: string;
  overview?: string;
  director?: string;
  screenwriter?: string;
  operator?: string;
  producer?: string;
  composer?: string;
  country?: string;
  budget?: number;
  revenue?: number;
  runtime?: number;
  poster_url?: string;
  rating?: number;
}

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  role_id?: number;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  film_id: number;
  user_id: number;
  created_at: string;
  likes: number;
  film?: Film;
  user?: User;
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'films' | 'users' | 'reviews'>('films');
  
  // Films state
  const [films, setFilms] = useState<Film[]>([]);
  const [editingFilm, setEditingFilm] = useState<Film | null>(null);
  const [showFilmModal, setShowFilmModal] = useState(false);
  const [filmSearch, setFilmSearch] = useState('');
  const [filmPage, setFilmPage] = useState(1);
  
  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  
  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewPage, setReviewPage] = useState(1);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const itemsPerPage = 10;

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (activeTab === 'films') {
        const res = await API.films.getAll();
        let filmsData = res.data?.data?.films || res.data?.data || res.data || [];
        if (!Array.isArray(filmsData)) filmsData = [filmsData];
        setFilms(filmsData);
      } 
      else if (activeTab === 'users') {
        const res = await API.admin.getUsers();
        const usersData = res.data?.data || res.data || [];
        setUsers(usersData);
      }
      else if (activeTab === 'reviews') {
        const res = await API.admin.getAllReviews();
        let reviewsData = res.data?.data || res.data || [];
        if (!Array.isArray(reviewsData)) reviewsData = [];
        setReviews(reviewsData);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация и пагинация
  const filteredFilms = films.filter(film => 
    film.name?.toLowerCase().includes(filmSearch.toLowerCase())
  );
  const paginatedFilms = filteredFilms.slice((filmPage - 1) * itemsPerPage, filmPage * itemsPerPage);
  const totalFilmPages = Math.ceil(filteredFilms.length / itemsPerPage);

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.name?.toLowerCase().includes(userSearch.toLowerCase())
  );
  const paginatedUsers = filteredUsers.slice((userPage - 1) * itemsPerPage, userPage * itemsPerPage);
  const totalUserPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const filteredReviews = reviews.filter(review => 
    review.comment?.toLowerCase().includes(reviewSearch.toLowerCase()) ||
    review.film?.name?.toLowerCase().includes(reviewSearch.toLowerCase()) ||
    review.user?.email?.toLowerCase().includes(reviewSearch.toLowerCase())
  );
  const paginatedReviews = filteredReviews.slice((reviewPage - 1) * itemsPerPage, reviewPage * itemsPerPage);
  const totalReviewPages = Math.ceil(filteredReviews.length / itemsPerPage);

  // Film CRUD
  const handleCreateFilm = async (filmData: Partial<Film>) => {
    try {
      await API.admin.createFilm(filmData);
      await fetchData();
      setShowFilmModal(false);
      setSuccess('Фильм успешно добавлен');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка создания фильма');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUpdateFilm = async (id: number, filmData: Partial<Film>) => {
    try {
      await API.admin.updateFilm(id, filmData);
      await fetchData();
      setEditingFilm(null);
      setShowFilmModal(false);
      setSuccess('Фильм успешно обновлён');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка обновления фильма');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteFilm = async (id: number) => {
    if (confirm('Удалить этот фильм? Все связанные рецензии также будут удалены.')) {
      try {
        await API.admin.deleteFilm(id);
        await fetchData();
        setSuccess('Фильм успешно удалён');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка удаления фильма');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  // User management
  const handleUpdateUserRole = async (id: number, role: string) => {
    try {
      await API.admin.updateUserRole(id, role);
      await fetchData();
      setEditingUser(null);
      setShowUserModal(false);
      setSuccess('Роль пользователя обновлена');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка обновления роли');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (confirm('Удалить этого пользователя? Все его рецензии также будут удалены.')) {
      try {
        await API.admin.deleteUser(id);
        await fetchData();
        setSuccess('Пользователь удалён');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка удаления пользователя');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  // Review management
  const handleDeleteReview = async (id: number) => {
    if (confirm('Удалить эту рецензию?')) {
      try {
        await API.reviews.delete(id);
        await fetchData();
        setSuccess('Рецензия удалена');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ошибка удаления рецензии');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  // Modals
  const FilmModal = ({ film, onClose, onSave }: { film?: Film | null; onClose: () => void; onSave: (data: any) => void }) => {
    const [formData, setFormData] = useState({
      name: film?.name || '',
      release_date: film?.release_date || '',
      country: film?.country || '',
      director: film?.director || '',
      screenwriter: film?.screenwriter || '',
      operator: film?.operator || '',
      producer: film?.producer || '',
      composer: film?.composer || '',
      budget: film?.budget || '',
      revenue: film?.revenue || '',
      runtime: film?.runtime || '',
      overview: film?.overview || film?.description || '',
      poster_url: film?.poster_url || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
            <h2 className="text-2xl font-semibold">{film ? 'Редактировать фильм' : 'Добавить фильм'}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Название *</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-xl" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Дата выхода</label>
                <input type="date" value={formData.release_date} onChange={e => setFormData({...formData, release_date: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Страна</label>
                <input type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Режиссёр</label>
                <input type="text" value={formData.director} onChange={e => setFormData({...formData, director: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Сценарий</label>
                <input type="text" value={formData.screenwriter} onChange={e => setFormData({...formData, screenwriter: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Оператор</label>
                <input type="text" value={formData.operator} onChange={e => setFormData({...formData, operator: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Продюсер</label>
                <input type="text" value={formData.producer} onChange={e => setFormData({...formData, producer: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Композитор</label>
                <input type="text" value={formData.composer} onChange={e => setFormData({...formData, composer: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Длительность (мин)</label>
                <input type="number" value={formData.runtime} onChange={e => setFormData({...formData, runtime: parseInt(e.target.value)})} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Бюджет ($)</label>
                <input type="number" value={formData.budget} onChange={e => setFormData({...formData, budget: parseInt(e.target.value)})} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Сборы ($)</label>
                <input type="number" value={formData.revenue} onChange={e => setFormData({...formData, revenue: parseInt(e.target.value)})} className="w-full px-4 py-2 border rounded-xl" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Описание</label>
              <textarea value={formData.overview} onChange={e => setFormData({...formData, overview: e.target.value})} rows={4} className="w-full px-4 py-2 border rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL постера</label>
              <input type="text" value={formData.poster_url} onChange={e => setFormData({...formData, poster_url: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
            </div>
            <div className="flex gap-4 pt-4">
              <button type="submit" className="flex-1 bg-purple-700 text-white py-3 rounded-xl font-medium hover:bg-purple-800 transition">Сохранить</button>
              <button type="button" onClick={onClose} className="flex-1 border py-3 rounded-xl hover:bg-gray-50 transition">Отмена</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const UserModal = ({ user, onClose, onSave }: { user?: User | null; onClose: () => void; onSave: (id: number, role: string) => void }) => {
    const [selectedRole, setSelectedRole] = useState(user?.role || 'user');

    if (!user) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl max-w-md w-full">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-semibold">Редактировать пользователя</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="text" value={user.email} disabled className="w-full px-4 py-2 border rounded-xl bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Имя</label>
              <input type="text" value={user.name || ''} disabled className="w-full px-4 py-2 border rounded-xl bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Роль</label>
              <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className="w-full px-4 py-2 border rounded-xl">
                <option value="user">Пользователь</option>
                <option value="admin">Администратор</option>
              </select>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => onSave(user.id, selectedRole)} className="flex-1 bg-purple-700 text-white py-3 rounded-xl font-medium hover:bg-purple-800 transition">Сохранить</button>
              <button onClick={onClose} className="flex-1 border py-3 rounded-xl hover:bg-gray-50 transition">Отмена</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#F8F5F0]">
        <Header />
        
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-4xl font-semibold">Админ-панель</h1>
            <Link href="/" className="text-gray-500 hover:text-purple-700 transition">На сайт →</Link>
          </div>
          <p className="text-gray-500 mb-8">Управление фильмами, пользователями и рецензиями</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-2xl">
              {success}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b">
            <button
              onClick={() => { setActiveTab('films'); setFilmPage(1); }}
              className={`px-6 py-3 font-medium transition flex items-center gap-2 ${
                activeTab === 'films' ? 'border-b-2 border-purple-700 text-purple-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Film className="w-4 h-4" /> Фильмы ({films.length})
            </button>
            <button
              onClick={() => { setActiveTab('users'); setUserPage(1); }}
              className={`px-6 py-3 font-medium transition flex items-center gap-2 ${
                activeTab === 'users' ? 'border-b-2 border-purple-700 text-purple-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4" /> Пользователи ({users.length})
            </button>
            <button
              onClick={() => { setActiveTab('reviews'); setReviewPage(1); }}
              className={`px-6 py-3 font-medium transition flex items-center gap-2 ${
                activeTab === 'reviews' ? 'border-b-2 border-purple-700 text-purple-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Star className="w-4 h-4" /> Рецензии ({reviews.length})
            </button>
          </div>

          {/* Films Tab */}
          {activeTab === 'films' && (
            <div>
              <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Поиск фильмов..."
                    value={filmSearch}
                    onChange={(e) => { setFilmSearch(e.target.value); setFilmPage(1); }}
                    className="w-full pl-10 pr-4 py-2 border rounded-xl"
                  />
                </div>
                <button
                  onClick={() => { setEditingFilm(null); setShowFilmModal(true); }}
                  className="bg-purple-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-purple-800 transition"
                >
                  <Plus className="w-4 h-4" /> Добавить фильм
                </button>
              </div>
              
              {loading ? (
                <div className="text-center py-12">Загрузка...</div>
              ) : (
                <>
                  <div className="bg-white rounded-2xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-4 font-medium">ID</th>
                          <th className="text-left p-4 font-medium">Постер</th>
                          <th className="text-left p-4 font-medium">Название</th>
                          <th className="text-left p-4 font-medium">Год</th>
                          <th className="text-left p-4 font-medium">Режиссёр</th>
                          <th className="text-left p-4 font-medium">Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedFilms.map(film => (
                          <tr key={film.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">{film.id}</td>
                            <td className="p-4">
                              {film.poster_url ? (
                                <img src={film.poster_url} alt={film.name} className="w-10 h-14 object-cover rounded" />
                              ) : (
                                <div className="w-10 h-14 bg-gray-200 rounded"></div>
                              )}
                            </td>
                            <td className="p-4 font-medium">{film.name}</td>
                            <td className="p-4">{film.release_date ? new Date(film.release_date).getFullYear() : '—'}</td>
                            <td className="p-4">{film.director || '—'}</td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <Link href={`/movie/${film.id}`} target="_blank" className="p-1 hover:bg-gray-100 rounded transition">
                                  <Eye className="w-5 h-5 text-gray-500" />
                                </Link>
                                <button onClick={() => { setEditingFilm(film); setShowFilmModal(true); }} className="p-1 hover:bg-gray-100 rounded transition">
                                  <Edit className="w-5 h-5 text-blue-600" />
                                </button>
                                <button onClick={() => handleDeleteFilm(film.id)} className="p-1 hover:bg-gray-100 rounded transition">
                                  <Trash2 className="w-5 h-5 text-red-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {totalFilmPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                      <button onClick={() => setFilmPage(p => Math.max(1, p-1))} disabled={filmPage === 1} className="px-3 py-1 border rounded-lg disabled:opacity-50">←</button>
                      <span className="px-3 py-1">{filmPage} / {totalFilmPages}</span>
                      <button onClick={() => setFilmPage(p => Math.min(totalFilmPages, p+1))} disabled={filmPage === totalFilmPages} className="px-3 py-1 border rounded-lg disabled:opacity-50">→</button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <div className="mb-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Поиск пользователей..."
                    value={userSearch}
                    onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                    className="w-full pl-10 pr-4 py-2 border rounded-xl"
                  />
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-12">Загрузка...</div>
              ) : (
                <>
                  <div className="bg-white rounded-2xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left p-4 font-medium">ID</th>
                          <th className="text-left p-4 font-medium">Имя</th>
                          <th className="text-left p-4 font-medium">Email</th>
                          <th className="text-left p-4 font-medium">Роль</th>
                          <th className="text-left p-4 font-medium">Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedUsers.map(user => (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">{user.id}</td>
                            <td className="p-4">{user.name || '—'}</td>
                            <td className="p-4">{user.email}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {user.role === 'admin' ? 'Админ' : 'Пользователь'}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <button onClick={() => { setEditingUser(user); setShowUserModal(true); }} className="p-1 hover:bg-gray-100 rounded transition">
                                  <Edit className="w-5 h-5 text-blue-600" />
                                </button>
                                <button onClick={() => handleDeleteUser(user.id)} className="p-1 hover:bg-gray-100 rounded transition">
                                  <Trash2 className="w-5 h-5 text-red-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {totalUserPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                      <button onClick={() => setUserPage(p => Math.max(1, p-1))} disabled={userPage === 1} className="px-3 py-1 border rounded-lg disabled:opacity-50">←</button>
                      <span className="px-3 py-1">{userPage} / {totalUserPages}</span>
                      <button onClick={() => setUserPage(p => Math.min(totalUserPages, p+1))} disabled={userPage === totalUserPages} className="px-3 py-1 border rounded-lg disabled:opacity-50">→</button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div>
              <div className="mb-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Поиск рецензий..."
                    value={reviewSearch}
                    onChange={(e) => { setReviewSearch(e.target.value); setReviewPage(1); }}
                    className="w-full pl-10 pr-4 py-2 border rounded-xl"
                  />
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-12">Загрузка...</div>
              ) : (
                <>
                  <div className="space-y-4">
                    {paginatedReviews.map(review => (
                      <div key={review.id} className="bg-white rounded-2xl p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <Link href={`/movie/${review.film_id}`} className="font-semibold text-lg hover:text-purple-700 transition">
                              {review.film?.name || `Фильм #${review.film_id}`}
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-500">Автор: {review.user?.name || review.user?.email || `Пользователь #${review.user_id}`}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-sm text-gray-500">{review.created_at ? new Date(review.created_at).toLocaleDateString() : '—'}</span>
                            </div>
                            <div className="flex gap-1 mt-2">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                              ))}
                            </div>
                          </div>
                          <button onClick={() => handleDeleteReview(review.id)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </button>
                        </div>
                        <p className="text-gray-700 line-clamp-3">{review.comment || 'Без текста'}</p>
                        <div className="mt-3 flex gap-4 text-sm text-gray-400">
                          <span>❤️ {review.likes || 0} лайков</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {totalReviewPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                      <button onClick={() => setReviewPage(p => Math.max(1, p-1))} disabled={reviewPage === 1} className="px-3 py-1 border rounded-lg disabled:opacity-50">←</button>
                      <span className="px-3 py-1">{reviewPage} / {totalReviewPages}</span>
                      <button onClick={() => setReviewPage(p => Math.min(totalReviewPages, p+1))} disabled={reviewPage === totalReviewPages} className="px-3 py-1 border rounded-lg disabled:opacity-50">→</button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {showFilmModal && (
          <FilmModal 
            film={editingFilm} 
            onClose={() => { setShowFilmModal(false); setEditingFilm(null); }} 
            onSave={(data) => editingFilm ? handleUpdateFilm(editingFilm.id, data) : handleCreateFilm(data)} 
          />
        )}
        
        {showUserModal && (
          <UserModal 
            user={editingUser} 
            onClose={() => { setShowUserModal(false); setEditingUser(null); }} 
            onSave={handleUpdateUserRole} 
          />
        )}
      </div>
    </AdminGuard>
  );
}