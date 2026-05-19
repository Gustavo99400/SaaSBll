import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateServiceDto } from './dto/create-service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async create(createServiceDto: CreateServiceDto) {
    const docRef = await this.firebaseService.firestore
      .collection('services')
      .add({ ...createServiceDto });

    return { id: docRef.id, ...createServiceDto };
  }

  async findAll(tenantId?: string) {
    let query: any = this.firebaseService.firestore.collection('services');

    if (tenantId) {
      query = query.where('tenantId', '==', tenantId);
    }

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }
}
