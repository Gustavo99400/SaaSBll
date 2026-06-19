import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateStaffDto } from './dto/create-staff.dto';

@Injectable()
export class StaffService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async create(createStaffDto: CreateStaffDto) {
    const docRef = await this.firebaseService.firestore
      .collection('staff')
      .add({ ...createStaffDto });

    return { id: docRef.id, ...createStaffDto };
  }

  async findAll(tenantId?: string) {
    let query: any = this.firebaseService.firestore.collection('staff');

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
