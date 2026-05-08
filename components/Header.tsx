'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { User, LogOut, Shield } from 'lucide-react';
import API from '@/src/api';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
    
    if (token) {
      API.auth.me()
        .then(res => {
          const user = res.data?.data || res.data;
          setUserRole(user.role);
        })
        .catch(() => {});
    }
  }, []);

  const handleLogout = async () => {
    await API.auth.logout();
    setIsLoggedIn(false);
    setUserRole(null);
    router.push('/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white font-bold text-2xl">M</div>
          <span className="text-2xl font-semibold">Marka</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className={`hover:text-purple-700 transition ${pathname === '/' ? 'text-purple-700' : 'text-gray-700'}`}>Главная</Link>
          <Link href="/movies" className={`hover:text-purple-700 transition ${pathname === '/movies' ? 'text-purple-700' : 'text-gray-700'}`}>Фильмы</Link>
        </nav>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="w-9 h-9 bg-purple-700 text-white rounded-full flex items-center justify-center font-medium hover:bg-purple-800 transition">
                П
              </button>
              
              {showMenu && (
                <>
                  <div className="fixed inset-0" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border py-2 z-10">
                    <Link href="/profile" onClick={() => setShowMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition">
                      <User className="w-4 h-4" /> Профиль
                    </Link>
                    {userRole === 'admin' && (
                      <Link href="/admin" onClick={() => setShowMenu(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition">
                        <Shield className="w-4 h-4" /> Админ-панель
                      </Link>
                    )}
                    <button onClick={() => { handleLogout(); setShowMenu(false); }} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition w-full text-left">
                      <LogOut className="w-4 h-4" /> Выйти
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/login" className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition">
              Войти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}