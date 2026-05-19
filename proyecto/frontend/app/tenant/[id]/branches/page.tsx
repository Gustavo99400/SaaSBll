'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function BranchesRedirect() {
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      router.push(`/tenant/${id}`);
    }
  }, [id, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm">Redireccionando a la gestión de sedes...</p>
      </div>
    </div>
  );
}
