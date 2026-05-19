export type PlanType = 'STARTUP' | 'PRO' | 'ENTERPRISE';

export interface Tenant {
  id: string;
  name: string;
  taxId: string;
  contactEmail: string;
  status?: 'ACTIVE' | 'SUSPENDED';
  plan?: PlanType;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  tenantId: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  tenantId: string;
}

export interface Appointment {
  id: string;
  customerId: string;
  serviceId: string;
  staffId: string;
  date: string; // ISO String
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  tenantId: string;
  branchId: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone: string;
  tenantId: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationInMinutes: number;
  tenantId: string;
}
