import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  /**
   * Valida que todas las entidades referenciadas (tenant, branch, service, staff)
   * existan en Firestore y pertenezcan al tenant correcto antes de crear la cita.
   */
  private async validateEntities(dto: CreateAppointmentDto): Promise<void> {
    const db = this.firebaseService.firestore;

    // Resolución de IDs: soporta tanto formato plano como anidado
    const tenantId = dto.tenantId;
    const branchId = dto.branchId || dto.branch?.id;
    const serviceId = dto.serviceId || dto.service?.id;
    const staffId = dto.staffId || dto.staff?.id;

    // 1. Validar Tenant (Empresa)
    if (!tenantId) {
      throw new BadRequestException('Se requiere un tenantId válido para crear la cita.');
    }
    const tenantDoc = await db.collection('tenants').doc(tenantId).get();
    if (!tenantDoc.exists) {
      throw new NotFoundException(
        `La empresa con ID "${tenantId}" no existe. Debe ser creada por el Super Admin primero.`
      );
    }
    const tenantData = tenantDoc.data();
    if (tenantData?.status && tenantData.status !== 'ACTIVE') {
      throw new BadRequestException(
        `La empresa "${tenantData.name}" no está activa (estado: ${tenantData.status}). No se pueden crear citas.`
      );
    }

    // 2. Validar Branch (Sucursal)
    if (branchId) {
      const branchDoc = await db.collection('branches').doc(branchId).get();
      if (!branchDoc.exists) {
        throw new NotFoundException(
          `La sucursal con ID "${branchId}" no existe. Debe ser creada por el administrador de la empresa primero.`
        );
      }
      const branchData = branchDoc.data();
      if (branchData?.tenantId !== tenantId) {
        throw new BadRequestException(
          `La sucursal "${branchId}" no pertenece a la empresa "${tenantId}". Verifique los IDs.`
        );
      }
      if (branchData?.status && branchData.status === 'CLOSED') {
        throw new BadRequestException(
          `La sucursal "${branchData.name}" está cerrada. No se pueden agendar citas en ella.`
        );
      }
    }

    // 3. Validar Service (Servicio)
    if (serviceId) {
      const serviceDoc = await db.collection('services').doc(serviceId).get();
      if (!serviceDoc.exists) {
        throw new NotFoundException(
          `El servicio con ID "${serviceId}" no existe. Debe ser creado por el administrador de la empresa primero.`
        );
      }
      const serviceData = serviceDoc.data();
      if (serviceData?.tenantId !== tenantId) {
        throw new BadRequestException(
          `El servicio "${serviceId}" no pertenece a la empresa "${tenantId}". Verifique los IDs.`
        );
      }
    }

    // 4. Validar Staff (Personal)
    if (staffId) {
      const staffDoc = await db.collection('staff').doc(staffId).get();
      if (!staffDoc.exists) {
        throw new NotFoundException(
          `El miembro del staff con ID "${staffId}" no existe. Debe ser registrado por el administrador de la empresa primero.`
        );
      }
      const staffData = staffDoc.data();
      if (staffData?.tenantId !== tenantId) {
        throw new BadRequestException(
          `El staff "${staffId}" no pertenece a la empresa "${tenantId}". Verifique los IDs.`
        );
      }
    }
  }

  async create(createAppointmentDto: CreateAppointmentDto) {
    // ✅ Validar integridad referencial ANTES de guardar
    await this.validateEntities(createAppointmentDto);

    const docRef = await this.firebaseService.firestore
      .collection('appointments')
      .add({
        ...createAppointmentDto,
        createdAt: new Date().toISOString(),
      });

    return { id: docRef.id, ...createAppointmentDto };
  }

  async findAll(tenantId?: string, branchId?: string, customerEmail?: string, customerId?: string) {
    let query: any = this.firebaseService.firestore.collection('appointments');

    if (tenantId) {
      query = query.where('tenantId', '==', tenantId);
    }
    if (branchId) {
      query = query.where('branchId', '==', branchId);
    }
    if (customerEmail) {
      query = query.where('customer.email', '==', customerEmail);
    }
    if (customerId) {
      query = query.where('customer.id', '==', customerId);
    }

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }
}
