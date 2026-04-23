'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { API } from 'app/lib/api';

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('accessToken'));
  }, []);

  const handleLogout = async () => {
    await API.auth.logout();
    setIsLoggedIn(false);
    router.push('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white font-bold text-2xl">M</div>
          <span className="text-2xl font-semibold tracking-tight">Marka</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="text-black">Главная</Link>
          {isLoggedIn && <Link href="/profile" className="text-gray-600 hover:text-black">Профиль</Link>}
          {isLoggedIn && <Link href="/add-review" className="text-gray-600 hover:text-black">Добавить рецензию</Link>}
        </nav>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <button onClick={handleLogout} className="text-sm bg-gray-200 px-4 py-2 rounded-full hover:bg-gray-300">Выйти</button>
          ) : (
            <Link href="/login" className="text-sm bg-purple-700 text-white px-4 py-2 rounded-full hover:bg-purple-800">Войти</Link>
          )}
        </div>
      </div>
    </header>
  );
}