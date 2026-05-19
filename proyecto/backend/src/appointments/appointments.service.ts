import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async create(createAppointmentDto: CreateAppointmentDto) {
    const docRef = await this.firebaseService.firestore
      .collection('appointments')
      .add({
        ...createAppointmentDto,
        createdAt: new Date().toISOString() // Buena práctica: registrar cuándo se creó
      });

    return { id: docRef.id, ...createAppointmentDto };
  }

  async findAll(tenantId?: string, branchId?: string) {
    let query: any = this.firebaseService.firestore.collection('appointments');

    if (tenantId) {
      query = query.where('tenantId', '==', tenantId);
    }
    if (branchId) {
      query = query.where('branchId', '==', branchId);
    }

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }
}
