'use client';

import { useState } from 'react';
import { auth } from '@/app/lib/firebase';
import { updatePassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function ChangePasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setError('No hay un usuario autenticado.');
      router.push('/login');
      return;
    }

    try {
      // 1. Actualizamos la contraseña en Firebase Auth
      await updatePassword(user, password);
      const token = await user.getIdToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      await fetch(`${API_URL}/auth/password-changed`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Forzamos refresco del token para obtener los claims actualizados
      const tokenResult = await user.getIdTokenResult(true);
      const role = tokenResult.claims.role;
      const tenantId = tokenResult.claims.tenantId;

      setSuccess(true);
      
      setTimeout(() => {
        if (role === 'EMPRESA' && tenantId) {
          router.push(`/tenant/${tenantId}`);
        } else {
          router.push('/login');
        }
      }, 2000);
    } catch (err: any) {
      console.error("Error cambiando contraseña:", err);
      setError('No se pudo cambiar la contraseña. Es posible que debas re-autenticarte.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-4 mx-auto text-2xl">
            🔒
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Actualizar Contraseña</h1>
          <p className="text-slate-500 mt-2">Por seguridad, debes cambiar tu contraseña temporal antes de continuar.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 text-center font-medium">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-green-50 text-green-600 p-4 rounded-xl text-center font-medium">
            ¡Contraseña actualizada con éxito! Redirigiendo...
          </div>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Nueva Contraseña</label>
              <input
                type="password"
                className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 text-slate-700"
                placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required
              />
            </div>

            <div>
              <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Confirmar Contraseña</label>
              <input
                type="password"
                className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 text-slate-700"
                placeholder="••••••••"
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
            >
              Guardar y Continuar
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
