'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/app/lib/firebase';
import { signOut } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/app/lib/LocaleContext';

import { Branch, Tenant } from '@/app/types';

export default function TenantAdminPanel({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { t } = useTranslation();
  const { locale, changeLocale } = useLocale();

  // Desempaquetamos el ID de la URL (el ID de la empresa)
  const { id: tenantId } = use(params);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Formulario para nueva sucursal
  const [branchName, setBranchName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      try {
        const tokenResult = await user.getIdTokenResult();
        const role = tokenResult.claims.role;
        const userTenantId = tokenResult.claims.tenantId;

        // Solo permitir acceso si el rol es EMPRESA y el tenantId coincide
        if (role !== 'EMPRESA' || userTenantId !== tenantId) {
          console.warn('Acceso denegado: No tienes permisos para administrar esta empresa.');
          await signOut(auth);
          router.push('/login');
        } else {
          setCheckingAuth(false);
        }
      } catch (error) {
        console.error("Error verificando permisos de empresa:", error);
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router, tenantId]);

  useEffect(() => {
    if (checkingAuth) return;
    let isMounted = true;
    const loadTenantData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();

        // 1. Cargamos datos de la empresa para el título
        const resTenant = await fetch(`${API_URL}/tenants/${tenantId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const tenantData = await resTenant.json();

        // 2. Cargamos las sucursales de esta empresa
        const resBranches = await fetch(`${API_URL}/branches?tenantId=${tenantId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const branchesData = await resBranches.json();

        if (isMounted) {
          setTenant(tenantData);
          setBranches(branchesData);
        }
      } catch (error) {
        console.error("Error cargando sucursales:", error);
      }
    };
    loadTenantData();
    return () => { isMounted = false; };
  }, [tenantId, refreshKey, checkingAuth]);

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      await fetch(`${API_URL}/branches`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: branchName,
          address,
          phone,
          tenantId // Vinculamos la sucursal a esta empresa
        }),
      });
      setBranchName(''); setAddress(''); setPhone('');
      setRefreshKey(prev => prev + 1);
      
      setSuccessMessage(t('messages.successBranch'));
      setTimeout(() => setSuccessMessage(''), 1000);
    } catch (error) {
      console.error("Error creando sucursal:", error);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        <header className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900">
                {t('nav.adminPanel')}: <span className="text-rose-500">{tenant?.name || '...'}</span>
              </h1>
              <p className="text-slate-500 mt-1">{t('nav.adminDesc')}</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Selector de idioma */}
              <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200 mr-2">
                {(['es', 'en', 'pt', 'fr'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => changeLocale(lang)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all uppercase ${
                      locale === lang
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <Link href={`/tenant/${tenantId}/customers`} className="bg-rose-600 text-white font-bold py-2 px-4 rounded-xl hover:bg-rose-500 transition-colors text-sm">
                {t('nav.clients')}
              </Link>
              <Link href={`/tenant/${tenantId}/staff`} className="bg-slate-900 text-white font-bold py-2 px-4 rounded-xl hover:bg-slate-800 transition-colors text-sm">
                {t('nav.staff')}
              </Link>
              <Link href={`/tenant/${tenantId}/services`} className="bg-slate-700 text-white font-bold py-2 px-4 rounded-xl hover:bg-slate-600 transition-colors text-sm">
                {t('nav.services')}
              </Link>
              <Link href={`/tenant/${tenantId}/appointments`} className="bg-emerald-600 text-white font-bold py-2 px-4 rounded-xl hover:bg-emerald-500 transition-colors text-sm">
                {t('nav.appointments')}
              </Link>
              <button 
                onClick={handleLogout}
                className="bg-slate-800 text-white font-bold py-2 px-4 rounded-xl hover:bg-slate-700 transition-colors text-sm"
              >
                {t('nav.exit')}
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* FORMULARIO SUCURSAL */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 h-fit">
            <h2 className="text-xl font-bold mb-4">{t('form.newBranch')}</h2>
            <form onSubmit={handleCreateBranch} className="space-y-4">
              <input
                className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                placeholder={t('form.branchName')} value={branchName} onChange={e => setBranchName(e.target.value.slice(0, 100))} required maxLength={100}
              />
              <input
                className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                placeholder={t('form.address')} value={address} onChange={e => setAddress(e.target.value.slice(0, 200))} required maxLength={200}
              />
              <input
                className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                placeholder={t('form.phone')} value={phone} onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setPhone(val);
                }} required maxLength={9}
              />
              <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800">
                {t('form.registerBranchBtn')}
              </button>
            </form>
          </div>

          {/* LISTA DE SUCURSALES */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches.map(branch => (
              <div key={branch.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-rose-100 text-rose-600 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                  📍
                </div>
                <h3 className="text-lg font-bold">{branch.name}</h3>
                <p className="text-sm text-slate-500">{branch.address}</p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs font-mono text-slate-400">T-ID: {branch.tenantId.slice(0,8)}</span>
                  <Link
                    href={`/tenant/${tenantId}/branches/${branch.id}`}
                    className="text-sm font-bold text-rose-600 hover:text-rose-700 transition-colors"
                  >
                    {t('nav.configure')}
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-900 font-medium">{t('messages.processing')}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg z-[100]">
          {successMessage}
        </div>
      )}
    </div>
  );
}

