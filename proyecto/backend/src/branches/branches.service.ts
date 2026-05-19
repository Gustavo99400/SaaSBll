import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateBranchDto } from './dto/create-branch.dto';

@Injectable()
export class BranchesService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async create(createBranchDto: CreateBranchDto) {
    const newBranch = {
      ...createBranchDto,
      status: 'OPEN', // Valor por defecto para nuevas sedes
      createdAt: new Date().toISOString(),
    };

    const docRef = await this.firebaseService.firestore
      .collection('branches')
      .add(newBranch);

    return { id: docRef.id, ...newBranch };
  }

  // AISLAMIENTO: Recibimos el tenantId para filtrar la consulta
  async findAll(tenantId?: string) {
    const query = this.firebaseService.firestore.collection('branches');

    if (tenantId) {
      // Solo traemos las sucursales que pertenecen a este negocio
      const snapshot = await query.where('tenantId', '==', tenantId).get();
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }

    // Si no hay tenantId, por seguridad devolvemos vacío o manejamos error
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async remove(id: string) {
    const docRef = this.firebaseService.firestore
      .collection('branches')
      .doc(id);

    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException(`Sucursal no encontrada`);
    }

    // ELIMINACIÓN EN CASCADA: Borrar citas de esta sucursal
    const appointmentsSnapshot = await this.firebaseService.firestore
      .collection('appointments')
      .where('branchId', '==', id)
      .get();
      
    for (const doc of appointmentsSnapshot.docs) {
      await doc.ref.delete();
    }

    await docRef.delete();
    return { id, deleted: true };
  }
}
