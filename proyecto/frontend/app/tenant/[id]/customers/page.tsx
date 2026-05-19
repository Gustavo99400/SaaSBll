'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Customer } from '@/app/types';

export default function CustomersPage({ params }: { params: Promise<{ id: string }> }) {
  // Desempaquetamos el ID de la URL (el ID de la empresa)
  const { id: tenantId } = use(params);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Formulario para nuevo cliente
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    let isMounted = true;
    const loadCustomers = async () => {
      try {
        const res = await fetch(`${API_URL}/customers?tenantId=${tenantId}`);
        const data = await res.json();
        if (isMounted) setCustomers(data);
      } catch (error) {
        console.error("Error cargando clientes:", error);
      }
    };
    loadCustomers();
    return () => { isMounted = false; };
  }, [tenantId, refreshKey]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          tenantId // Vinculamos el cliente a esta empresa
        }),
      });
      setName(''); setEmail(''); setPhone('');
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Error creando cliente:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* NAVEGACIÓN DE REGRESO */}
        <Link href={`/tenant/${tenantId}`} className="text-rose-500 font-bold flex items-center gap-2 hover:underline">
          ← Volver al Panel de la Empresa
        </Link>

        <header className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h1 className="text-3xl font-black text-slate-900">
            Gestión de <span className="text-rose-500">Clientes</span>
          </h1>
          <p className="text-slate-500 mt-1">Registra y administra los clientes de tu salón.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* FORMULARIO CLIENTE */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 h-fit">
            <h2 className="text-xl font-bold mb-4">Nuevo Cliente</h2>
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <input
                className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Nombre Completo" value={name} onChange={e => setName(e.target.value)} required
              />
              <input
                className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                type="email"
                placeholder="Correo Electrónico" value={email} onChange={e => setEmail(e.target.value)} required
              />
              <input
                className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Teléfono" value={phone} onChange={e => setPhone(e.target.value)} required
              />
              <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800">
                Registrar Cliente
              </button>
            </form>
          </div>

          {/* LISTA DE CLIENTES */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold">Clientes Registrados</h2>
            </div>
            
            {customers.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No hay clientes registrados aún.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-widest">
                      <th className="p-4 font-medium">Nombre</th>
                      <th className="p-4 font-medium">Contacto</th>
                      <th className="p-4 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customers.map(customer => (
                      <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{customer.name}</div>
                          <div className="text-xs text-slate-400 font-mono mt-1">ID: {customer.id.slice(0,8)}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-slate-700">{customer.email}</div>
                          <div className="text-sm text-slate-500">{customer.phone}</div>
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
