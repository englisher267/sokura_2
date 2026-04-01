import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SOKURA - 自分取説AI',
  description: '成功と失敗の体験から、あなたの「自分取説」を作るAI対話',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
