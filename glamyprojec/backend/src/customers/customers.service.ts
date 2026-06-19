import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service'; // Verifica que la ruta coincida con tu estructura
import { CreateCustomerDto } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  // Inyectamos nuestro servicio de Firebase
  constructor(private readonly firebaseService: FirebaseService) {}

  // POST: Crear un nuevo cliente en la colección 'customers'
  async create(createCustomerDto: CreateCustomerDto) {
    const docRef = await this.firebaseService.firestore
      .collection('customers')
      .add({ ...createCustomerDto });

    // Retornamos el DTO junto con el ID autogenerado por Firestore
    return { id: docRef.id, ...createCustomerDto };
  }

  // GET: Obtener clientes (opcionalmente filtrados por tenantId)
  async findAll(tenantId?: string) {
    let query: any = this.firebaseService.firestore.collection('customers');

    if (tenantId) {
      query = query.where('tenantId', '==', tenantId);
    }

    const snapshot = await query.get();

    // Mapeamos los documentos de Firebase a un array de objetos limpio
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }
}
