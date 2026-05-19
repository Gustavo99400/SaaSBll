'use client';

import { useState } from 'react';
import { auth } from '@/app/lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdTokenResult();
      
      // Aquí podemos leer los Custom Claims
      const role = token.claims.role;
      const tenantId = token.claims.tenantId;
      const requiresPasswordChange = token.claims.requiresPasswordChange;

      if (requiresPasswordChange) {
        router.push('/login/change-password');
        return;
      }

      // Redirección basada en roles
      if (role === 'EMPRESA') {
        router.push(`/tenant/${tenantId}`);
      } else if (role === 'SUPER_ADMIN') {
        router.push('/login/verify-2fa');
      } else {
        router.push('/customer/dashboard'); // O donde sea para clientes
      }
    } catch (err: any) {
      console.error("Error en login:", err);
      setError('Credenciales inválidas o error en el sistema.');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Los usuarios que entran por Google son Clientes estrictamente
      router.push('/customer/dashboard');
    } catch (err: any) {
      console.error("Error en Google login:", err);
      setError('No se pudo iniciar sesión con Google.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900">
            Bienvenido a <span className="text-rose-500">Glamy</span>
          </h1>
          <p className="text-slate-500 mt-2">Inicia sesión para continuar</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 text-center font-medium">
            {error}
          </div>
        )}

        {/* LOGIN PARA CLIENTES (GOOGLE) */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50 transition-colors mb-6 shadow-sm"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Ingresar con Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-500">O ingresa con tu correo</span>
          </div>
        </div>

        {/* LOGIN PARA ADMINS / STAFF (CORREO/CLAVE) */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Correo Electrónico</label>
            <input
              type="email"
              className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 text-slate-700"
              placeholder="admin@empresa.com"
              value={email} onChange={e => setEmail(e.target.value)} required
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Contraseña</label>
            <input
              type="password"
              className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 text-slate-700"
              placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
          >
            Iniciar Sesión
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-400">
          Uso exclusivo para personal autorizado y clientes.
        </div>

      </div>
    </div>
  );
}
