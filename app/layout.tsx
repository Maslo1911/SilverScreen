import type { Metadata } from 'next';
import './globals.css';   // ← должна быть эта строка!

export const metadata: Metadata = {
  title: 'Marka',
  description: 'Рецензии на фильмы',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}