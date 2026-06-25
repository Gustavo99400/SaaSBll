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
  • Mares Graos Frederick Dicarlo<br/>
  • Flores Vera Gustavo Alexander<br/>
  • Saya Ramos Arnold Daniel<br/>
  • Ortiz Rosas Joshua David
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v22-green?style=for-the-badge&logo=node.js" alt="Node version"/>
  <img src="https://img.shields.io/badge/NestJS-v11-red?style=for-the-badge&logo=nestjs" alt="NestJS version"/>
  <img src="https://img.shields.io/badge/Next.js-v16-black?style=for-the-badge&logo=next.js" alt="NextJS version"/>
  <img src="https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore-orange?style=for-the-badge&logo=firebase" alt="Firebase version"/>
</p>

---

## 📋 Tabla de Contenidos

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
11. [Práctica: Internacionalización (i18n) y Localización (l10n)](#11-práctica-internacionalización-i18n-y-localización-l10n)
12. [Rúbrica de Calificación (Práctica de i18n y l10n)](#12-rúbrica-de-calificación-práctica-de-i18n-y-l10n)
13. [Enlaces de Interés](#13-enlaces-de-interés)

---

## 1. Descripción del Proyecto

**Glamy SaaS** es un ecosistema digital multi-tenant diseñado para automatizar y administrar de manera centralizada salones de belleza, barberías y centros de estética. Bajo un modelo de Software as a Service (SaaS), la plataforma permite aislar los datos de cada salón de belleza (tenant) a la vez que provee herramientas globales de administración.

### Características Clave
- **Aislamiento Multi-Tenant:** Cada salón de belleza administra sus propios recursos (sucursales, personal, catálogos de servicios, clientes y reservas).
- **Esquema de Suscripciones:** Soporte nativo para planes `STARTUP`, `PRO` y `ENTERPRISE`.
- **Autenticación Basada en Roles con Requisitos de Seguridad:** SuperAdmin (con 2FA obligatorio por TOTP), Empresa (acceso al panel de control específico del tenant) y Cliente (wizard interactivo de reservas).
- **Operaciones en Cascada:** Al suspender o eliminar un tenant, el sistema propaga la acción a todos los recursos dependientes utilizando transacciones por lotes en la base de datos Firestore.

### 👥 Roles del Sistema

| Rol | Distintivo | Acceso | Descripción |
|-----|------------|--------|-------------|
| **SUPER_ADMIN** | `bg-red-500` | Panel Global Maestro | Administra todas las empresas, monitorea KPIs, gráficos distributivos de planes, y genera nuevas cuentas empresariales con credenciales temporales. Requiere 2FA. |
| **EMPRESA** | `bg-blue-500` | Panel Administrativo por Tenant | Controla sucursales, horarios, personal asignado, listado de clientes, catálogos de servicios y programación de citas específicas de su organización. |
| **CLIENTE** | `bg-green-500` | Portal de Reservas | Registro de datos de contacto y asistente (wizard) interactivo de programación de reservas en 6 pasos. |

---

## 2. Tecnologías Utilizadas y Explicación de Librerías

### 2.1 Stack General
- **Backend Framework:** NestJS (v11) con adaptador Express.
- **Frontend Framework:** Next.js (v16) con App Router y renderizado híbrido.
- **Runtime:** Node.js (v22).
- **Base de Datos NoSQL:** Google Cloud Firestore (Serverless).
- **Autenticación:** Firebase Authentication con Custom Claims.
- **Estilos:** TailwindCSS (v4) con PostCSS.

### 2.2 Librerías del Backend (`backend/package.json`)

| Librería | Versión | Explicación |
|----------|---------|-------------|
| `@nestjs/common` | ^11.0.1 | Módulo principal que provee decoradores de inyección de dependencias (`@Injectable()`, `@Controller()`, etc.). |
| `@nestjs/core` | ^11.0.1 | Núcleo del framework NestJS para control de ciclo de vida de la aplicación. |
| `@nestjs/platform-express` | ^11.0.1 | Adaptador para integrar NestJS sobre el servidor HTTP Express. |
| `firebase-admin` | ^13.8.0 | SDK servidor de Firebase para comunicarse con Firestore y administrar claims JWT. |
| `firebase-functions` | ^7.2.5 | SDK para crear Cloud Functions v2 y empaquetar la API de NestJS como serverless. |
| `class-validator` / `class-transformer` | ^0.15.1 / ^0.5.1 | Validación declarativa de DTOs en las peticiones REST. |
| `otplib` | ^13.4.0 | Generador y verificador de códigos TOTP de 6 dígitos para la seguridad del 2FA. |
| `cors` | ^2.8.6 | Habilita el intercambio de recursos de origen cruzado para conectar el Frontend. |

### 2.3 Librerías del Frontend (`frontend/package.json`)

| Librería | Versión | Explicación |
|----------|---------|-------------|
| `next` | 16.2.6 | Framework web de React con enrutamiento basado en archivos. |
| `react` / `react-dom` | 19.2.4 | Librería base para la interfaz reactiva. |
| `firebase` | ^12.13.0 | SDK cliente para autenticar usuarios directamente desde el navegador. |
| `lucide-react` | ^1.14.0 | Iconografía SVG ligera e interactiva. |
| `recharts` | ^3.8.1 | Renderizado de gráficos de barra D3 para visualización de KPIs. |
| `i18next` / `react-i18next` | ^23.14 / ^14.1 | Motor de internacionalización y hooks de traducción reactivos. |
| `date-fns` | ^3.6.0 | Formateador localizado de fechas regionales en base al idioma activo. |

---

## 3. Instalación y Configuración del Backend (NestJS)

### 3.1 Prerrequisitos
- Node.js 22 o superior e instalador de paquetes `npm`.
- Proyecto Firebase activo con Firestore y Auth habilitados.

### 3.2 Creación del Proyecto
```bash
# Instalar NestJS CLI globalmente
npm i -g @nestjs/cli

# Crear la aplicación backend
nest new backend --no-spec
cd backend
```

### 3.3 Instalación de Dependencias
```bash
npm install firebase-admin firebase-functions class-validator class-transformer @nestjs/mapped-types cors @types/cors otplib @nestjs/platform-express
```

### 3.4 Configuración de Firebase Admin SDK

> [!WARNING]
> Nunca exponga ni suba al control de versiones el archivo de llaves privadas `firebase-config.json`.

Descargue el archivo de llaves privadas de Firebase Console (Configuración del proyecto > Cuentas de servicio > Generar nueva clave privada) y colóquelo como `firebase-config.json` en `src/firebase/`.

**`src/firebase/firebase.service.ts`**:
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

### 3.5 Ejecución en Entorno Local
```bash
npm run start:dev
# La API se levantará en: http://localhost:3000
```

---

## 4. Instalación y Configuración del Frontend (Next.js)

### 4.1 Creación del Proyecto
```bash
npx create-next-app@latest frontend --typescript --eslint --tailwind --app --src-dir=false
cd frontend
```

### 4.2 Instalación de Dependencias
```bash
npm install firebase lucide-react recharts i18next react-i18next date-fns
```

### 4.3 Configuración de Variables de Entorno
Cree un archivo **`.env.local`** en la raíz de `frontend/` e ingrese los datos de su Web App de Firebase:
```env
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="tu-proyecto.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="tu-proyecto"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="tu-proyecto.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="657751849225"
NEXT_PUBLIC_FIREBASE_APP_ID="1:657751849225:web:0230e020781"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### 4.4 Configuración de Exportación Estática
Para realizar el despliegue en Firebase Hosting como sitio web estático optimizado, configure el compilador en **`next.config.ts`**:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  env: {
    FIREBASE_WEBAPP_CONFIG: process.env.FIREBASE_WEBAPP_CONFIG || '',
  },
};

export default nextConfig;
```

---

## 5. Modelo de Datos (Firestore NoSQL)

El sistema almacena la información estructurada en colecciones raíz de Firestore. Las relaciones lógicas se garantizan mediante identificadores indexados (`tenantId`, `branchId`, `customerId`, `serviceId`, `staffId`).

### 5.1 Diagrama Entidad-Relación Lógico (Mermaid)

```mermaid
erDiagram
    TENANT ||--o{ BRANCH : "posee"
    TENANT ||--o{ STAFF : "contrata"
    TENANT ||--o{ SERVICE : "ofrece"
    TENANT ||--o{ CUSTOMER : "registra"
    TENANT ||--o{ APPOINTMENT : "almacena"
    BRANCH ||--o{ APPOINTMENT : "aloja"
    CUSTOMER ||--o{ APPOINTMENT : "solicita"
    SERVICE ||--o{ APPOINTMENT : "detalla"
    STAFF ||--o{ APPOINTMENT : "atiende"
```

### 5.2 Estructura Documental

#### Colección: `tenants`
```json
{
  "id": "tenant_123",
  "name": "Salon Antuane",
  "taxId": "20123456789",
  "contactEmail": "admin@antuane.com",
  "status": "ACTIVE",
  "plan": "PRO",
  "createdAt": "2026-06-25T21:30:00Z"
}
```

#### Colección: `appointments`
```json
{
  "id": "appointment_999",
  "tenantId": "tenant_123",
  "date": "2026-06-30T10:00:00.000Z",
  "status": "PENDING",
  "customer": {
    "name": "Gustavo Flores",
    "email": "gustavo@gmail.com",
    "phone": "994001234"
  },
  "branch": {
    "id": "branch_456",
    "name": "Sede Miraflores",
    "address": "Av. Larco 123",
    "phone": "999888777"
  },
  "service": {
    "id": "service_789",
    "name": "Corte de Cabello Premium",
    "price": 60.00,
    "durationInMinutes": 45
  },
  "staff": {
    "id": "staff_111",
    "name": "Carlos Barber",
    "role": "Estilista Senior"
  }
}
```

---

## 6. Endpoints de la API REST

Todas las peticiones del panel administrativo requieren la cabecera `Authorization: Bearer <JWT_TOKEN>`.

### 🔐 Autenticación y 2FA
- `POST /auth/password-changed` — Informa al servidor del cambio de clave obligatoria del tenant.
- `POST /auth/2fa/generate` — Genera la clave secreta TOTP en formato base32 para vincular Google Authenticator.
- `POST /auth/2fa/verify` — Valida el token de 2FA y autoriza el inicio de sesión del SuperAdmin.

### 🏢 Tenants (Empresas)
- `GET /tenants` — Lista todas las empresas (Solo SuperAdmin).
- `GET /tenants/:id` — Recupera la información de un tenant por ID.
- `POST /tenants` — Registra un tenant, genera una cuenta en Firebase Auth con claim `role: 'EMPRESA'` y devuelve una clave temporal aleatoria.
- `PATCH /tenants/:id` — Modifica datos del tenant. Si el estado cambia a `SUSPENDED`, deshabilita el acceso de forma restrictiva.
- `DELETE /tenants/:id` — Remueve el tenant y elimina en cascada todos sus documentos relacionados en Firestore.

### 📍 Sucursales y Recursos
- `GET /branches?tenantId=X` — Lista sucursales de la empresa.
- `POST /branches` — Registra una sede de atención.
- `GET /services?tenantId=X` — Lista servicios ofertados.
- `POST /services` — Crea servicios en el catálogo.
- `GET /appointments?tenantId=X&customerEmail=Y` — Lista citas filtradas dinámicamente.
- `POST /appointments` — Inserta reservas asociadas a los salones.

---

## 7. Componentes del Frontend

La interfaz del frontend está estructurada bajo el patrón **Client Components** utilizando el enrutamiento de Next.js App Router.

### 7.1 Diagrama de Secuencia de Autenticación y Redirección (Mermaid)

```mermaid
sequenceDiagram
    autonumber
    Usuario->>LoginPage (Client): Ingresa Credenciales
    LoginPage (Client)->>Firebase Auth: signInWithEmailAndPassword
    Firebase Auth-->>LoginPage (Client): Retorna UserCredential (JWT)
    LoginPage (Client)->>Firebase Auth: getIdTokenResult() (Decodifica Custom Claims)
    
    alt Claim role == 'SUPER_ADMIN'
        LoginPage (Client)->>Verify2FAPage: Redirige a /login/verify-2fa
        Verify2FAPage->>API REST: POST /auth/2fa/verify
        API REST-->>Verify2FAPage: OTP Válido
        Verify2FAPage->>SuperAdminPanel: Redirige a / (Dashboard Maestro)
    else Claim role == 'EMPRESA'
        LoginPage (Client)->>TenantAdminPanel: Redirige a /tenant/[tenantId]
    else Claim role == 'CLIENTE'
        LoginPage (Client)->>CustomerDashboard: Redirige a /customer/dashboard
    end
```

### 7.2 Mapeo de Vistas en el App Router

| Ruta del Archivo | URL de Acceso | Componente Principal | Funcionalidad |
|------------------|---------------|----------------------|---------------|
| `app/page.tsx` | `/` | `SuperAdminPanel` | Dashboard Maestro de KPIs globales, gráficos con Recharts y CRUD de Tenants con exportación a CSV. |
| `app/login/page.tsx` | `/login` | `LoginPage` | Autenticación integrada de Firebase con redirección selectiva por Claims de rol. |
| `app/login/verify-2fa/page.tsx` | `/login/verify-2fa` | `Verify2FAPage` | Pantalla de validación OTP y vinculación de código QR para SuperAdmin. |
| `app/customer/dashboard/page.tsx`| `/customer/dashboard`| `CustomerDashboard` | Portal del cliente. Contiene las reservas agendadas del usuario y el Wizard interactivo de reserva en 6 pasos. |
| `app/tenant/[id]/page.tsx` | `/tenant/[id]` | `TenantAdminPanel` | Panel administrativo de la Empresa para el control de sedes de atención. |
| `app/tenant/[id]/staff/page.tsx` | `/tenant/[id]/staff` | `StaffPage` | Catálogo de estilistas y roles por tenant. |

---

## 8. Pruebas con SoapUI

Para validar el funcionamiento del AuthGuard y la serialización JSON de los controladores, se configuró un proyecto REST en **SoapUI**.

### 8.1 Autenticación (Paso de Token JWT)
Las cabeceras se ingresan en la pestaña **Headers** de la petición en SoapUI:
```http
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 8.2 Creación de Tenant (`POST /tenants`)
**Cuerpo de la Petición (JSON):**
```json
{
  "name": "Barbería Classic",
  "taxId": "20987654321",
  "contactEmail": "contacto@classicbarber.pe",
  "plan": "PRO"
}
```

**Respuesta Exitosa (201 Created):**
```json
{
  "id": "8yG9xKj2sL01",
  "name": "Barbería Classic",
  "taxId": "20987654321",
  "contactEmail": "contacto@classicbarber.pe",
  "status": "ACTIVE",
  "plan": "PRO",
  "credentials": {
    "email": "contacto@classicbarber.pe",
    "password": "k7m2p9x4q1A1!"
  }
}
```

---

## 9. Despliegue en Firebase

### 9.1 Arquitectura Serverless
El ecosistema completo se aloja en los servidores globales de Google Cloud Platform (GCP) mediante la CLI de Firebase:
- **Backend:** NestJS empaquetado como Firebase Cloud Functions v2 (HTTP Serverless).
- **Frontend:** Next.js exportado estáticamente y servido en Firebase Hosting CDN.
- **Base de Datos:** Cloud Firestore.

### 9.2 Despliegue del Backend (Cloud Functions)
```bash
cd backend
npm run build
firebase deploy --only functions
```

### 9.3 Despliegue del Frontend (Hosting)
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

---

## 10. Conclusiones

1. **Aislamiento Multitenant Robusto:** La arquitectura diseñada aísla las transacciones comerciales por tenant utilizando consultas indexadas por `tenantId` en Firestore, garantizando seguridad y confidencialidad en los datos de los salones.
2. **Ciclo de Vida en Cascada:** La implementación de disparadores por lotes (Batch updates) en NestJS asegura que las bajas o suspensiones de empresas impacten en cascada y de manera atómica a sucursales, citas y personal, previniendo la persistencia de huérfanos.
3. **Control de Acceso Riguroso:** El uso de Custom Claims en JWT emitidos por Firebase Auth valida los perfiles directamente en el router, rechazando intentos de suplantación en milisegundos con códigos HTTP 401.

---

## 11. Práctica: Internacionalización (i18n) y Localización (l10n)

Se ha integrado un sistema completo de **Internacionalización (i18n)** y **Localización (l10n)** en el cliente para el frontend de **Glamy SaaS**. Esto permite adaptar dinámicamente toda la experiencia de usuario (incluyendo traducción de etiquetas, validación de formularios, visualización de alertas, formato de divisas regionales, fechas y números) a 4 lenguajes y regiones distintas:
- 🇪🇸 **Español (`es`)** — Divisa: Soles Peruanos (`PEN`), formato: `S/. 150.00`
- 🇺🇸 **Inglés (`en`)** — Divisa: Dólares Americanos (`USD`), formato: `$150.00`
- 🇧🇷 **Portugués (`pt`)** — Divisa: Reales Brasileños (`BRL`), formato: `R$ 150,00`
- 🇫🇷 **Francés (`fr`)** — Divisa: Euros (`EUR`), formato: `150,00 €`

### 11.1 Arquitectura del Sistema de Localización

La traducción y localización se implementaron en el lado del cliente utilizando un patrón de diseño desacoplado. A continuación se presenta el diagrama de flujo arquitectónico de las dependencias y el estado global:

```mermaid
flowchart TD
    i18nConfig[i18n.ts Dictionaries] -->|Inicializa recursos ES/EN/PT/FR| i18nEngine[i18next Engine]
    i18nEngine -->|Provee t hook| LocaleCtx[LocaleContext.tsx Provider]
    IntlAPI[Browser Intl API] -->|Formatea Divisa y Números| LocaleCtx
    DateFns[date-fns/locale] -->|Formatea Fechas localizadas| LocaleCtx
    
    LocaleCtx -->|Preferencia de idioma guardada en localStorage| ClientState[LocaleContext State]
    
    ClientState -->|Idioma + Formateadores| SuperAdmin[SuperAdmin Panel]
    ClientState -->|Idioma + Formateadores| TenantAdmin[Tenant Admin Panel]
    ClientState -->|Idioma + Formateadores| Customer[Customer Dashboard]
    ClientState -->|Idioma + Formateadores| TestLab[Lab de Pruebas /test-i18n]
```

### 11.2 Detalle de Archivos Creados y Lógica Implementada

#### A. Inicialización Core: [`i18n.ts`](file:///d:/universidad/ingeniera%20WEB%20CUrso/Glamy/glamyprojec/frontend/app/lib/i18n.ts)
Este archivo gestiona las plantillas de traducción estructuradas en formato JSON. Posee claves anidadas para:
- `nav`: Menú de navegación, roles de usuario, botones de cerrar sesión y redirección.
- `kpi`: Nombres de métricas principales e indicador del gráfico distributivo.
- `form`: Etiquetas de formularios de creación (razón social, identificadores fiscales, direcciones, horarios).
- `table`: Encabezados de directorios y listas.
- `messages`: Notificaciones del sistema, validaciones dinámicas y confirmaciones críticas de borrado.
- `customer`: Pasos del asistente del cliente y textos informativos.

#### B. Contexto Global: [`LocaleContext.tsx`](file:///d:/universidad/ingeniera%20WEB%20CUrso/Glamy/glamyprojec/frontend/app/lib/LocaleContext.tsx)
Proporciona el estado del idioma activo y encapsula el formateo dinámico:
```typescript
// Lógica interna de localización de monedas en LocaleContext
const formatCurrency = (value: number): string => {
  let currency = 'PEN';
  let currencyLocale = 'es-PE';
  if (locale === 'en') { currency = 'USD'; currencyLocale = 'en-US'; }
  else if (locale === 'pt') { currency = 'BRL'; currencyLocale = 'pt-BR'; }
  else if (locale === 'fr') { currency = 'EUR'; currencyLocale = 'fr-FR'; }
  
  return new Intl.NumberFormat(currencyLocale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};
```

#### C. Integración en Vistas Principales
- **[`layout.tsx`](file:///d:/universidad/ingeniera%20WEB%20CUrso/Glamy/glamyprojec/frontend/app/layout.tsx)**: Se inyectó el `LocaleProvider` a nivel raíz para evitar problemas de sincronía en el renderizado y envolver los componentes del cliente.
- **[`page.tsx`](file:///d:/universidad/ingeniera%20WEB%20CUrso/Glamy/glamyprojec/frontend/app/page.tsx) (SuperAdmin)**: Integra las traducciones para todos los botones de estado, modales flotantes y formateo dinámico de precios de planes en el desplegable. Incluye un interruptor de 4 botones premium para el control de idiomas.
- **[`page.tsx`](file:///d:/universidad/ingeniera%20WEB%20CUrso/Glamy/glamyprojec/frontend/app/tenant/[id]/page.tsx) (Tenant Admin)**: Traduce las secciones administrativas principales de gestión de sedes e integra el selector de idiomas en el panel superior.
- **[`page.tsx`](file:///d:/universidad/ingeniera%20WEB%20CUrso/Glamy/glamyprojec/frontend/app/customer/dashboard/page.tsx) (Customer Dashboard)**: Traduce al 100% la interfaz del cliente que realiza reservas, automatizando la traducción de los 6 pasos del asistente, así como la visualización localizada de precios y fechas en el historial de reservas.

---

### 11.3 Guía de Calificación y Evidencia del Laboratorio (`/test-i18n`)

Para facilitar la revisión por parte del profesor, se diseñó la ruta interactiva `/test-i18n` ([`test-i18n/page.tsx`](file:///d:/universidad/ingeniera%20WEB%20CUrso/Glamy/glamyprojec/frontend/app/test-i18n/page.tsx)). Al acceder en modo local u online y alternar entre los 4 idiomas, se actualizan dinámicamente cuatro aspectos fundamentales:

| Idioma Seleccionado | 1. Traducción UI (i18n) | 2. Localización Fecha (l10n) | 3. Moneda Regional (l10n) | 4. Formato Numérico (l10n) |
|--------------------|-------------------------|------------------------------|----------------------------|----------------------------|
| **Español (ES)** | Texto traducido al español | `25 de junio de 2026` | `S/. 1,500.50` | `9,876,543` |
| **English (EN)** | Translated text to English | `June 25, 2026` | `$1,500.50` | `9,876,543` |
| **Português (PT)** | Texto traduzido para português | `25 de junho de 2026` | `R$ 1.500,50` | `9.876.543` |
| **Français (FR)** | Texte traduit en français | `25 juin 2026` | `1 500,50 €` | `9 876 543` |

> [!TIP]
> **Pasos para evidenciar:**
> 1. Levante el proyecto en desarrollo mediante `npm run dev` en el directorio `frontend`.
> 2. Visite la ruta: **http://localhost:3000/test-i18n** y verifique la actualización reactiva instantánea al interactuar con las tarjetas del laboratorio.

---

## 12. Rúbrica de Calificación (Práctica de i18n y l10n)

| Ítem | Descripción | Puntaje | Check |
|------|-------------|---------|-------|
| **l10n (Localización)** | Instalación y configuración de la librería `date-fns` y el uso nativo de `Intl` para formatear fechas, divisas locales y separadores de números en el cliente. | 4 | X |
| **i18n (Internacionalización)** | Configuración de `i18next` y `react-i18next` gestionando diccionarios completos en Español, Inglés, Portugués y Francés. | 4 | X |
| **Prueba de l10n** | Validación desde el Frontend de formatos monetarios (`S/.`, `$`, `R$`, `€`) y fechas en la ruta `/test-i18n` y pantallas del sistema. | 4 | X |
| **Prueba de i18n** | Pruebas dinámicas de cambio de idioma en navbar, formularios, modales, alertas y confirmaciones en los paneles administrativos y de cliente. | 4 | X |
| **Informe** | Inclusión y desglose detallado de toda la práctica en este archivo `README.md` (Sección 11 y 12). | 4 | X |
| **Total** | | **20** | |

---

## 13. Enlaces de Interés

- **Frontend en Producción (Firebase):** https://glamysaas.web.app
- **Laboratorio de Pruebas de i18n/l10n:** http://localhost:3000/test-i18n
- **Repositorio GitHub de Avance:** https://github.com/Gustavo99400/SaaSBll.git
- **Proyecto de Consola Firebase:** saasrcb
