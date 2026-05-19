# Backend de Reservas - Antuane Studio

## Información Académica

<table align="center">
    <thead>
        <tr>
            <td>
                <img src="https://1.bp.blogspot.com/-3wALNMake70/XK-07VtIngI/AAAAAAABOrY/n3X_ZJV5fGEpTs8ppMQvKk_yic7BfyBYQCLcBGAs/s1600/universidad-la-salle-logo.jpg?raw=true" alt="Universidad La Salle" width="120"/>
            </td>
            <th>
                UNIVERSIDAD LA SALLE<br/>
                FACULTAD DE INGENIERÍA DE SOFTWARE
            </th>
        </tr>
    </thead>
</table>

<br/>

<div align="center">
<strong>CARÁTULA DEL GRUPO</strong>
</div>

<br/>

<table border="1" align="center">
    <thead>
        <tr>
            <th colspan="3">INFORMACIÓN</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td colspan="2">
                <table>
                    <tr>
                        <td><strong>ASIGNATURA:</strong></td>
                        <td>Ingeniería Web</td>
                    </tr>
                    <tr>
                        <td><strong>AÑO:</strong></td>
                        <td>2026</td>
                        <td><strong>SEMESTRE:</strong></td>
                        <td>VII</td>
                    </tr>
                    <tr>
                        <td colspan="4">
                            <strong>DOCENTE:</strong>
                            <ul>
                                <li>Richart Smith Escobedo Quispe</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="4">
                            <strong>INTEGRANTES:</strong>
                            <ul>
                                <li>Mares Graos Frederick Dicarlo</li>
                                <li>Flores Vera Gustavo Alexander</li>
                                <li>Saya Ramos Arnold Daniel</li>
                                <li>Ortiz Rosas Joshua David</li>
                            </ul>
                        </td>
                    </tr>
                </table>
            </td>
            <td align="center">
                Grupo de Trabajo
                <br/><br/>
                ______________________
            </td>
        </tr>
    </tbody>
</table>

---

## Descripción del Proyecto

Este repositorio contiene el backend para la gestión de reservas de un salón de belleza. El sistema está diseñado bajo una arquitectura modular, orientado a entornos multi-tenant (SaaS) y soportado por una base de datos NoSQL basada en documentos.

---

## Tecnologías Utilizadas

- Framework: NestJS (Node.js)
- Lenguaje: TypeScript (tipado estricto)
- Base de Datos: Firebase Firestore
- Arquitectura: Modular (Controladores, Servicios, DTOs)

---

## Estructura de la Base de Datos

El sistema utiliza siete colecciones principales en Firestore:

1. Tenants
2. Branches
3. Staff
4. Customers
5. Services
6. Appointments
7. AuditLog

---

## Inicialización del Proyecto

### Instalación

```bash
npm i -g @nestjs/cli
nest new backend-reservas-salon
cd backend-reservas-salon

---

Generación de Recursos

nest g resource tenants --no-spec
nest g resource branches --no-spec
nest g resource staff --no-spec
nest g resource customers --no-spec
nest g resource services --no-spec
nest g resource appointments --no-spec
nest g resource audit-log --no-spec

Firebase

npm install firebase-admin
nest g module firebase
nest g service firebase

Configuración de Firebase

Archivo: src/firebase/firebase.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private _firestore: admin.firestore.Firestore;

  onModuleInit() {
    if (admin.apps.length === 0) {
      const serviceAccount = require('../../firebase-config.json');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    this._firestore = admin.firestore();
  }

  get firestore() {
    return this._firestore;
  }
}

Modelado de Datos
DTO Principal: Appointments
export class CreateAppointmentDto {
  readonly customerId: string;
  readonly serviceId: string;
  readonly staffId: string;
  readonly date: string;
  readonly status: string;
}
Otros DTOs
Customer: name, email, phone
Service: name, description, price, durationInMinutes
Staff: name, role, phone
Tenant: name, taxId, contactEmail
Branch: tenantId, name, address, phone

Lógica de Negocio
Servicio
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppointmentsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async create(dto: CreateAppointmentDto) {
    const docRef = await this.firebaseService.firestore
      .collection('appointments')
      .add({ ...dto, createdAt: new Date().toISOString() });

    return { id: docRef.id, ...dto };
  }

  async findAll() {
    const snapshot = await this.firebaseService.firestore
      .collection('appointments')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }
}
Controlador
import { Controller, Post, Get, Body } from '@nestjs/common';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly service: AppointmentsService) {}

  @Post()
  create(@Body() dto: CreateAppointmentDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
Consideraciones de Seguridad
AuditLog
Registro de acciones del sistema
Campos: action, entity, performedBy
Inmutable
Solo permite GET y POST
Ejecución del Proyecto
npm run start:dev
Prueba de Endpoint
Crear una reserva

POST
http://localhost:3000/appointments

{
  "customerId": "PdZLMPaipHkmbAGY30Sp",
  "serviceId": "k9jSMPaipHkmbAGY88Xz",
  "staffId": "m2mPMPaipHkmbAGY11Qw",
  "date": "2026-05-15T16:30:00Z",
  "status": "CONFIRMED"
}
