'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Staff } from '@/app/types';

export default function StaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: tenantId } = use(params);

  const [staff, setStaff] = useState<Staff[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Formulario para nuevo personal
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');

  const API_URL = 'http://localhost:3000';

  useEffect(() => {
    let isMounted = true;
    const loadStaff = async () => {
      try {
        const res = await fetch(`${API_URL}/staff?tenantId=${tenantId}`);
        const data = await res.json();
        if (isMounted) setStaff(data);
      } catch (error) {
        console.error("Error cargando personal:", error);
      }
    };
    loadStaff();
    return () => { isMounted = false; };
  }, [tenantId, refreshKey]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          role,
          phone,
          tenantId
        }),
      });
      setName(''); setRole(''); setPhone('');
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Error creando personal:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        <Link href={`/tenant/${tenantId}`} className="text-rose-500 font-bold flex items-center gap-2 hover:underline">
          ← Volver al Panel de la Empresa
        </Link>

        <header className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h1 className="text-3xl font-black text-slate-900">
            Gestión de <span className="text-rose-500">Personal</span>
          </h1>
          <p className="text-slate-500 mt-1">Registra y administra los estilistas y trabajadores de tu salón.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* FORMULARIO STAFF */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 h-fit">
            <h2 className="text-xl font-bold mb-4">Nuevo Personal</h2>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <input
                className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Nombre Completo" value={name} onChange={e => setName(e.target.value)} required
              />
              <input
                className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Rol (Ej. Estilista, Manicurista)" value={role} onChange={e => setRole(e.target.value)} required
              />
              <input
                className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Teléfono" value={phone} onChange={e => setPhone(e.target.value)} required
              />
              <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800">
                Registrar Personal
              </button>
            </form>
          </div>

          {/* LISTA DE STAFF */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold">Personal Registrado</h2>
            </div>
            
            {staff.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No hay personal registrado aún.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-widest">
                      <th className="p-4 font-medium">Nombre</th>
                      <th className="p-4 font-medium">Rol</th>
                      <th className="p-4 font-medium">Contacto</th>
                      <th className="p-4 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {staff.map(member => (
                      <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{member.name}</div>
                          <div className="text-xs text-slate-400 font-mono mt-1">ID: {member.id.slice(0,8)}</div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 text-xs font-bold bg-rose-100 text-rose-600 rounded-full">
                            {member.role}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-slate-700">
                          {member.phone}
                        </td>
                        <td className="p-4 text-right">
                          <button className="text-sm font-bold text-rose-600 hover:text-rose-700 transition-colors">
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
