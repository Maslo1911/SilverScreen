import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300">404</h1>
        <h2 className="text-2xl font-semibold mt-4 mb-2">Страница не найдена</h2>
        <p className="text-gray-500 mb-8">Извините, запрашиваемая страница не существует.</p>
        <Link href="/" className="inline-block bg-purple-700 text-white px-8 py-3 rounded-2xl hover:bg-purple-800 transition">
          На главную
        </Link>
      </div>
    </div>
  );
}