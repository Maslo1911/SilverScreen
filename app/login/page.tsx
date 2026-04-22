'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex">
      {/* Левая часть - Форма входа */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Логотип */}
          <div className="flex justify-center mb-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-4xl">M</span>
              </div>
              <span className="text-4xl font-semibold tracking-tight">Marka</span>
            </div>
          </div>

          <h1 className="text-4xl font-semibold text-center mb-10">Вход</h1>

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-600 mb-2">E-mail</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@mail.com"
                className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-purple-600 transition"
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
              />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="w-5 h-5 accent-purple-700" />
              <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                Я согласен с правилами сайта
              </label>
            </div>

            <button className="w-full bg-purple-700 hover:bg-purple-800 text-white py-4 rounded-2xl font-semibold text-lg transition">
              Войти
            </button>

            <div className="relative text-center my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <span className="relative bg-[#F8F5F0] px-6 text-gray-500 text-sm">Или</span>
            </div>

            <button className="w-full border border-gray-300 hover:border-gray-400 bg-white py-4 rounded-2xl flex items-center justify-center gap-3 transition">
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
          </div>
        </div>
      </div>

      {/* Правая часть — Большое изображение */}
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