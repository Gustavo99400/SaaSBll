'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Appointment, Customer, Service, Staff } from '@/app/types';

export default function AppointmentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: tenantId } = use(params);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Formulario para nueva cita
  const [customerId, setCustomerId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<'PENDING' | 'CONFIRMED' | 'CANCELLED'>('PENDING');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        // Cargamos todo en paralelo para que sea más rápido
        const [resApps, resCusts, resServs, resStaff] = await Promise.all([
          fetch(`${API_URL}/appointments?tenantId=${tenantId}`),
          fetch(`${API_URL}/customers?tenantId=${tenantId}`),
          fetch(`${API_URL}/services?tenantId=${tenantId}`),
          fetch(`${API_URL}/staff?tenantId=${tenantId}`)
        ]);

        const [appsData, custsData, servsData, staffData] = await Promise.all([
          resApps.json(),
          resCusts.json(),
          resServs.json(),
          resStaff.json()
        ]);

        if (isMounted) {
          setAppointments(appsData);
          setCustomers(custsData);
          setServices(servsData);
          setStaff(staffData);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [tenantId, refreshKey]);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          serviceId,
          staffId,
          date,
          status,
          tenantId,
          branchId: 'default' // Por ahora por defecto, luego se puede mejorar
        }),
      });
      setCustomerId(''); setServiceId(''); setStaffId(''); setDate(''); setStatus('PENDING');
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Error creando cita:", error);
    }
  };

  // Funciones auxiliares para buscar nombres por ID
  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || 'Desconocido';
  const getServiceName = (id: string) => services.find(s => s.id === id)?.name || 'Desconocido';
  const getStaffName = (id: string) => staff.find(s => s.id === id)?.name || 'Desconocido';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        <Link href={`/tenant/${tenantId}`} className="text-rose-500 font-bold flex items-center gap-2 hover:underline">
          ← Volver al Panel de la Empresa
        </Link>

        <header className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h1 className="text-3xl font-black text-slate-900">
            Gestión de <span className="text-rose-500">Citas</span>
          </h1>
          <p className="text-slate-500 mt-1">Programa y controla las reservas de tus clientes.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* FORMULARIO CITA */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 h-fit">
            <h2 className="text-xl font-bold mb-4">Nueva Cita</h2>
            <form onSubmit={handleCreateAppointment} className="space-y-4">
              
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Cliente</label>
                <select
                  className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 text-slate-700"
                  value={customerId} onChange={e => setCustomerId(e.target.value)} required
                >
                  <option value="">Selecciona un cliente</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Servicio</label>
                <select
                  className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 text-slate-700"
                  value={serviceId} onChange={e => setServiceId(e.target.value)} required
                >
                  <option value="">Selecciona un servicio</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (S/. {s.price})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Profesional</label>
                <select
                  className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 text-slate-700"
                  value={staffId} onChange={e => setStaffId(e.target.value)} required
                >
                  <option value="">Selecciona un profesional</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Fecha y Hora</label>
                <input
                  type="datetime-local"
                  className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 text-slate-700"
                  value={date} onChange={e => setDate(e.target.value)} required
                />
              </div>

              <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors">
                Agendar Cita
              </button>
            </form>
          </div>

          {/* LISTA DE CITAS */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold">Citas Programadas</h2>
            </div>
            
            {appointments.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No hay citas programadas aún.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-widest">
                      <th className="p-4 font-medium">Cita</th>
                      <th className="p-4 font-medium">Cliente</th>
                      <th className="p-4 font-medium">Servicio / Profesional</th>
                      <th className="p-4 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments.map(app => (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">
                            {new Date(app.date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-rose-500 font-bold">
                            {new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-slate-800">{getCustomerName(app.customerId)}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm font-bold text-slate-700">{getServiceName(app.serviceId)}</div>
                          <div className="text-xs text-slate-500">Atendido por: {getStaffName(app.staffId)}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                            app.status === 'CONFIRMED' ? 'bg-green-100 text-green-600' :
                            app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {app.status}
                          </span>
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
