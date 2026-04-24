'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import API from '@/src/api';           // ← Исправленный импорт (как в register)

export default function Login() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agree) {
      setError('Необходимо согласиться с правилами сайта');
      return;
    }

    if (!formData.email.trim() || !formData.password) {
      setError('Введите email и пароль');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await API.auth.login(
          formData.email.trim().toLowerCase(),
          formData.password
      );

      if (result.success) {
        router.push('/'); // или '/profile'
      } else {
        setError('Неверный email или пароль');
      }
    } catch (err: unknown) {
      console.error('🔴 Login FULL error:', err);

      let message = 'Не удалось войти. Попробуйте позже.';

      if (err && typeof err === 'object' && err !== null) {
        const errorObj = err as Record<string, any>;
        message = errorObj.response?.data?.message
            || errorObj.response?.data?.error
            || message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-[#F8F5F0] flex">
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            <div className="flex justify-center mb-10">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-4xl">M</span>
                </div>
                <span className="text-4xl font-semibold tracking-tight">Marka</span>
              </Link>
            </div>

            <h1 className="text-4xl font-semibold text-center mb-10">Вход</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm text-gray-600 mb-2">E-mail</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@mail.com"
                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-purple-600 transition"
                    disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Пароль</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-purple-600 transition"
                    disabled={loading}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="terms"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="w-5 h-5 accent-purple-700"
                    disabled={loading}
                />
                <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                  Я согласен с правилами сайта
                </label>
              </div>

              {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm">
                    {error}
                  </div>
              )}

              <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white py-4 rounded-2xl font-semibold text-lg transition disabled:opacity-50"
              >
                {loading ? 'Вход...' : 'Войти'}
              </button>

              <div className="relative text-center my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <span className="relative bg-[#F8F5F0] px-6 text-gray-500 text-sm">Или</span>
              </div>

              <button
                  type="button"
                  disabled={loading}
                  className="w-full border border-gray-300 hover:border-gray-400 bg-white py-4 rounded-2xl flex items-center justify-center gap-3 transition"
              >
                <img
                    src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
                    alt="Google"
                    className="w-6 h-6"
                />
                <span className="font-medium">Продолжить с Google</span>
              </button>

              <p className="text-center text-sm text-gray-600 mt-8">
                Нет аккаунта?{' '}
                <Link href="/register" className="text-purple-700 hover:underline font-medium">
                  Зарегистрироваться
                </Link>
              </p>
            </form>
          </div>
        </div>

        <div className="hidden lg:block w-5/12 relative">
          <img
              src="/images/movies/bg-big.png"
              alt="Login background"
              className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      </div>
  );
}