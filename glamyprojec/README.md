# Glamy SaaS — Sistema Multi-Tenant de Gestión para Salones de Belleza

<p align="center">
  <img src="https://1.bp.blogspot.com/-3wALNMake70/XK-07VtIngI/AAAAAAABOrY/n3X_ZJV5fGEpTs8ppMQvKk_yic7BfyBYQCLcBGAs/s1600/universidad-la-salle-logo.jpg" alt="Universidad La Salle" width="120"/>
</p>

<p align="center">
  <strong>UNIVERSIDAD LA SALLE</strong><br/>
  Facultad de Ingenierías y Arquitectura<br/>
  Carrera Profesional de Ingeniería de Software
</p>

<p align="center">
  <strong>ASIGNATURA:</strong> Ingeniería Web<br/>
  <strong>PROFESOR:</strong> Richart Smith Escobedo Quispe<br/>
  <strong>AÑO:</strong> 2026 — Semestre VII
</p>

<p align="center">
  <strong>INTEGRANTES:</strong><br/>
  - Mares Graos Frederick Dicarlo<br/>
  - Flores Vera Gustavo Alexander<br/>
  - Saya Ramos Arnold Daniel<br/>
  - Ortiz Rosas Joshua David
</p>

---

## Tabla de Contenidos

1. [Descripción del Proyecto](#1-descripción-del-proyecto)
2. [Tecnologías Utilizadas y Explicación de Librerías](#2-tecnologías-utilizadas-y-explicación-de-librerías)
3. [Instalación y Configuración del Backend (NestJS)](#3-instalación-y-configuración-del-backend-nestjs)
4. [Instalación y Configuración del Frontend (Next.js)](#4-instalación-y-configuración-del-frontend-nextjs)
5. [Modelo de Datos](#5-modelo-de-datos)
6. [Endpoints de la API REST](#6-endpoints-de-la-api-rest)
7. [Componentes del Frontend](#7-componentes-del-frontend)
8. [Pruebas con SoapUI](#8-pruebas-con-soapui)
9. [Despliegue en Firebase](#9-despliegue-en-firebase)
10. [Conclusiones](#10-conclusiones)
11. [Rúbrica de Autoevaluación](#11-rúbrica-de-autoevaluación)

---

## 1. Descripción del Proyecto

**Glamy SaaS** es un sistema web diseñado para automatizar la gestión integral de salones de belleza bajo un modelo *Software as a Service* (SaaS) multi-tenant. El sistema permite:

- Registrar y administrar múltiples empresas (tenants) con planes de suscripción (STARTUP, PRO, ENTERPRISE).
- Gestionar sucursales, personal, servicios y clientes por cada empresa.
- Programar y controlar citas/reservas de clientes con profesionales específicos.
- Autenticación diferenciada por roles: SuperAdmin (con 2FA), Empresa y Cliente.
- Operaciones en cascada al suspender o eliminar una empresa.
- Panel analítico con KPIs y gráficos de distribución por suscripción.
- Exportación de reportes en formato CSV.

### Roles del Sistema

| Rol | Acceso | Descripción |
|-----|--------|-------------|
| SUPER_ADMIN | Panel global | Administra todas las empresas, KPIs, gráficos, 2FA obligatorio |
| EMPRESA | Panel por tenant | Gestiona sucursales, personal, servicios, clientes y citas de su empresa |
| Cliente | Portal de reservas | Agenda citas, selecciona sucursal, servicio y profesional |

---

## 2. Tecnologías Utilizadas y Explicación de Librerías

### 2.1 Stack General

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | 22 | Entorno de ejecución JavaScript/TypeScript |
| TypeScript | 5.x | Lenguaje tipado para backend y frontend |
| NestJS | 11 | Framework backend para API REST |
| Next.js | 16 | Framework frontend con React y App Router |
| React | 19 | Librería UI del frontend |
| TailwindCSS | 4 | Framework de estilos utilitario |
| Firebase Auth | — | Autenticación JWT con Custom Claims |
| Firebase Firestore | — | Base de datos NoSQL en la nube |
| Firebase Cloud Functions | v2 | Despliegue serverless del backend |
| Firebase Hosting | — | Hosting del frontend estático |
| Git / GitHub | — | Control de versiones |

### 2.2 Librerías del Backend (`backend/package.json`)

| Librería | Versión | Explicación |
|----------|---------|-------------|
| `@nestjs/common` | ^11.0.1 | Módulo principal de NestJS que provee decoradores (Controller, Get, Post, Injectable), guards, pipes y utilidades core para construir la API. |
| `@nestjs/core` | ^11.0.1 | Núcleo del framework NestJS: maneja el ciclo de vida, la inyección de dependencias y el arranque de la aplicación. |
| `@nestjs/platform-express` | ^11.0.1 | Adaptador HTTP que integra NestJS con Express, permitiendo usar middleware de Express como CORS. |
| `@nestjs/mapped-types` | * | Utilidad para transformar DTOs (ej. PartialType para crear update DTOs a partir de create DTOs). |
| `firebase-admin` | ^13.8.0 | SDK de Firebase para entornos servidor. Se usa para verificar tokens JWT (Auth) y acceder a Firestore desde el backend. |
| `firebase-functions` | ^7.2.5 | SDK para crear Cloud Functions v2. Permite exportar la aplicación NestJS como una función HTTP serverless. |
| `class-validator` | ^0.15.1 | Librería de validación basada en decoradores. Se usa en los DTOs para validar datos de entrada (email, longitud, tipos). |
| `class-transformer` | ^0.5.1 | Transforma objetos planos a instancias de clases con tipos. Complementa a class-validator para la serialización de DTOs. |
| `cors` | ^2.8.6 | Middleware de Express para habilitar CORS (Cross-Origin Resource Sharing), permitiendo que el frontend se comunique con la API. |
| `otplib` | ^13.4.0 | Implementación de TOTP (Time-based One-Time Password). Se usa para generar y verificar códigos 2FA para el SuperAdmin. |
| `reflect-metadata` | ^0.2.2 | Polyfill para el API de decoradores experimental de TypeScript. Necesario para que NestJS funcione correctamente. |
| `rxjs` | ^7.8.1 | Librería de programación reactiva. NestJS la usa internamente para el manejo de streams y observables en peticiones HTTP. |

### 2.3 Librerías del Frontend (`frontend/package.json`)

| Librería | Versión | Explicación |
|----------|---------|-------------|
| `next` | 16.2.6 | Framework de React con renderizado híbrido (SSR/SSG) y App Router. Proporciona enrutamiento basado en archivos, optimización de imágenes y fonts. |
| `react` / `react-dom` | 19.2.4 | Librería core de React para construir interfaces de usuario. React 19 incluye el nuevo hook `use()` para promesas. |
| `firebase` | ^12.13.0 | SDK cliente de Firebase. Se usa para autenticación (signInWithEmailAndPassword, GoogleAuthProvider) desde el navegador. |
| `lucide-react` | ^1.14.0 | Colección de íconos SVG open-source como componentes React. Se usa en botones, menús y tarjetas de la UI. |
| `recharts` | ^3.8.1 | Librería de gráficos para React basada en D3. Se usa en el panel SuperAdmin para mostrar gráficos de barras de distribución de planes. |
| `tailwindcss` | ^4 | Framework CSS utilitario que genera clases atómicas (flex, grid, p-4, text-lg, etc.) directamente en el HTML/JSX. |
| `@tailwindcss/postcss` | ^4 | Plugin de PostCSS para integrar TailwindCSS v4 en el pipeline de build de Next.js. |
| `typescript` | ^5 | Superset tipado de JavaScript. Permite definir interfaces (Tenant, Branch, Appointment) y detectar errores en tiempo de compilación. |
| `eslint` / `eslint-config-next` | ^9 / 16.2.6 | Herramientas de linting que analizan el código en busca de errores, malas prácticas y estilos inconsistentes. |

---

## 3. Instalación y Configuración del Backend (NestJS)

### 3.1 Prerrequisitos

- Node.js 22+
- npm 10+
- Una cuenta de Firebase con proyecto activo
- Firebase Admin SDK (credenciales de servicio)

### 3.2 Creación del Proyecto

```bash
# Instalar NestJS CLI globalmente
npm i -g @nestjs/cli

# Crear el proyecto
nest new backend
cd backend
```

### 3.3 Instalación de Dependencias

```bash
# Firebase
npm install firebase-admin firebase-functions

# Validación de DTOs
npm install class-validator class-transformer

# Utilidades
npm install @nestjs/mapped-types
npm install cors @types/cors

# 2FA
npm install otplib

# Adaptador Express
npm install @nestjs/platform-express
```

### 3.4 Configuración de Firebase Admin SDK

Crear el módulo y servicio de Firebase:

```bash
nest generate module firebase
nest generate service firebase
```

**`src/firebase/firebase.service.ts`** — Servicio wrapper que inicializa Firebase Admin SDK y expone Firestore + Auth:

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private _firestore: admin.firestore.Firestore;

  onModuleInit() {
    if (admin.apps.length === 0) {
      if (process.env.FIREBASE_CONFIG) {
        admin.initializeApp(); // Cloud Functions
      } else {
        const serviceAccount = require('./firebase-config.json');
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      }
    }
    this._firestore = admin.firestore();
  }

  get firestore() { return this._firestore; }
  get auth(): admin.auth.Auth { return admin.auth(); }
}
```

Colocar el archivo `firebase-config.json` (credenciales de servicio) en `src/firebase/`.

### 3.5 Implementación del AuthGuard (JWT)

```bash
nest generate guard auth
```

**`src/auth/auth.guard.ts`** — Guard que verifica tokens JWT usando Firebase Admin SDK:

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    try {
      const decodedToken = await this.firebaseService.auth.verifyIdToken(token);
      request['user'] = decodedToken;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token invalido');
    }
  }
}
```

### 3.6 Generación de Módulos CRUD

```bash
nest generate resource tenants --no-spec
nest generate resource branches --no-spec
nest generate resource staff --no-spec
nest generate resource customers --no-spec
nest generate resource services --no-spec
nest generate resource appointments --no-spec
nest generate resource audit-log --no-spec
```

Cada recurso genera: módulo, controlador, servicio, DTOs (create, update) y entidad.

### 3.7 Estructura de DTOs

Todos los DTOs usan `class-validator` para validar datos de entrada. Ejemplo:

```typescript
// create-tenant.dto.ts
export class CreateTenantDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @Length(11, 11)
  taxId: string;

  @IsEmail()
  contactEmail: string;

  @IsOptional()
  @IsEnum(['STARTUP', 'PRO', 'ENTERPRISE'])
  plan?: string;
}
```

### 3.8 Ejecución Local

```bash
npm run start:dev
# Servidor en http://localhost:3000
```

---

## 4. Instalación y Configuración del Frontend (Next.js)

### 4.1 Prerrequisitos

- Node.js 22+
- npm 10+
- Proyecto Firebase con autenticación habilitada (Email/Password y Google)
- Web App configurada en Firebase Console

### 4.2 Creación del Proyecto Next.js

```bash
# Crear proyecto Next.js con App Router
npx create-next-app@latest frontend
cd frontend

# Seleccionar:
# - TypeScript: Sí
# - ESLint: Sí
# - TailwindCSS: Sí (versión 4)
# - App Router: Sí
```

### 4.3 Instalación de Dependencias Adicionales

```bash
# Firebase Client SDK (autenticación)
npm install firebase

# Íconos
npm install lucide-react

# Gráficos
npm install recharts
```

### 4.4 Configuración de Firebase Client SDK

Crear archivo de configuración:

**`app/lib/firebase.ts`** — Inicializa Firebase Auth desde variables de entorno:

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

let firebaseConfig;

if (process.env.FIREBASE_WEBAPP_CONFIG) {
  try {
    firebaseConfig = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
  } catch (error) {
    console.error("Error parsing FIREBASE_WEBAPP_CONFIG:", error);
  }
}

if (!firebaseConfig) {
  firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { auth };
```

Crear archivo de entorno:

**`.env.local`** — Variables de entorno con las credenciales de Firebase Web App:

```env
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyDPvdFRYgKTOFkIXFGXT2x178ycodzp7WM"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="saasrcb.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="saasrcb"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="saasrcb.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="657751849225"
NEXT_PUBLIC_FIREBASE_APP_ID="1:657751849225:web:0230e02078111e0357bbd8"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-BHJFR8RHMB"
```

### 4.5 Configuración de TailwindCSS v4

TailwindCSS v4 se configura directamente en el archivo CSS principal:

**`app/globals.css`** — Importa TailwindCSS y define variables de color:

```css
@import "tailwindcss";

@theme {
  --color-primary: #e11d48;
  --color-primary-dark: #be123c;
  /* ... más colores personalizados */
}
```

### 4.6 Configuración de PostCSS

**`postcss.config.mjs`** — Integra TailwindCSS con Next.js:

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

### 4.7 Configuración de Next.js para Exportación Estática

Para el despliegue en Firebase Hosting (solo archivos estáticos), se configura `next.config.ts` con `output: 'export'`:

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  env: {
    FIREBASE_WEBAPP_CONFIG: process.env.FIREBASE_WEBAPP_CONFIG || '',
  },
};

export default nextConfig;
```

Las rutas dinámicas (`[id]`, `[branchId]`) requieren `generateStaticParams` para la exportación estática:

```typescript
// En cada página con parámetros dinámicos
export function generateStaticParams() {
  return [{ id: 'sample' }];
}
```

### 4.8 Ejecución Local

```bash
# Desarrollo
npm run dev
# Abrir http://localhost:3000

# Build para producción
npm run build
# Genera la carpeta out/
```

### 4.9 Estructura de Tipos Compartidos

**`app/types/index.ts`** — Interfaces TypeScript que reflejan las colecciones de Firestore:

```typescript
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
  customerId?: string;
  serviceId?: string;
  staffId?: string;
  date: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  tenantId: string;
  branchId?: string;
  customer?: { id?: string; name: string; email: string; phone: string };
  branch?: { id: string; name: string; address: string; phone: string };
  service?: { id: string; name: string; price: number; durationInMinutes: number };
  staff?: { id: string; name: string; role: string };
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
```

---

## 5. Modelo de Datos

El sistema utiliza **Firebase Firestore** (base de datos NoSQL documental) con 7 colecciones principales:

### 5.1 Colecciones

| Colección | Descripción | Campos clave |
|-----------|-------------|--------------|
| `tenants` | Empresas registradas | name, taxId, contactEmail, plan, status |
| `branches` | Sucursales por empresa | tenantId, name, address, phone |
| `staff` | Personal/profesionales | tenantId, name, role, phone |
| `services` | Servicios del catálogo | tenantId, name, description, price, durationInMinutes |
| `customers` | Clientes registrados | tenantId, name, email, phone |
| `appointments` | Citas/reservas | tenantId, branchId, customerId, serviceId, staffId, date, status |
| `audit-log` | Registro de auditoría | action, entity, entityId, performedBy, timestamp |

### 5.2 Relaciones

```
Tenant (1) ──→ (N) Branches
Tenant (1) ──→ (N) Staff
Tenant (1) ──→ (N) Services
Tenant (1) ──→ (N) Customers
Tenant (1) ──→ (N) Appointments
Branch  (1) ──→ (N) Appointments
Customer (1) ──→ (N) Appointments
Service  (1) ──→ (N) Appointments
Staff    (1) ──→ (N) Appointments
```

Todas las consultas se filtran por `tenantId` para garantizar el aislamiento de datos entre empresas (multi-tenant).

### 5.3 Operaciones en Cascada

Al cambiar el estado de un tenant a `SUSPENDED` o eliminarlo, las operaciones se propagan a todos los recursos relacionados (branches, staff, services, customers, appointments) mediante Firestore queries batch.

---

## 6. Endpoints de la API REST

### 6.1 Autenticación

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/password-changed` | JWT | Marca que el usuario cambió su contraseña inicial |
| POST | `/auth/2fa/generate` | JWT | Genera un secreto TOTP para 2FA |
| POST | `/auth/2fa/verify` | JWT | Verifica un código TOTP de 6 dígitos |

### 6.2 Tenants (Empresas)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/tenants` | JWT | Listar todas las empresas |
| GET | `/tenants/:id` | JWT | Obtener empresa por ID |
| POST | `/tenants` | JWT | Crear empresa + usuario Firebase Auth + rol EMPRESA |
| PATCH | `/tenants/:id` | JWT | Actualizar empresa (cambios de estado en cascada) |
| DELETE | `/tenants/:id` | JWT | Eliminar empresa (borrado en cascada) |

### 6.3 Branches (Sucursales)

| Método | Ruta | Query Params | Descripción |
|--------|------|-------------|-------------|
| GET | `/branches` | ?tenantId=X | Listar sucursales por tenant |
| POST | `/branches` | — | Crear sucursal |
| DELETE | `/branches/:id` | — | Eliminar sucursal |

### 6.4 Staff (Personal)

| Método | Ruta | Query Params | Descripción |
|--------|------|-------------|-------------|
| GET | `/staff` | ?tenantId=X | Listar personal por tenant |
| POST | `/staff` | — | Crear personal |

### 6.5 Services (Servicios)

| Método | Ruta | Query Params | Descripción |
|--------|------|-------------|-------------|
| GET | `/services` | ?tenantId=X | Listar servicios por tenant |
| POST | `/services` | — | Crear servicio |

### 6.6 Customers (Clientes)

| Método | Ruta | Query Params | Descripción |
|--------|------|-------------|-------------|
| GET | `/customers` | ?tenantId=X | Listar clientes por tenant |
| POST | `/customers` | — | Crear cliente |

### 6.7 Appointments (Citas)

| Método | Ruta | Query Params | Descripción |
|--------|------|-------------|-------------|
| GET | `/appointments` | ?tenantId=X&branchId=Y&customerEmail=Z | Listar citas con filtros |
| POST | `/appointments` | — | Crear cita (soporta JSON plano y anidado) |

### 6.8 Audit Log

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/audit-log` | Listar registros de auditoría |
| POST | `/audit-log` | Crear registro de auditoría |

---

## 7. Componentes del Frontend

El frontend consta de **13 páginas (vistas)** desarrolladas con Next.js App Router, todas como Client Components (`'use client'`). Se comunican con el backend mediante fetch a la API REST.

### 7.1 Listado de Vistas

| Ruta | Componente | Funcionalidad |
|------|-----------|---------------|
| `/` | `SuperAdminPanel` | Dashboard SuperAdmin: KPIs (total tenants, activos, enterprise), gráfico de barras por plan (Recharts), tabla CRUD de tenants con edición inline, modal de creación, exportación CSV, modal de credenciales |
| `/login` | `LoginPage` | Inicio de sesión con Email/Password y Google Sign-In. Redirección por rol: EMPRESA → `/tenant/:id`, SUPER_ADMIN → `/login/verify-2fa`, cliente → `/customer/dashboard` |
| `/login/change-password` | `ChangePasswordPage` | Forzar cambio de contraseña si el Custom Claim `requiresPasswordChange` está activo. Llama a `POST /auth/password-changed` |
| `/login/verify-2fa` | `Verify2FAPage` | Verificación TOTP de 6 dígitos para SuperAdmin. Incluye flujo de setup con QR y llamadas a `/auth/2fa/generate` y `/auth/2fa/verify` |
| `/customer/dashboard` | `CustomerDashboard` | Portal del cliente: wizard de reserva en 6 pasos (tenant → branch → service → staff → datetime → confirmar), historial de citas, perfil del usuario |
| `/tenant/[id]` | `TenantAdminPanel` | Dashboard de empresa: gestión de sucursales (formulario + tarjetas), enlaces a secciones de staff, servicios, clientes y citas |
| `/tenant/[id]/staff` | `StaffPage` | CRUD de personal: formulario de creación (name, role, phone) + tabla listando personal del tenant |
| `/tenant/[id]/services` | `ServicesPage` | CRUD de servicios: formulario (name, description, price, duration) + tabla con precios y duración |
| `/tenant/[id]/customers` | `CustomersPage` | CRUD de clientes: formulario (name, email, phone) + tabla listando clientes |
| `/tenant/[id]/appointments` | `AppointmentsPage` | Gestión de citas: formulario con selects (cliente, servicio, staff) + tabla con estados (PENDING, CONFIRMED, CANCELLED) |
| `/tenant/[id]/branches` | `BranchesRedirect` | Redirecciona automáticamente a `/tenant/[id]` |
| `/tenant/[id]/branches/[branchId]` | `BranchSettings` | Configuración de sucursal: editor de horarios semanales (inputs de hora por día), toggles activo/inactivo |

### 7.2 Ejemplo de Flujo: Login con Redirección por Rol

```typescript
// login/page.tsx - Lógica de autenticación
const handleEmailLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const token = await userCredential.user.getIdTokenResult();

  const role = token.claims.role;
  const tenantId = token.claims.tenantId;

  if (role === 'EMPRESA') {
    router.push(`/tenant/${tenantId}`);
  } else if (role === 'SUPER_ADMIN') {
    router.push('/login/verify-2fa');
  } else {
    router.push('/customer/dashboard');
  }
};
```

### 7.3 Ejemplo de Consumo de API

```typescript
// page.tsx (SuperAdminPanel) - Obtener tenants
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const fetchTenants = async () => {
  const user = auth.currentUser;
  const token = await user?.getIdToken();
  const res = await fetch(`${API_URL}/tenants`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  setTenants(data);
};
```

---

## 8. Pruebas con SoapUI

Para validar el correcto funcionamiento de la API REST, se empleó **SoapUI** como cliente REST.

### 8.1 Obtención del Token JWT

El token JWT se obtiene desde Firebase Auth. En desarrollo, se obtiene desde la consola del navegador:

```javascript
// En la consola del navegador después de iniciar sesión
const user = firebase.auth().currentUser;
const token = await user.getIdToken();
console.log(token);
// Copiar este token para usar en SoapUI
```

### 8.2 Listar Empresas (GET /tenants)

**Solicitud:**
```
GET http://localhost:3000/tenants
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta:**
```json
[
  {
    "id": "abc123",
    "name": "Salon Antuane",
    "taxId": "20123456789",
    "contactEmail": "admin@antuane.com",
    "status": "ACTIVE",
    "plan": "PRO",
    "createdAt": "2026-05-15T10:30:00.000Z"
  }
]
```

### 8.3 Crear Empresa (POST /tenants)

**Solicitud:**
```
POST http://localhost:3000/tenants
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...
Content-Type: application/json

{
  "name": "Beauty Studio Lima",
  "taxId": "20567891234",
  "contactEmail": "admin@beautystudio.pe",
  "plan": "STARTUP"
}
```

**Respuesta (incluye credenciales generadas automáticamente):**
```json
{
  "id": "def456",
  "name": "Beauty Studio Lima",
  "taxId": "20567891234",
  "contactEmail": "admin@beautystudio.pe",
  "status": "ACTIVE",
  "plan": "STARTUP",
  "credentials": {
    "email": "admin@beautystudio.pe",
    "password": "k7m2p9x4q1A1!"
  }
}
```

### 8.4 Actualizar Empresa (PATCH /tenants/:id)

```
PATCH http://localhost:3000/tenants/def456
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...
Content-Type: application/json

{
  "plan": "PRO",
  "name": "Beauty Studio Premium"
}
```

### 8.5 Eliminar Empresa (DELETE /tenants/:id)

```
DELETE http://localhost:3000/tenants/def456
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...
```

**Respuesta:**
```json
{
  "id": "def456",
  "deleted": true
}
```

### 8.6 Validación de Seguridad

La API rechaza peticiones sin autenticación con HTTP 401:

```
GET http://localhost:3000/tenants
(Sin header Authorization)
```

**Respuesta:**
```json
{
  "statusCode": 401,
  "message": "No se proporciono un token de autorizacion",
  "error": "Unauthorized"
}
```

---

## 9. Despliegue en Firebase

### 9.1 Arquitectura de Despliegue

- **Backend**: Firebase Cloud Functions v2 (NestJS empaquetado como función HTTP)
- **Frontend**: Firebase Hosting (Next.js exportado como sitio estático)
- **Base de datos**: Firebase Firestore (NoSQL)
- **Autenticación**: Firebase Auth

### 9.2 Configuración de Firebase

**`.firebaserc`:**
```json
{
  "projects": {
    "default": "saasrcb"
  }
}
```

**`firebase.json`:**
```json
{
  "functions": [
    {
      "codebase": "default",
      "source": "backend",
      "ignore": ["node_modules", ".git", "firebase-debug.log", "firestore-debug.log"],
      "predeploy": ["npm --prefix backend run build"]
    }
  ],
  "hosting": {
    "site": "glamysaas",
    "public": "frontend/out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ]
  }
}
```

### 9.3 Despliegue del Backend (Cloud Functions)

```bash
# Build del backend
cd backend
npm run build
cd ..

# Desplegar Cloud Functions
firebase deploy --only functions
```

El backend se despliega como una Cloud Function v2 con:
- Memoria: 512 MiB
- Acceso: público (`invoker: 'public'`)
- CORS: habilitado globalmente
- URL: `https://api-<hash>-<region>.cloudfunctions.net/api`

### 9.4 Despliegue del Frontend (Hosting)

```bash
# Build del frontend (genera frontend/out/)
cd frontend
npm run build
cd ..

# Desplegar a Firebase Hosting
firebase deploy --only hosting
```

URL del frontend: **https://glamysaas.web.app**

### 9.5 Variables de Entorno para Producción

Para el frontend en producción, las variables de entorno de Firebase se incluyen en el build mediante `next.config.ts` (`env.FIREBASE_WEBAPP_CONFIG`). Las variables `NEXT_PUBLIC_*` se incorporan en tiempo de build.

---

## 10. Conclusiones

1. La autenticación mediante JWT (Firebase Auth con Custom Claims) se implementó correctamente, permitiendo un acceso seguro y diferenciado por roles (SUPER_ADMIN, EMPRESA, Cliente) a los recursos de la API REST.

2. Todas las operaciones CRUD sobre los recursos fueron probadas exitosamente mediante SoapUI, incluyendo la generación automática de credenciales al crear una empresa.

3. Se comprobó que el sistema rechaza las solicitudes no autenticadas con respuesta HTTP 401, validando la seguridad del endpoint protegido con AuthGuard.

4. La arquitectura multi-tenant garantiza el aislamiento de datos entre empresas mediante el campo `tenantId` en todas las consultas a Firestore.

5. El frontend en Next.js 16 con React 19 y TailwindCSS 4 proporciona una interfaz moderna y responsiva con 13 vistas funcionales que consumen la API REST.

6. El despliegue del backend en Firebase Cloud Functions v2 y del frontend en Firebase Hosting permite una arquitectura serverless escalable sin gestión de infraestructura.

7. El uso de `output: 'export'` en Next.js permite generar un sitio estático desplegable en cualquier hosting CDN, incluyendo Firebase Hosting.

---

## 11. Rúbrica de Autoevaluación

| Ítem | Descripción | Pts | Check | Est. |
|------|-------------|-----|-------|------|
| 1. GitHub | Repositorio con todos los archivos necesarios. Se clona. | 2 | X | 2.0 |
| 2. Firebase/Firestore | Configura base de datos en la nube (equivalente a Supabase). | 4 | X | 4.0 |
| 3. REST Framework | Endpoints serializados (NestJS Controllers + DTOs) que envían y reciben JSON. | 4 | X | 4.0 |
| 4. JWT | Firebase Auth con Custom Claims para autenticar y autorizar operaciones. | 4 | X | 4.0 |
| 5. SoapUI | Consume REST desde cliente SoapUI. | 3 | X | 3.0 |
| 6. Deploy | Aplicación desplegada en Firebase (Cloud Functions + Hosting). | 3 | X | 3.0 |
| **Total** | | **20** | | **20.0** |

---

## Enlaces

- **Frontend (producción):** https://glamysaas.web.app
- **Repositorio GitHub:** https://github.com/Gustavo99400/SaaSBll.git
- **Proyecto Firebase:** saasrcb
