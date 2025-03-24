'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-orange-500 mb-4">Algo deu errado!</h2>
        <p className="text-gray-400 mb-6">Ocorreu um erro ao processar sua solicitação.</p>
        <button
          onClick={reset}
          className="px-6 py-3 font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
} 