import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async create(createTenantDto: CreateTenantDto) {
    const newTenant = {
      ...createTenantDto,
      status: createTenantDto.status || 'ACTIVE',
      plan: createTenantDto.plan || 'STARTUP',
      createdAt: new Date().toISOString(),
    };

    // 1. Guardamos los datos de la empresa en Firestore
    const docRef = await this.firebaseService.firestore
      .collection('tenants')
      .add(newTenant);

    const tenantId = docRef.id;

    // 2. Generamos una contraseña aleatoria para la empresa
    const generatedPassword = Math.random().toString(36).slice(-10) + 'A1!'; // Aseguramos complejidad básica

    try {
      // 3. Creamos el usuario en Firebase Auth usando el Admin SDK
      const user = await this.firebaseService.auth.createUser({
        email: createTenantDto.contactEmail,
        password: generatedPassword,
        displayName: createTenantDto.name,
      });

      // 4. Asignamos los Custom Claims (Rol y TenantId)
      await this.firebaseService.auth.setCustomUserClaims(user.uid, {
        role: 'EMPRESA',
        tenantId: tenantId,
        requiresPasswordChange: true,
      });

      // Retornamos los datos incluyendo la contraseña generada para que el SuperAdmin se la dé
      return { 
        id: tenantId, 
        ...newTenant, 
        credentials: {
          email: createTenantDto.contactEmail,
          password: generatedPassword
        }
      };
    } catch (error) {
      console.error('Error creando usuario en Firebase Auth:', error);
      // Borramos el documento de Firestore para no dejar datos corruptos
      await docRef.delete();
      throw error;
    }
  }

  async findAll() {
    const snapshot = await this.firebaseService.firestore
      .collection('tenants')
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async findOne(id: string) {
    const doc = await this.firebaseService.firestore
      .collection('tenants')
      .doc(id)
      .get();

    if (!doc.exists) {
      throw new NotFoundException(`Empresa con ID ${id} no encontrada`);
    }
    return { id: doc.id, ...doc.data() };
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    const tenantRef = this.firebaseService.firestore
      .collection('tenants')
      .doc(id);

    const doc = await tenantRef.get();

    if (!doc.exists) {
      throw new NotFoundException(
        `No se puede actualizar: Empresa no encontrada`,
      );
    }

    await tenantRef.update({
      ...updateTenantDto,
      updatedAt: new Date().toISOString(),
    });

    // CASCADA DE ESTADO
    if (updateTenantDto.status) {
      const collections = ['branches', 'staff', 'services'];
      
      for (const coll of collections) {
        const snapshot = await this.firebaseService.firestore
          .collection(coll)
          .where('tenantId', '==', id)
          .get();
          
        for (const doc of snapshot.docs) {
          await doc.ref.update({ 
            status: updateTenantDto.status,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }

    return { id, ...updateTenantDto };
  }

  async remove(id: string) {
    const tenantRef = this.firebaseService.firestore
      .collection('tenants')
      .doc(id);

    const doc = await tenantRef.get();

    if (!doc.exists) {
      throw new NotFoundException(
        `No se puede eliminar: Empresa no encontrada`,
      );
    }

    // ELIMINACIÓN EN CASCADA
    const collections = ['branches', 'staff', 'services', 'appointments', 'customers'];
    
    for (const coll of collections) {
      const snapshot = await this.firebaseService.firestore
        .collection(coll)
        .where('tenantId', '==', id)
        .get();
        
      for (const doc of snapshot.docs) {
        await doc.ref.delete();
      }
    }

    // Finalmente borramos la empresa
    await tenantRef.delete();
    return { id, deleted: true };
  }
}
