'use client';

import { useState } from 'react';
import { auth } from '@/app/lib/firebase';
import { useRouter } from 'next/navigation';

export default function Verify2FAPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const user = auth.currentUser;
    if (!user) {
      setError('No hay un usuario autenticado.');
      router.push('/login');
      return;
    }

    try {
      const token = await user.getIdToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_URL}/auth/2fa/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/');
      } else {
        setError(data.message || 'Código inválido.');
        if (data.message && data.message.includes('No se ha configurado 2FA')) {
          setShowSetup(true);
        }
      }
    } catch (err: any) {
      console.error("Error verificando 2FA:", err);
      setError('Error en el sistema al verificar el código.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_URL}/auth/2fa/generate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.otpauthUrl) {
        setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data.otpauthUrl)}&size=200x200`);
      }
    } catch (err) {
      console.error("Error generando QR:", err);
      setError('No se pudo generar el código QR.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4 mx-auto text-2xl">
            🛡️
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Verificación en Dos Pasos</h1>
          <p className="text-slate-500 mt-2">
            {showSetup ? 'Configura tu autenticador escaneando el código QR.' : 'Ingresa el código de 6 dígitos de tu aplicación Google Authenticator.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 text-center font-medium">
            {error}
          </div>
        )}

        {showSetup ? (
          <div className="text-center space-y-6">
            {!qrUrl ? (
              <button
                onClick={handleGenerateQR}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Generar Código QR
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center bg-white p-4 rounded-xl border border-slate-200 inline-block mx-auto">
                  <img src={qrUrl} alt="QR Code" />
                </div>
                <p className="text-xs text-slate-500">Escanea este código con Google Authenticator y luego ingresa el código abajo para verificar.</p>
                <button
                  onClick={() => setShowSetup(false)}
                  className="text-emerald-500 font-bold text-sm hover:underline"
                >
                  Ya lo escaneé, ingresar código
                </button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="text-xs text-slate-500 uppercase font-bold mb-1 block text-center">Código de Seguridad</label>
              <input
                type="text"
                className="w-full border p-4 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 text-center text-2xl font-bold tracking-widest"
                placeholder="000000"
                maxLength={6}
                value={code} onChange={e => setCode(e.target.value)} required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Verificando...' : 'Verificar Código'}
            </button>
          </form>
        )}

        <div className="text-center mt-6 text-xs text-slate-400">
          ¿No tienes acceso a tu autenticador? Contacta a soporte.
        </div>

      </div>
    </div>
  );
}
