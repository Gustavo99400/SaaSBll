import { Module, Global } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Global() // Esto lo hace disponible en todo el proyecto
@Module({
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
