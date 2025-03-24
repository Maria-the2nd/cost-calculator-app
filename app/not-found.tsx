import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-orange-500 mb-4">Página não encontrada</h2>
        <p className="text-gray-400 mb-6">A página que você está procurando não existe.</p>
        <Link
          href="/"
          className="px-6 py-3 font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 inline-block"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
} 