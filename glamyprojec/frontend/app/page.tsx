'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/app/lib/firebase';
import { signOut } from 'firebase/auth';
// IMPORTAMOS LOS COMPONENTES DEL GRÁFICO
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import { PlanType, Tenant } from '@/app/types';

export default function SuperAdminPanel() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [name, setName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState<PlanType>('STARTUP');

  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [newTenantCredentials, setNewTenantCredentials] = useState<{email: string, password: string} | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      const token = await user.getIdTokenResult();
      const role = token.claims.role;
      const tenantId = token.claims.tenantId;

      if (role === 'EMPRESA' && tenantId) {
        router.push(`/tenant/${tenantId}`);
      } else if (role !== 'SUPER_ADMIN') {
        router.push('/login');
      } else {
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (checkingAuth) return;
    let isMounted = true;
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await fetch(`${API_URL}/tenants`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (isMounted && Array.isArray(data)) {
            setTenants(data);
          }
        } catch (error) {
          console.error("Error cargando empresas:", error);
        }
      }
    });
    return () => { isMounted = false; unsubscribe(); };
  }, [refreshKey, checkingAuth]);

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter(t => t.status !== 'SUSPENDED').length;
  const enterpriseTenants = tenants.filter(t => t.plan === 'ENTERPRISE').length;

  // PREPARAMOS LA DATA PARA EL GRÁFICO
  const chartData = [
    {
      name: 'STARTUP',
      clientes: tenants.filter(t => t.plan === 'STARTUP' || !t.plan).length,
      color: '#64748b' // Slate
    },
    {
      name: 'PRO',
      clientes: tenants.filter(t => t.plan === 'PRO').length,
      color: '#3b82f6' // Blue
    },
    {
      name: 'ENTERPRISE',
      clientes: tenants.filter(t => t.plan === 'ENTERPRISE').length,
      color: '#a855f7' // Purple
    }
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (taxId.length !== 11 || !/^[0-9]+$/.test(taxId)) {
      alert('El RUC debe tener exactamente 11 dígitos numéricos.');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      const res = await fetch(`${API_URL}/tenants`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, taxId, contactEmail: email, status: 'ACTIVE', plan }),
      });
      
      const data = await res.json();
      console.log('Empresa creada - Data devuelta:', data);
      
      setName(''); setTaxId(''); setEmail(''); setPlan('STARTUP');
      setRefreshKey(prev => prev + 1);

      if (data.credentials) {
        console.log('Cargando credenciales en el estado...');
        setNewTenantCredentials(data.credentials);
      } else {
        console.warn('El backend no devolvió credenciales:', data);
      }
      
      setSuccessMessage('¡Empresa creada con éxito!');
      setTimeout(() => setSuccessMessage(''), 1000);
    } catch (error) {
      console.error("Error creando:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string | undefined) => {
    const newStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    if (!window.confirm(`¿Estás seguro de cambiar el estado a ${newStatus}?`)) return;
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      await fetch(`${API_URL}/tenants/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      });
      setRefreshKey(prev => prev + 1);
      
      setSuccessMessage('¡Estado actualizado!');
      setTimeout(() => setSuccessMessage(''), 1000);
    } catch (error) {
      console.error("Error cambiando estado:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      await fetch(`${API_URL}/tenants/${editingTenant.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editingTenant.name,
          taxId: editingTenant.taxId,
          contactEmail: editingTenant.contactEmail,
          plan: editingTenant.plan
        }),
      });
      setEditingTenant(null);
      setRefreshKey(prev => prev + 1);
      
      setSuccessMessage('¡Datos actualizados!');
      setTimeout(() => setSuccessMessage(''), 1000);
    } catch (error) {
      console.error("Error actualizando:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTenant = async (id: string) => {
    if (!window.confirm('ALERTA CRÍTICA: ¿Eliminar esta empresa y todos sus datos?')) return;
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      await fetch(`${API_URL}/tenants/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setRefreshKey(prev => prev + 1);
      
      setSuccessMessage('¡Empresa eliminada!');
      setTimeout(() => setSuccessMessage(''), 1000);
    } catch (error) {
      console.error("Error eliminando:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (tenants.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }
    const headers = ['ID Firebase', 'Razón Social', 'Plan SaaS', 'RUC/DNI', 'Email de Contacto', 'Estado Actual'];
    const csvRows = [headers.join(',')];

    tenants.forEach(t => {
      const row = [
        t.id,
        `"${t.name}"`,
        t.plan || 'STARTUP',
        t.taxId,
        t.contactEmail,
        t.status || 'ACTIVE'
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Reporte_Ecosistema_SaaS_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPlanColor = (planType?: string) => {
    switch(planType) {
      case 'PRO': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'ENTERPRISE': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-12">

      <nav className="bg-slate-900 border-b border-slate-800 px-8 py-4 sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-orange-500 rounded-lg shadow-lg shadow-rose-500/20"></div>
          <h1 className="text-2xl font-black tracking-tight">
            SaaS<span className="text-slate-400 font-light">Glamy</span>
          </h1>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
          <span>Administrador Maestro</span>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-rose-500 font-bold">
            GF
          </div>
          <button 
            onClick={handleLogout}
            className="ml-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors border border-slate-700"
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 mt-10 space-y-8">

        {/* FILA 1: KPIS Y GRÁFICO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Columna Izquierda: Tarjetas KPI */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between h-32">
              <h3 className="text-slate-400 font-medium uppercase tracking-widest text-xs">Total Clientes</h3>
              <p className="text-4xl font-black text-white">{totalTenants}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between h-32">
              <h3 className="text-slate-400 font-medium uppercase tracking-widest text-xs">Empresas Activas</h3>
              <p className="text-4xl font-black text-green-400">{activeTenants}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between h-32">
              <h3 className="text-slate-400 font-medium uppercase tracking-widest text-xs">Clientes Enterprise</h3>
              <p className="text-4xl font-black text-purple-400">{enterpriseTenants}</p>
            </div>
          </div>

          {/* Columna Derecha: Gráfico Analítico */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col">
            <h3 className="text-slate-400 font-medium uppercase tracking-widest text-xs mb-6">Distribución por Suscripción</h3>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: '#1e293b' }}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    labelStyle={{
                      color: '#ffffff'
                    }}
                    itemStyle={{
                      color: '#ffffff'
                    }}
                  />
                    <Bar dataKey="clientes" radius={[6, 6, 0, 0]} maxBarSize={60}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4 text-white">Registrar Nueva Empresa</h2>
          <form onSubmit={handleCreateTenant} className="flex flex-col md:flex-row gap-4">
            <input className="flex-1 bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none focus:border-rose-500" placeholder="Razón Social" value={name} onChange={e => setName(e.target.value.slice(0, 100))} required maxLength={100} />
            <input className="flex-1 bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none focus:border-rose-500" placeholder="RUC (11 dígitos)" value={taxId} onChange={e => {
              const val = e.target.value.replace(/[^0-9]/g, '');
              setTaxId(val);
            }} required maxLength={11} />
            <input type="email" className="flex-1 bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none focus:border-rose-500" placeholder="Correo de Contacto" value={email} onChange={e => setEmail(e.target.value)} required />
            <select className="flex-1 bg-slate-950 border border-slate-800 p-3 rounded-xl outline-none focus:border-rose-500 text-slate-300" value={plan} onChange={e => setPlan(e.target.value as PlanType)}>
              <option value="STARTUP">Plan STARTUP (Básico)</option>
              <option value="PRO">Plan PRO (Intermedio)</option>
              <option value="ENTERPRISE">Plan ENTERPRISE (Ilimitado)</option>
            </select>
            <button className="bg-white text-slate-950 hover:bg-slate-200 font-bold py-3 px-8 rounded-xl transition-colors">
              Crear Tenant
            </button>
          </form>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-lg font-bold text-white">Directorio de Ecosistema</h2>
            <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition-colors text-sm border border-slate-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Exportar CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-widest">
                  <th className="p-4 font-medium">Empresa</th>
                  <th className="p-4 font-medium">Plan (Suscripción)</th>
                  <th className="p-4 font-medium">Identificador Fiscal</th>
                  <th className="p-4 font-medium">Estado</th>
                  <th className="p-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {tenants.map(tenant => (
                  <tr key={tenant.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-200">{tenant.name}</div>
                      <div className="text-xs text-slate-500 font-mono mt-1">{tenant.contactEmail}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-[10px] font-black tracking-widest rounded-full border uppercase ${getPlanColor(tenant.plan)}`}>
                        {tenant.plan || 'STARTUP'}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-sm text-slate-300">{tenant.taxId}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(tenant.id, tenant.status)}
                        className={`px-3 py-1 text-xs font-bold rounded-full border ${
                          tenant.status !== 'SUSPENDED' ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                        }`}
                      >
                        {tenant.status !== 'SUSPENDED' ? 'Activo' : 'Suspendido'}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => setEditingTenant(tenant)} className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-bold rounded hover:bg-slate-700 transition-colors">Editar</button>
                      <button onClick={() => handleDeleteTenant(tenant.id)} className="px-3 py-1.5 bg-transparent border border-rose-900 text-rose-500 text-xs font-bold rounded hover:bg-rose-900/50 transition-colors">X</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingTenant && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-white">Editar Tenant</h2>
            <form onSubmit={handleUpdateTenant} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Razón Social</label>
                <input className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-rose-500" value={editingTenant.name} onChange={e => setEditingTenant(prev => prev ? {...prev, name: e.target.value.slice(0, 100)} : null)} required maxLength={100} />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Plan (Suscripción)</label>
                <select className="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-rose-500" value={editingTenant.plan || 'STARTUP'} onChange={e => setEditingTenant(prev => prev ? {...prev, plan: e.target.value as PlanType} : null)}>
                  <option value="STARTUP">Plan STARTUP</option>
                  <option value="PRO">Plan PRO</option>
                  <option value="ENTERPRISE">Plan ENTERPRISE</option>
                </select>
              </div>
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setEditingTenant(null)} className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700">Cancelar</button>
                <button type="submit" className="flex-1 bg-rose-600 text-white font-bold py-3 rounded-xl hover:bg-rose-500">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {newTenantCredentials && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[110] p-4">
          <div className="bg-slate-900 border border-emerald-500/30 p-8 rounded-3xl max-w-md w-full shadow-2xl">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4 text-2xl">
              🔑
            </div>
            <h2 className="text-2xl font-bold mb-2 text-white">¡Empresa Creada!</h2>
            <p className="text-slate-400 text-sm mb-6">Comparte estas credenciales con el administrador de la empresa para que pueda ingresar por primera vez.</p>
            
            <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Correo de Acceso</label>
                <div className="text-white font-mono">{newTenantCredentials.email}</div>
              </div>
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Contraseña Temporal</label>
                <div className="text-emerald-400 font-mono font-bold tracking-wider">{newTenantCredentials.password}</div>
              </div>
            </div>

            <button 
              onClick={() => setNewTenantCredentials(null)} 
              className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Entendido, Guardado
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white font-medium">Procesando...</p>
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
