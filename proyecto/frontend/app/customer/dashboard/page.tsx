'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/app/lib/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';

export default function CustomerDashboard() {
  const [userName, setUserName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login');
      } else {
        setUserName(user.displayName || user.email || 'Cliente');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">¡Hola, {userName}! 👋</h1>
            <p className="text-slate-500 text-sm mt-1">Bienvenido a tu portal de reservas.</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-slate-900 text-white font-bold py-2 px-4 rounded-xl hover:bg-slate-800 transition-colors text-sm"
          >
            Cerrar Sesión
          </button>
        </header>

        <main className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Tus Próximas Citas</h2>
            <div className="text-center py-8 text-slate-400 text-sm">
              <div className="text-4xl mb-2">📅</div>
              No tienes citas programadas aún.
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Reservar Nueva Cita</h2>
            <p className="text-slate-500 text-sm mb-4">Encuentra tu salón favorito y reserva en segundos.</p>
            <button className="w-full bg-rose-600 text-white font-bold py-3 rounded-xl hover:bg-rose-500 transition-colors">
              Buscar Salones
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
