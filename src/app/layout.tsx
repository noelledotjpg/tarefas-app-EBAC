import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gerenciador de Tarefas',
  description: 'App de tarefas com Next.js 15 e testes unitários',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
