'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Service } from '@/app/types';

export default function ServicesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: tenantId } = use(params);

  const [services, setServices] = useState<Service[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Formulario para nuevo servicio
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [durationInMinutes, setDurationInMinutes] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    let isMounted = true;
    const loadServices = async () => {
      try {
        const res = await fetch(`${API_URL}/services?tenantId=${tenantId}`);
        const data = await res.json();
        if (isMounted) setServices(data);
      } catch (error) {
        console.error("Error cargando servicios:", error);
      }
    };
    loadServices();
    return () => { isMounted = false; };
  }, [tenantId, refreshKey]);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          price: parseFloat(price),
          durationInMinutes: parseInt(durationInMinutes),
          tenantId
        }),
      });
      setName(''); setDescription(''); setPrice(''); setDurationInMinutes('');
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Error creando servicio:", error);
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
            Gestión de <span className="text-rose-500">Servicios</span>
          </h1>
          <p className="text-slate-500 mt-1">Registra y administra los servicios que ofrece tu salón.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* FORMULARIO SERVICIO */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 h-fit">
            <h2 className="text-xl font-bold mb-4">Nuevo Servicio</h2>
            <form onSubmit={handleCreateService} className="space-y-4">
              <input
                className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Nombre del Servicio" value={name} onChange={e => setName(e.target.value)} required
              />
              <textarea
                className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="Descripción" value={description} onChange={e => setDescription(e.target.value)} required
              />
              <input
                className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                type="number"
                step="0.01"
                placeholder="Precio (S/.)" value={price} onChange={e => setPrice(e.target.value)} required
              />
              <input
                className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
                type="number"
                placeholder="Duración (minutos)" value={durationInMinutes} onChange={e => setDurationInMinutes(e.target.value)} required
              />
              <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800">
                Registrar Servicio
              </button>
            </form>
          </div>

          {/* LISTA DE SERVICIOS */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold">Servicios Registrados</h2>
            </div>
            
            {services.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No hay servicios registrados aún.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-widest">
                      <th className="p-4 font-medium">Servicio</th>
                      <th className="p-4 font-medium">Precio</th>
                      <th className="p-4 font-medium">Duración</th>
                      <th className="p-4 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {services.map(service => (
                      <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{service.name}</div>
                          <div className="text-sm text-slate-500">{service.description}</div>
                          <div className="text-xs text-slate-400 font-mono mt-1">ID: {service.id.slice(0,8)}</div>
                        </td>
                        <td className="p-4 font-bold text-slate-700">
                          S/. {service.price.toFixed(2)}
                        </td>
                        <td className="p-4 text-sm text-slate-500">
                          {service.durationInMinutes} min
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
