'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/app/lib/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  DollarSign,
  Plus,
  LogOut,
  CheckCircle,
  Scissors,
  Building,
  ChevronRight,
  Phone,
  ArrowLeft,
  Mail,
  CalendarCheck
} from 'lucide-react';
import { Tenant, Branch, Service, Staff, Appointment } from '@/app/types';

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // App data lists
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // Booking Wizard State
  const [step, setStep] = useState(0); // 0: Dashboard, 1: Tenant, 2: Branch, 3: Service, 4: Staff, 5: DateTime, 6: Confirm
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  // 1. Auth Listener & Initial Data Load
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
        setUserName(currentUser.displayName || currentUser.email?.split('@')[0] || 'Cliente');
        setUserEmail(currentUser.email || '');

        // Fetch customer's appointments
        await loadCustomerAppointments(currentUser.email || '');
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Load appointments matching customer email
  const loadCustomerAppointments = async (email: string) => {
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : '';
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/appointments?customerEmail=${encodeURIComponent(email)}`, {
        headers
      });
      if (res.ok) {
        const data = await res.json();
        // Sort appointments by date descending
        const sorted = data.sort((a: Appointment, b: Appointment) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAppointments(sorted);
      }
    } catch (err) {
      console.error("Error cargando citas del cliente:", err);
    }
  };

  // Load all available tenants for step 1
  const loadTenants = async () => {
    setBookingLoading(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : '';
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/tenants`, {
        headers
      });
      if (res.ok) {
        const data = await res.json();
        // Show only active tenants
        setTenants(data.filter((t: Tenant) => t.status !== 'SUSPENDED'));
      } else {
        console.error("Failed to load tenants:", res.status, res.statusText);
      }
    } catch (err) {
      console.error("Error cargando salones:", err);
    } finally {
      setBookingLoading(false);
    }
  };

  // Load branches of selected tenant
  const loadBranches = async (tenantId: string) => {
    setBookingLoading(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : '';
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/branches?tenantId=${tenantId}`, {
        headers
      });
      if (res.ok) {
        const data = await res.json();
        setBranches(data);
      }
    } catch (err) {
      console.error("Error cargando sucursales:", err);
    } finally {
      setBookingLoading(false);
    }
  };

  // Load services of selected tenant
  const loadServices = async (tenantId: string) => {
    setBookingLoading(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : '';
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/services?tenantId=${tenantId}`, {
        headers
      });
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch (err) {
      console.error("Error cargando servicios:", err);
    } finally {
      setBookingLoading(false);
    }
  };

  // Load staff of selected tenant
  const loadStaff = async (tenantId: string) => {
    setBookingLoading(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : '';
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/staff?tenantId=${tenantId}`, {
        headers
      });
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      }
    } catch (err) {
      console.error("Error cargando profesionales:", err);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Start booking wizard
  const startBooking = async () => {
    setStep(1);
    await loadTenants();
  };

  // Navigation handlers for wizard
  const selectTenant = async (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setStep(2);
    await loadBranches(tenant.id);
  };

  const selectBranch = async (branch: Branch) => {
    setSelectedBranch(branch);
    setStep(3);
    if (selectedTenant) {
      await loadServices(selectedTenant.id);
    }
  };

  const selectService = async (service: Service) => {
    setSelectedService(service);
    setStep(4);
    if (selectedTenant) {
      await loadStaff(selectedTenant.id);
    }
  };

  const selectStaff = (member: Staff) => {
    setSelectedStaff(member);
    setStep(5);
  };

  const handleDateTimeConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate) {
      setError("Por favor selecciona una fecha y hora válida.");
      return;
    }
    setError("");
    setStep(6);
  };

  // Submit reservation using nested JSON structure
  const submitBooking = async () => {
    if (!selectedTenant || !selectedBranch || !selectedService || !selectedStaff || !bookingDate) {
      setError("Datos de reserva incompletos.");
      return;
    }

    setBookingLoading(true);
    setError("");

    // Build the nested JSON payload
    const bookingPayload = {
      tenantId: selectedTenant.id,
      date: new Date(bookingDate).toISOString(),
      status: 'PENDING',
      customer: {
        name: userName,
        email: userEmail,
        phone: customerPhone || 'Sin teléfono'
      },
      branch: {
        id: selectedBranch.id,
        name: selectedBranch.name,
        address: selectedBranch.address,
        phone: selectedBranch.phone
      },
      service: {
        id: selectedService.id,
        name: selectedService.name,
        price: selectedService.price,
        durationInMinutes: selectedService.durationInMinutes
      },
      staff: {
        id: selectedStaff.id,
        name: selectedStaff.name,
        role: selectedStaff.role
      }
    };

    try {
      const res = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingPayload)
      });

      if (res.ok) {
        setSuccessMessage("¡Reserva agendada con éxito!");
        // Reset wizard state
        setStep(0);
        setSelectedTenant(null);
        setSelectedBranch(null);
        setSelectedService(null);
        setSelectedStaff(null);
        setBookingDate('');
        setCustomerPhone('');

        // Reload list
        await loadCustomerAppointments(userEmail);

        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await res.json();
        setError(data.message || "Error al procesar la reserva. Intenta de nuevo.");
      }
    } catch (err) {
      console.error("Error enviando reserva:", err);
      setError("Error de conexión al servidor.");
    } finally {
      setBookingLoading(false);
    }
  };

  // Helper to format date beautifully
  const formatAppDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatAppTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  // Helper to get Tenant name from appointments list mapping or display it directly if available
  const getAppTenantName = (app: Appointment) => {
    // If we have a nested structure, maybe tenant info is also loaded, otherwise we use the tenant ID as fallback
    // In our dashboard, we fetch tenants, so we can try to look it up in `tenants` state
    const t = tenants.find(ten => ten.id === app.tenantId);
    return t ? t.name : "Salón Glamy";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl shadow-lg shadow-rose-500/20 flex items-center justify-center text-white font-black text-sm">G</div>
          <h1 className="text-xl font-black tracking-tight text-slate-900">
            Glamy<span className="text-rose-500 font-light">Cliente</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-bold text-slate-900">{userName}</span>
            <span className="text-xs text-slate-500">{userEmail}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-4 rounded-xl transition-all text-xs font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 mt-8">

        {/* Alerts and Success notifications */}
        {successMessage && (
          <div className="mb-6 bg-emerald-500 text-white p-4 rounded-2xl flex items-center gap-3 shadow-lg shadow-emerald-500/10 animate-fade-in">
            <CheckCircle className="w-6 h-6 flex-shrink-0" />
            <p className="font-bold text-sm">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-rose-500 text-white p-4 rounded-2xl flex items-center gap-3 shadow-lg shadow-rose-500/10">
            <div className="w-6 h-6 flex-shrink-0 bg-white/20 rounded-full flex items-center justify-center font-bold">!</div>
            <p className="font-bold text-sm">{error}</p>
          </div>
        )}

        {/* LOADING MAIN SPIN */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 text-sm font-medium mt-4">Cargando tu información...</p>
          </div>
        ) : (
          <>
            {/* STEP 0: DASHBOARD (CITAS & ACCIONES) */}
            {step === 0 && (
              <div className="space-y-8">

                {/* Hero Header */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl"></div>
                  <div className="space-y-2 z-10">
                    <h2 className="text-3xl font-black">¡Hola, {userName}!</h2>
                    <p className="text-slate-300 text-sm">Reserva citas en los mejores salones de belleza y barberías al instante.</p>
                  </div>
                  <button
                    onClick={startBooking}
                    className="flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 px-6 rounded-2xl transition-all hover:scale-[1.02] shadow-lg shadow-rose-500/20 text-sm z-10"
                  >
                    <Plus className="w-5 h-5" />
                    Reservar Nueva Cita
                  </button>
                </div>

                {/* Grid appointments & info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                  {/* Left list: appointments */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                        <CalendarCheck className="w-5 h-5 text-rose-500" />
                        Tus Próximas Citas
                      </h3>
                      <span className="text-xs bg-slate-200 text-slate-600 px-3 py-1 rounded-full font-bold">
                        {appointments.length} en total
                      </span>
                    </div>

                    {appointments.length === 0 ? (
                      <div className="bg-white border border-slate-200 p-12 rounded-3xl text-center space-y-4 shadow-sm">
                        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto text-2xl">
                          📅
                        </div>
                        <h4 className="text-base font-bold text-slate-800">No tienes citas agendadas</h4>
                        <p className="text-slate-500 text-xs max-w-xs mx-auto">Encuentra un salón cercano, selecciona el servicio que desees y agenda tu cita en segundos.</p>
                        <button
                          onClick={startBooking}
                          className="text-rose-500 font-bold text-xs hover:underline"
                        >
                          Reservar tu primera cita ahora →
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {appointments.map((app) => (
                          <div
                            key={app.id}
                            className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                          >
                            <div className="space-y-3">
                              {/* Sede / Salon */}
                              <div>
                                <span className="text-[10px] uppercase font-bold tracking-widest text-rose-500 bg-rose-50 px-2 py-0.5 rounded">
                                  {app.branch?.name || "Sede Estándar"}
                                </span>
                                <h4 className="text-lg font-black text-slate-900 mt-1">
                                  {app.service?.name || "Servicio General"}
                                </h4>
                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                  {app.branch?.address || "Dirección de la sede"}
                                </p>
                              </div>

                              {/* Date, Time, Stylist */}
                              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600">
                                <span className="flex items-center gap-1 font-semibold text-slate-800">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  {formatAppDate(app.date)}
                                </span>
                                <span className="flex items-center gap-1 font-semibold text-rose-600">
                                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                                  {formatAppTime(app.date)}
                                </span>
                                <span className="flex items-center gap-1 font-medium text-slate-500">
                                  <User className="w-3.5 h-3.5 text-slate-400" />
                                  Atendido por: {app.staff?.name || "Cualquier profesional"}
                                </span>
                              </div>
                            </div>

                            {/* Price and status */}
                            <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
                              <span className="text-lg font-black text-slate-900 flex items-center">
                                <span className="text-sm font-normal text-slate-400 mr-0.5">S/.</span>
                                {app.service?.price || '0.00'}
                              </span>
                              <span className={`mt-2 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                                app.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                                app.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                                'bg-rose-500/10 text-rose-600 border-rose-500/20'
                              }`}>
                                {app.status === 'PENDING' ? 'Pendiente' : app.status === 'CONFIRMED' ? 'Confirmada' : 'Cancelada'}
                              </span>
                            </div>

                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right side: quick stats & info */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-black text-slate-900">Tu Perfil</h3>
                    <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center font-bold text-lg">
                          {userName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{userName}</h4>
                          <span className="text-xs text-slate-500">Cliente Glamy</span>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span>{userEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>{customerPhone || "Teléfono no registrado"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl space-y-2">
                      <h4 className="text-sm font-bold text-rose-950 flex items-center gap-1.5">
                        <Scissors className="w-4 h-4 text-rose-500" />
                        ¿Cómo funciona Glamy?
                      </h4>
                      <p className="text-xs text-rose-900/80 leading-relaxed">
                        Seleccionas el salón de tu preferencia, eliges la sucursal, el servicio y el estilista de tu agrado. Confirmamos tu cita al instante con almacenamiento inteligente para un servicio más rápido.
                      </p>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* STEP 1: CHOOSE TENANT (SALÓN) */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep(0)}
                    className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm"
                  >
                    <ArrowLeft className="w-4 h-4 text-slate-700" />
                  </button>
                  <div>
                    <span className="text-xs text-rose-500 font-bold uppercase tracking-wider">Paso 1 de 6</span>
                    <h2 className="text-2xl font-black text-slate-900 mt-0.5">Selecciona un Salón de Belleza</h2>
                  </div>
                </div>

                {bookingLoading ? (
                  <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : tenants.length === 0 ? (
                  <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center text-slate-500">
                    No hay salones disponibles en este momento.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tenants.map((tenant) => (
                      <button
                        key={tenant.id}
                        onClick={() => selectTenant(tenant)}
                        className="bg-white border border-slate-200 hover:border-rose-500 p-6 rounded-3xl text-left shadow-sm hover:shadow-md hover:scale-[1.01] transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-rose-100 to-rose-200 text-rose-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner">
                            {tenant.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-black text-lg text-slate-900 group-hover:text-rose-600 transition-colors">
                              {tenant.name}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                              <Building className="w-3.5 h-3.5 text-slate-400" />
                              Plan {tenant.plan || 'STARTUP'}
                            </p>
                            <span className="text-[10px] text-slate-400 mt-1 block">Contacto: {tenant.contactEmail}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-rose-500 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: CHOOSE BRANCH (SEDE) */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm"
                  >
                    <ArrowLeft className="w-4 h-4 text-slate-700" />
                  </button>
                  <div>
                    <span className="text-xs text-rose-500 font-bold uppercase tracking-wider">Paso 2 de 6 • {selectedTenant?.name}</span>
                    <h2 className="text-2xl font-black text-slate-900 mt-0.5">Selecciona una Sucursal (Sede)</h2>
                  </div>
                </div>

                {bookingLoading ? (
                  <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : branches.length === 0 ? (
                  <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center text-slate-500 space-y-4">
                    <p>Este salón no tiene sucursales disponibles.</p>
                    <button onClick={() => setStep(1)} className="bg-slate-900 text-white py-2 px-4 rounded-xl text-sm font-bold">Volver</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {branches.map((branch) => (
                      <button
                        key={branch.id}
                        onClick={() => selectBranch(branch)}
                        className="bg-white border border-slate-200 hover:border-rose-500 p-6 rounded-3xl text-left shadow-sm hover:shadow-md hover:scale-[1.01] transition-all flex items-center justify-between group"
                      >
                        <div className="space-y-2">
                          <div className="bg-rose-50 text-rose-500 w-9 h-9 rounded-xl flex items-center justify-center text-base">
                            📍
                          </div>
                          <h3 className="font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                            {branch.name}
                          </h3>
                          <p className="text-xs text-slate-500 leading-normal">
                            {branch.address}
                          </p>
                          {branch.phone && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {branch.phone}
                            </span>
                          )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-rose-500 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: CHOOSE SERVICE */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm"
                  >
                    <ArrowLeft className="w-4 h-4 text-slate-700" />
                  </button>
                  <div>
                    <span className="text-xs text-rose-500 font-bold uppercase tracking-wider">Paso 3 de 6 • {selectedTenant?.name}</span>
                    <h2 className="text-2xl font-black text-slate-900 mt-0.5">Selecciona un Servicio</h2>
                  </div>
                </div>

                {bookingLoading ? (
                  <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : services.length === 0 ? (
                  <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center text-slate-500 space-y-4">
                    <p>Este salón no tiene servicios registrados.</p>
                    <button onClick={() => setStep(2)} className="bg-slate-900 text-white py-2 px-4 rounded-xl text-sm font-bold">Volver</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => selectService(service)}
                        className="bg-white border border-slate-200 hover:border-rose-500 p-6 rounded-3xl text-left shadow-sm hover:shadow-md hover:scale-[1.01] transition-all flex flex-col justify-between group"
                      >
                        <div className="space-y-2 w-full">
                          <div className="flex justify-between items-start w-full">
                            <h3 className="font-bold text-slate-900 group-hover:text-rose-600 transition-colors text-base">
                              {service.name}
                            </h3>
                            <span className="text-rose-600 font-black text-lg flex items-center bg-rose-50 px-2.5 py-1 rounded-xl">
                              <span className="text-xs font-normal text-rose-400 mr-0.5">S/.</span>
                              {service.price}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 leading-normal line-clamp-2">
                            {service.description || "Sin descripción disponible."}
                          </p>
                          <div className="pt-2 flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-slate-300" />
                            {service.durationInMinutes} minutos
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: CHOOSE STAFF (PROFESIONAL) */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep(3)}
                    className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm"
                  >
                    <ArrowLeft className="w-4 h-4 text-slate-700" />
                  </button>
                  <div>
                    <span className="text-xs text-rose-500 font-bold uppercase tracking-wider">Paso 4 de 6 • {selectedTenant?.name}</span>
                    <h2 className="text-2xl font-black text-slate-900 mt-0.5">Selecciona un Profesional</h2>
                  </div>
                </div>

                {bookingLoading ? (
                  <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : staff.length === 0 ? (
                  <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center text-slate-500 space-y-4">
                    <p>No hay personal registrado en este salón. Crearemos un estilista por defecto para que puedas agendar.</p>
                    <button
                      onClick={() => selectStaff({ id: 'default', name: 'Estilista Glamy', role: 'Estilista Principal', phone: '', tenantId: selectedTenant?.id || '' })}
                      className="bg-rose-500 text-white py-3 px-6 rounded-xl text-sm font-bold hover:bg-rose-600 transition-colors"
                    >
                      Continuar con Especialista Glamy
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {staff.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => selectStaff(member)}
                        className="bg-white border border-slate-200 hover:border-rose-500 p-6 rounded-3xl text-left shadow-sm hover:shadow-md hover:scale-[1.01] transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center font-bold text-lg">
                            {member.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                              {member.name}
                            </h3>
                            <p className="text-xs text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded mt-1 inline-block">
                              {member.role}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-rose-500 transition-colors" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: SELECT DATE & TIME */}
            {step === 5 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep(4)}
                    className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm"
                  >
                    <ArrowLeft className="w-4 h-4 text-slate-700" />
                  </button>
                  <div>
                    <span className="text-xs text-rose-500 font-bold uppercase tracking-wider">Paso 5 de 6 • {selectedTenant?.name}</span>
                    <h2 className="text-2xl font-black text-slate-900 mt-0.5">Selecciona Fecha y Hora</h2>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm max-w-md mx-auto">
                  <form onSubmit={handleDateTimeConfirm} className="space-y-6">
                    <div>
                      <label className="text-xs text-slate-500 uppercase font-bold mb-2 block flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Fecha y Hora de la Cita
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 text-slate-700 text-sm font-bold"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        required
                        min={new Date().toISOString().slice(0, 16)}
                      />
                      <p className="text-xs text-slate-400 mt-2">Introduce la fecha y hora de tu preferencia para la cita en el salón.</p>
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 uppercase font-bold mb-2 block flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        Tu Teléfono de Contacto (Opcional)
                      </label>
                      <input
                        type="tel"
                        className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 text-slate-700 text-sm"
                        placeholder="Ej: 994001234"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        maxLength={9}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
                    >
                      Continuar al Resumen
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* STEP 6: CONFIRM RESERVATION (RESUMEN JSON ANIDADO) */}
            {step === 6 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep(5)}
                    className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-all shadow-sm"
                  >
                    <ArrowLeft className="w-4 h-4 text-slate-700" />
                  </button>
                  <div>
                    <span className="text-xs text-rose-500 font-bold uppercase tracking-wider">Paso 6 de 6</span>
                    <h2 className="text-2xl font-black text-slate-900 mt-0.5">Confirma tu Reserva</h2>
                  </div>
                </div>

                <div className="max-w-md mx-auto">

                  {/* Summary breakdown */}
                  <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-6 shadow-sm">
                    <h3 className="text-lg font-black text-slate-900 pb-3 border-b border-slate-100">
                      Resumen de la Cita
                    </h3>

                    {/* Salon, Sede */}
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Salón de Belleza</span>
                        <span className="font-bold text-slate-900 text-base">{selectedTenant?.name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Sede / Sucursal</span>
                        <div className="flex items-start gap-1.5 mt-0.5">
                          <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-800 text-sm">{selectedBranch?.name}</span>
                            <p className="text-xs text-slate-500 mt-0.5">{selectedBranch?.address}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Service & Staff */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Servicio Seleccionado</span>
                        <span className="font-bold text-slate-950 text-sm block mt-0.5">{selectedService?.name}</span>
                        <span className="text-xs text-slate-500 block mt-0.5">{selectedService?.durationInMinutes} mins</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Profesional a Cargo</span>
                        <span className="font-bold text-slate-950 text-sm block mt-0.5">{selectedStaff?.name}</span>
                        <span className="text-xs text-rose-500 font-bold block mt-0.5">{selectedStaff?.role}</span>
                      </div>
                    </div>

                    {/* Date and Time */}
                    <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Programación</span>
                        <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-rose-500" />
                          {formatAppDate(bookingDate)}
                        </span>
                      </div>
                      <span className="text-base font-black text-rose-600 bg-rose-50 py-1.5 px-3 rounded-xl flex items-center gap-1">
                        <Clock className="w-4 h-4 text-rose-400" />
                        {formatAppTime(bookingDate)}
                      </span>
                    </div>

                    {/* Total Price */}
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <span className="font-bold text-slate-800">Total a pagar en local:</span>
                      <span className="text-2xl font-black text-slate-900 flex items-center">
                        <span className="text-sm font-normal text-slate-400 mr-0.5">S/.</span>
                        {selectedService?.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={submitBooking}
                        disabled={bookingLoading}
                        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-rose-500/20 hover:scale-[1.01] flex justify-center items-center gap-2"
                      >
                        {bookingLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>Agendar y Registrar Reserva</>
                        )}
                      </button>
                      <button
                        onClick={() => setStep(5)}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl transition-colors text-xs"
                      >
                        Modificar Fecha u Hora
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
