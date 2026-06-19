'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Clock, Users, MapPin, Save, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function BranchSettings() {
  const { id, branchId } = useParams();

  // Estado para los horarios (Esto se conectará luego con tu API de NestJS)
  const [schedule, setSchedule] = useState([
    { day: 'Lunes', open: '09:00', close: '20:00', active: true },
    { day: 'Martes', open: '09:00', close: '20:00', active: true },
    { day: 'Miércoles', open: '09:00', close: '20:00', active: true },
    { day: 'Jueves', open: '09:00', close: '20:00', active: true },
    { day: 'Viernes', open: '09:00', close: '21:00', active: true },
    { day: 'Sábado', open: '09:00', close: '18:00', active: true },
    { day: 'Domingo', open: '00:00', close: '00:00', active: false },
  ]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* Botón Volver */}
      <Link
        href={`/tenant/${id}/branches`}
        className="flex items-center text-slate-500 hover:text-rose-600 transition-colors mb-6 text-sm font-medium"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Volver a sedes
      </Link>

      {/* Encabezado */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-5 h-5 text-rose-500" />
              <h1 className="text-2xl font-bold text-slate-800">Configuración de Sede</h1>
            </div>
            <p className="text-slate-500 text-sm">
              Gestiona los horarios y personal para la sede: <span className="font-mono text-rose-600">{branchId}</span>
            </p>
          </div>
          <button className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-rose-600 transition-all shadow-sm">
            <Save className="w-4 h-4" />
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Columna Izquierda: Horarios */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-500" />
              <h2 className="font-bold text-slate-800">Horarios de Atención</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {schedule.map((item, index) => (
                  <div key={item.day} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3 w-32">
                      <input
                        type="checkbox"
                        checked={item.active}
                        className="w-4 h-4 accent-rose-500"
                        onChange={() => {}}
                      />
                      <span className="font-medium text-slate-700">{item.day}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={item.open}
                        disabled={!item.active}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-rose-500 outline-none disabled:opacity-50"
                      />
                      <span className="text-slate-400">-</span>
                      <input
                        type="time"
                        value={item.close}
                        disabled={!item.active}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-rose-500 outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Personal y Estado */}
        <div className="space-y-6">
          {/* Card: Personal */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center gap-2">
              <Users className="w-5 h-5 text-rose-500" />
              <h2 className="font-bold text-slate-800">Personal en Sede</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-4">Selecciona qué miembros del staff trabajan aquí.</p>
              <div className="space-y-3">
                {/* Esto se llenará con los datos de tu carpeta /staff del backend */}
                <div className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl hover:bg-rose-50 cursor-pointer transition-colors">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs">
                    AS
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-700">Antuane Staff 1</p>
                    <p className="text-xs text-slate-400">Estilista Senior</p>
                  </div>
                  <input type="checkbox" className="accent-rose-500" />
                </div>
              </div>
              <button className="w-full mt-4 py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium hover:border-rose-300 hover:text-rose-500 transition-all">
                + Gestionar Staff
              </button>
            </div>
          </div>

          {/* Card: Estado de la Sede */}
          <div className="bg-rose-50 rounded-2xl p-6 border border-rose-100">
            <h3 className="font-bold text-rose-800 mb-2">Estado de Sede</h3>
            <p className="text-xs text-rose-600 mb-4">Si desactivas la sede, no se podrán realizar nuevas reservas hasta que la habilites de nuevo.</p>
            <div className="flex items-center gap-2">
              <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-rose-600">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
              </div>
              <span className="text-sm font-bold text-rose-700">Sede Activa</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
