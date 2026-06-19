import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Injectable()
export class AuditLogService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async create(createAuditLogDto: CreateAuditLogDto) {
    const docRef = await this.firebaseService.firestore
      .collection('auditLog')
      .add({
        ...createAuditLogDto,
        timestamp: new Date().toISOString(), // La hora exacta del servidor
      });

    return { id: docRef.id, ...createAuditLogDto };
  }

  async findAll() {
    // Es buena práctica ordenarlos por fecha, del más reciente al más antiguo
    const snapshot = await this.firebaseService.firestore
      .collection('auditLog')
      .orderBy('timestamp', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }
}
